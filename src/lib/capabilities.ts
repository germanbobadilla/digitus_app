// Role Capabilities System
// This file defines all available capabilities and role definitions

export const CAPABILITIES = {
  // Order Management Capabilities
  ORDER_CREATE: 'can_create_orders',
  ORDER_CREATE_FROM_SERVICE: 'can_create_orders_from_service',
  ORDER_VIEW_OWN: 'can_view_own_orders',
  ORDER_VIEW_ALL: 'can_view_all_orders',
  ORDER_EDIT_OWN: 'can_edit_own_orders',
  ORDER_EDIT_ALL: 'can_edit_all_orders',
  ORDER_DELETE_OWN: 'can_delete_own_orders',
  ORDER_DELETE_ALL: 'can_delete_all_orders',
  ORDER_ASSIGN: 'can_assign_orders',
  ORDER_CHANGE_STATUS: 'can_change_order_status',
  ORDER_VIEW_HISTORY: 'can_view_order_history',
  ORDER_EXPORT: 'can_export_orders',

  // Service Management Capabilities
  SERVICE_CREATE: 'can_create_services',
  SERVICE_EDIT: 'can_edit_services',
  SERVICE_DELETE: 'can_delete_services',
  SERVICE_VIEW: 'can_view_services',
  SERVICE_MANAGE_CATEGORIES: 'can_manage_service_categories',
  SERVICE_SET_PRICING: 'can_set_service_pricing',
  SERVICE_SET_PRICE: 'can_set_service_price',
  SERVICE_CREATE_PHASES: 'can_create_service_phases',
  SERVICE_VIEW_PHASES: 'can_view_service_phases',
  SERVICE_EDIT_PHASES: 'can_edit_service_phases',

  // User Management Capabilities
  USER_VIEW: 'can_view_users',
  USER_CREATE: 'can_create_users',
  USER_EDIT: 'can_edit_users',
  USER_DELETE: 'can_delete_users',
  USER_MANAGE_ROLES: 'can_manage_user_roles',
  USER_ACTIVATE_DEACTIVATE: 'can_activate_deactivate_users',
  USER_VIEW_ANALYTICS: 'can_view_user_analytics',

  // Payment Management Capabilities
  PAYMENT_VIEW_OWN: 'can_view_own_payments',
  PAYMENT_VIEW_ALL: 'can_view_all_payments',
  PAYMENT_CONFIRM: 'can_confirm_payments',
  PAYMENT_PROCESS_REFUNDS: 'can_process_refunds',
  PAYMENT_EXPORT: 'can_export_payment_data',

  // System Administration Capabilities
  ADMIN_ACCESS: 'can_access_admin_panel',
  ADMIN_MANAGE_SETTINGS: 'can_manage_system_settings',
  ADMIN_VIEW_ANALYTICS: 'can_view_analytics',
  ADMIN_MANAGE_NOTIFICATIONS: 'can_manage_notifications',
  ADMIN_BACKUP_DATA: 'can_backup_data',
  ADMIN_RESTORE_DATA: 'can_restore_data',

  // Communication Capabilities
  NOTIFICATION_SEND: 'can_send_notifications',
  ANNOUNCEMENT_MANAGE: 'can_manage_announcements',
  AUDIT_LOG_VIEW: 'can_view_audit_logs',
} as const

export type Capability = typeof CAPABILITIES[keyof typeof CAPABILITIES]

const CAPABILITY_LABELS: Record<Capability, string> = {
  [CAPABILITIES.ORDER_CREATE]: 'Create Orders',
  [CAPABILITIES.ORDER_CREATE_FROM_SERVICE]: 'Create Orders from Service',
  [CAPABILITIES.ORDER_VIEW_OWN]: 'View Own Orders',
  [CAPABILITIES.ORDER_VIEW_ALL]: 'View All Orders',
  [CAPABILITIES.ORDER_EDIT_OWN]: 'Edit Own Orders',
  [CAPABILITIES.ORDER_EDIT_ALL]: 'Edit All Orders',
  [CAPABILITIES.ORDER_DELETE_OWN]: 'Delete Own Orders',
  [CAPABILITIES.ORDER_DELETE_ALL]: 'Delete All Orders',
  [CAPABILITIES.ORDER_ASSIGN]: 'Assign Orders',
  [CAPABILITIES.ORDER_CHANGE_STATUS]: 'Change Order Status',
  [CAPABILITIES.ORDER_VIEW_HISTORY]: 'View Order History',
  [CAPABILITIES.ORDER_EXPORT]: 'Export Orders',
  [CAPABILITIES.SERVICE_CREATE]: 'Create Services',
  [CAPABILITIES.SERVICE_EDIT]: 'Edit Services',
  [CAPABILITIES.SERVICE_DELETE]: 'Delete Services',
  [CAPABILITIES.SERVICE_VIEW]: 'View Services',
  [CAPABILITIES.SERVICE_MANAGE_CATEGORIES]: 'Manage Service Categories',
  [CAPABILITIES.SERVICE_SET_PRICING]: 'Set Service Pricing',
  [CAPABILITIES.SERVICE_SET_PRICE]: 'Set Service Price',
  [CAPABILITIES.SERVICE_CREATE_PHASES]: 'Create Service Phases',
  [CAPABILITIES.SERVICE_VIEW_PHASES]: 'View Service Phases',
  [CAPABILITIES.SERVICE_EDIT_PHASES]: 'Edit Service Phases',
  [CAPABILITIES.USER_VIEW]: 'View Users',
  [CAPABILITIES.USER_CREATE]: 'Create Users',
  [CAPABILITIES.USER_EDIT]: 'Edit Users',
  [CAPABILITIES.USER_DELETE]: 'Delete Users',
  [CAPABILITIES.USER_MANAGE_ROLES]: 'Manage User Roles',
  [CAPABILITIES.USER_ACTIVATE_DEACTIVATE]: 'Activate/Deactivate Users',
  [CAPABILITIES.USER_VIEW_ANALYTICS]: 'View User Analytics',
  [CAPABILITIES.PAYMENT_VIEW_OWN]: 'View Own Payments',
  [CAPABILITIES.PAYMENT_VIEW_ALL]: 'View All Payments',
  [CAPABILITIES.PAYMENT_CONFIRM]: 'Confirm Payments',
  [CAPABILITIES.PAYMENT_PROCESS_REFUNDS]: 'Process Refunds',
  [CAPABILITIES.PAYMENT_EXPORT]: 'Export Payment Data',
  [CAPABILITIES.ADMIN_ACCESS]: 'Access Admin Panel',
  [CAPABILITIES.ADMIN_MANAGE_SETTINGS]: 'Manage System Settings',
  [CAPABILITIES.ADMIN_VIEW_ANALYTICS]: 'View Analytics',
  [CAPABILITIES.ADMIN_MANAGE_NOTIFICATIONS]: 'Manage Notifications',
  [CAPABILITIES.ADMIN_BACKUP_DATA]: 'Backup Data',
  [CAPABILITIES.ADMIN_RESTORE_DATA]: 'Restore Data',
  [CAPABILITIES.NOTIFICATION_SEND]: 'Send Notifications',
  [CAPABILITIES.ANNOUNCEMENT_MANAGE]: 'Manage Announcements',
  [CAPABILITIES.AUDIT_LOG_VIEW]: 'View Audit Logs',
}

