'use client'

import { useEffect, useState } from 'react'
import { CAPABILITIES, CAPABILITY_LABELS, type Capability } from '@/lib/capabilities'

interface Role {
    id: string
    name: string
    description?: string
    isActive: boolean
    capabilities: RoleCapability[]
    _count: {
        users: number
    }
}

interface RoleCapability {
    id: string
    capability: string
    isGranted: boolean
}

interface CapabilityGroup {
    name: string
    capabilities: Capability[]
}

const CAPABILITY_GROUPS: CapabilityGroup[] = [
    {
        name: 'Project Management',
        capabilities: [
            CAPABILITIES.PROJECT_CREATE,
            CAPABILITIES.PROJECT_VIEW_ASSIGNED,
            CAPABILITIES.PROJECT_VIEW_ALL,
            CAPABILITIES.PROJECT_EDIT_ALL,
            CAPABILITIES.PROJECT_DELETE,
            CAPABILITIES.PROJECT_EXPORT,
        ]
    },
    {
        name: 'Service Management',
        capabilities: [
            CAPABILITIES.SERVICE_CREATE,
            CAPABILITIES.SERVICE_READ,
            CAPABILITIES.SERVICE_UPDATE,
            CAPABILITIES.SERVICE_DELETE,
            CAPABILITIES.SERVICE_EDIT,
            CAPABILITIES.SERVICE_ASSIGN,
            CAPABILITIES.SERVICE_MARK_DONE,
        ]
    },
    {
        name: 'Milestone Management',
        capabilities: [
            CAPABILITIES.MILESTONE_CREATE,
            CAPABILITIES.MILESTONE_READ,
            CAPABILITIES.MILESTONE_UPDATE,
            CAPABILITIES.MILESTONE_DELETE,
            CAPABILITIES.MILESTONE_EDIT,
            CAPABILITIES.MILESTONE_MARK_DELIVERED,
            CAPABILITIES.MILESTONE_MARK_COMPLETED,
        ]
    },
    {
        name: 'Task Management',
        capabilities: [
            CAPABILITIES.TASK_CREATE,
            CAPABILITIES.TASK_READ,
            CAPABILITIES.TASK_UPDATE,
            CAPABILITIES.TASK_DELETE,
        ]
    },
    {
        name: 'Billing & Payments',
        capabilities: [
            CAPABILITIES.BILLING_VIEW_OWN,
            CAPABILITIES.BILLING_VIEW_ALL,
            CAPABILITIES.INVOICE_VIEW_OWN,
            CAPABILITIES.INVOICE_VIEW_ALL,
            CAPABILITIES.PAYMENT_VIEW_OWN,
            CAPABILITIES.PAYMENT_VIEW_ALL,
            CAPABILITIES.PAYMENT_PROCESS,
            CAPABILITIES.PAYMENT_METHOD_MANAGE,
        ]
    },
    {
        name: 'User Management',
        capabilities: [
            CAPABILITIES.USER_VIEW,
            CAPABILITIES.USER_CREATE,
            CAPABILITIES.USER_EDIT,
            CAPABILITIES.USER_DELETE,
            CAPABILITIES.USER_MANAGE_ALL,
            CAPABILITIES.USER_ACTIVATE_DEACTIVATE,
        ]
    },
    {
        name: 'System Administration',
        capabilities: [
            CAPABILITIES.ADMIN_ACCESS,
            CAPABILITIES.SYSTEM_SETTINGS,
            CAPABILITIES.ANALYTICS_VIEW_ALL,
            CAPABILITIES.ROLE_MANAGE,
            CAPABILITIES.AUDIT_LOG_VIEW,
            CAPABILITIES.ALL_SECTIONS_ACCESS,
            CAPABILITIES.FILE_UPLOAD,
            CAPABILITIES.FILE_VIEW,
            CAPABILITIES.FILE_DELETE,
            CAPABILITIES.PROFILE_VIEW_EDIT,
        ]
    }
]


