'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/NextAuthContext'
import { hasCapabilityClient } from '@/lib/auth-utils'
import { CAPABILITIES } from '@/lib/capabilities'
import PermissionDenied from '@/components/PermissionDenied'

interface Payment {
    id: string
    paymentId: number
    amount: number
    method: string
    status: string
    description: string | null
    referenceNo: string | null
    transactionId: string | null
    createdAt: string
    paidAt: string | null
    confirmedAt: string | null
    user: {
        id: string
        name: string
        email: string
    }
}

interface Invoice {
    id: string
    invoiceNumber: string
    projectId: string
    userId: string
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
    subtotal: number
    taxAmount: number
    totalAmount: number
    currency: string
    dueDate: string
    issuedDate: string
    paidDate: string | null
    notes: string | null
    fiscalReceipt: boolean
    taxId: string | null
    businessName: string | null
    businessAddress: string | null
    project: {
        id: string
        name: string
        description: string | null
    }
    user: {
        id: string
        name: string
        email: string
    }
    lineItems: InvoiceLineItem[]
}

interface InvoiceLineItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
    serviceId: string | null
    service: {
        id: string
        name: string
    } | null
}

export default function BillingPage() {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [payments, setPayments] = useState<Payment[]>([])
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices')
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
    const [formData, setFormData] = useState({
        amount: '',
        method: 'CARD',
        description: '',
        referenceNo: ''
    })

    // Check permissions
    const [canViewOwnPayments, setCanViewOwnPayments] = useState(false)
    const [canViewAllPayments, setCanViewAllPayments] = useState(false)
    const [canViewOwnInvoices, setCanViewOwnInvoices] = useState(false)
    const [canViewAllInvoices, setCanViewAllInvoices] = useState(false)
    const [canCreateInvoices, setCanCreateInvoices] = useState(false)

    useEffect(() => {
        const checkPermissions = () => {
            if (user?.capabilities) {
                setCanViewOwnPayments(hasCapabilityClient(user.capabilities, CAPABILITIES.PAYMENT_VIEW_OWN))
                setCanViewAllPayments(hasCapabilityClient(user.capabilities, CAPABILITIES.PAYMENT_VIEW_ALL))
                setCanViewOwnInvoices(hasCapabilityClient(user.capabilities, CAPABILITIES.INVOICE_VIEW_OWN))
                setCanViewAllInvoices(hasCapabilityClient(user.capabilities, CAPABILITIES.INVOICE_VIEW_ALL))
                setCanCreateInvoices(hasCapabilityClient(user.capabilities, CAPABILITIES.PROJECT_CREATE)) // Managers can create invoices
            }
        }
        checkPermissions()
    }, [user])

    useEffect(() => {
        // Only fetch data when user is authenticated and capabilities are loaded
        if (user?.id && user?.capabilities && user.capabilities.length > 0) {
            if (canViewOwnPayments || canViewAllPayments) {
                fetchPayments()
            }
            if (canViewOwnInvoices || canViewAllInvoices) {
                fetchInvoices()
            }
        }
    }, [user?.id, user?.capabilities, canViewOwnPayments, canViewAllPayments, canViewOwnInvoices, canViewAllInvoices])

    const fetchPayments = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/payments', {
                credentials: 'include'
            })
            if (!response.ok) {
                if (response.status === 401) {
                    // User not authenticated - redirect to login
                    window.location.href = '/login'
                    return
                }
                if (response.status === 403) {
                    // User doesn't have permission - this shouldn't happen if capabilities are checked correctly
                    console.log('User does not have permission to view payments')
                    setPayments([]) // Set empty array instead of error
                    return
                }
                throw new Error('Failed to fetch payments')
            }
            const data = await response.json()
            setPayments(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const fetchInvoices = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/invoices', {
                credentials: 'include'
            })
            if (!response.ok) {
                if (response.status === 401) {
                    // User not authenticated - redirect to login
                    window.location.href = '/login'
                    return
                }
                if (response.status === 403) {
                    // User doesn't have permission - this shouldn't happen if capabilities are checked correctly
                    console.log('User does not have permission to view invoices')
                    setInvoices([]) // Set empty array instead of error
                    return
                }
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to fetch invoices')
            }
            const data = await response.json()
            setInvoices(data || []) // Ensure we always have an array
        } catch (err) {
            console.error('Error fetching invoices:', err)
            // Don't set error for empty invoices - this is normal
            if (err instanceof Error && !err.message.includes('not available')) {
                setError(err.message)
            } else {
                setInvoices([]) // Set empty array instead of error
            }
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingPayment) return

        try {
            const response = await fetch(`/api/payments/${editingPayment.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transactionId: formData.referenceNo,
                    description: formData.description
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update payment')
            }

            const updatedPayment = await response.json()
            setPayments(payments.map(p => p.id === updatedPayment.id ? updatedPayment : p))
            setEditingPayment(null)
            setFormData({ amount: '', method: 'CARD', description: '', referenceNo: '' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        }
    }

    const openEditModal = (payment: Payment) => {
        setEditingPayment(payment)
        setFormData({
            amount: payment.amount.toString(),
            method: payment.method,
            description: payment.description || '',
            referenceNo: payment.transactionId || ''
        })
    }

    const closeModals = () => {
        setShowAddPaymentModal(false)
        setEditingPayment(null)
        setFormData({ amount: '', method: 'CARD', description: '', referenceNo: '' })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800'
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800'
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800'
            case 'FAILED':
                return 'bg-red-100 text-red-800'
            case 'REFUNDED':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'CARD':
                return '💳'
            case 'BANK_TRANSFER':
                return '🏦'
            case 'DIGITAL_WALLET':
                return '📱'
            case 'CASH':
                return '💵'
            case 'CRYPTOCURRENCY':
                return '₿'
            default:
                return '💳'
        }
    }

    const getInvoiceStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-800'
            case 'SENT':
                return 'bg-blue-100 text-blue-800'
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800'
            case 'OVERDUE':
                return 'bg-red-100 text-red-800'
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-500'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getInvoiceStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID':
                return '✅'
            case 'SENT':
                return '📤'
            case 'DRAFT':
                return '📝'
            case 'OVERDUE':
                return '⚠️'
            case 'CANCELLED':
                return '❌'
            default:
                return '📄'
        }
    }

    const totalSpent = payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0)

    const totalInvoiced = invoices
        .filter(i => i.status === 'SENT' || i.status === 'PAID')
        .reduce((sum, i) => sum + i.totalAmount, 0)

    const totalPaid = invoices
        .filter(i => i.status === 'PAID')
        .reduce((sum, i) => sum + i.totalAmount, 0)

    const totalOutstanding = invoices
        .filter(i => i.status === 'SENT' || i.status === 'OVERDUE')
        .reduce((sum, i) => sum + i.totalAmount, 0)

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
                </div>
            </DashboardLayout>
        )
    }

    // Check if user has permission to view billing
    if (!canViewOwnPayments && !canViewAllPayments && !canViewOwnInvoices && !canViewAllInvoices) {
        return (
            <DashboardLayout>
                <PermissionDenied
                    action="view billing"
                    capability={CAPABILITIES.BILLING_VIEW_OWN}
                />
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t('billing.title')}</h1>
                <p className="mt-1 text-sm text-gray-600">
                    {t('billing.description')}
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'invoices'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            📄 Invoices
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'payments'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            💳 Payments
                        </button>
                    </nav>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {activeTab === 'invoices' ? (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                        <span className="text-white text-lg">📄</span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-xs font-medium text-gray-500">Total Invoiced</p>
                                    <p className="text-xl font-semibold text-gray-900">${totalInvoiced.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                        <span className="text-white text-lg">✅</span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-xs font-medium text-gray-500">Total Paid</p>
                                    <p className="text-xl font-semibold text-gray-900">${totalPaid.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                        <span className="text-white text-lg">⏰</span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-xs font-medium text-gray-500">Outstanding</p>
                                    <p className="text-xl font-semibold text-gray-900">${totalOutstanding.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-xs font-medium text-gray-500">{t('billing.totalSpent')}</p>
                                    <p className="text-xl font-semibold text-gray-900">${totalSpent.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-xs font-medium text-gray-500">{t('billing.transactions')}</p>
                                    <p className="text-xl font-semibold text-gray-900">{payments.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
                                    <p className="text-xl font-semibold text-gray-900">
                                        {payments.filter(p => p.status === 'PENDING').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Content based on active tab */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {activeTab === 'invoices' ? '📄 Invoices' : '💳 Payment History'}
                    </h2>
                    {activeTab === 'invoices' && canCreateInvoices && (
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                            + Create Invoice
                        </button>
                    )}
                </div>

                {activeTab === 'invoices' ? (
                    invoices.length === 0 ? (
                        <div className="p-8 text-center">
                            <span className="text-6xl">📄</span>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Invoices Yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {user?.userType === 'CLIENT'
                                    ? "You don't have any pending invoices at the moment. Invoices will appear here when they are created and sent to you."
                                    : "No invoices have been created yet. Create your first invoice to get started."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Invoice #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Project
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {invoice.invoiceNumber}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(invoice.issuedDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {invoice.project.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {invoice.project.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="font-medium">${invoice.totalAmount.toFixed(2)}</div>
                                                {invoice.taxAmount > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        Tax: ${invoice.taxAmount.toFixed(2)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusColor(invoice.status)}`}>
                                                    <span className="mr-1">{getInvoiceStatusIcon(invoice.status)}</span>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(invoice.dueDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button className="text-indigo-600 hover:text-indigo-900">
                                                        View
                                                    </button>
                                                    {invoice.status === 'SENT' && (
                                                        <button className="text-green-600 hover:text-green-900">
                                                            Pay
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    payments.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('billing.noTransactions')}</h3>
                            <p className="mt-1 text-sm text-gray-500">{t('billing.noTransactionsDesc')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('billing.description')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('billing.amount')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('billing.method')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('billing.status')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('billing.date')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.description || 'Payment'}
                                                </div>
                                                {payment.transactionId && (
                                                    <div className="text-sm text-gray-500">
                                                        {t('billing.transactionId')}: {payment.transactionId}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${payment.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-lg mr-2">{getMethodIcon(payment.method)}</span>
                                                    <span className="text-sm text-gray-900">{payment.method}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openEditModal(payment)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>

            {/* Edit Payment Modal */}
            {editingPayment && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Update Payment
                            </h3>
                            <form onSubmit={handleUpdatePayment}>
                                <div className="mb-4">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('billing.description')}
                                    </label>
                                    <input
                                        type="text"
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="referenceNo" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('billing.transactionId')}
                                    </label>
                                    <input
                                        type="text"
                                        id="referenceNo"
                                        value={formData.referenceNo}
                                        onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter transaction ID"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={closeModals}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        {t('common.save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}