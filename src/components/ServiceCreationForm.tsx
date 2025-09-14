'use client'

import { useState, useEffect } from 'react'
import { useCapabilities } from '@/hooks/useCapabilities'
import { CAPABILITIES } from '@/lib/capabilities'

interface ServiceFormData {
    // Required fields
    name: string
    shortDescription: string
    description: string
    price: number
    category: string
    serviceType: string
    duration: string

    // Optional fields
    features?: string
    deliveryTime?: string
    webDesignType?: string // Only relevant when serviceType = 'web-design'
    isOnline: boolean
    image?: string
    customFields: {
        pagesIncluded?: number
        revisions?: number
        technologies?: string
        [key: string]: any // Allow additional custom fields
    }
    phases: {
        showPhases: boolean
        phases: Array<{
            name: string
            description: string
        }>
    }
}

interface ServiceCreationFormProps {
    onSuccess?: (service: any) => void
    onCancel?: () => void
}

const SERVICE_CATEGORIES = [
    'Web Design',
    'Development',
    'Hosting',
    'Content',
    'Marketing',
    'Consulting',
    'Support',
    'Other'
]

const SERVICE_TYPES = [
    'web-design',
    'development',
    'hosting',
    'content-writing',
    'marketing',
    'consulting',
    'support',
    'other'
]

const WEB_DESIGN_TYPES = [
    'Landing Page',
    'Corporate Website',
    'E-commerce',
    'Portfolio',
    'Blog',
    'Custom Application',
    'Other'
]

const DURATION_OPTIONS = [
    '1-3 days',
    '1 week',
    '2 weeks',
    '1 month',
    '2-3 months',
    '3-6 months',
    '6+ months',
    'Ongoing'
]

