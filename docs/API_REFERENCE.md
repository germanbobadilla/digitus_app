# Digitus API Reference

## Overview

The Digitus API is a comprehensive project management system with role-based access control (RBAC). The API follows RESTful principles with hierarchical resource nesting to enforce business rules and dependencies.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication via NextAuth.js session cookies. Include the session cookie in requests or use the `getServerSession` helper in server-side code.

## Role-Based Access Control (RBAC)

The system uses three primary roles with specific capabilities:

### Roles

- **CLIENT**: Can view assigned projects, manage payment methods, mark milestones as completed
- **MANAGER**: Can create and manage projects, add services, manage milestones (cannot see prices)
- **ADMIN**: Full system access, can manage users, roles, and all resources

### Capabilities

Each role has specific capabilities that control access to endpoints. See `src/lib/capabilities.ts` for the complete list.

---

## API Endpoints

### 1. Authentication & Users

#### Get Current User Session

```http
GET /api/auth/session
```

**Response:** Current user session data

#### User Management

```http
GET /api/users?limit=50&search=query
POST /api/users
GET /api/users/[id]
PUT /api/users/[id]
DELETE /api/users/[id]
```

**Access:** ADMIN only
**Description:** Full user management with search and pagination

#### User Capabilities

```http
GET /api/users/[id]/capabilities
```

**Access:** ADMIN only
**Description:** Get user's assigned capabilities

#### User Role Management

```http
PUT /api/users/[id]/role
```

**Access:** ADMIN only
**Description:** Assign/change user role

---

### 2. Projects

#### List Projects

```http
GET /api/projects
```

**Access:** Role-based

- **CLIENT**: Only assigned projects
- **MANAGER**: Own projects
- **ADMIN**: All projects

#### Create Project

```http
POST /api/projects
Content-Type: application/json

{
  "title": "Project Title",
  "description": "Project Description",
  "assignedUserId": "user-id" // Optional, for assigning to client
}
```

**Access:** MANAGER, ADMIN
**Description:** Create new project

#### Get Project

```http
GET /api/projects/[id]
```

**Access:** Role-based

- **CLIENT**: Only if assigned to them
- **MANAGER**: Own projects
- **ADMIN**: All projects

#### Update Project

```http
PUT /api/projects/[id]
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description"
}
```

**Access:** MANAGER (own projects), ADMIN (all projects)

#### Delete Project

```http
DELETE /api/projects/[id]
```

**Access:** MANAGER (own projects), ADMIN (all projects)
**Description:** Soft delete (sets isActive = false)

---

### 3. Project Services (Nested)

#### List Project Services

```http
GET /api/projects/[projectId]/services
```

**Access:** Role-based (same as project access)
**Description:** Get all services for a specific project

#### Create Service

```http
POST /api/projects/[projectId]/services
Content-Type: application/json

{
  "name": "Service Name",
  "description": "Service Description",
  "price": 100.00,
  "unit": "hour",
  "estimatedHours": 10
}
```

**Access:** MANAGER, ADMIN
**Description:** Add service to project

#### Get Service

```http
GET /api/projects/[projectId]/services/[serviceId]
```

**Access:** Role-based (same as project access)

#### Update Service

```http
PUT /api/projects/[projectId]/services/[serviceId]
Content-Type: application/json

{
  "name": "Updated Service Name",
  "price": 150.00
}
```

**Access:** MANAGER, ADMIN

#### Delete Service

```http
DELETE /api/projects/[projectId]/services/[serviceId]
```

**Access:** MANAGER, ADMIN

---

### 4. Project Milestones (Nested)

#### List Service Milestones

```http
GET /api/projects/[projectId]/services/[serviceId]/milestones
```

**Access:** Role-based (same as project access)

#### Create Milestone

```http
POST /api/projects/[projectId]/services/[serviceId]/milestones
Content-Type: application/json

{
  "title": "Milestone Title",
  "description": "Milestone Description",
  "dueDate": "2024-01-15",
  "estimatedHours": 5
}
```

**Access:** MANAGER, ADMIN

#### Get Milestone

```http
GET /api/projects/[projectId]/services/[serviceId]/milestones/[milestoneId]
```

**Access:** Role-based (same as project access)

#### Update Milestone

```http
PUT /api/projects/[projectId]/services/[serviceId]/milestones/[milestoneId]
Content-Type: application/json

{
  "title": "Updated Milestone",
  "status": "completed"
}
```

**Access:** MANAGER, ADMIN

#### Mark Milestone as Delivered

```http
POST /api/projects/[projectId]/services/[serviceId]/milestones/[milestoneId]/mark-delivered
```

**Access:** MANAGER, ADMIN
**Description:** Mark milestone as delivered by manager

#### Mark Milestone as Completed

```http
POST /api/projects/[projectId]/services/[serviceId]/milestones/[milestoneId]/mark-completed
```

**Access:** CLIENT, MANAGER, ADMIN
**Description:** Mark milestone as completed by client

---

### 5. Billing & Payments

#### List User Payment Methods

```http
GET /api/users/payment-methods
```

**Access:** Own payment methods only

#### Add Payment Method

```http
POST /api/users/payment-methods
Content-Type: application/json

{
  "type": "CARD", // or "BANK_ACCOUNT"
  "name": "My Visa Card",
  "cardNumber": "1234567890123456",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123"
}
```

**Access:** Own payment methods only

#### Update Payment Method

```http
PUT /api/users/payment-methods/[id]
```

**Access:** Own payment methods only

#### Delete Payment Method

```http
DELETE /api/users/payment-methods/[id]
```

**Access:** Own payment methods only

#### Set Default Payment Method

```http
PATCH /api/users/payment-methods/[id]/default
```

**Access:** Own payment methods only

