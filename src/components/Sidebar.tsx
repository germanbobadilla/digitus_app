'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/NextAuthContext'
import { useTranslation } from '@/contexts/LanguageContext'
import { Avatar } from './Avatar'
import { Logo } from './Logo'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const { t } = useTranslation()
    if (typeof window !== 'undefined') {
        // Debug current session role
        // eslint-disable-next-line no-console
        console.log('Sidebar session user:', user)
    }

    const [sessionAdmin, setSessionAdmin] = useState(false)
    useEffect(() => {
        let cancelled = false
        const checkSession = async () => {
            try {
                const res = await fetch('/api/auth/session')
                if (!res.ok) return
                const data = await res.json()
                const role = ((data?.user?.userType) || '').toUpperCase()
                if (!cancelled) setSessionAdmin(role === 'ADMIN')
            } catch { }
        }
        checkSession()
        return () => { cancelled = true }
    }, [])

    const navigation = [
        { name: t('navigation.dashboard'), href: '/dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
        { name: 'Projects', href: '/dashboard/projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { name: 'Billing', href: '/dashboard/billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    ]


    const adminNavigation = [
        ...((((user?.userType || '').toUpperCase() === 'ADMIN') || sessionAdmin) ? [{ name: 'Users', href: '/dashboard/users', icon: 'M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m9-4a4 4 0 11-8 0 4 4 0 018 0z' }] : []),
    ]

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname === href || pathname.startsWith(href + '/')
    }

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-digitus-dark bg-opacity-75 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <Logo size="md" />
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Avatar
                                    src={user?.image}
                                    name={user?.name || user?.email}
                                    alt={user?.name || 'User'}
                                    size="md"
                                />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                                {user?.userType && (
                                    <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800">
                                        {user.userType}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {/* Main Navigation */}
                        <div className="space-y-1">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {t('common.main') || 'Main'}
                            </h3>
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive(item.href)
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <svg
                                        className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {item.name}
                                </Link>
                            ))}
                        </div>


                        {/* Admin Navigation */}
                        {adminNavigation.length > 0 && (
                            <div className="space-y-1 mt-6">
                                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Admin
                                </h3>
                                {adminNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive(item.href)
                                                ? 'bg-indigo-100 text-indigo-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }
                  `}
                                    >
                                        <svg
                                            className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </>
    )
}
