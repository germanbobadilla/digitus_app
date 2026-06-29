// Role Capabilities System
// This file defines all available capabilities and role definitions

export const CAPABILITIES = {
  // Project Management Capabilities
  PROJECT_CREATE: 'can_create_projects',
  PROJECT_VIEW_ASSIGNED: 'can_view_assigned_projects',
  PROJECT_VIEW_ALL: 'can_view_all_projects',
  PROJECT_EDIT_ALL: 'can_edit_all_projects',
  PROJECT_DELETE: 'can_delete_projects',
  PROJECT_EXPORT: 'can_export_projects',

  // Service Management Capabilities
  SERVICE_CREATE: 'can_create_services',
  SERVICE_READ: 'can_read_services',
  SERVICE_UPDATE: 'can_update_services',
  SERVICE_DELETE: 'can_delete_services',
  SERVICE_EDIT: 'can_edit_services',
  SERVICE_ASSIGN: 'can_assign_services',
  SERVICE_MARK_DONE: 'can_mark_services_done',

  // Milestone Management Capabilities
  MILESTONE_CREATE: 'can_create_milestones',
  MILESTONE_READ: 'can_read_milestones',
  MILESTONE_UPDATE: 'can_update_milestones',
  MILESTONE_DELETE: 'can_delete_milestones',
  MILESTONE_EDIT: 'can_edit_milestones',
  MILESTONE_MARK_DELIVERED: 'can_mark_milestones_delivered',
  MILESTONE_MARK_COMPLETED: 'can_mark_milestones_completed',

  // Task Management Capabilities
  TASK_CREATE: 'can_create_tasks',
  TASK_READ: 'can_read_tasks',
  TASK_UPDATE: 'can_update_tasks',
  TASK_DELETE: 'can_delete_tasks',

  // Billing & Payment Capabilities
  BILLING_VIEW_OWN: 'can_view_own_billing',
  BILLING_VIEW_ALL: 'can_view_all_billing',
  INVOICE_VIEW_OWN: 'can_view_own_invoices',
  INVOICE_VIEW_ALL: 'can_view_all_invoices',
  PAYMENT_VIEW_OWN: 'can_view_own_payments',
  PAYMENT_VIEW_ALL: 'can_view_all_payments',
  PAYMENT_PROCESS: 'can_process_payments',
  PAYMENT_METHOD_MANAGE: 'can_manage_payment_methods',

  // User Management Capabilities
  USER_VIEW: 'can_view_users',
  USER_CREATE: 'can_create_users',
  USER_EDIT: 'can_edit_users',
  USER_DELETE: 'can_delete_users',
  USER_MANAGE_ALL: 'can_manage_all_users',
  USER_ACTIVATE_DEACTIVATE: 'can_activate_deactivate_users',

  // System Administration Capabilities
  ADMIN_ACCESS: 'can_access_admin_panel',
  SYSTEM_SETTINGS: 'can_manage_system_settings',
  ANALYTICS_VIEW_ALL: 'can_view_all_analytics',
  ROLE_MANAGE: 'can_manage_roles',
  AUDIT_LOG_VIEW: 'can_view_audit_logs',
  ALL_SECTIONS_ACCESS: 'can_access_all_sections',

  // File Management Capabilities
  FILE_UPLOAD: 'can_upload_files',
  FILE_VIEW: 'can_view_files',
  FILE_DELETE: 'can_delete_files',

  // Profile Management
  PROFILE_VIEW_EDIT: 'can_view_edit_own_profile',
} as const

export type Capability = typeof CAPABILITIES[keyof typeof CAPABILITIES]