#### Project Billing

```http
GET /api/projects/[id]/billing
POST /api/projects/[id]/billing/generate-invoice
```

**Access:** CLIENT (assigned projects), ADMIN (all projects)
**Description:** View project billing and generate invoices

#### Project Invoices

```http
GET /api/projects/[id]/invoices
GET /api/projects/[id]/invoices/[invoiceId]
POST /api/projects/[id]/invoices
```

**Access:** CLIENT (own invoices), ADMIN (all invoices)

#### Payments

```http
GET /api/payments
POST /api/payments
GET /api/payments/[id]
```

**Access:** CLIENT (own payments), ADMIN (all payments)

---

### 6. Roles & Capabilities Management

#### List Roles

```http
GET /api/roles
```

**Access:** ADMIN only

#### Create Role

```http
POST /api/roles
Content-Type: application/json

{
  "name": "Custom Role",
  "description": "Role Description"
}
```

**Access:** ADMIN only

#### Get Role

```http
GET /api/roles/[id]
```

**Access:** ADMIN only

#### Update Role

```http
PUT /api/roles/[id]
```

**Access:** ADMIN only

#### Delete Role

```http
DELETE /api/roles/[id]
```

**Access:** ADMIN only

#### Role Capabilities

```http
GET /api/roles/[id]/capabilities
POST /api/roles/[id]/capabilities
DELETE /api/roles/[id]/capabilities
```

**Access:** ADMIN only
**Description:** Manage capabilities for a role

---

### 7. System & Analytics

#### System Health

```http
GET /api/debug/db
```

**Access:** ADMIN only
**Description:** Database connection and health check

#### User Capabilities Debug

```http
GET /api/debug-capabilities
```

**Access:** ADMIN only
**Description:** Debug user capabilities

#### Test Endpoints

```http
GET /api/test
POST /api/test
```

**Access:** ADMIN only
**Description:** System testing endpoints

---

## Data Models

### Project

```typescript
{
  id: string
  projectId: number // Sequential ID
  title: string
  description?: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  assignedUserId?: string // For client assignment
  ownerId: string // Digitus (manager)
  managerId: string // Digitus (manager)
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  services?: Service[] // Array of services in this project
  assignedUser?: {
    id: string
    name: string
    email: string
  }
}
```

### Service

```typescript
{
  id: string
  projectId: string
  name: string
  description?: string
  price: number
  unit: 'hour' | 'day' | 'fixed'
  estimatedHours?: number
  actualHours?: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  createdAt: Date
  updatedAt: Date
  milestones?: Milestone[] // Array of milestones for this service
}
```

### Milestone

```typescript
{
  id: string
  serviceId: string
  projectId: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED'
  dueDate?: Date
  completedAt?: Date
  estimatedHours?: number
  actualHours?: number
  createdAt: Date
  updatedAt: Date
  tasks?: Task[] // Array of tasks for this milestone
}
```

### Task

```typescript
{
  id: string
  milestoneId: string
  serviceId: string
  projectId: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate?: Date
  completedAt?: Date
  estimatedHours?: number
  actualHours?: number
  assignedTo?: string // User ID if task is assigned to specific user
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: Date
  updatedAt: Date
}
```

### PaymentMethod

```typescript
{
  id: string
  userId: string
  type: 'CARD' | 'BANK_ACCOUNT'
  name: string
  last4?: string
  bankName?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}
```

### User

```typescript
{
  id: string
  name: string
  email: string
  userType: 'CLIENT' | 'MANAGER' | 'ADMIN'
  roleId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Codes

- `UNAUTHORIZED` - No valid session
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input data
- `DUPLICATE_RESOURCE` - Resource already exists
- `MISSING_PAYMENT_METHOD` - Cannot start project without payment method

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production use.

---

## Pagination

List endpoints support pagination:

```
GET /api/users?limit=50&offset=0&search=query
```

### Pagination Parameters

- `limit` - Number of items per page (default: 50, max: 100)
- `offset` - Number of items to skip (default: 0)
- `search` - Search query string

### Pagination Response

```json
{
  "data": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 150,
    "hasMore": true
  }
}
```

---

## Business Rules

### 1. Hierarchical Dependencies

- Services cannot exist without a project
- Milestones cannot exist without a service
- Tasks cannot exist without a milestone

### 2. Role Permissions

- Clients can only see assigned projects
- Managers cannot see prices or invoices
- Only admins can manage users and roles

### 3. Data Integrity

- All resources have soft delete (isActive flag)
- Sequential IDs for display purposes
- Audit trail for all changes

### 4. Payment Processing

- Payment methods are encrypted
- Only last 4 digits stored for display
- Default payment method management

### 5. Project Status Validation

- Projects cannot be started (status = 'IN_PROGRESS') without assigned user having payment methods
- Validation occurs when admin/manager changes project status to 'IN_PROGRESS'
- Returns error: "Cannot start project: User must have a payment method added first"

---

## Development Notes

### Database Schema

- Uses Prisma ORM
- PostgreSQL database
- Migrations in `prisma/migrations/`

### Authentication

- NextAuth.js with session-based auth
- Session stored in HTTP-only cookies

### File Structure

```
src/app/api/
├── auth/[...nextauth]/route.ts
├── users/
│   ├── route.ts
│   ├── [id]/
│   └── payment-methods/
├── projects/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── services/
│       └── billing/
├── roles/
└── debug/
```

### Testing

- Test endpoints available for development
- Debug endpoints for troubleshooting
- Capability testing utilities

---

## Changelog

### v1.0.0

- Initial API implementation
- Three-role RBAC system
- Project management with nested services
- Payment method management
- Role and capability management

---

## Support

For API support and questions, contact the development team or refer to the internal documentation.
