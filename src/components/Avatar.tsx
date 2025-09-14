'use client'

import { useState } from 'react'

interface AvatarProps {
    src?: string | null
    alt?: string
    name?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

export function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
    const [imageError, setImageError] = useState(false)

    const sizeClasses = {
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl'
    }

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    // If we have a valid image source and no error, show the image
    if (src && !imageError) {
        return (
            <img
                src={src}
                alt={alt || name || 'User avatar'}
                className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
                onError={() => setImageError(true)}
            />
        )
    }

    // Fallback to icon with user's initials or a generic user icon
    return (
        <div className={`${sizeClasses[size]} rounded-full bg-digitus-accent flex items-center justify-center text-white font-medium ${className}`}>
            {name ? (
                <span className="font-semibold">
                    {getInitials(name)}
                </span>
            ) : (
                <svg
                    className={`${iconSizes[size]} text-white`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            )}
        </div>
    )
}
