'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'

interface UserCapabilities {
  capabilities: string[]
  roleId?: string
  roleName?: string
  loading: boolean
  error?: string
}

export function useCapabilities() {
  const { user } = useAuth()
  const [capabilities, setCapabilities] = useState<UserCapabilities>({
    capabilities: [],
    loading: true
  })

  useEffect(() => {
    if (!user?.id) {
      setCapabilities({ capabilities: [], loading: false })
      return
    }

    const fetchCapabilities = async () => {
      try {
        const response = await fetch(`/api/users/${user.id}/capabilities`)
        if (response.ok) {
          const data = await response.json()
          setCapabilities({
            capabilities: data.capabilities || [],
            roleId: data.roleId,
            roleName: data.roleName,
            loading: false
          })
        } else {
          setCapabilities({
            capabilities: [],
            loading: false,
            error: 'Failed to fetch capabilities'
          })
        }
      } catch (error) {
        setCapabilities({
          capabilities: [],
          loading: false,
          error: 'Failed to fetch capabilities'
        })
      }
    }

    fetchCapabilities()
  }, [user?.id])

  const hasCapability = (capability: string): boolean => {
    return capabilities.capabilities.includes(capability)
  }

  const hasAnyCapability = (requiredCapabilities: string[]): boolean => {
    return requiredCapabilities.some(capability =>
      capabilities.capabilities.includes(capability)
    )
  }

  const hasAllCapabilities = (requiredCapabilities: string[]): boolean => {
    return requiredCapabilities.every(capability =>
      capabilities.capabilities.includes(capability)
    )
  }

  return {
    ...capabilities,
    hasCapability,
    hasAnyCapability,
    hasAllCapabilities
  }
}
