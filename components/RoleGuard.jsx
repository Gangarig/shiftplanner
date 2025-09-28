'use client'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../lib/roles'

export function RoleGuard({ 
  children, 
  requiredRole, 
  requiredPermission, 
  fallback = null
}) {
  const { hasUserRoleLevel, hasUserPermission } = useAuth()

  // Check role level - hide content if user doesn't have required role
  if (requiredRole && !hasUserRoleLevel(requiredRole)) {
    return fallback
  }

  // Check specific permission - hide content if user doesn't have permission
  if (requiredPermission && !hasUserPermission(requiredPermission)) {
    return fallback
  }

  return children
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback = null }) {
  return (
    <RoleGuard requiredRole={ROLES.ADMIN} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function ManagerOnly({ children, fallback = null }) {
  return (
    <RoleGuard requiredRole={ROLES.MANAGER} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function AccountantOnly({ children, fallback = null }) {
  return (
    <RoleGuard requiredRole={ROLES.ACCOUNTANT} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function WorkerOnly({ children, fallback = null }) {
  return (
    <RoleGuard requiredRole={ROLES.WORKER} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
