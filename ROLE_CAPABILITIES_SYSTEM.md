# Role-Based Capability System

## Overview

The Digitus application now includes a comprehensive role-based capability system that provides fine-grained access control. This system allows administrators to manage user permissions through roles and capabilities, providing better security and flexibility than the previous user type system.

## Architecture

### Database Models

#### Role Model

```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  capabilities RoleCapability[]
  users        User[]
}
```

#### RoleCapability Model

```prisma
model RoleCapability {
  id          String   @id @default(cuid())
  roleId      String
  capability  String   // e.g., "can_create_orders"
  isGranted   Boolean  @default(true)
  createdAt   DateTime @default(now())

  role        Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([roleId, capability], name: "roleId_capability")
}
```

#### Updated User Model

```prisma
model User {
  // ... existing fields ...
  roleId       String?   // New field for role assignment
  role         Role?     @relation(fields: [roleId], references: [id])
  // ... other relations ...
}
```

## Capabilities

### Order Management Capabilities

- `can_create_orders` - Create new orders
- `can_create_orders_from_service` - Create orders from service templates
- `can_view_own_orders` - View their own orders
- `can_view_all_orders` - View all orders (admin/manager)
- `can_edit_own_orders` - Edit their own orders
- `can_edit_all_orders` - Edit any order
- `can_delete_own_orders` - Delete their own orders
- `can_delete_all_orders` - Delete any order
- `can_assign_orders` - Assign orders to other users
- `can_change_order_status` - Change order status
- `can_view_order_history` - View order status history
- `can_export_orders` - Export order data

### Service Management Capabilities

- `can_create_services` - Create new services
- `can_edit_services` - Edit existing services
- `can_delete_services` - Delete services
- `can_view_services` - View service catalog
- `can_manage_service_categories` - Manage service categories
- `can_set_service_pricing` - Set service prices

### User Management Capabilities

- `can_view_users` - View user list
- `can_create_users` - Create new users
- `can_edit_users` - Edit user profiles
- `can_delete_users` - Delete users
- `can_manage_user_roles` - Assign/change user roles
- `can_activate_deactivate_users` - Activate/deactivate users
- `can_view_user_analytics` - View user statistics

### Payment Management Capabilities

- `can_view_own_payments` - View their own payments
- `can_view_all_payments` - View all payments
- `can_confirm_payments` - Confirm payment status
- `can_process_refunds` - Process refunds
- `can_export_payment_data` - Export payment reports

### System Administration Capabilities

- `can_access_admin_panel` - Access admin dashboard
- `can_manage_system_settings` - Manage system configuration
- `can_view_analytics` - View system analytics
- `can_manage_notifications` - Manage notification settings
- `can_backup_data` - Backup system data
- `can_restore_data` - Restore system data

### Communication Capabilities

- `can_send_notifications` - Send system notifications
- `can_manage_announcements` - Manage system announcements
- `can_view_audit_logs` - View system audit logs

## Predefined Roles

### Regular

- **Description**: Standard user with basic order capabilities
- **Capabilities**: Create/view/edit own orders, view services, view own payments

### Manager

- **Description**: Manager with team oversight capabilities
- **Capabilities**: All Regular capabilities plus order management, user management, payment confirmation, analytics

### Corporation

- **Description**: Corporate account with bulk operations
- **Capabilities**: All Regular capabilities plus export functions, analytics, announcement management

### Education

- **Description**: Educational institution with special pricing
- **Capabilities**: All Regular capabilities plus analytics and export functions

### Government

- **Description**: Government entity with compliance features
- **Capabilities**: All Regular capabilities plus audit logs, export functions, analytics

### Admin

- **Description**: Full system administrator
- **Capabilities**: All capabilities

## API Endpoints

### Role Management

```
GET    /api/roles                    - List all roles
POST   /api/roles                    - Create new role (admin only)
PATCH  /api/roles                    - Update role (admin only)
DELETE /api/roles?id=...             - Delete role (admin only)
```

### Role Capabilities