const CAPABILITY_LABELS: Record<Capability, string> = {
  // Project Management
  [CAPABILITIES.PROJECT_CREATE]: 'Create Projects',
  [CAPABILITIES.PROJECT_VIEW_ASSIGNED]: 'View Assigned Projects',
  [CAPABILITIES.PROJECT_VIEW_ALL]: 'View All Projects',
  [CAPABILITIES.PROJECT_EDIT_ALL]: 'Edit All Projects',
  [CAPABILITIES.PROJECT_DELETE]: 'Delete Projects',
  [CAPABILITIES.PROJECT_EXPORT]: 'Export Projects',

  // Service Management
  [CAPABILITIES.SERVICE_CREATE]: 'Create Services',
  [CAPABILITIES.SERVICE_READ]: 'Read Services',
  [CAPABILITIES.SERVICE_UPDATE]: 'Update Services',
  [CAPABILITIES.SERVICE_DELETE]: 'Delete Services',
  [CAPABILITIES.SERVICE_EDIT]: 'Edit Services',
  [CAPABILITIES.SERVICE_ASSIGN]: 'Assign Services',
  [CAPABILITIES.SERVICE_MARK_DONE]: 'Mark Services Done',

  // Milestone Management
  [CAPABILITIES.MILESTONE_CREATE]: 'Create Milestones',
  [CAPABILITIES.MILESTONE_READ]: 'Read Milestones',
  [CAPABILITIES.MILESTONE_UPDATE]: 'Update Milestones',
  [CAPABILITIES.MILESTONE_DELETE]: 'Delete Milestones',
  [CAPABILITIES.MILESTONE_EDIT]: 'Edit Milestones',
  [CAPABILITIES.MILESTONE_MARK_DELIVERED]: 'Mark Milestones Delivered',
  [CAPABILITIES.MILESTONE_MARK_COMPLETED]: 'Mark Milestones Completed',

  // Task Management
  [CAPABILITIES.TASK_CREATE]: 'Create Tasks',
  [CAPABILITIES.TASK_READ]: 'Read Tasks',
  [CAPABILITIES.TASK_UPDATE]: 'Update Tasks',
  [CAPABILITIES.TASK_DELETE]: 'Delete Tasks',

  // Billing & Payment
  [CAPABILITIES.BILLING_VIEW_OWN]: 'View Own Billing',
  [CAPABILITIES.BILLING_VIEW_ALL]: 'View All Billing',
  [CAPABILITIES.INVOICE_VIEW_OWN]: 'View Own Invoices',
  [CAPABILITIES.INVOICE_VIEW_ALL]: 'View All Invoices',
  [CAPABILITIES.PAYMENT_VIEW_OWN]: 'View Own Payments',
  [CAPABILITIES.PAYMENT_VIEW_ALL]: 'View All Payments',
  [CAPABILITIES.PAYMENT_PROCESS]: 'Process Payments',
  [CAPABILITIES.PAYMENT_METHOD_MANAGE]: 'Manage Payment Methods',

  // User Management
  [CAPABILITIES.USER_VIEW]: 'View Users',
  [CAPABILITIES.USER_CREATE]: 'Create Users',
  [CAPABILITIES.USER_EDIT]: 'Edit Users',
  [CAPABILITIES.USER_DELETE]: 'Delete Users',
  [CAPABILITIES.USER_MANAGE_ALL]: 'Manage All Users',
  [CAPABILITIES.USER_ACTIVATE_DEACTIVATE]: 'Activate/Deactivate Users',

  // System Administration
  [CAPABILITIES.ADMIN_ACCESS]: 'Access Admin Panel',
  [CAPABILITIES.SYSTEM_SETTINGS]: 'Manage System Settings',
  [CAPABILITIES.ANALYTICS_VIEW_ALL]: 'View All Analytics',
  [CAPABILITIES.ROLE_MANAGE]: 'Manage Roles',
  [CAPABILITIES.AUDIT_LOG_VIEW]: 'View Audit Logs',
  [CAPABILITIES.ALL_SECTIONS_ACCESS]: 'Access All Sections',

  // File Management
  [CAPABILITIES.FILE_UPLOAD]: 'Upload Files',
  [CAPABILITIES.FILE_VIEW]: 'View Files',
  [CAPABILITIES.FILE_DELETE]: 'Delete Files',

  // Profile Management
  [CAPABILITIES.PROFILE_VIEW_EDIT]: 'View/Edit Own Profile',
}

export { CAPABILITY_LABELS }

// Role Definitions with their capabilities
export const ROLE_DEFINITIONS = {
  'Client': {
    description: 'Client with project viewing and payment capabilities',
    capabilities: [
      CAPABILITIES.PROJECT_VIEW_ASSIGNED,
      CAPABILITIES.SERVICE_READ,
      CAPABILITIES.SERVICE_UPDATE,
      CAPABILITIES.MILESTONE_READ,
      CAPABILITIES.MILESTONE_UPDATE,
      CAPABILITIES.MILESTONE_MARK_COMPLETED,
      CAPABILITIES.TASK_READ,
      CAPABILITIES.TASK_UPDATE,
      CAPABILITIES.SERVICE_MARK_DONE,
      CAPABILITIES.BILLING_VIEW_OWN,
      CAPABILITIES.INVOICE_VIEW_OWN,
      CAPABILITIES.PAYMENT_VIEW_OWN,
      CAPABILITIES.PAYMENT_PROCESS,
      CAPABILITIES.PAYMENT_METHOD_MANAGE,
      CAPABILITIES.PROFILE_VIEW_EDIT,
    ]
  },

  'Manager': {
    description: 'Manager with project creation and management capabilities',
    capabilities: [
      CAPABILITIES.PROJECT_CREATE,
      CAPABILITIES.PROJECT_VIEW_ALL,
      CAPABILITIES.PROJECT_EDIT_ALL,
      CAPABILITIES.PROJECT_EXPORT,
      CAPABILITIES.SERVICE_CREATE,
      CAPABILITIES.SERVICE_READ,
      CAPABILITIES.SERVICE_UPDATE,
      CAPABILITIES.SERVICE_DELETE,
      CAPABILITIES.SERVICE_EDIT,
      CAPABILITIES.SERVICE_ASSIGN,
      CAPABILITIES.MILESTONE_CREATE,
      CAPABILITIES.MILESTONE_READ,
      CAPABILITIES.MILESTONE_UPDATE,
      CAPABILITIES.MILESTONE_DELETE,
      CAPABILITIES.MILESTONE_EDIT,
      CAPABILITIES.MILESTONE_MARK_DELIVERED,
      CAPABILITIES.TASK_CREATE,
      CAPABILITIES.TASK_READ,
      CAPABILITIES.TASK_UPDATE,
      CAPABILITIES.TASK_DELETE,
      CAPABILITIES.FILE_UPLOAD,
      CAPABILITIES.FILE_VIEW,
      CAPABILITIES.USER_VIEW,
      CAPABILITIES.USER_EDIT,
      CAPABILITIES.USER_ACTIVATE_DEACTIVATE,
      CAPABILITIES.ANALYTICS_VIEW_ALL,
      CAPABILITIES.PROFILE_VIEW_EDIT,
    ]
  },

  'Admin': {
    description: 'Full system administrator (Superuser)',
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
