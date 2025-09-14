'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'

interface UserRow {
    id: string
    name: string
    email: string
    userType: 'REGULAR' | 'CORPORATION' | 'EDUCATION' | 'ADMIN'
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
}

export default function UsersPage() {
    const { user } = useAuth()
    const [rows, setRows] = useState<UserRow[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [deletingUser, setDeletingUser] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/users?limit=50&search=${encodeURIComponent(search)}`)
                if (res.ok) {
                    const data = await res.json()
                    setRows(data.users)
                }
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [search])

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone and will delete all their orders and data.`)) {
            return
        }

        setDeletingUser(userId)
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                const result = await response.json()
                alert(result.message)
                // Refresh the users list
                const res = await fetch(`/api/users?limit=50&search=${encodeURIComponent(search)}`)
                if (res.ok) {
                    const data = await res.json()
                    setRows(data.users)
                }
            } else {
                const error = await response.json()
                alert(`Error deleting user: ${error.error}`)
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Error deleting user. Please try again.')
        } finally {
            setDeletingUser(null)
        }
    }


    if (!user || user.userType !== 'ADMIN') {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50" />
            </DashboardLayout>
        )
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
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="px-3 py-2 border rounded-lg w-64"
                />
            </div>

            <div className="bg-white border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rows.map((u) => (
                            <tr key={u.id}>
                                <td className="px-4 py-3 text-sm text-gray-900">{u.name || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                                <td className="px-4 py-3 text-sm">
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={u.userType}
                                        onChange={async (e) => {
                                            const userType = e.target.value
                                            const res = await fetch('/api/users', {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ id: u.id, userType })
                                            })
                                            if (res.ok) {
                                                const updated = await res.json()
                                                setRows((prev) => prev.map((r) => (r.id === u.id ? { ...r, userType: updated.userType } : r)))
                                            }
                                        }}
                                    >
                                        {['REGULAR', 'CORPORATION', 'EDUCATION', 'ADMIN'].map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                                        disabled={deletingUser === u.id || u.id === user?.id}
                                        title={u.id === user?.id ? "Cannot delete your own account" : ""}
                                    >
                                        {deletingUser === u.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {rows.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No users found.</div>
                )}
            </div>
        </DashboardLayout>
    )
}





