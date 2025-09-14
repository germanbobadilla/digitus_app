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
    isCollapsed: boolean
    onToggleCollapse: () => void
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname()
    const { user } = useAuth()
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
        { name: t('navigation.services'), href: '/dashboard/services', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { name: t('navigation.orders'), href: '/dashboard/orders', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: t('navigation.payments'), href: '/dashboard/payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    ]

    // Admin navigation - only show for admin users
    const adminNavigation = [
        ...((((user?.userType || '').toUpperCase() === 'ADMIN') || sessionAdmin) ? [
            { name: 'Users', href: '/dashboard/users', icon: 'M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m9-4a4 4 0 11-8 0 4 4 0 018 0z' },
            { name: 'Admin Orders', href: '/dashboard/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
        ] : []),
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
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                        <div className="flex items-center">
                            {!isCollapsed && <Logo size="md" />}
                            {isCollapsed && <Logo variant="icon" size="sm" />}
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Desktop toggle button */}
                            <button
                                onClick={onToggleCollapse}
                                className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            {/* Mobile close button */}
                            <button
                                onClick={onClose}
                                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* User Info - Only show when not collapsed */}
                    {!isCollapsed && (
                        <div className="px-4 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <Avatar
                                    src={user?.image}
                                    name={user?.name || user?.email}
                                    alt={user?.name || 'User'}
                                    size="sm"
                                />
                                <div className="ml-3 min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user?.email}
                                    </p>
                                    {user?.userType && (
                                        <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-800">
                                            {user.userType}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {/* Main Navigation */}
                        <div className="space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative
                                        ${isActive(item.href)
                                            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                        ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <svg
                                        className={`
                                            h-5 w-5 flex-shrink-0
                                            ${isActive(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                                            ${isCollapsed ? '' : 'mr-3'}
                                        `}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {!isCollapsed && (
                                        <span className="truncate">{item.name}</span>
                                    )}
                                    {isActive(item.href) && (
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Admin Navigation */}
                        {adminNavigation.length > 0 && (
                            <div className="space-y-1 mt-6">
                                {!isCollapsed && (
                                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                        Admin
                                    </h3>
                                )}
                                {adminNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                                            group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative
                                            ${isActive(item.href)
                                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }
                                            ${isCollapsed ? 'justify-center' : ''}
                                        `}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <svg
                                            className={`
                                                h-5 w-5 flex-shrink-0
                                                ${isActive(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                                                ${isCollapsed ? '' : 'mr-3'}
                                            `}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                        {!isCollapsed && (
                                            <span className="truncate">{item.name}</span>
                                        )}
                                        {isActive(item.href) && (
                                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
                                        )}
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
