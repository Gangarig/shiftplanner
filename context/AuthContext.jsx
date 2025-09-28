'use client'
import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import pb from '../lib/pb'
import { ROLES, hasPermission, hasRoleLevel } from '../lib/roles'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(pb.authStore.model)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    pb.authStore.onChange(() => setUser(pb.authStore.model))
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      await pb.collection('users').authWithPassword(email, password)
      return { success: true }
    } catch (err) {
      let errorMessage = 'Login failed'
      
      if (err.status === 400) {
        errorMessage = 'Invalid email or password.'
      } else if (err.status === 404) {
        errorMessage = 'Server not found. Please check if PocketBase is running.'
      } else if (err.status === 0) {
        errorMessage = 'Cannot connect to server. Please start PocketBase.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, additionalData = {}) => {
    try {
      setLoading(true)
      setError(null)
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        ...additionalData
      })
      return { success: true }
    } catch (err) {
      let errorMessage = 'Registration failed'
      
      if (err.status === 400) {
        errorMessage = 'Invalid data provided. Please check your email and password.'
      } else if (err.status === 404) {
        errorMessage = 'Server not found. Please check if PocketBase is running.'
      } else if (err.status === 0) {
        errorMessage = 'Cannot connect to server. Please start PocketBase.'
      } else if (err.data && err.data.data) {
        // Handle PocketBase validation errors
        const validationErrors = Object.values(err.data.data).flat()
        errorMessage = validationErrors.join(', ')
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      setLoading(true)
      setError(null)
      await pb.collection('users').requestPasswordReset(email)
      return { success: true }
    } catch (err) {
      const errorMessage = err.message || 'Password reset failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    pb.authStore.clear()
    setError(null)
  }

  const clearError = () => setError(null)

  // Role management functions
  const getUserRole = () => {
    return user?.role || ROLES.WORKER // Default to worker if no role set
  }

  const hasUserPermission = (permission) => {
    const userRole = getUserRole()
    return hasPermission(userRole, permission)
  }

  const hasUserRoleLevel = (requiredRole) => {
    const userRole = getUserRole()
    return hasRoleLevel(userRole, requiredRole)
  }

  const isAdmin = () => {
    return getUserRole() === ROLES.ADMIN
  }

  const isManager = () => {
    return getUserRole() === ROLES.MANAGER
  }

  const isAccountant = () => {
    return getUserRole() === ROLES.ACCOUNTANT
  }

  const isWorker = () => {
    return getUserRole() === ROLES.WORKER
  }

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    register,
    resetPassword,
    logout,
    clearError,
    // Role management
    getUserRole,
    hasUserPermission,
    hasUserRoleLevel,
    isAdmin,
    isManager,
    isAccountant,
    isWorker
  }), [user, loading, error])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}