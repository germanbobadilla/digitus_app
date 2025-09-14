'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { DashboardLayout } from '@/components/DashboardLayout'

interface Order {
    id: string
    price: number
    quantity: number
    totalPrice: number
    webDesignType?: string
    status: string
    priority: string
    adminNotes?: string
    assignedTo?: string
    createdAt: string
    updatedAt: string
    user: {
        id: string
        name: string
        email: string
        userType: string
    }
    service: {
        id: string
        name: string
        description: string
    }
    payments: {
        id: string
        amount: number
        method: string
        status: string
        transactionId?: string
        adminNotes?: string
        confirmedAt?: string
        confirmedBy?: string
    }[]
}

export default function AdminOrdersPage() {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [editingOrder, setEditingOrder] = useState<string | null>(null)
    const [editingPayment, setEditingPayment] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({
        status: '',
        priority: '',
        adminNotes: '',
        assignedTo: '',
        price: '',
        quantity: '',
        totalPrice: '',
        webDesignType: ''
    })
    const [paymentForm, setPaymentForm] = useState({
        adminNotes: ''
    })
    const [deletingAll, setDeletingAll] = useState(false)

    // Fetch orders on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                console.log('Fetching admin orders...')
                const response = await fetch('/api/admin/orders')
                console.log('Admin orders response status:', response.status)

                if (response.ok) {
                    const data = await response.json()
                    console.log('Admin orders data:', data)
                    setOrders(data)
                } else {
                    const errorData = await response.json()
                    console.error('Admin orders API error:', errorData)
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

    // Handle order status update
    const handleOrderUpdate = async (orderId: string) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            })

            if (response.ok) {
                const updatedOrder = await response.json()
                setOrders(prev => prev.map(order =>
                    order.id === orderId ? { ...order, ...updatedOrder } : order
                ))
                setEditingOrder(null)
                setEditForm({ status: '', priority: '', adminNotes: '', assignedTo: '', price: '', quantity: '', totalPrice: '', webDesignType: '' })
            } else {
                const error = await response.json()
                alert(`Error updating order: ${error.error}`)
            }
        } catch (error) {
            console.error('Error updating order:', error)
            alert('Error updating order. Please try again.')
        }
    }

    // Handle payment confirmation
    const handlePaymentConfirmation = async (paymentId: string) => {
        try {
            const response = await fetch(`/api/admin/payments/${paymentId}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentForm),
            })

            if (response.ok) {
                const updatedPayment = await response.json()
                setOrders(prev => prev.map(order => ({
                    ...order,
                    payments: order.payments.map(payment =>
                        payment.id === paymentId ? { ...payment, ...updatedPayment } : payment
                    )
                })))
                setEditingPayment(null)
                setPaymentForm({ adminNotes: '' })
            } else {
                const error = await response.json()
                alert(`Error confirming payment: ${error.error}`)
            }
        } catch (error) {
            console.error('Error confirming payment:', error)
            alert('Error confirming payment. Please try again.')
        }
    }

    // Handle delete all orders
    const handleDeleteAllOrders = async () => {
        if (!confirm('Are you sure you want to delete ALL orders? This action cannot be undone and will delete all orders, payments, and related data.')) {
            return
        }

        setDeletingAll(true)
        try {
            const response = await fetch('/api/admin/orders/delete-all', {
                method: 'DELETE',
            })

            if (response.ok) {
                const result = await response.json()
                alert(result.message)
                setOrders([]) // Clear the orders from state
            } else {
                const error = await response.json()
                alert(`Error deleting orders: ${error.error}`)
            }
        } catch (error) {
            console.error('Error deleting all orders:', error)
            alert('Error deleting all orders. Please try again.')
        } finally {
            setDeletingAll(false)
        }
    }

    // Start editing order
    const startEditingOrder = (order: Order) => {
        setEditForm({
            status: order.status,
            priority: order.priority,
            adminNotes: order.adminNotes || '',
            assignedTo: order.assignedTo || '',
            price: order.price.toString(),
            quantity: order.quantity.toString(),
            totalPrice: order.totalPrice.toString(),
            webDesignType: order.webDesignType || ''
        })
        setEditingOrder(order.id)
    }

    // Start editing payment
    const startEditingPayment = (paymentId: string) => {
        setPaymentForm({ adminNotes: '' })
        setEditingPayment(paymentId)
    }

    // Handle price or quantity change to auto-calculate total
    const handlePriceOrQuantityChange = (field: 'price' | 'quantity', value: string) => {
        const newForm = { ...editForm, [field]: value }

        // Auto-calculate total price if both price and quantity are valid numbers
        const price = parseFloat(newForm.price)
        const quantity = parseInt(newForm.quantity)

        if (!isNaN(price) && !isNaN(quantity) && price > 0 && quantity > 0) {
            newForm.totalPrice = (price * quantity).toFixed(2)
        }

        setEditForm(newForm)
    }

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800'
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
            case 'COMPLETED': return 'bg-green-100 text-green-800'
            case 'CANCELLED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'LOW': return 'bg-green-100 text-green-800'
            case 'NORMAL': return 'bg-blue-100 text-blue-800'
            case 'HIGH': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
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
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin - Orders Management</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage all orders, update status, and confirm payments
                        </p>
                    </div>
                    <button
                        onClick={handleDeleteAllOrders}
                        disabled={deletingAll || orders.length === 0}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>{deletingAll ? 'Deleting...' : 'Delete All Orders'}</span>
                    </button>
                </div>
            </div>

            {/* Order Stats */}
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
                            <p className="text-xs font-medium text-gray-500">Total Orders</p>
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
                            <p className="text-xs font-medium text-gray-500">Pending</p>
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
                            <p className="text-xs font-medium text-gray-500">Completed</p>
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
                            <p className="text-xs font-medium text-gray-500">Cancelled</p>
                            <p className="text-xl font-semibold text-gray-900">{cancelledOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            #{order.orderNumber || order.orderId?.toString().padStart(6, '0') || order.id.slice(0, 8)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.user.email}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {order.user.userType}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {order.service.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: S{order.service.serviceId?.toString().padStart(5, '0') || order.service.id.slice(0, 8)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Qty: {order.quantity}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        ${order.totalPrice}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                                            {order.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {order.payments.length > 0 ? (
                                            <div className="space-y-1">
                                                {order.payments.map((payment) => (
                                                    <div key={payment.id} className="text-xs">
                                                        <div className={`inline-flex px-2 py-1 rounded-full ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {payment.status}
                                                        </div>
                                                        {payment.transactionId && (
                                                            <div className="text-gray-500 mt-1">
                                                                ID: {payment.transactionId}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">No payment</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => startEditingOrder(order)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </button>
                                            {order.payments.length > 0 && order.payments.some(p => p.status === 'PENDING') && (
                                                <button
                                                    onClick={() => startEditingPayment(order.payments.find(p => p.status === 'PENDING')?.id || '')}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Confirm Payment
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">Edit Order</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Status and Priority */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <select
                                            value={editForm.priority}
                                            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="NORMAL">Normal</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                                        <input
                                            type="text"
                                            value={editForm.assignedTo}
                                            onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Admin user ID"
                                        />
                                    </div>
                                </div>

                                {/* Pricing Information */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Unit Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.price}
                                            onChange={(e) => handlePriceOrQuantityChange('price', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={editForm.quantity}
                                            onChange={(e) => handlePriceOrQuantityChange('quantity', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.totalPrice}
                                            onChange={(e) => setEditForm({ ...editForm, totalPrice: e.target.value })}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Web Design Type */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700">Website Type</label>
                                <select
                                    value={editForm.webDesignType}
                                    onChange={(e) => setEditForm({ ...editForm, webDesignType: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Select website type</option>
                                    <option value="wordpress">WordPress</option>
                                    <option value="dynamic-html">Dynamic HTML</option>
                                </select>
                            </div>

                            {/* Admin Notes */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                                <textarea
                                    value={editForm.adminNotes}
                                    onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                                    rows={4}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Add admin notes, special instructions, or updates..."
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 mt-8">
                                <button
                                    onClick={() => setEditingOrder(null)}
                                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleOrderUpdate(editingOrder)}
                                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Update Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Payment Modal */}
            {editingPayment && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Payment</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                                    <textarea
                                        value={paymentForm.adminNotes}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, adminNotes: e.target.value })}
                                        rows={3}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Add confirmation notes..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setEditingPayment(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handlePaymentConfirmation(editingPayment)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
