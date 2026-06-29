import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma) as any, // Temporarily disabled to avoid account linking issues
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            console.log("User not found or no password")
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log("Invalid password")
            return null
          }

          console.log("Login successful for:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            userType: user.userType,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account }) {
      // Only allow credentials sign-ins
      if (account?.provider === "credentials") {
        return true
      }
      return false
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
      }

      // Always sync fresh role/id from DB to reflect updates like promotions
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, userType: true, roleId: true }
          })

          if (dbUser) {
            token.userType = dbUser.userType
            token.sub = dbUser.id
          }
        } catch (error) {
          console.error("Error syncing userType:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub as string
        (session.user as any).userType = token.userType as string
        (session.user as any).email = token.email as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to port 3000
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: "/login",
  }
}
