'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'es'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
    isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
    children: React.ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>('en')
    const [translations, setTranslations] = useState<Record<string, any>>({})
    const [isLoading, setIsLoading] = useState(true)

    // Load translations
    useEffect(() => {
        const loadTranslations = async () => {
            try {
                setIsLoading(true)
                const response = await fetch(`/locales/${language}.json`)
                if (response.ok) {
                    const data = await response.json()
                    setTranslations(data)
                } else {
                    console.error('Failed to load translations')
                    // Fallback to English if translation fails
                    if (language !== 'en') {
                        const fallbackResponse = await fetch('/locales/en.json')
                        if (fallbackResponse.ok) {
                            const fallbackData = await fallbackResponse.json()
                            setTranslations(fallbackData)
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading translations:', error)
                // Fallback to English
                if (language !== 'en') {
                    try {
                        const fallbackResponse = await fetch('/locales/en.json')
                        if (fallbackResponse.ok) {
                            const fallbackData = await fallbackResponse.json()
                            setTranslations(fallbackData)
                        }
                    } catch (fallbackError) {
                        console.error('Error loading fallback translations:', fallbackError)
                    }
                }
            } finally {
                setIsLoading(false)
            }
        }

        loadTranslations()
    }, [language])

    // Load initial translations on mount
    useEffect(() => {
        const loadInitialTranslations = async () => {
            try {
                const response = await fetch('/locales/en.json')
                if (response.ok) {
                    const data = await response.json()
                    setTranslations(data)
                }
            } catch (error) {
                console.error('Error loading initial translations:', error)
            }
        }

        loadInitialTranslations()
    }, [])

    // Load saved language preference
    useEffect(() => {
        const savedLanguage = localStorage.getItem('digitus-language') as Language
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
            setLanguageState(savedLanguage)
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0]
            if (browserLang === 'es') {
                setLanguageState('es')
            } else {
                setLanguageState('en')
            }
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('digitus-language', lang)
    }

    const t = (key: string): string => {
        // If translations are not loaded yet, return the key
        if (Object.keys(translations).length === 0) {
            return key
        }

        const keys = key.split('.')
        let value: any = translations

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k]
            } else {
                // Return the key if translation not found
                return key
            }
        }

        return typeof value === 'string' ? value : key
    }

    const value: LanguageContextType = {
        language,
        setLanguage,
        t,
        isLoading
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}

// Hook for getting translations with fallback
export function useTranslation() {
    const { t, language, isLoading } = useLanguage()

    return {
        t,
        language,
        isLoading,
        isSpanish: language === 'es',
        isEnglish: language === 'en'
    }
}

