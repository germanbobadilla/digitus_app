import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma) as any, // Temporarily disabled to avoid account linking issues
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
      // Allow Google OAuth sign-ins unconditionally (avoid blocking on DB errors)
      if (account?.provider === "google") {
        try {
          // Best-effort user ensure; do not block sign-in on failure
          const existingUser = await prisma.user.findUnique({ where: { email: user.email! } })

          // Admin whitelist via env (comma-separated emails)
          const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
          const shouldBeAdmin = adminEmails.includes((user.email || '').toLowerCase())

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                image: user.image,
                userType: shouldBeAdmin ? 'ADMIN' : 'REGULAR',
                emailVerified: new Date(),
              }
            })
            console.log("Created new user via Google OAuth:", user.email)
          } else if (shouldBeAdmin && existingUser.userType !== 'ADMIN') {
            await prisma.user.update({ where: { email: user.email! }, data: { userType: 'ADMIN' } })
            console.log("Upgraded user to ADMIN via whitelist:", user.email)
          }
        } catch (error) {
          console.warn("Non-blocking error in Google signIn callback:", error)
        }
        return true
      }

      // Allow credentials sign-ins
      if (account?.provider === "credentials") {
        return true
      }

      return true
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
            select: { id: true, userType: true }
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