```
GET    /api/roles/[id]/capabilities  - Get role capabilities
POST   /api/roles/[id]/capabilities  - Add capability to role (admin only)
DELETE /api/roles/[id]/capabilities  - Remove capability from role (admin only)
```

### User Role Assignment

```
PUT    /api/users/[id]/role          - Assign role to user (admin only)
DELETE /api/users/[id]/role          - Remove role from user (admin only)
GET    /api/users/[id]/capabilities  - Get user capabilities
```

### Capability Check

```
POST   /api/auth/check-capability    - Check if user has specific capability
```

### Admin Operations

```
POST   /api/admin/seed-roles         - Seed roles and capabilities (admin only)
```

## Usage Examples

### Checking Capabilities in Code

```typescript
import {
  hasCapability,
  hasAnyCapability,
  hasAllCapabilities,
} from "@/lib/auth-utils";
import { CAPABILITIES } from "@/lib/capabilities";

// Check single capability
const canCreateOrders = await hasCapability(CAPABILITIES.ORDER_CREATE);

// Check multiple capabilities (any)
const canManageOrders = await hasAnyCapability([
  CAPABILITIES.ORDER_CREATE,
  CAPABILITIES.ORDER_EDIT_ALL,
  CAPABILITIES.ORDER_DELETE_ALL,
]);

// Check multiple capabilities (all)
const canFullyManageOrders = await hasAllCapabilities([
  CAPABILITIES.ORDER_CREATE,
  CAPABILITIES.ORDER_EDIT_ALL,
  CAPABILITIES.ORDER_DELETE_ALL,
]);
```

### API Route Protection

```typescript
import { requireCapability } from "@/lib/auth-utils";
import { CAPABILITIES } from "@/lib/capabilities";

export async function POST(request: NextRequest) {
  // Check capability before processing
  const capabilityCheck = await requireCapability(CAPABILITIES.ORDER_CREATE)(
    request
  );
  if (capabilityCheck) {
    return capabilityCheck; // Returns 403 if no permission
  }

  // Continue with the request...
}
```

### Getting User Capabilities

```typescript
import { getCurrentUserWithCapabilities } from "@/lib/auth-utils";

const user = await getCurrentUserWithCapabilities();
const capabilities = user?.role?.capabilities?.map((rc) => rc.capability) || [];
```

## Setup Instructions

### 1. Database Migration

The schema has been updated and migrated. The new tables are:

- `roles` - Stores role definitions
- `role_capabilities` - Stores role-capability mappings
- `users.roleId` - Links users to roles

### 2. Seed Initial Data

Run the seeding endpoint to populate initial roles and capabilities:

```bash
POST /api/admin/seed-roles
```

This will:

- Create all predefined roles (Regular, Manager, Corporation, Education, Government, Admin)
- Assign appropriate capabilities to each role
- Assign default roles to existing users based on their userType

### 3. Update Existing Code

Replace userType checks with capability checks:

```typescript
// Old way
if (user.userType === "ADMIN") {
  // admin logic
}

// New way
if (await hasCapability(CAPABILITIES.ADMIN_ACCESS)) {
  // admin logic
}
```

## Migration from UserType System

The system maintains backward compatibility with the existing UserType enum. During the seeding process, existing users are automatically assigned roles based on their userType:

- `ADMIN` → Admin role
- `CORPORATION` → Corporation role
- `EDUCATION` → Education role
- `REGULAR` → Regular role

## Benefits

1. **Granular Control**: Fine-grained permissions instead of broad user types
2. **Scalability**: Easy to add new capabilities without code changes
3. **Flexibility**: Mix and match capabilities for custom roles
4. **Security**: Centralized permission checking
5. **Audit Trail**: Track capability changes and role assignments
6. **Future-Proof**: Easy to extend as the system grows

## Security Considerations

- All role management endpoints require admin access
- Capability checks are performed server-side
- Users can only view their own capabilities unless they're admin
- Role deletion is prevented if users are assigned to the role
- All capability strings are validated against a predefined list

## Next Steps

1. Run the seeding endpoint to populate initial data
2. Update existing API routes to use capability checks
3. Update frontend components to check capabilities
4. Create admin interface for role management
5. Add audit logging for role and capability changes
