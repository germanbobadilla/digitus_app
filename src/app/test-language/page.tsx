'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function TestLanguagePage() {
    const { language, setLanguage, t, isLoading } = useLanguage()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    {t('languageSettings.title')}
                </h1>

                <div className="space-y-6">
                    <div className="text-center">
                        <p className="text-lg text-gray-600 mb-4">
                            {t('languageSettings.description')}
                        </p>
                        <p className="text-sm text-gray-500">
                            Current language: <span className="font-semibold">{language.toUpperCase()}</span>
                        </p>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${language === 'en'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            🇺🇸 English
                        </button>
                        <button
                            onClick={() => setLanguage('es')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${language === 'es'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            🇪🇸 Español
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {t('common.settings')}
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('common.login')}:</span>
                                <span className="font-medium">{t('common.login')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('common.register')}:</span>
                                <span className="font-medium">{t('common.register')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('common.logout')}:</span>
                                <span className="font-medium">{t('common.logout')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('navigation.dashboard')}:</span>
                                <span className="font-medium">{t('navigation.dashboard')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('navigation.services')}:</span>
                                <span className="font-medium">{t('navigation.services')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <a
                            href="/dashboard/language"
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            → Go to Language Settings
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
