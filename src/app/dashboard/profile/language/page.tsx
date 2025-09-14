'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function LanguagePage() {
    const { user } = useAuth()
    const { language, setLanguage, t } = useLanguage()
    const [selectedLanguage, setSelectedLanguage] = useState(language)
    const [selectedTimezone, setSelectedTimezone] = useState('UTC')
    const [isSaving, setIsSaving] = useState(false)

    // Update selected language when context language changes
    useEffect(() => {
        setSelectedLanguage(language)
    }, [language])

    const handleLanguageChange = (langCode: string) => {
        setSelectedLanguage(langCode)
        setLanguage(langCode as 'en' | 'es')
    }

    const handleSavePreferences = async () => {
        setIsSaving(true)
        // Here you would typically save to user preferences in the database
        // For now, we'll just simulate a save
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSaving(false)
        // Show success message
        alert(t('languageSettings.preferencesSaved'))
    }

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
    ]

    const timezones = [
        { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
        { value: 'Europe/Paris', label: 'Central European Time (CET)' },
        { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
        { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
        { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
        { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
        { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
    ]

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t('languageSettings.title')}</h1>
                <p className="mt-2 text-gray-600">
                    {t('languageSettings.description')}
                </p>
            </div>

            <div className="space-y-6">
                {/* Language Selection */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900">{t('languageSettings.language')}</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {t('languageSettings.languageDescription')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => handleLanguageChange(language.code)}
                                className={`
                                    flex items-center p-3 rounded-lg border text-left transition-colors
                                    ${selectedLanguage === language.code
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <span className="text-2xl mr-3">{language.flag}</span>
                                <div>
                                    <div className="font-medium">{language.name}</div>
                                    <div className="text-sm text-gray-500">{language.code.toUpperCase()}</div>
                                </div>
                                {selectedLanguage === language.code && (
                                    <svg className="ml-auto h-5 w-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timezone Selection */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900">Timezone</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Select your timezone for accurate time display.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Timezone
                        </label>
                        <select
                            value={selectedTimezone}
                            onChange={(e) => setSelectedTimezone(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            {timezones.map((timezone) => (
                                <option key={timezone.value} value={timezone.value}>
                                    {timezone.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date & Time Format */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900">Date & Time Format</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Customize how dates and times are displayed.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Format
                            </label>
                            <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time Format
                            </label>
                            <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="12">12-hour (AM/PM)</option>
                                <option value="24">24-hour</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Currency */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900">Currency</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Set your preferred currency for pricing display.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Currency
                            </label>
                            <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="USD">USD - US Dollar ($)</option>
                                <option value="EUR">EUR - Euro (€)</option>
                                <option value="GBP">GBP - British Pound (£)</option>
                                <option value="JPY">JPY - Japanese Yen (¥)</option>
                                <option value="CAD">CAD - Canadian Dollar (C$)</option>
                                <option value="AUD">AUD - Australian Dollar (A$)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Currency Position
                            </label>
                            <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="before">Before amount ($100)</option>
                                <option value="after">After amount (100$)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSavePreferences}
                        disabled={isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md text-sm font-medium"
                    >
                        {isSaving ? t('common.loading') : t('languageSettings.savePreferences')}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )
}