export default function RoleManagement() {
    const [roles, setRoles] = useState<Role[]>([])
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [capabilityStates, setCapabilityStates] = useState<Record<string, 'not_set' | 'allow' | 'prevent'>>({})

    useEffect(() => {
        loadRoles()
    }, [])

    useEffect(() => {
        if (selectedRole) {
            // Initialize capability states based on current role capabilities
            const states: Record<string, 'not_set' | 'allow' | 'prevent'> = {}

            // Set all capabilities to 'not_set' first
            Object.values(CAPABILITIES).forEach(capability => {
                states[capability] = 'not_set'
            })

            // Update based on current role capabilities
            selectedRole.capabilities.forEach(rc => {
                states[rc.capability] = rc.isGranted ? 'allow' : 'prevent'
            })

            setCapabilityStates(states)
        }
    }, [selectedRole])

    const loadRoles = async () => {
        try {
            console.log('Loading roles...')
            const response = await fetch('/api/roles')
            console.log('Roles response status:', response.status)
            if (response.ok) {
                const data = await response.json()
                console.log('Roles data received:', data)
                setRoles(data)
                if (data.length > 0 && !selectedRole) {
                    setSelectedRole(data[0])
                }
            } else {
                const errorText = await response.text()
                console.error('Roles API error:', response.status, errorText)
            }
        } catch (error) {
            console.error('Error loading roles:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCapabilityChange = (capability: string, value: 'not_set' | 'allow' | 'prevent') => {
        setCapabilityStates(prev => ({
            ...prev,
            [capability]: value
        }))
    }

    const saveRoleCapabilities = async () => {
        if (!selectedRole) return

        setSaving(true)
        try {
            // Get capabilities that need to be updated
            const capabilitiesToUpdate = Object.entries(capabilityStates).filter(([_, state]) => state !== 'not_set')

            // Update each capability
            for (const [capability, state] of capabilitiesToUpdate) {
                const isGranted = state === 'allow'

                const response = await fetch(`/api/roles/${selectedRole.id}/capabilities`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ capability, isGranted })
                })

                if (!response.ok) {
                    throw new Error(`Failed to update capability ${capability}`)
                }
            }

            // Reload roles to get updated data
            await loadRoles()
            alert('Role capabilities updated successfully!')
        } catch (error) {
            console.error('Error saving role capabilities:', error)
            alert('Error saving role capabilities. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const seedRoles = async () => {
        try {
            const response = await fetch('/api/admin/seed-roles', {
                method: 'POST'
            })

            if (response.ok) {
                alert('Roles seeded successfully!')
                await loadRoles()
            } else {
                const error = await response.json()
                alert(`Error seeding roles: ${error.error}`)
            }
        } catch (error) {
            console.error('Error seeding roles:', error)
            alert('Error seeding roles. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Define Role</h2>
                <div className="space-x-2">
                    <button
                        onClick={seedRoles}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Seed Roles
                    </button>
                    <button
                        onClick={saveRoleCapabilities}
                        disabled={saving || !selectedRole}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role Selection */}
                <div className="lg:col-span-1">
                    <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Role</h3>
                        <div className="space-y-2">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedRole?.id === role.id
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-medium">{role.name}</div>
                                    <div className="text-sm text-gray-500">{role.description}</div>
                                    <div className="text-xs text-gray-400">
                                        {role._count.users} user{role._count.users !== 1 ? 's' : ''}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Capabilities */}
                <div className="lg:col-span-2">
                    <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Capabilities for {selectedRole?.name || 'Select a role'}
                        </h3>

                        {selectedRole ? (
                            <div className="space-y-6">
                                {CAPABILITY_GROUPS.map((group) => (
                                    <div key={group.name}>
                                        <h4 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">
                                            {group.name}
                                        </h4>
                                        <div className="space-y-3">
                                            {group.capabilities.map((capability) => (
                                                <div key={capability} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">
                                                            {CAPABILITY_LABELS[capability]}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-mono">
                                                            {capability}
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name={`capability_${capability}`}
                                                                value="not_set"
                                                                checked={capabilityStates[capability] === 'not_set'}
                                                                onChange={() => handleCapabilityChange(capability, 'not_set')}
                                                                className="mr-2"
                                                            />
                                                            <span className="text-sm text-gray-600">Not set</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name={`capability_${capability}`}
                                                                value="allow"
                                                                checked={capabilityStates[capability] === 'allow'}
                                                                onChange={() => handleCapabilityChange(capability, 'allow')}
                                                                className="mr-2"
                                                            />
                                                            <span className="text-sm text-green-600">Allow</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                name={`capability_${capability}`}
                                                                value="prevent"
                                                                checked={capabilityStates[capability] === 'prevent'}
                                                                onChange={() => handleCapabilityChange(capability, 'prevent')}
                                                                className="mr-2"
                                                            />
                                                            <span className="text-sm text-red-600">Prevent</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                Select a role to manage its capabilities
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
