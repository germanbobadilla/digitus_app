'use client'

import { SessionProvider } from 'next-auth/react'
import { NextAuthProvider } from '@/contexts/NextAuthContext'

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <NextAuthProvider>
                {children}
            </NextAuthProvider>
        </SessionProvider>
    )
}





























