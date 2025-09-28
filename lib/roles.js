// Role-based access control system
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  ACCOUNTANT: 'accountant',
  WORKER: 'worker'
}

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    name: 'Administrator',
    description: 'Vollzugriff auf alle Funktionen',
    permissions: [
      'users.manage',
      'shifts.manage', 
      'reports.view',
      'settings.manage',
      'system.admin'
    ],
    color: '#dc2626', // red
    icon: '👑'
  },
  [ROLES.MANAGER]: {
    name: 'Manager',
    description: 'Verwaltung von Schichten und Personal',
    permissions: [
      'shifts.manage',
      'reports.view',
      'users.view'
    ],
    color: '#2563eb', // blue
    icon: '👔'
  },
  [ROLES.ACCOUNTANT]: {
    name: 'Buchhalter',
    description: 'Zugriff auf Berichte und Finanzdaten',
    permissions: [
      'reports.view',
      'reports.export',
      'users.view'
    ],
    color: '#059669', // green
    icon: '📊'
  },
  [ROLES.WORKER]: {
    name: 'Mitarbeiter',
    description: 'Eigene Schichten anzeigen',
    permissions: [
      'shifts.view_own'
    ],
    color: '#7c3aed', // purple
    icon: '👷'
  }
}

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.MANAGER]: 3,
  [ROLES.ACCOUNTANT]: 2,
  [ROLES.WORKER]: 1
}

// Check if user has permission
export function hasPermission(userRole, permission) {
  const rolePermissions = ROLE_PERMISSIONS[userRole]?.permissions || []
  return rolePermissions.includes(permission)
}

// Check if user role is higher than or equal to required role
export function hasRoleLevel(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  return userLevel >= requiredLevel
}

// Get all roles for dropdown/selection
export function getAllRoles() {
  return Object.values(ROLES).map(role => ({
    value: role,
    label: ROLE_PERMISSIONS[role].name,
    description: ROLE_PERMISSIONS[role].description,
    color: ROLE_PERMISSIONS[role].color,
    icon: ROLE_PERMISSIONS[role].icon
  }))
}
