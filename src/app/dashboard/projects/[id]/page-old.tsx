"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Project {
    id: string
    projectId: number
    title: string
    description?: string
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
    assignedUserId?: string
    ownerId: string
    managerId: string
    createdAt: string
    updatedAt: string
    isActive: boolean
    services?: Service[]
    assignedUser?: {
        id: string
        name: string
        email: string
    }
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
    milestones?: Milestone[]
}

interface Milestone {
    id: string
    serviceId: string
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
    tasks?: Task[]
}

interface Task {
    id: string
    milestoneId: string
    serviceId: string
    projectId: string
    title: string
    description?: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    dueDate?: string
    completedAt?: string
    estimatedHours?: number
    actualHours?: number
    assignedTo?: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
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
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)

    // Form data states
    const [newService, setNewService] = useState({ name: '', description: '', price: 0 })
    const [newMilestone, setNewMilestone] = useState({ name: '', description: '', dueDate: '', status: 'PENDING' })
    const [newTask, setNewTask] = useState({ name: '', description: '', priority: 'MEDIUM', status: 'PENDING' })

    // Delete confirmation states
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'milestone' | 'task', id: string, name: string } | null>(null)

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
                title: data.name ?? data.title,
                description: data.description ?? undefined,
                status: (data.status ?? 'ACTIVE') as any,
                assignedUserId: data.assignedUserId ?? undefined,
                ownerId: data.userId ?? data.ownerId,
                managerId: data.managerId ?? data.assignedUserId ?? '',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                isActive: data.isActive,
                assignedUser: data.users_projects_assignedUserIdTousers ?? data.assignedUser,
                services: Array.isArray(data.services)
                    ? data.services.map((s: any) => ({
                        id: s.id,
                        projectId: s.projectId,
                        name: s.name,
                        description: s.description ?? undefined,
                        price: Number(s.price),
                        unit: (s.unit ?? 'fixed').toString().toLowerCase() as any,
                        estimatedHours: s.estimatedHours ?? undefined,
                        actualHours: s.actualHours ?? undefined,
                        status: (s.status ?? 'PENDING') as any,
                        createdAt: s.createdAt,
                        updatedAt: s.updatedAt,
                        milestones: Array.isArray(s.milestones)
                            ? s.milestones.map((m: any) => ({
                                id: m.id,
                                serviceId: m.serviceId,
                                projectId: m.projectId,
                                title: m.title,
                                description: m.description ?? undefined,
                                status: (m.status ?? 'PENDING') as any,
                                dueDate: m.dueDate ?? undefined,
                                completedAt: m.completedAt ?? undefined,
                                estimatedHours: m.estimatedHours ?? undefined,
                                actualHours: m.actualHours ?? undefined,
                                createdAt: m.createdAt,
                                updatedAt: m.updatedAt,
                                tasks: Array.isArray(m.tasks)
                                    ? m.tasks.map((t: any) => ({
                                        id: t.id,
                                        milestoneId: t.milestoneId,
                                        serviceId: t.serviceId,
                                        projectId: t.projectId,
                                        title: t.title,
                                        description: t.description ?? undefined,
                                        status: (t.status ?? 'PENDING') as any,
                                        dueDate: t.dueDate ?? undefined,
                                        completedAt: t.completedAt ?? undefined,
                                        estimatedHours: t.estimatedHours ?? undefined,
                                        actualHours: t.actualHours ?? undefined,
                                        assignedTo: t.assignedTo ?? undefined,
                                        priority: (t.priority ?? 'MEDIUM') as any,
                                        createdAt: t.createdAt,
                                        updatedAt: t.updatedAt,
                                    }))
                                    : []
                            }))
                            : []
                    }))
                    : []
            }
            setProject(normalized)
        } catch (error) {
            console.error('Error fetching project:', error)
            setError('Failed to fetch project')
        } finally {
            setLoading(false)
        }
    }

    const updateTaskStatus = async (taskId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
        try {
            setUpdating(taskId)

            const projectUuid = project?.id || projectId
            const response = await fetch(`/api/projects/${projectUuid}/services/${taskId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) {
                throw new Error('Failed to update task')
            }

            // Update the task status in the local state
            setProject(prev => {
                if (!prev) return null

                return {
                    ...prev,
                    services: prev.services?.map(service => ({
                        ...service,
                        milestones: service.milestones?.map(milestone => ({
                            ...milestone,
                            tasks: milestone.tasks?.map(task =>
                                task.id === taskId
                                    ? { ...task, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined }
                                    : task
                            )
                        }))
                    }))
                }
            })
        } catch (error) {
            console.error('Error updating task:', error)
        } finally {
            setUpdating(null)
        }
    }

    const updateMilestoneStatus = async (milestoneId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED') => {
        try {
            setUpdating(milestoneId)

            const projectUuid = project?.id || projectId
            const response = await fetch(`/api/projects/${projectUuid}/services/${milestoneId}/milestones/${milestoneId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) {
                throw new Error('Failed to update milestone')
            }

            // Update the milestone status in the local state
            setProject(prev => {
                if (!prev) return null

                return {
                    ...prev,
                    services: prev.services?.map(service => ({
                        ...service,
                        milestones: service.milestones?.map(milestone =>
                            milestone.id === milestoneId
                                ? { ...milestone, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined }
                                : milestone
                        )
                    }))
                }
            })
        } catch (error) {
            console.error('Error updating milestone:', error)
        } finally {
            setUpdating(null)
        }
    }

    const updateServiceStatus = async (serviceId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
        try {
            setUpdating(serviceId)

            const projectUuid = project?.id || projectId
            const response = await fetch(`/api/projects/${projectUuid}/services/${serviceId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) {
                throw new Error('Failed to update service')
            }

            // Update the service status in the local state
            setProject(prev => {
                if (!prev) return null

                return {
                    ...prev,
                    services: prev.services?.map(service =>
                        service.id === serviceId
                            ? { ...service, status: newStatus }
                            : service
                    )
                }
            })
        } catch (error) {
            console.error('Error updating service:', error)
        } finally {
            setUpdating(null)
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
                    services: [...(prev.services || []), {
                        id: createdService.id,
                        projectId: createdService.projectId,
                        name: createdService.name,
                        description: createdService.description,
                        price: createdService.price,
                        unit: 'fixed' as const,
                        status: 'PENDING' as const,
                        createdAt: createdService.createdAt,
                        updatedAt: createdService.updatedAt,
                        milestones: []
                    }]
                }
            })

            // Reset form and close modal
            setNewService({ name: '', description: '', price: 0 })
            setShowAddService(false)
        } catch (error) {
            console.error('Error creating service:', error)
        } finally {
            setUpdating(null)
        }
    }

    // Add new milestone
    const addMilestone = async () => {
        if (!selectedServiceId) return

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
                    milestones: [...(prev.milestones || []), {
                        id: createdMilestone.id,
                        projectId: createdMilestone.projectId,
                        title: createdMilestone.title,
                        description: createdMilestone.description,
                        status: createdMilestone.status,
                        dueDate: createdMilestone.dueDate,
                        createdAt: createdMilestone.createdAt,
                        updatedAt: createdMilestone.updatedAt
                    }]
                }
            })

            // Reset form and close modal
            setNewMilestone({ name: '', description: '', dueDate: '', status: 'PENDING' })
            setShowAddMilestone(false)
            setSelectedServiceId(null)
        } catch (error) {
            console.error('Error creating milestone:', error)
        } finally {
            setUpdating(null)
        }
    }

    // Add new task
    const addTask = async () => {
        if (!selectedServiceId || !selectedMilestoneId) return

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
                    services: prev.services?.map(service =>
                        service.id === selectedServiceId
                            ? {
                                ...service,
                                milestones: service.milestones?.map(milestone =>
                                    milestone.id === selectedMilestoneId
                                        ? {
                                            ...milestone,
                                            tasks: [...(milestone.tasks || []), {
                                                id: createdTask.id,
                                                milestoneId: createdTask.milestoneId,
                                                serviceId: createdTask.serviceId,
                                                projectId: createdTask.projectId,
                                                title: createdTask.name,
                                                description: createdTask.description,
                                                status: createdTask.status,
                                                priority: createdTask.priority,
                                                createdAt: createdTask.createdAt,
                                                updatedAt: createdTask.updatedAt
                                            }]
                                        }
                                        : milestone
                                )
                            }
                            : service
                    )
                }
            })

            // Reset form and close modal
            setNewTask({ name: '', description: '', priority: 'MEDIUM', status: 'PENDING' })
            setShowAddTask(false)
            setSelectedServiceId(null)
            setSelectedMilestoneId(null)
        } catch (error) {
            console.error('Error creating task:', error)
        } finally {
            setUpdating(null)
        }
    }

    // Delete milestone
    const deleteMilestone = async (milestoneId: string) => {
        try {
            setUpdating(milestoneId)

            // Use the project's UUID (id) instead of sequential ID (projectId) for API calls
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

            // Use the project's UUID (id) instead of sequential ID (projectId) for API calls
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
            case 'COMPLETED':
                return 'bg-green-100 text-green-800'
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800'
            case 'DELIVERED':
                return 'bg-purple-100 text-purple-800'
            case 'PENDING':
                return 'bg-gray-100 text-gray-800'
            case 'CANCELLED':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return 'bg-red-100 text-red-800'
            case 'HIGH':
                return 'bg-orange-100 text-orange-800'
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800'
            case 'LOW':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading project...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500 text-6xl mb-4">📁</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
                    <p className="text-gray-600">The project you're looking for doesn't exist.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Project #{project.projectId} • {project.assignedUser ? `Assigned to ${project.assignedUser.name}` : 'Unassigned'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                                <button
                                    onClick={() => window.history.back()}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    ← Back to Projects
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Project Description */}
                {project.description && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h2>
                        <p className="text-gray-700">{project.description}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b px-4 pt-4">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button onClick={() => setActiveTab('services')} className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'services' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Services</button>
                            <button onClick={() => setActiveTab('milestones')} className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'milestones' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Milestones</button>
                            <button onClick={() => setActiveTab('tasks')} className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${activeTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Tasks</button>
                        </nav>
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
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {project.services?.map((s) => (
                                            <tr key={s.id}>
                                                <td className="px-4 py-2 text-sm text-gray-900">{s.name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600">{s.description ?? '-'}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">${s.price.toFixed(2)}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600">{s.unit}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>{s.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!project.services || project.services.length === 0) && (
                                            <tr>
                                                <td className="px-4 py-4 text-sm text-gray-500" colSpan={5}>No services</td>
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
                                <table className="min-w-full border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Service</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Milestone</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Task</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Due Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-16">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {project.services?.map((service) => {
                                            const milestones = service.milestones ?? []
                                            const allTasks = milestones.flatMap(m => (m.tasks ?? []).map(task => ({ ...task, milestone: m })))

                                            return allTasks.map((task, taskIndex) => {
                                                const isFirstTask = taskIndex === 0
                                                const isFirstMilestone = task.milestone.id !== allTasks[taskIndex - 1]?.milestone.id
                                                const isFirstService = true // This is the first service in the map

                                                return (
                                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                                        {isFirstTask ? (
                                                            <td
                                                                rowSpan={allTasks.length}
                                                                className="px-6 py-4 text-sm font-semibold text-gray-900 bg-gray-50 border-r border-gray-200 align-top"
                                                            >
                                                                <div className="flex items-center">
                                                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                                                                    {service.name}
                                                                </div>
                                                            </td>
                                                        ) : null}
                                                        {isFirstMilestone ? (
                                                            <td
                                                                rowSpan={milestones.find(m => m.id === task.milestone.id)?.tasks?.length || 1}
                                                                className="px-6 py-4 text-sm font-medium text-gray-800 bg-gray-25 border-r border-gray-200 align-top"
                                                            >
                                                                <div className="flex items-center">
                                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                                                                    {task.milestone.title}
                                                                </div>
                                                            </td>
                                                        ) : null}
                                                        <td className="px-6 py-4 text-sm text-gray-900">{task.title}</td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                                                            {task.priority}
                                                                                        </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
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
                                                )
                                            })
                                        })}
                                        {(!project.services || project.services.flatMap(s => (s.milestones ?? []).flatMap(m => m.tasks ?? [])).length === 0) && (
                                            <tr>
                                                <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={7}>
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
                </div>
            </div>

            {/* Add Service Modal */}
            {showAddService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Add New Service</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Service name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newService.description}
                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    placeholder="Service description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    value={newService.price}
                                    onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                                                                                    <button
                                onClick={() => setShowAddService(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addService}
                                disabled={!newService.name || updating === 'new-service'}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {updating === 'new-service' ? 'Adding...' : 'Add Service'}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
            )}

            {/* Add Milestone Modal */}
            {showAddMilestone && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Add New Milestone</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                                <select
                                    value={selectedServiceId || ''}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a service</option>
                                    {project?.services?.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                                                                </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newMilestone.name}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Milestone name"
                                />
                                                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newMilestone.description}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    placeholder="Milestone description"
                                />
                                                    </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={newMilestone.dueDate}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowAddMilestone(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addMilestone}
                                disabled={!selectedServiceId || !newMilestone.name || updating === 'new-milestone'}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {updating === 'new-milestone' ? 'Adding...' : 'Add Milestone'}
                            </button>
                        </div>
                                            </div>
                                        </div>
                                    )}

            {/* Add Task Modal */}
            {showAddTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                                <select
                                    value={selectedServiceId || ''}
                                    onChange={(e) => {
                                        setSelectedServiceId(e.target.value)
                                        setSelectedMilestoneId(null) // Reset milestone when service changes
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a service</option>
                                    {project?.services?.map((service) => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                                </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Milestone</label>
                                <select
                                    value={selectedMilestoneId || ''}
                                    onChange={(e) => setSelectedMilestoneId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    disabled={!selectedServiceId}
                                >
                                    <option value="">Select a milestone</option>
                                    {selectedServiceId && project?.services
                                        ?.find(s => s.id === selectedServiceId)
                                        ?.milestones?.map((milestone) => (
                                            <option key={milestone.id} value={milestone.id}>
                                                {milestone.title}
                                            </option>
                                        ))}
                                </select>
                        </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newTask.name}
                                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Task name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    placeholder="Task description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowAddTask(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addTask}
                                disabled={!selectedServiceId || !selectedMilestoneId || !newTask.name || updating === 'new-task'}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {updating === 'new-task' ? 'Adding...' : 'Add Task'}
                            </button>
                        </div>
                    </div>
                        </div>
                    )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                </div>
            </div>
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Delete {deleteConfirm.type === 'milestone' ? 'Milestone' : 'Task'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>?
                                {deleteConfirm.type === 'milestone' && ' This will also delete all associated tasks.'}
                                <br />
                                <span className="text-red-600 font-medium">This action cannot be undone.</span>
                            </p>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (deleteConfirm.type === 'milestone') {
                                            // Find the service ID for this milestone
                                            const service = project?.services?.find(s =>
                                                s.milestones?.some(m => m.id === deleteConfirm.id)
                                            )
                                            if (service) {
                                                deleteMilestone(deleteConfirm.id, service.id)
                                            }
                                        } else {
                                            // Find the service and milestone IDs for this task
                                            const service = project?.services?.find(s =>
                                                s.milestones?.some(m =>
                                                    m.tasks?.some(t => t.id === deleteConfirm.id)
                                                )
                                            )
                                            const milestone = service?.milestones?.find(m =>
                                                m.tasks?.some(t => t.id === deleteConfirm.id)
                                            )
                                            if (service && milestone) {
                                                deleteTask(deleteConfirm.id, service.id, milestone.id)
                                            }
                                        }
                                    }}
                                    disabled={updating === deleteConfirm.id}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {updating === deleteConfirm.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

