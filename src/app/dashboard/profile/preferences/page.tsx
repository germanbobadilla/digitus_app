'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { useTranslation } from '@/contexts/LanguageContext'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export default function PreferencesPage() {
    const { user, logout, isLoading } = useAuth()
    const { t, language, setLanguage, isLoading: langLoading } = useTranslation()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    if (isLoading || langLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-digitus-accent"></div>
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
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">{t('preferences.title')}</h1>
                            <p className="mt-2 text-gray-600">
                                {t('preferences.description')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Language Selection */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h2 className="text-lg font-medium text-gray-900">{t('common.language')}</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {t('preferences.languageDesc') || 'Choose your preferred language for the application.'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('common.language')}
                                        </label>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="language"
                                                    value="en"
                                                    checked={language === 'en'}
                                                    onChange={() => setLanguage('en')}
                                                    className="h-4 w-4 text-digitus-accent focus:ring-digitus-accent border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">English</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="language"
                                                    value="es"
                                                    checked={language === 'es'}
                                                    onChange={() => setLanguage('es')}
                                                    className="h-4 w-4 text-digitus-accent focus:ring-digitus-accent border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Español</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Appearance */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h2 className="text-lg font-medium text-gray-900">{t('preferences.appearance')}</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {t('preferences.appearanceDesc')}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('common.theme')}
                                        </label>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="theme"
                                                    value="light"
                                                    defaultChecked
                                                    className="h-4 w-4 text-digitus-accent focus:ring-digitus-accent border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">{t('common.light')}</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="theme"
                                                    value="dark"
                                                    className="h-4 w-4 text-digitus-accent focus:ring-digitus-accent border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">{t('common.dark')}</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="theme"
                                                    value="auto"
                                                    className="h-4 w-4 text-digitus-accent focus:ring-digitus-accent border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">{t('common.auto')}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('preferences.colorScheme')}
                                        </label>
                                        <div className="flex space-x-3">
                                            <button className="w-8 h-8 rounded-full bg-digitus-accent border-2 border-digitus-accent-600"></button>
                                            <button className="w-8 h-8 rounded-full bg-blue-500 border-2 border-gray-200"></button>
                                            <button className="w-8 h-8 rounded-full bg-green-500 border-2 border-gray-200"></button>
                                            <button className="w-8 h-8 rounded-full bg-purple-500 border-2 border-gray-200"></button>
                                            <button className="w-8 h-8 rounded-full bg-red-500 border-2 border-gray-200"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard Layout */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h2 className="text-lg font-medium text-gray-900">Dashboard Layout</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Configure how information is displayed on your dashboard.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Compact Mode</h4>
                                            <p className="text-sm text-gray-500">Show more information in less space</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Show Recent Activity</h4>
                                            <p className="text-sm text-gray-500">Display recent orders and activities on dashboard</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Show Quick Stats</h4>
                                            <p className="text-sm text-gray-500">Display summary statistics on dashboard</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Data & Privacy */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h2 className="text-lg font-medium text-gray-900">Data & Privacy</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Control how your data is used and stored.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Analytics Tracking</h4>
                                            <p className="text-sm text-gray-500">Help us improve by sharing anonymous usage data</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Error Reporting</h4>
                                            <p className="text-sm text-gray-500">Automatically report errors to help us fix issues</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Data Backup</h4>
                                            <p className="text-sm text-gray-500">Automatically backup your data to cloud storage</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Accessibility */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h2 className="text-lg font-medium text-gray-900">Accessibility</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Make the application more accessible for your needs.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Font Size
                                        </label>
                                        <select
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            defaultValue="medium"
                                        >
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                            <option value="extra-large">Extra Large</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">High Contrast Mode</h4>
                                            <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Screen Reader Support</h4>
                                            <p className="text-sm text-gray-500">Optimize interface for screen readers</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Keyboard Navigation</h4>
                                            <p className="text-sm text-gray-500">Enable enhanced keyboard navigation</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button className="bg-digitus-accent hover:bg-digitus-accent-700 text-white px-6 py-2 rounded-md text-sm font-medium">
                                    {t('preferences.savePreferences')}
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
