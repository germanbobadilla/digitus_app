'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/NextAuthContext'
import { CAPABILITIES, hasCapability } from '@/lib/capabilities'
import PermissionDenied from '@/components/PermissionDenied'

interface Project {
    id: string
    projectId: number
    title: string
    description: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
    user: {
        id: string
        name: string
        email: string
    }
    assignedUser?: {
        id: string
        name: string
        email: string
    } | null
}

export default function ProjectsPage() {
    const { user } = useAuth()
    const { t } = useLanguage()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedUserId: ''
    })
    const [users, setUsers] = useState<any[]>([])

    // Check permissions
    const [canViewAssignedProjects, setCanViewAssignedProjects] = useState(false)
    const [canViewAllProjects, setCanViewAllProjects] = useState(false)
    const [canCreateProjects, setCanCreateProjects] = useState(false)
    const [canEditAllProjects, setCanEditAllProjects] = useState(false)
    const [canDeleteProjects, setCanDeleteProjects] = useState(false)

    useEffect(() => {
        const checkPermissions = () => {
            console.log('Checking permissions for user:', user)
            console.log('User capabilities:', user?.capabilities)
            console.log('Capabilities length:', user?.capabilities?.length)

            if (user?.capabilities && user.capabilities.length > 0) {
                console.log('User has capabilities, checking permissions...')
                setCanViewAssignedProjects(hasCapability(user.capabilities, CAPABILITIES.PROJECT_VIEW_ASSIGNED))
                setCanViewAllProjects(hasCapability(user.capabilities, CAPABILITIES.PROJECT_VIEW_ALL))
                setCanCreateProjects(hasCapability(user.capabilities, CAPABILITIES.PROJECT_CREATE))
                setCanEditAllProjects(hasCapability(user.capabilities, CAPABILITIES.PROJECT_EDIT_ALL))
                setCanDeleteProjects(hasCapability(user.capabilities, CAPABILITIES.PROJECT_DELETE))

                console.log('Permission results:')
                console.log('- canViewAssignedProjects:', hasCapability(user.capabilities, CAPABILITIES.PROJECT_VIEW_ASSIGNED))
                console.log('- canViewAllProjects:', hasCapability(user.capabilities, CAPABILITIES.PROJECT_VIEW_ALL))
                console.log('- canCreateProjects:', hasCapability(user.capabilities, CAPABILITIES.PROJECT_CREATE))
            } else if (user && (!user.capabilities || user.capabilities.length === 0)) {
                console.log('User exists but no capabilities loaded yet, waiting...')
                // User exists but no capabilities loaded yet, wait a bit more
            } else if (!user) {
                console.log('No user found')
                // No user, stop loading
                setLoading(false)
            }
        }
        checkPermissions()
    }, [user])

    useEffect(() => {
        if (canViewAssignedProjects || canViewAllProjects) {
            fetchProjects()
        } else if (user && !canViewAssignedProjects && !canViewAllProjects) {
            // User exists but doesn't have permissions, stop loading
            setLoading(false)
        } else if (user && (!user.capabilities || user.capabilities.length === 0)) {
            // User exists but capabilities not loaded yet, try to fetch projects anyway
            // This is a fallback for when capabilities aren't loaded
            fetchProjects()
        }
    }, [canViewAssignedProjects, canViewAllProjects, user])

    useEffect(() => {
        // Only fetch users if user can create projects (managers/admins)
        if (canCreateProjects) {
            fetchUsers()
        }
    }, [canCreateProjects])

    // Timeout to prevent infinite loading
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading && user) {
                console.log('Capabilities loading timeout, proceeding with fallback')
                setLoading(false)
                fetchProjects()
            }
        }, 5000) // 5 second timeout

        return () => clearTimeout(timeout)
    }, [loading, user])

    const fetchProjects = async () => {
        try {
            setLoading(true)
            setError(null) // Clear any previous errors
            const response = await fetch('/api/projects')

            if (response.status === 403) {
                // User doesn't have permission - this shouldn't happen if capabilities are loaded correctly
                setError('You do not have permission to view projects. Please contact your administrator.')
                return
            }

            if (!response.ok) {
                let errorMessage = `Failed to fetch projects (${response.status})`
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.error || errorMessage
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError)
                    // Use the default error message
                }
                throw new Error(errorMessage)
            }

            const data = await response.json()
            const normalized = Array.isArray(data)
                ? data.map((p: any) => ({
                    ...p,
                    title: p.title ?? p.name ?? '',
                }))
                : []
            setProjects(normalized)
        } catch (err) {
            console.error('Error fetching projects:', err)
            setError(err instanceof Error ? err.message : 'An error occurred while fetching projects')
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users?limit=100', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setUsers(data.users || [])
            } else if (response.status === 403) {
                console.log('User does not have permission to view users')
                // Don't set error, just leave users empty
            } else {
                console.error('Failed to fetch users:', response.status)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canCreateProjects) return

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create project')
            }

            const newProject = await response.json()
            setProjects([newProject, ...projects])
            setFormData({ title: '', description: '' })
            setShowCreateModal(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        }
    }

    const handleEditProject = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingProject) return

        if (!canEditAllProjects) return

        try {
            const response = await fetch(`/api/projects/${editingProject.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update project')
            }

            const updatedProject = await response.json()
            setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p))
            setEditingProject(null)
            setFormData({ title: '', description: '' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        }
    }

    const handleDeleteProject = async (projectId: string) => {
        const project = projects.find(p => p.id === projectId)
        if (!project) return

        if (!canDeleteProjects) return

        if (!confirm(t('projects.confirmDeleteProject'))) return

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete project')
            }

            setProjects(projects.filter(p => p.id !== projectId))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        }
    }

    const openEditModal = (project: Project) => {
        setEditingProject(project)
        setFormData({
            title: project.title,
            description: project.description || '',
            assignedUserId: project.assignedUserId || ''
        })
    }

    const closeModals = () => {
        setShowCreateModal(false)
        setEditingProject(null)
        setFormData({ title: '', description: '', assignedUserId: '' })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    // Check if user has permission to view projects
    if (!canViewAssignedProjects && !canViewAllProjects) {
        return (
            <PermissionDenied
                action="view projects"
                capability={CAPABILITIES.PROJECT_VIEW_ASSIGNED}
            />
        )
    }

    return (
        <>
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {user?.userType === 'CLIENT' ? 'Your Projects' :
                                user?.userType === 'MANAGER' ? 'Project Management' :
                                    'Project Administration'}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {user?.userType === 'CLIENT' ? 'View your assigned projects here.' :
                                user?.userType === 'MANAGER' ? 'Manage your projects here.' :
                                    'Create and manage all projects here.'}
                        </p>
                    </div>
                    {canCreateProjects && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            {user?.userType === 'MANAGER' ? 'Create Project' : 'Create New Project'}
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Projects List */}
            {projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {user?.userType === 'CLIENT' ? 'No Assigned Projects' :
                            user?.userType === 'MANAGER' ? 'No Projects Yet' :
                                'No Projects Yet'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {user?.userType === 'CLIENT' ? 'Your assigned projects will appear here once they are created and assigned to you by your project manager.' :
                            user?.userType === 'MANAGER' ? 'Get started by creating your first project.' :
                                'Get started by creating your first project.'}
                    </p>
                    {canCreateProjects ? (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            {user?.userType === 'MANAGER' ? 'Create Your First Project' : 'Create Your First Project'}
                        </button>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        <strong>Waiting for projects?</strong> Your project manager will assign projects to you as they become available.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {projects.map((project) => {
                        const canEdit = canEditAllProjects
                        const canDelete = canDeleteProjects

                        return (
                            <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <button
                                            onClick={() => window.location.href = `/dashboard/projects/${project.projectId}`}
                                            className="text-left hover:text-indigo-600 transition-colors"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">{project.title}</h3>
                                        </button>
                                        {project.description && (
                                            <p className="mt-2 text-sm text-gray-600">{project.description}</p>
                                        )}
                                        <div className="mt-4 flex items-center text-sm text-gray-500">
                                            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                                            {project.updatedAt !== project.createdAt && (
                                                <span className="ml-4">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => window.location.href = `/dashboard/projects/${project.projectId}`}
                                        aria-label="View project details"
                                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:translate-y-[1px] transition-all"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        View Details
                                    </button>
                                    {canEdit && (
                                        <button
                                            onClick={() => openEditModal(project)}
                                            aria-label="Edit project"
                                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:translate-y-[1px] transition-all"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            {t('projects.editProject')}
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDeleteProject(project.id)}
                                            aria-label="Delete project"
                                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:translate-y-[1px] transition-all"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h10" /></svg>
                                            {t('projects.deleteProject')}
                                        </button>
                                    )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingProject) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingProject ? t('projects.editProject') : t('projects.createNewProject')}
                            </h3>
                            <form onSubmit={editingProject ? handleEditProject : handleCreateProject}>
                                <div className="mb-4">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('projects.projectTitle')}
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('projects.projectDescription')}
                                    </label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder={t('projects.projectDescriptionPlaceholder')}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="assignedUserId" className="block text-sm font-medium text-gray-700 mb-2">
                                        Assign to User (Optional)
                                    </label>
                                    <select
                                        id="assignedUserId"
                                        value={formData.assignedUserId}
                                        onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select a user to assign this project to</option>
                                        {users.filter(user => user.userType === 'CLIENT').map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
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
                                        {editingProject ? t('common.save') : t('projects.createProject')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}
