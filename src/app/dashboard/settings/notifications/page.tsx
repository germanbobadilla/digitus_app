'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export default function NotificationsPage() {
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
                                {t('navigation.notifications')}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage your notification preferences
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 mb-2">Email Notifications</h3>
                                    <p className="text-sm text-gray-600 mb-4">Choose what email notifications you want to receive</p>
                                    <div className="space-y-3">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" defaultChecked />
                                            <span className="ml-2 text-sm text-gray-700">Order updates</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" defaultChecked />
                                            <span className="ml-2 text-sm text-gray-700">Payment confirmations</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                                            <span className="ml-2 text-sm text-gray-700">Marketing emails</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-md font-medium text-gray-900 mb-2">Push Notifications</h3>
                                    <p className="text-sm text-gray-600 mb-4">Control browser push notifications</p>
                                    <div className="space-y-3">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" defaultChecked />
                                            <span className="ml-2 text-sm text-gray-700">Order status changes</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                                            <span className="ml-2 text-sm text-gray-700">New messages</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-md font-medium text-gray-900 mb-2">SMS Notifications</h3>
                                    <p className="text-sm text-gray-600 mb-4">Receive important updates via SMS</p>
                                    <div className="space-y-3">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                                            <span className="ml-2 text-sm text-gray-700">Critical account updates</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}