export default function ServiceCreationForm({ onSuccess, onCancel }: ServiceCreationFormProps) {
    const { hasCapability } = useCapabilities()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const canSetPrice = hasCapability(CAPABILITIES.SERVICE_SET_PRICE)
    const canCreatePhases = hasCapability(CAPABILITIES.SERVICE_CREATE_PHASES)

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel?.()
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onCancel])

    const [formData, setFormData] = useState<ServiceFormData>({
        // Required fields
        name: '',
        shortDescription: '',
        description: '',
        price: 0,
        category: '',
        serviceType: '',
        duration: '',

        // Optional fields
        features: '',
        deliveryTime: '',
        webDesignType: '',
        isOnline: true,
        image: '',
        customFields: {
            pagesIncluded: 0,
            revisions: 0,
            technologies: ''
        },
        phases: {
            showPhases: false,
            phases: [
                { name: 'Phase 1', description: '' },
                { name: 'Phase 2', description: '' },
                { name: 'Phase 3', description: '' },
                { name: 'Phase 4', description: '' },
                { name: 'Phase 5', description: '' }
            ]
        }
    })

    const handleInputChange = (field: keyof ServiceFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleCustomFieldChange = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            customFields: {
                ...prev.customFields,
                [key]: value
            }
        }))
    }

    const handlePhaseToggle = (showPhases: boolean) => {
        setFormData(prev => ({
            ...prev,
            phases: {
                ...prev.phases,
                showPhases
            }
        }))
    }

    const handlePhaseDescriptionChange = (phaseIndex: number, description: string) => {
        setFormData(prev => ({
            ...prev,
            phases: {
                ...prev.phases,
                phases: prev.phases.phases.map((phase, index) =>
                    index === phaseIndex ? { ...phase, description } : phase
                )
            }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            console.log('Form data being sent:', formData)
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    customFields: JSON.stringify(formData.customFields),
                    phases: JSON.stringify(formData.phases),
                    isActive: true
                })
            })

            if (response.ok) {
                const newService = await response.json()
                onSuccess?.(newService)
                // Reset form
                setFormData({
                    // Required fields
                    name: '',
                    shortDescription: '',
                    description: '',
                    price: 0,
                    category: '',
                    serviceType: '',
                    duration: '',

                    // Optional fields
                    features: '',
                    deliveryTime: '',
                    webDesignType: '',
                    isOnline: true,
                    image: '',
                    customFields: {
                        pagesIncluded: 0,
                        revisions: 0,
                        technologies: ''
                    },
                    phases: {
                        showPhases: false,
                        phases: [
                            { name: 'Phase 1', description: '' },
                            { name: 'Phase 2', description: '' },
                            { name: 'Phase 3', description: '' },
                            { name: 'Phase 4', description: '' },
                            { name: 'Phase 5', description: '' }
                        ]
                    }
                })
            } else {
                const errorData = await response.json()
                console.error('Service creation error:', errorData)
                setError(errorData.error || 'Failed to create service')
            }
        } catch (err) {
            console.error('Network error:', err)
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onCancel?.()
                }
            }}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Create New Service</h2>
                            <p className="text-gray-600">Fill out the form below to create a new service offering.</p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Service Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                                    placeholder="e.g., Professional Web Design"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                                    required
                                >
                                    <option value="" className="text-gray-500">Select a category</option>
                                    {SERVICE_CATEGORIES.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Short Description and Detailed Description */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Short Description *
                                </label>
                                <input
                                    type="text"
                                    value={formData.shortDescription}
                                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                                    placeholder="Brief description for service cards"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Detailed Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                                    placeholder="Comprehensive description of the service"
                                    required
                                />
                            </div>
                        </div>

                        {/* Price and Duration */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 ${!canSetPrice ? 'bg-gray-100 cursor-not-allowed' : ''
                                        }`}
                                    placeholder="0.00"
                                    disabled={!canSetPrice}
                                    required
                                />
                                {!canSetPrice && (
                                    <p className="text-xs text-gray-500 mt-1">You don't have permission to set prices</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration *
                                </label>
                                <select
                                    value={formData.duration}
                                    onChange={(e) => handleInputChange('duration', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                                    required
                                >
                                    <option value="" className="text-gray-500">Select duration</option>
                                    {DURATION_OPTIONS.map(duration => (
                                        <option key={duration} value={duration}>{duration}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Time
                                </label>
                                <input
                                    type="text"
                                    value={formData.deliveryTime}
                                    onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                                    placeholder="e.g., 7-14 days"
                                />
                            </div>
                        </div>

                        {/* Service Type and Delivery Method */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Service Type *
                                </label>
                                <select
                                    value={formData.serviceType}
                                    onChange={(e) => handleInputChange('serviceType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                                    required
                                >
                                    <option value="" className="text-gray-500">Select service type</option>
                                    {SERVICE_TYPES.map(type => (
                                        <option key={type} value={type}>{type.replace('-', ' ').toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Method *
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            checked={formData.isOnline}
                                            onChange={() => handleInputChange('isOnline', true)}
                                            className="mr-2"
                                        />
                                        Online
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            checked={!formData.isOnline}
                                            onChange={() => handleInputChange('isOnline', false)}
                                            className="mr-2"
                                        />
                                        In Person
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Web Design Type and Features */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Web Design Type (if applicable) */}
                            {formData.serviceType === 'web-design' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Web Design Type
                                    </label>
                                    <select
                                        value={formData.webDesignType}
                                        onChange={(e) => handleInputChange('webDesignType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                                    >
                                        <option value="" className="text-gray-500">Select web design type</option>
                                        {WEB_DESIGN_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Features
                                </label>
                                <textarea
                                    value={formData.features}
                                    onChange={(e) => handleInputChange('features', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                                    placeholder="List key features, one per line"
                                />
                            </div>
                        </div>

                        {/* Custom Fields */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Information
                            </label>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Pages Included</label>
                                        <input
                                            type="number"
                                            value={formData.customFields.pagesIncluded || ''}
                                            onChange={(e) => handleCustomFieldChange('pagesIncluded', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                                            placeholder="Number of pages"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Revisions</label>
                                        <input
                                            type="number"
                                            value={formData.customFields.revisions || ''}
                                            onChange={(e) => handleCustomFieldChange('revisions', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                                            placeholder="Number of revisions"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Technologies</label>
                                        <input
                                            type="text"
                                            value={formData.customFields.technologies || ''}
                                            onChange={(e) => handleCustomFieldChange('technologies', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                                            placeholder="e.g., React, Node.js, MongoDB"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phases/Stages - Only show if user has permission */}
                        {canCreatePhases && (
                            <div>
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="showPhases"
                                        checked={formData.phases.showPhases}
                                        onChange={(e) => handlePhaseToggle(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="showPhases" className="ml-2 block text-sm font-medium text-gray-700">
                                        Show Phases/Stages
                                    </label>
                                </div>

                                {formData.phases.showPhases && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Service Phases</h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        {formData.phases.phases.map((phase, index) => (
                                                            <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                {phase.name}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        {formData.phases.phases.map((phase, index) => (
                                                            <td key={index} className="px-3 py-2">
                                                                <input
                                                                    type="text"
                                                                    value={phase.description}
                                                                    onChange={(e) => handlePhaseDescriptionChange(index, e.target.value)}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                                                                    placeholder={`Enter ${phase.name.toLowerCase()} description`}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Enter a description for each phase. Leave empty if not applicable.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Creating...' : 'Create Service'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
