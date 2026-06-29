'use client'

import Image from 'next/image'

interface LogoProps {
    variant?: 'default' | 'white' | 'icon'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function Logo({ variant = 'default', size = 'md', className = '' }: LogoProps) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    }

    const textSizes = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl'
    }

    // When you get the actual logos, replace these with Image components
    if (variant === 'icon') {
        return (
            <div className={`${sizeClasses[size]} bg-digitus-accent rounded-lg flex items-center justify-center ${className}`}>
                <span className="text-white font-bold text-sm">D</span>
            </div>
        )
    }

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            {/* Logo icon */}
            <div className={`${sizeClasses[size]} bg-digitus-accent rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">D</span>
            </div>

            {/* Logo text */}
            <h1 className={`${textSizes[size]} font-bold ${variant === 'white' ? 'text-white' : 'text-digitus-dark'}`}>
                Digitus
            </h1>
        </div>
    )
}

// Instructions for when you get the actual logos:
/*
1. Place your logo files in /public/logos/:
   - digitus-logo.svg (main logo)
   - digitus-logo-white.svg (white version)
   - digitus-icon.svg (icon version)
   - digitus-icon-white.svg (white icon version)

2. Replace the placeholder divs with Image components:

For icon variant:
<Image
  src={variant === 'white' ? '/logos/digitus-icon-white.svg' : '/logos/digitus-icon.svg'}
  alt="Digitus"
  width={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
  height={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
  className={className}
/>

For full logo:
<div className={`flex items-center space-x-3 ${className}`}>
  <Image
    src={variant === 'white' ? '/logos/digitus-icon-white.svg' : '/logos/digitus-icon.svg'}
    alt="Digitus"
    width={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
    height={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
  />
  <Image
    src={variant === 'white' ? '/logos/digitus-logo-white.svg' : '/logos/digitus-logo.svg'}
    alt="Digitus"
    width={size === 'sm' ? 80 : size === 'md' ? 100 : 120}
    height={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
  />
</div>
*/





























