'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    name: string
    email: string
    image?: string
    userType?: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    loginWithGoogle: () => Promise<void>
    logout: () => Promise<void>
    register: (name: string, email: string, password: string, userType: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status !== 'loading') {
            setIsLoading(false)
        }
    }, [status])

    const login = async (email: string, password: string) => {
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            throw new Error('Invalid credentials')
        }

        router.push('/dashboard')
    }

    const loginWithGoogle = async () => {
        await signIn('google', { callbackUrl: '/dashboard' })
    }

    const logout = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    const register = async (name: string, email: string, password: string, userType: string) => {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
                userType,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Registration failed')
        }

        // Auto-login after registration
        await login(email, password)
    }

    const value: AuthContextType = {
        user: session?.user ? {
            id: session.user.id || '',
            name: session.user.name || '',
            email: session.user.email || '',
            image: session.user.image || undefined,
            userType: session.user.userType,
        } : null,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        register,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within a NextAuthProvider')
    }
    return context
}

