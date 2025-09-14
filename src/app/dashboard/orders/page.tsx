'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { DashboardLayout } from '@/components/DashboardLayout'

interface Order {
    id: string
    orderId?: number
    orderNumber?: string
    price: number
    quantity: number
    totalPrice: number
    webDesignType?: string
    status: string
    createdAt: string
    service: {
        id: string
        serviceId?: number
        name: string
        description: string
        shortDescription?: string
    }
}

export default function OrdersPage() {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
    const [deletingOrder, setDeletingOrder] = useState<string | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState<{ show: boolean; order: Order | null }>({ show: false, order: null })

    // Fetch orders on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders')
                if (response.ok) {
                    const data = await response.json()
                    setOrders(data)
                }
            } catch (error) {
                console.error('Error fetching orders:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    // Calculate order statistics
    const totalOrders = orders.length
    const pendingOrders = orders.filter(order => order.status === 'PENDING').length
    const inProgressOrders = orders.filter(order => order.status === 'IN_PROGRESS').length
    const completedOrders = orders.filter(order => order.status === 'COMPLETED').length
    const cancelledOrders = orders.filter(order => order.status === 'CANCELLED').length

    // Toggle order expansion
    const toggleExpanded = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId)
    }

    // Handle order deletion
    const handleDeleteOrder = async (order: Order) => {
        if (order.status !== 'PENDING') {
            alert('Only pending orders can be deleted.')
            return
        }

        setShowDeleteModal({ show: true, order })
    }

    // Confirm order deletion
    const confirmDeleteOrder = async () => {
        if (!showDeleteModal.order) return

        setDeletingOrder(showDeleteModal.order.id)
        try {
            const response = await fetch(`/api/orders/${showDeleteModal.order.id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                // Remove the order from the list
                setOrders(prev => prev.filter(order => order.id !== showDeleteModal.order!.id))
                alert('Order deleted successfully!')
            } else {
                const error = await response.json()
                alert(`Error deleting order: ${error.error}`)
            }
        } catch (error) {
            console.error('Error deleting order:', error)
            alert('Error deleting order. Please try again.')
        } finally {
            setDeletingOrder(null)
            setShowDeleteModal({ show: false, order: null })
        }
    }

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800'
            case 'IN_PROGRESS':
                return 'bg-purple-100 text-purple-800'
            case 'COMPLETED':
                return 'bg-green-100 text-green-800'
            case 'CANCELLED':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Get service icon based on service type
    const getServiceIcon = (serviceName: string) => {
        const name = serviceName.toLowerCase()
        if (name.includes('web') || name.includes('design')) {
            return (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            )
        } else if (name.includes('hosting')) {
            return (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
            )
        } else if (name.includes('content') || name.includes('writing')) {
            return (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            )
        } else if (name.includes('marketing')) {
            return (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        } else {
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
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('navigation.orders')}</h1>
                <p className="mt-1 text-sm text-gray-600">
                    {t('orders.description')}
                </p>
            </div>

            {/* Orders Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-500">{t('orders.totalOrders')}</p>
                            <p className="text-xl font-semibold text-gray-900">{totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-500">{t('orders.pending')}</p>
                            <p className="text-xl font-semibold text-gray-900">{pendingOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-500">In Progress</p>
                            <p className="text-xl font-semibold text-gray-900">{inProgressOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-500">{t('orders.completed')}</p>
                            <p className="text-xl font-semibold text-gray-900">{completedOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-500">{t('orders.cancelled')}</p>
                            <p className="text-xl font-semibold text-gray-900">{cancelledOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
                {orders.length > 0 ? (
                    orders.map((order) => {
                        const isExpanded = expandedOrder === order.id
                        const orderNumber = order.orderNumber || `#${order.orderId?.toString().padStart(6, '0') || order.id.slice(0, 8)}`
                        const serviceId = order.service?.serviceId ? `S${order.service.serviceId.toString().padStart(5, '0')}` : order.service?.id?.slice(0, 8) || 'N/A'

                        return (
                            <div key={order.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                                {/* Main Order Card */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        {/* Left Side - Icon, Order Info, Service */}
                                        <div className="flex items-center space-x-4 flex-1">
                                            {/* Service Icon */}
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                                    {getServiceIcon(order.service?.name || '')}
                                                </div>
                                            </div>

                                            {/* Order Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="text-base font-semibold text-gray-900">
                                                        {orderNumber}
                                                    </h3>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {order.service?.name || 'Unknown Service'}
                                                </p>
                                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side - Price and Actions */}
                                        <div className="flex items-center space-x-3">
                                            {/* Price */}
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-indigo-600">${order.totalPrice}</div>
                                                <div className="text-xs text-gray-500">total</div>
                                            </div>

                                            {/* Expand Arrow */}
                                            <button
                                                onClick={() => toggleExpanded(order.id)}
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

                                            {/* Delete Button - Only for pending orders */}
                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleDeleteOrder(order)}
                                                    disabled={deletingOrder === order.id}
                                                    className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {deletingOrder === order.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 bg-gray-50">
                                        <div className="p-4 space-y-4">
                                            {/* Order Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                    <h4 className="font-semibold text-gray-900 mb-2">Order Information</h4>
                                                    <dl className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <dt className="text-sm text-gray-500">Order Number:</dt>
                                                            <dd className="text-sm font-medium text-gray-900">{orderNumber}</dd>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <dt className="text-sm text-gray-500">Service ID:</dt>
                                                            <dd className="text-sm font-medium text-gray-900">{serviceId}</dd>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <dt className="text-sm text-gray-500">Quantity:</dt>
                                                            <dd className="text-sm font-medium text-gray-900">{order.quantity}</dd>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <dt className="text-sm text-gray-500">Unit Price:</dt>
                                                            <dd className="text-sm font-medium text-gray-900">${order.price}</dd>
                                                        </div>
                                                        <div className="flex justify-between border-t pt-2">
                                                            <dt className="text-sm font-medium text-gray-900">Total Price:</dt>
                                                            <dd className="text-sm font-bold text-indigo-600">${order.totalPrice}</dd>
                                                        </div>
                                                    </dl>
                                                </div>

                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                    <h4 className="font-semibold text-gray-900 mb-2">Service Details</h4>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <dt className="text-sm text-gray-500">Service Name:</dt>
                                                            <dd className="text-sm font-medium text-gray-900">{order.service?.name || 'Unknown Service'}</dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-sm text-gray-500">Description:</dt>
                                                            <dd className="text-sm text-gray-600 mt-1">
                                                                {order.service?.shortDescription || order.service?.description || 'Professional service tailored to your needs.'}
                                                            </dd>
                                                        </div>
                                                        {order.webDesignType && (
                                                            <div>
                                                                <dt className="text-sm text-gray-500">Website Type:</dt>
                                                                <dd className="text-sm font-medium text-gray-900">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.webDesignType === 'wordpress'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-green-100 text-green-800'
                                                                        }`}>
                                                                        {order.webDesignType === 'wordpress' ? 'WordPress' : 'Dynamic HTML'}
                                                                    </span>
                                                                </dd>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Information */}
                                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <h4 className="font-semibold text-gray-900 mb-3">Status Information</h4>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Current Status</p>
                                                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">Order Date</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {new Date(order.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('orders.noOrdersYet')}</h2>
                        <p className="text-gray-600 mb-6">
                            {t('orders.noOrdersDesc')}
                        </p>
                        <a
                            href="/dashboard/services"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {t('orders.browseServices')}
                        </a>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal.show && showDeleteModal.order && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Order</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete order <strong>{showDeleteModal.order.orderNumber || `#${showDeleteModal.order.orderId?.toString().padStart(6, '0')}`}</strong>?
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={confirmDeleteOrder}
                                    disabled={deletingOrder === showDeleteModal.order.id}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deletingOrder === showDeleteModal.order.id ? 'Deleting...' : 'Delete Order'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal({ show: false, order: null })}
                                    className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}