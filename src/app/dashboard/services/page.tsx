'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { DashboardLayout } from '@/components/DashboardLayout'

interface Service {
    id: string
    name: string
    shortDescription?: string
    description?: string
    price: number
    category?: string
    features?: string
    deliveryTime?: string
    image?: string
    serviceType?: string
    customFields?: string
    webDesignType?: string
    isActive: boolean
}

interface CustomFields {
    [key: string]: any
}

export default function ServicesPage() {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [ordering, setOrdering] = useState<string | null>(null)
    const [expandedService, setExpandedService] = useState<string | null>(null)
    const [quantities, setQuantities] = useState<Record<string, number>>({})
    const [webDesignTypes, setWebDesignTypes] = useState<Record<string, string>>({})
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [createdOrder, setCreatedOrder] = useState<any>(null)

    // Fetch services on component mount
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/services')
                if (response.ok) {
                    const data = await response.json()
                    setServices(data)
                }
            } catch (error) {
                console.error('Error fetching services:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [])

    // Create order function
    const createOrder = async (serviceId: string) => {
        setOrdering(serviceId)
        try {
            const quantity = quantities[serviceId] || 1
            const webDesignType = webDesignTypes[serviceId]

            const orderData: any = { serviceId, quantity }
            if (webDesignType) {
                orderData.webDesignType = webDesignType
            }

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            })

            if (response.ok) {
                const order = await response.json()
                setCreatedOrder(order)
                setShowSuccessModal(true)
                // Reset quantity after successful order
                setQuantities(prev => ({ ...prev, [serviceId]: 1 }))
            } else {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }))
                alert(`Error creating order: ${error.error}`)
            }
        } catch (error) {
            console.error('Error creating order:', error)
            alert('Error creating order. Please try again.')
        } finally {
            setOrdering(null)
        }
    }

    // Handle quantity change
    const handleQuantityChange = (serviceId: string, quantity: number) => {
        setQuantities(prev => ({ ...prev, [serviceId]: quantity }))
    }

    // Handle web design type change
    const handleWebDesignTypeChange = (serviceId: string, type: string) => {
        setWebDesignTypes(prev => ({ ...prev, [serviceId]: type }))
    }

    // Toggle service expansion
    const toggleExpanded = (serviceId: string) => {
        setExpandedService(expandedService === serviceId ? null : serviceId)
    }

    // Calculate total price for a service
    const getTotalPrice = (service: Service) => {
        const quantity = quantities[service.id] || 1
        return (service.price * quantity).toFixed(2)
    }

    // Handle success modal close and redirect
    const handleSuccessModalClose = () => {
        setShowSuccessModal(false)
        setCreatedOrder(null)
        // Hard reload to orders page
        window.location.href = '/dashboard/orders'
    }

    // Parse custom fields
    const getCustomFields = (service: Service): CustomFields => {
        try {
            return service.customFields ? JSON.parse(service.customFields) : {}
        } catch {
            return {}
        }
    }

    // Get service-specific icon based on service type
    const getServiceIcon = (serviceType?: string) => {
        switch (serviceType) {
            case 'web-design':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                )
            case 'hosting':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                )
            case 'content':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                )
            case 'marketing':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                )
            default:
                return (
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        D
                    </div>
                )
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t('navigation.services')}</h1>
                <p className="mt-2 text-gray-600">
                    {t('services.description')}
                </p>
            </div>

            {/* Admin Controls */}
            {user?.userType === 'ADMIN' && (
                <div className="mb-6">
                    <button
                        onClick={async () => {
                            const name = prompt('Service name:')
                            if (!name) return
                            const priceStr = prompt('Price (e.g. 99.99):')
                            if (!priceStr) return
                            const price = parseFloat(priceStr)
                            if (Number.isNaN(price)) return alert('Invalid price')
                            const res = await fetch('/api/services', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name, price })
                            })
                            if (res.ok) {
                                const created = await res.json()
                                setServices(prev => [created, ...prev])
                            } else {
                                const err = await res.json().catch(() => ({}))
                                alert(err.error || 'Failed to create service')
                            }
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Create Service
                    </button>
                </div>
            )}

            {/* Services List */}
            <div className="space-y-4">
                {services.map((service) => {
                    const isExpanded = expandedService === service.id
                    const quantity = quantities[service.id] || 1
                    const totalPrice = getTotalPrice(service)
                    const customFields = getCustomFields(service)

                    return (
                        <div key={service.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                            {/* Main Service Card */}
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    {/* Left Side - Icon, Name, Description */}
                                    <div className="flex items-center space-x-4 flex-1">
                                        {/* Service Icon */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                                {getServiceIcon(service.serviceType)}
                                            </div>
                                        </div>

                                        {/* Service Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {service.name}
                                                </h3>
                                                {service.category && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        {service.category}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {service.shortDescription || service.description || 'Professional service tailored to your needs.'}
                                            </p>
                                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {service.deliveryTime || '5-7 business days'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side - Price and Actions */}
                                    <div className="flex items-center space-x-4">
                                        {/* Price */}
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-indigo-600">${service.price}</div>
                                            <div className="text-xs text-gray-500">per unit</div>
                                        </div>

                                        {/* Expand Arrow */}
                                        <button
                                            onClick={() => toggleExpanded(service.id)}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        >
                                            <svg
                                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Admin actions */}
                                        {user?.userType === 'ADMIN' && (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={async () => {
                                                        const name = prompt('New name:', service.name) || service.name
                                                        const priceStr = prompt('New price:', String(service.price)) || String(service.price)
                                                        const price = parseFloat(priceStr)
                                                        if (Number.isNaN(price)) return alert('Invalid price')
                                                        const res = await fetch('/api/services', {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ id: service.id, name, price })
                                                        })
                                                        if (res.ok) {
                                                            const updated = await res.json()
                                                            setServices(prev => prev.map(s => s.id === updated.id ? updated : s))
                                                        } else {
                                                            const err = await res.json().catch(() => ({}))
                                                            alert(err.error || 'Failed to update service')
                                                        }
                                                    }}
                                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Delete this service?')) return
                                                        const res = await fetch(`/api/services?id=${service.id}`, { method: 'DELETE' })
                                                        if (res.ok) {
                                                            setServices(prev => prev.filter(s => s.id !== service.id))
                                                        } else {
                                                            const err = await res.json().catch(() => ({}))
                                                            alert(err.error || 'Failed to delete service')
                                                        }
                                                    }}
                                                    className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 bg-gray-50">
                                    <div className="p-6 space-y-6">
                                        {/* Description */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {service.description || service.shortDescription || 'Professional service tailored to your needs.'}
                                            </p>
                                        </div>

                                        {/* Custom Fields based on Service Type */}
                                        {Object.keys(customFields).length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {Object.entries(customFields).map(([key, value]) => (
                                                        <div key={key} className="bg-white p-3 rounded-lg border border-gray-200">
                                                            <dt className="text-sm font-medium text-gray-500 capitalize">
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </dt>
                                                            <dd className="mt-1 text-sm text-gray-900">
                                                                {Array.isArray(value) ? (
                                                                    <ul className="space-y-1">
                                                                        {value.map((item, index) => (
                                                                            <li key={index} className="flex items-center">
                                                                                <svg className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                                {item}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    value
                                                                )}
                                                            </dd>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Web Design Type Selection - Only for Web Design services */}
                                        {service.serviceType === 'web-design' && (
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <h4 className="font-semibold text-gray-900 mb-3">Website Type</h4>
                                                <p className="text-sm text-gray-600 mb-4">Choose the type of website you need:</p>
                                                <div className="space-y-3">
                                                    <label className="flex items-center space-x-3 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`webDesignType-${service.id}`}
                                                            value="wordpress"
                                                            checked={webDesignTypes[service.id] === 'wordpress'}
                                                            onChange={(e) => handleWebDesignTypeChange(service.id, e.target.value)}
                                                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">WordPress</div>
                                                                    <div className="text-sm text-gray-500">Easy-to-manage CMS with themes and plugins</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>

                                                    <label className="flex items-center space-x-3 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`webDesignType-${service.id}`}
                                                            value="dynamic-html"
                                                            checked={webDesignTypes[service.id] === 'dynamic-html'}
                                                            onChange={(e) => handleWebDesignTypeChange(service.id, e.target.value)}
                                                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center">
                                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">Dynamic HTML</div>
                                                                    <div className="text-sm text-gray-500">Custom-built website with modern frameworks</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {/* Features */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                                            <ul className="space-y-2">
                                                {(service.features || 'Quality service\nProfessional support\nFast delivery')
                                                    .split('\n')
                                                    .filter(feature => feature.trim())
                                                    .map((feature, index) => (
                                                        <li key={index} className="flex items-start text-sm text-gray-600">
                                                            <svg className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            {feature}
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>

                                        {/* Quantity Selection and Order */}
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Quantity
                                                    </label>
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => handleQuantityChange(service.id, Math.max(1, quantity - 1))}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                            </svg>
                                                        </button>
                                                        <span className="w-12 text-center font-medium">{quantity}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(service.id, quantity + 1)}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-900">${totalPrice}</div>
                                                    <div className="text-sm text-gray-500">total</div>
                                                </div>

                                                <button
                                                    onClick={() => createOrder(service.id)}
                                                    disabled={ordering === service.id}
                                                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {ordering === service.id ? (
                                                        <div className="flex items-center">
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Creating Order...
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                                            </svg>
                                                            Order Now
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {services.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Services Available</h2>
                    <p className="text-gray-600">
                        There are currently no services available. Please check back later.
                    </p>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && createdOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
                        <div className="text-center">
                            {/* Success Icon */}
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            {/* Success Message */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Order Created Successfully!
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Your order <span className="font-medium text-indigo-600">#{createdOrder.orderNumber || createdOrder.id}</span> has been created and is now pending.
                            </p>

                            {/* Order Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="text-sm text-gray-600">
                                    <div className="flex justify-between mb-1">
                                        <span>Service:</span>
                                        <span className="font-medium">{createdOrder.service?.name || 'Unknown Service'}</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span>Quantity:</span>
                                        <span className="font-medium">{createdOrder.quantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total:</span>
                                        <span className="font-medium text-indigo-600">${Number(createdOrder.totalPrice || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* OK Button */}
                            <button
                                onClick={handleSuccessModalClose}
                                className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                OK - View Orders
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

