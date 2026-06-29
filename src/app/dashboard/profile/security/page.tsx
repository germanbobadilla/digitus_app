'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export default function SecurityPage() {
    const { user, logout, isLoading } = useAuth()
    const { t, isLoading: langLoading } = useLanguage()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    if (isLoading || langLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Mobile Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {t('navigation.security')}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage your account security settings
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 mb-2">Password</h3>
                                    <p className="text-sm text-gray-600 mb-4">Change your password to keep your account secure</p>
                                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        Change Password
                                    </button>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-md font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        Enable 2FA
                                    </button>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-md font-medium text-gray-900 mb-2">Active Sessions</h3>
                                    <p className="text-sm text-gray-600 mb-4">Manage devices that are currently signed in to your account</p>
                                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        View Sessions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}


























