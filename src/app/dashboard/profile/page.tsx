'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export default function ProfilePage() {
    const { user, logout, isLoading } = useAuth()
    const { t, isLoading: langLoading } = useLanguage()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: '',
        location: '',
        website: '',
        phone: ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSave = async () => {
        // Here you would typically save to the database
        console.log('Saving profile:', formData)
        setIsEditing(false)
        // Show success message
        alert(t('profile.profileUpdated') || 'Profile updated successfully!')
    }

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            bio: '',
            location: '',
            website: '',
            phone: ''
        })
        setIsEditing(false)
    }

    if (isLoading || langLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Mobile Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">{t('profile.title') || 'Profile'}</h1>
                            <p className="mt-2 text-gray-600">
                                {t('profile.description') || 'Manage your personal information and account settings.'}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Profile Picture */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-6">
                                    <div className="flex-shrink-0">
                                        {user.image ? (
                                            <img
                                                className="h-20 w-20 rounded-full object-cover"
                                                src={user.image}
                                                alt={user.name || 'Profile'}
                                            />
                                        ) : (
                                            <div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center">
                                                <span className="text-2xl font-medium text-white">
                                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {t('profile.profilePicture') || 'Profile Picture'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {t('profile.profilePictureDesc') || 'Upload a new profile picture to personalize your account.'}
                                        </p>
                                        <div className="mt-4">
                                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                                {t('profile.uploadPhoto') || 'Upload Photo'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        {t('profile.personalInfo') || 'Personal Information'}
                                    </h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                        >
                                            {t('profile.edit') || 'Edit'}
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('profile.name') || 'Full Name'}
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('profile.email') || 'Email Address'}
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('profile.bio') || 'Bio'}
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            rows={3}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                            placeholder={t('profile.bioPlaceholder') || 'Tell us about yourself...'}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('profile.location') || 'Location'}
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                                placeholder={t('profile.locationPlaceholder') || 'City, Country'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('profile.phone') || 'Phone Number'}
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                                placeholder={t('profile.phonePlaceholder') || '+1 (555) 123-4567'}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('profile.website') || 'Website'}
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                            placeholder={t('profile.websitePlaceholder') || 'https://yourwebsite.com'}
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            onClick={handleCancel}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                                        >
                                            {t('profile.cancel') || 'Cancel'}
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                        >
                                            {t('profile.save') || 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Account Settings */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-6">
                                    {t('profile.accountSettings') || 'Account Settings'}
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {t('profile.changePassword') || 'Change Password'}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {t('profile.changePasswordDesc') || 'Update your password to keep your account secure.'}
                                            </p>
                                        </div>
                                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                            {t('profile.change') || 'Change'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {t('profile.twoFactor') || 'Two-Factor Authentication'}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {t('profile.twoFactorDesc') || 'Add an extra layer of security to your account.'}
                                            </p>
                                        </div>
                                        <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
                                            {t('profile.enable') || 'Enable'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {t('profile.deleteAccount') || 'Delete Account'}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {t('profile.deleteAccountDesc') || 'Permanently delete your account and all data.'}
                                            </p>
                                        </div>
                                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                            {t('profile.delete') || 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

