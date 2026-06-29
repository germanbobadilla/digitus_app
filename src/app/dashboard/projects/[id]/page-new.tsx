import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'

interface Project {
    id: string
    projectId: number
    name: string
    description?: string
    status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED'
    assignedUserId?: string
    ownerId: string
    managerId: string
    createdAt: string
    updatedAt: string
    isActive: boolean
    assignedUser?: {
        id: string
        name: string
        email: string
    }
    services?: Service[]
    milestones?: Milestone[]
    tasks?: Task[]
}

interface Service {
    id: string
    projectId: string
    name: string
    description?: string
    price: number
    unit: 'hour' | 'day' | 'fixed'
    estimatedHours?: number
    actualHours?: number
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    createdAt: string
    updatedAt: string
}

interface Milestone {
    id: string
    projectId: string
    title: string
    description?: string
    status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED'
    dueDate?: string
    completedAt?: string
    estimatedHours?: number
    actualHours?: number
    createdAt: string
    updatedAt: string
}

interface Task {
    id: string
    projectId: string
    title: string
    description?: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    dueDate?: string
    completedAt?: string
    estimatedHours?: number
    actualHours?: number
    assignedTo?: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    createdAt: string
    updatedAt: string
}

export default function ProjectDetailPage() {
    const params = useParams()
    const { data: session } = useSession()
    const { t } = useLanguage()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updating, setUpdating] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'services' | 'milestones' | 'tasks'>('services')

    // Add form states
    const [showAddService, setShowAddService] = useState(false)
    const [showAddMilestone, setShowAddMilestone] = useState(false)
    const [showAddTask, setShowAddTask] = useState(false)

    // Form data states
    const [newService, setNewService] = useState({ name: '', description: '', price: 0, unit: 'fixed' })
    const [newMilestone, setNewMilestone] = useState({ title: '', description: '', dueDate: '', status: 'PENDING' })
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'PENDING' })

    // Delete confirmation states
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'service' | 'milestone' | 'task', id: string, name: string } | null>(null)

    const projectId = params.id as string

    useEffect(() => {
        if (projectId) {
            fetchProject()
        }
    }, [projectId])

    const fetchProject = async () => {
        try {
            setLoading(true)
            // Check if projectId is a number (sequential ID) or UUID
            const isSequentialId = !isNaN(Number(projectId))
            const apiUrl = isSequentialId
                ? `/api/projects/by-id/${projectId}`
                : `/api/projects/${projectId}`

            console.log('Project ID:', projectId, 'Is Sequential:', isSequentialId, 'API URL:', apiUrl)

            const response = await fetch(apiUrl)

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Project not found')
                } else if (response.status === 403) {
                    setError('You do not have permission to view this project')
                } else {
                    setError('Failed to fetch project')
                }
                return
            }

            const data = await response.json()
            // Normalize API → UI fields
            const normalized: Project = {
                id: data.id,
                projectId: data.projectId,
                name: data.name ?? data.title,
                description: data.description ?? undefined,
                status: (data.status ?? 'ACTIVE') as any,
                assignedUserId: data.assignedUserId ?? undefined,
                ownerId: data.userId ?? data.ownerId,
                managerId: data.managerId ?? data.assignedUserId ?? '',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                isActive: data.isActive,
                assignedUser: data.users_projects_assignedUserIdTousers ?? data.assignedUser,
                services: data.services || [],
                milestones: data.milestones || [],
                tasks: data.tasks || []
            }
            setProject(normalized)
        } catch (error) {
            console.error('Error fetching project:', error)
            setError('Failed to fetch project')
        } finally {
            setLoading(false)
        }
    }

    // Add new service
    const addService = async () => {
        try {
            setUpdating('new-service')

            const projectUuid = project?.id || projectId
            const response = await fetch(`/api/projects/${projectUuid}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newService)
            })

            if (!response.ok) {
                throw new Error('Failed to create service')
            }

            const createdService = await response.json()

            // Add the new service to the local state
            setProject(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    services: [...(prev.services || []), createdService]
                }
            })

            // Reset form and close modal
            setNewService({ name: '', description: '', price: 0, unit: 'fixed' })
            setShowAddService(false)
        } catch (error) {
            console.error('Error creating service:', error)
        } finally {
            setUpdating(null)
        }
    }

    // Add new milestone
    const addMilestone = async () => {
        try {
            setUpdating('new-milestone')

            const projectUuid = project?.id || projectId
            const response = await fetch(`/api/projects/${projectUuid}/milestones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMilestone)
            })

            if (!response.ok) {
                throw new Error('Failed to create milestone')
            }

            const createdMilestone = await response.json()

            // Add the new milestone to the local state
            setProject(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    milestones: [...(prev.milestones || []), createdMilestone]
                }
            })

            // Reset form and close modal
            setNewMilestone({ title: '', description: '', dueDate: '', status: 'PENDING' })
            setShowAddMilestone(false)
        } catch (error) {
            console.error('Error creating milestone:', error)
        } finally {
            setUpdating(null)
        }
    }

    // Add new task
    const addTask = async () => {
        try {
            setUpdating('new-task')

            const projectUuid = project?.id || projectId
            const response = await fetch(`/api/projects/${projectUuid}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTask)
            })

            if (!response.ok) {
                throw new Error('Failed to create task')
            }

            const createdTask = await response.json()

            // Add the new task to the local state
            setProject(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    tasks: [...(prev.tasks || []), createdTask]
                }
            })

            // Reset form and close modal
            setNewTask({ title: '', description: '', priority: 'MEDIUM', status: 'PENDING' })
            setShowAddTask(false)
        } catch (error) {
            console.error('Error creating task:', error)
        } finally {
            setUpdating(null)
        }
    }

    // Delete service
    const deleteService = async (serviceId: string) => {
        try {
            setUpdating(serviceId)

            const projectUuid = project?.id || projectId
            const response = await fetch(`/api/projects/${projectUuid}/services/${serviceId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Delete service error:', response.status, errorText)
                throw new Error(`Failed to delete service: ${response.status} ${errorText}`)
            }

            // Remove the service from local state
            setProject(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    services: prev.services?.filter(s => s.id !== serviceId)
                }
            })

            setDeleteConfirm(null)
        } catch (error) {
            console.error('Error deleting service:', error)
        } finally {
            setUpdating(null)
        }
    }

    // Delete milestone
    const deleteMilestone = async (milestoneId: string) => {
        try {
            setUpdating(milestoneId)

            const projectUuid = project?.id || projectId
            const response = await fetch(`/api/projects/${projectUuid}/milestones/${milestoneId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Delete milestone error:', response.status, errorText)
                throw new Error(`Failed to delete milestone: ${response.status} ${errorText}`)
            }

            // Remove the milestone from local state
            setProject(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    milestones: prev.milestones?.filter(m => m.id !== milestoneId)
                }
            })

            setDeleteConfirm(null)
        } catch (error) {
            console.error('Error deleting milestone:', error)
        } finally {
            setUpdating(null)
        }
    }

    // Delete task
    const deleteTask = async (taskId: string) => {
        try {
            setUpdating(taskId)

            const projectUuid = project?.id || projectId
            const response = await fetch(`/api/projects/${projectUuid}/tasks/${taskId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Delete task error:', response.status, errorText)
                throw new Error(`Failed to delete task: ${response.status} ${errorText}`)
            }

            // Remove the task from local state
            setProject(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    tasks: prev.tasks?.filter(t => t.id !== taskId)
                }
            })

            setDeleteConfirm(null)
        } catch (error) {
            console.error('Error deleting task:', error)
        } finally {
            setUpdating(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800'
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800'
            case 'COMPLETED':
                return 'bg-green-100 text-green-800'
            case 'DELIVERED':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'LOW':
                return 'bg-green-100 text-green-800'
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800'
            case 'HIGH':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading project...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-600 text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!project) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">📄</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
                        <p className="text-gray-600">The project you're looking for doesn't exist.</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                                    <p className="mt-1 text-sm text-gray-600">Project #{project.projectId}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Description */}
                {project.description && (
                    <div className="bg-white shadow-sm border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                            <p className="text-gray-600">{project.description}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'services'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Services
                            </button>
                            <button
                                onClick={() => setActiveTab('milestones')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'milestones'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Milestones
                            </button>
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Tasks
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Services Table */}
                {activeTab === 'services' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Services</h2>
                            <button
                                onClick={() => setShowAddService(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Service
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {project.services?.map((service) => (
                                        <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{service.name}</td>
                                            <td className="px-4 py-2 text-sm text-gray-600">{service.description || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">${service.price.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-sm text-gray-600">{service.unit}</td>
                                            <td className="px-4 py-2 text-sm">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                                                    {service.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => setDeleteConfirm({ type: 'service', id: service.id, name: service.name })}
                                                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete service"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!project.services || project.services.length === 0) && (
                                        <tr>
                                            <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={6}>
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    No services found
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Milestones Table */}
                {activeTab === 'milestones' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Milestones</h2>
                            <button
                                onClick={() => setShowAddMilestone(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Milestone
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {project.milestones?.map((milestone) => (
                                        <tr key={milestone.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{milestone.title}</td>
                                            <td className="px-4 py-2 text-sm text-gray-600">{milestone.description || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-600">
                                                {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                                                    {milestone.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => setDeleteConfirm({ type: 'milestone', id: milestone.id, name: milestone.title })}
                                                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete milestone"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!project.milestones || project.milestones.length === 0) && (
                                        <tr>
                                            <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={5}>
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    No milestones found
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tasks Table */}
                {activeTab === 'tasks' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
                            <button
                                onClick={() => setShowAddTask(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Task
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {project.tasks?.map((task) => (
                                        <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{task.title}</td>
                                            <td className="px-4 py-2 text-sm text-gray-600">{task.description || '-'}</td>
                                            <td className="px-4 py-2 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-600">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => setDeleteConfirm({ type: 'task', id: task.id, name: task.title })}
                                                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete task"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!project.tasks || project.tasks.length === 0) && (
                                        <tr>
                                            <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={6}>
                                                <div className="flex flex-col items-center">
                                                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                    </svg>
                                                    No tasks found
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add Service Modal */}
                {showAddService && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Service</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            value={newService.name}
                                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Service name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={newService.description}
                                            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Service description"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Price</label>
                                        <input
                                            type="number"
                                            value={newService.price}
                                            onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Unit</label>
                                        <select
                                            value={newService.unit}
                                            onChange={(e) => setNewService({ ...newService, unit: e.target.value as 'hour' | 'day' | 'fixed' })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="fixed">Fixed</option>
                                            <option value="hour">Per Hour</option>
                                            <option value="day">Per Day</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowAddService(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addService}
                                        disabled={updating === 'new-service'}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                                    >
                                        {updating === 'new-service' ? 'Adding...' : 'Add Service'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Milestone Modal */}
                {showAddMilestone && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Milestone</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title</label>
                                        <input
                                            type="text"
                                            value={newMilestone.title}
                                            onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Milestone title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={newMilestone.description}
                                            onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Milestone description"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                        <input
                                            type="date"
                                            value={newMilestone.dueDate}
                                            onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowAddMilestone(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addMilestone}
                                        disabled={updating === 'new-milestone'}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                                    >
                                        {updating === 'new-milestone' ? 'Adding...' : 'Add Milestone'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Task Modal */}
                {showAddTask && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title</label>
                                        <input
                                            type="text"
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Task title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Task description"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                        <input
                                            type="date"
                                            value={newTask.dueDate || ''}
                                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowAddTask(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addTask}
                                        disabled={updating === 'new-task'}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                                    >
                                        {updating === 'new-task' ? 'Adding...' : 'Add Task'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (deleteConfirm.type === 'service') {
                                                deleteService(deleteConfirm.id)
                                            } else if (deleteConfirm.type === 'milestone') {
                                                deleteMilestone(deleteConfirm.id)
                                            } else if (deleteConfirm.type === 'task') {
                                                deleteTask(deleteConfirm.id)
                                            }
                                        }}
                                        disabled={updating === deleteConfirm.id}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                                    >
                                        {updating === deleteConfirm.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