export { CAPABILITY_LABELS }

// Role Definitions with their capabilities
export const ROLE_DEFINITIONS = {
  'Regular': {
    description: 'Standard user with basic order capabilities',
    capabilities: [
      CAPABILITIES.ORDER_CREATE,
      CAPABILITIES.ORDER_CREATE_FROM_SERVICE,
      CAPABILITIES.ORDER_VIEW_OWN,
      CAPABILITIES.ORDER_EDIT_OWN,
      CAPABILITIES.ORDER_DELETE_OWN,
      CAPABILITIES.SERVICE_VIEW,
      CAPABILITIES.PAYMENT_VIEW_OWN,
    ]
  },

  'Manager': {
    description: 'Manager with team oversight capabilities',
    capabilities: [
      // All Regular capabilities plus:
      CAPABILITIES.ORDER_VIEW_ALL,
      CAPABILITIES.ORDER_ASSIGN,
      CAPABILITIES.ORDER_CHANGE_STATUS,
      CAPABILITIES.ORDER_VIEW_HISTORY,
      CAPABILITIES.ORDER_EXPORT,
      CAPABILITIES.SERVICE_CREATE,
      CAPABILITIES.SERVICE_EDIT,
      CAPABILITIES.SERVICE_SET_PRICE,
      CAPABILITIES.SERVICE_CREATE_PHASES,
      CAPABILITIES.SERVICE_VIEW_PHASES,
      CAPABILITIES.SERVICE_EDIT_PHASES,
      CAPABILITIES.USER_VIEW,
      CAPABILITIES.USER_EDIT,
      CAPABILITIES.USER_ACTIVATE_DEACTIVATE,
      CAPABILITIES.PAYMENT_VIEW_ALL,
      CAPABILITIES.PAYMENT_CONFIRM,
      CAPABILITIES.ADMIN_VIEW_ANALYTICS,
      CAPABILITIES.NOTIFICATION_SEND,
    ]
  },

  'Corporation': {
    description: 'Corporate account with bulk operations',
    capabilities: [
      // All Regular capabilities plus:
      CAPABILITIES.ORDER_EXPORT,
      CAPABILITIES.PAYMENT_EXPORT,
      CAPABILITIES.ADMIN_VIEW_ANALYTICS,
      CAPABILITIES.ANNOUNCEMENT_MANAGE,
    ]
  },

  'Education': {
    description: 'Educational institution with special pricing',
    capabilities: [
      // All Regular capabilities plus:
      CAPABILITIES.ADMIN_VIEW_ANALYTICS,
      CAPABILITIES.ORDER_EXPORT,
    ]
  },

  'Government': {
    description: 'Government entity with compliance features',
    capabilities: [
      // All Regular capabilities plus:
      CAPABILITIES.AUDIT_LOG_VIEW,
      CAPABILITIES.ORDER_EXPORT,
      CAPABILITIES.PAYMENT_EXPORT,
      CAPABILITIES.ADMIN_VIEW_ANALYTICS,
    ]
  },

  'Admin': {
    description: 'Full system administrator',
    capabilities: Object.values(CAPABILITIES), // All capabilities
  }
} as const

export type RoleName = keyof typeof ROLE_DEFINITIONS

// Helper function to check if a user has a specific capability
export function hasCapability(userCapabilities: string[], capability: Capability): boolean {
  return userCapabilities.includes(capability)
}

// Helper function to get all capabilities for a role
export function getRoleCapabilities(roleName: RoleName): Capability[] {
  return [...(ROLE_DEFINITIONS[roleName]?.capabilities || [])]
}

// Helper function to check if a capability exists
export function isValidCapability(capability: string): capability is Capability {
  return Object.values(CAPABILITIES).includes(capability as Capability)
}
