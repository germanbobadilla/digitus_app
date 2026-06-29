# Project Management System - Complete Field Specification

## Overview

This document outlines all possible fields and sub-endpoints for a comprehensive project management system. The specification covers various project types from software development to construction, marketing campaigns, and research projects.

## Core Project Fields

### Basic Information

- **id** (String) - Unique identifier
- **projectId** (Int) - Sequential display ID (PRJ-001, PRJ-002, etc.)
- **title** (String) - Project name/title
- **description** (Text) - Detailed project description
- **shortDescription** (String) - Brief summary (max 200 chars)
- **projectCode** (String) - Internal project code (e.g., "Q4-2024-MOBILE")
- **slug** (String) - URL-friendly identifier

### Project Classification

- **projectType** (Enum) - Software, Marketing, Construction, Research, Event, Product, etc.
- **category** (String) - Sub-category within type
- **priority** (Enum) - Low, Medium, High, Critical, Urgent
- **complexity** (Enum) - Simple, Moderate, Complex, Enterprise
- **size** (Enum) - Small, Medium, Large, Enterprise
- **visibility** (Enum) - Private, Team, Department, Public

### Status & Lifecycle

- **status** (Enum) - Planning, Active, On Hold, Completed, Cancelled, Archived
- **phase** (String) - Current project phase
- **lifecycleStage** (Enum) - Initiation, Planning, Execution, Monitoring, Closure
- **isActive** (Boolean) - Whether project is currently active
- **isArchived** (Boolean) - Whether project is archived
- **archivedAt** (DateTime) - When project was archived

### Timeline & Scheduling

- **startDate** (Date) - Project start date
- **endDate** (Date) - Project end date
- **plannedStartDate** (Date) - Originally planned start
- **plannedEndDate** (Date) - Originally planned end
- **actualStartDate** (Date) - When project actually started
- **actualEndDate** (Date) - When project actually ended
- **deadline** (Date) - Critical deadline
- **duration** (Int) - Project duration in days
- **estimatedHours** (Int) - Total estimated hours
- **actualHours** (Int) - Hours actually worked
- **timezone** (String) - Project timezone

### Budget & Financial

- **budget** (Decimal) - Total project budget
- **actualCost** (Decimal) - Actual cost incurred
- **estimatedCost** (Decimal) - Estimated cost
- **currency** (String) - Currency code (USD, EUR, etc.)
- **budgetStatus** (Enum) - Under Budget, On Budget, Over Budget
- **costCenter** (String) - Cost center code
- **billingType** (Enum) - Fixed Price, Time & Materials, Retainer

### Billing & Invoicing

- **billingEnabled** (Boolean) - Whether billing is enabled for this project
- **hourlyRate** (Decimal) - Default hourly rate for this project
- **billingFrequency** (Enum) - Weekly, Monthly, Quarterly, On Completion
- **lastBilledAt** (DateTime) - When project was last billed
- **nextBillingDate** (Date) - Next scheduled billing date
- **totalBilled** (Decimal) - Total amount billed to date
- **outstandingBalance** (Decimal) - Amount owed but not yet paid
- **invoiceTemplateId** (String) - Template to use for invoices
- **taxRate** (Decimal) - Tax rate for this project
- **discountRate** (Decimal) - Discount rate applied

### Services & Deliverables

- **servicesEnabled** (Boolean) - Whether services are enabled for this project
- **totalServiceCost** (Decimal) - Total cost of all services
- **completedServices** (Int) - Number of completed services
- **pendingServices** (Int) - Number of pending services
- **milestoneCount** (Int) - Total number of milestones
- **completedMilestones** (Int) - Number of completed milestones
- **deliveredMilestones** (Int) - Number of delivered milestones

### Billing Workflow

- **autoBillOnDelivery** (Boolean) - Whether to automatically bill when milestone is delivered
- **billingTrigger** (Enum) - Milestone Delivery, Service Completion, Manual, Scheduled
- **outstandingAmount** (Decimal) - Amount currently owed by user
- **lastBillingDate** (DateTime) - When last bill was generated
- **nextBillingDate** (Date) - When next bill will be generated
- **paymentStatus** (Enum) - Paid, Pending, Overdue, Partial
- **billingNotes** (Text) - Notes for billing team

### Billing Line Items & Fiscal Requirements

- **lineItems** (JSON) - Array of billing line items with: description, quantity, unit, unitPrice, subtotal, taxRate, taxAmount, total
- **fiscalReceiptRequired** (Boolean) - Whether user requires fiscal receipt (factura con comprobante fiscal)
- **fiscalReceiptNumber** (String) - Fiscal receipt number if generated
- **taxId** (String) - User's tax ID (RFC in Mexico)
- **businessName** (String) - Business name for fiscal receipt
- **businessAddress** (JSON) - Business address for fiscal receipt
- **fiscalStatus** (Enum) - Pending, Generated, Sent, Validated
- **taxExempt** (Boolean) - Whether transaction is tax exempt
- **taxExemptionReason** (String) - Reason for tax exemption

### People & Roles

- **ownerId** (String) - Project owner/creator (Digitus)
- **managerId** (String) - Project manager (Digitus)
- **assignedUserId** (String) - User assigned to work on the project
- **sponsorId** (String) - Project sponsor
- **clientId** (String) - Client contact
- **teamLeadId** (String) - Technical team lead
- **stakeholders** (JSON) - Array of stakeholder IDs and roles
- **canUserCreateProjects** (Boolean) - Whether users can create projects (false for regular users)

### Organization & Structure

- **departmentId** (String) - Department owning the project
- **divisionId** (String) - Division
- **companyId** (String) - Company (for multi-tenant)
- **parentProjectId** (String) - For sub-projects
- **templateId** (String) - Project template used
- **workflowId** (String) - Workflow template

### Metadata & Tracking

- **createdAt** (DateTime) - Creation timestamp
- **updatedAt** (DateTime) - Last update timestamp
- **createdById** (String) - User who created
- **lastModifiedById** (String) - User who last modified
- **version** (String) - Project version
- **revision** (Int) - Revision number
- **tags** (JSON) - Array of tags
- **customFields** (JSON) - Custom field values
- **metadata** (JSON) - Additional metadata

### Progress & Metrics

- **progress** (Decimal) - Completion percentage (0-100)
- **health** (Enum) - Green, Yellow, Red
- **riskLevel** (Enum) - Low, Medium, High, Critical
- **qualityScore** (Decimal) - Quality rating
- **satisfactionScore** (Decimal) - Stakeholder satisfaction
- **velocity** (Decimal) - Work velocity metric
- **burndownRate** (Decimal) - Burndown rate

### Viewer Tracking & Analytics

- **viewCount** (Int) - Total number of views
- **uniqueViewers** (Int) - Number of unique viewers
- **lastViewedAt** (DateTime) - When project was last viewed
- **activeViewers** (Int) - Currently active viewers count
- **viewTrackingEnabled** (Boolean) - Whether to track views

### Compliance & Security

- **complianceRequirements** (JSON) - Compliance needs
- **securityLevel** (Enum) - Public, Internal, Confidential, Secret
- **dataClassification** (Enum) - Public, Internal, Sensitive, Restricted
- **auditTrail** (Boolean) - Whether audit trail is required
- **retentionPeriod** (Int) - Data retention in days

## Sub-Endpoints & Related Entities

### 1. Tasks & Work Items

**Endpoint**: `/api/projects/{id}/tasks`

- **Fields**: id, title, description, status, priority, assigneeId, dueDate, estimatedHours, actualHours, progress, tags, dependencies, subtasks
- **Operations**: CRUD, bulk operations, status updates, assignment changes
- **Sub-endpoints**:
  - `/api/projects/{id}/tasks/{taskId}/subtasks`
  - `/api/projects/{id}/tasks/{taskId}/comments`
  - `/api/projects/{id}/tasks/{taskId}/attachments`
  - `/api/projects/{id}/tasks/{taskId}/time-entries`

### 2. Services & Pricing

**Endpoint**: `/api/projects/{id}/services`

- **Fields**: id, name, description, category, hourlyRate, estimatedHours, actualHours, cost, status, assignedTo, completedAt
- **Operations**: CRUD, assign services, track time, calculate costs
- **Sub-endpoints**:
  - `/api/projects/{id}/services/{serviceId}/time-entries`
  - `/api/projects/{id}/services/{serviceId}/assign`
  - `/api/projects/{id}/services/categories`

### 3. Milestones & Deliverables

**Endpoint**: `/api/projects/{id}/milestones`

- **Fields**: id, title, description, dueDate, completedAt, status, deliverables, dependencies, assignedServices
- **Operations**: CRUD, status updates, dependency management, mark as delivered
- **Sub-endpoints**:
  - `/api/projects/{id}/milestones/{milestoneId}/deliverables`
  - `/api/projects/{id}/milestones/{milestoneId}/mark-delivered`

### 4. Time Tracking

**Endpoint**: `/api/projects/{id}/time-entries`

- **Fields**: id, userId, taskId, date, hours, description, billable, rate, category
- **Operations**: CRUD, reporting, approval workflow
- **Sub-endpoints**:
  - `/api/projects/{id}/time-entries/reports`
  - `/api/projects/{id}/time-entries/approvals`

### 5. Budget & Expenses

**Endpoint**: `/api/projects/{id}/expenses`

- **Fields**: id, category, amount, currency, date, description, vendor, receipt, approved, billable
- **Operations**: CRUD, approval workflow, reporting
- **Sub-endpoints**:
  - `/api/projects/{id}/expenses/categories`
  - `/api/projects/{id}/expenses/approvals`
  - `/api/projects/{id}/expenses/reports`

### 6. Files & Attachments

**Endpoint**: `/api/projects/{id}/files`

- **Fields**: id, name, type, size, url, uploadedBy, uploadedAt, version, description, tags
- **Operations**: Upload, download, version control, sharing
- **Sub-endpoints**:
  - `/api/projects/{id}/files/{fileId}/versions`
  - `/api/projects/{id}/files/{fileId}/sharing`

### 7. Comments & Discussions

**Endpoint**: `/api/projects/{id}/comments`

- **Fields**: id, content, authorId, createdAt, updatedAt, parentId, type, mentions
- **Operations**: CRUD, threading, mentions, notifications
- **Sub-endpoints**:
  - `/api/projects/{id}/comments/{commentId}/replies`
  - `/api/projects/{id}/comments/{commentId}/reactions`

### 8. Reports & Analytics

**Endpoint**: `/api/projects/{id}/reports`

- **Fields**: id, type, parameters, generatedAt, status, url, format
- **Operations**: Generate, schedule, export, share
- **Sub-endpoints**:
  - `/api/projects/{id}/reports/{reportId}/schedule`
  - `/api/projects/{id}/reports/{reportId}/export`

### 9. Notifications & Alerts

**Endpoint**: `/api/projects/{id}/notifications`

- **Fields**: id, type, message, recipientId, sentAt, readAt, priority, channel
- **Operations**: CRUD, bulk operations, delivery tracking
- **Sub-endpoints**:
  - `/api/projects/{id}/notifications/settings`
  - `/api/projects/{id}/notifications/templates`

### 10. Templates & Workflows

**Endpoint**: `/api/projects/{id}/templates`

- **Fields**: id, name, type, content, version, isActive, createdBy
- **Operations**: CRUD, version control, sharing
- **Sub-endpoints**:
  - `/api/projects/{id}/templates/{templateId}/versions`
  - `/api/projects/{id}/templates/{templateId}/instances`

### 11. Integrations & Webhooks

**Endpoint**: `/api/projects/{id}/integrations`

- **Fields**: id, service, config, isActive, lastSync, status, credentials
- **Operations**: CRUD, sync, test, configure
- **Sub-endpoints**:
  - `/api/projects/{id}/integrations/{integrationId}/sync`
  - `/api/projects/{id}/integrations/{integrationId}/webhooks`

### 12. Project Viewers & Activity Tracking

**Endpoint**: `/api/projects/{id}/viewers`

- **Fields**: id, userId, projectId, viewedAt, lastActiveAt, sessionId, ipAddress, userAgent, isActive
- **Operations**: Track views, get active viewers, view history
- **Sub-endpoints**:
  - `/api/projects/{id}/viewers/active` - Get currently active viewers
  - `/api/projects/{id}/viewers/history` - Get view history
  - `/api/projects/{id}/viewers/analytics` - Get viewing analytics
  - `/api/projects/{id}/viewers/track` - Track a view (POST)

### 13. Billing & Payment Management

**Endpoint**: `/api/billing`

- **Fields**: id, projectId, userId, billingCycle, status, totalAmount, paidAmount, outstandingAmount, lastBillingDate, nextBillingDate, billingPreferences
- **Operations**: Manage billing cycles, process payments, send reminders, generate reports
- **Sub-endpoints**:
  - `/api/billing/invoices` - Invoice management (individual bills)
  - `/api/billing/invoices/{id}/send` - Send specific invoice
  - `/api/billing/invoices/{id}/pay` - Pay specific invoice
  - `/api/billing/invoices/{id}/cancel` - Cancel invoice
  - `/api/billing/payments` - Payment processing
  - `/api/billing/user-bills` - User's outstanding bills
  - `/api/billing/payment-methods` - User payment methods
  - `/api/billing/process-payment` - Process payment for specific bill
  - `/api/billing/bulk-pay` - Pay multiple bills at once
  - `/api/billing/receipts` - Payment receipts and history
  - `/api/billing/fiscal-receipts` - Fiscal receipts (facturas con comprobante fiscal)
  - `/api/billing/subscriptions` - Recurring billing
  - `/api/billing/refunds` - Refund processing
  - `/api/billing/reports` - Billing analytics
  - `/api/billing/templates` - Invoice templates

### 13.1. Invoices (Sub-endpoint of Billing)

**Endpoint**: `/api/billing/invoices`

- **Fields**: id, billingId, projectId, milestoneId, userId, invoiceNumber, amount, currency, status, dueDate, paidDate, description, lineItems, taxRate, discount, total, paymentMethodId, fiscalReceiptRequired, fiscalReceiptNumber, taxId, businessName, address, fiscalStatus
- **Operations**: CRUD, send, pay, cancel, generate fiscal receipt
- **Sub-endpoints**:
  - `/api/billing/invoices/{id}/line-items` - Manage invoice line items
  - `/api/billing/invoices/{id}/send` - Send invoice to customer
  - `/api/billing/invoices/{id}/pay` - Process payment for invoice
  - `/api/billing/invoices/{id}/fiscal-receipt` - Generate fiscal receipt
  - `/api/billing/invoices/{id}/download` - Download invoice PDF

#### Billing System Hierarchy

**Billing** (Parent Container):

- Manages overall billing cycles and payment processing
- Tracks total amounts, paid amounts, outstanding balances
- Handles billing preferences and cycles

**Invoices** (Sub-endpoint):

- Individual billable documents within a billing cycle
- Contains detailed line items, taxes, and payment terms
- Can be sent, paid, cancelled, or generate fiscal receipts

**Example Flow**:

1. Project milestone delivered → Generate invoice
2. Invoice added to billing cycle
3. Invoice sent to customer
4. Customer pays invoice
5. Payment recorded in billing system

### 14. User Payment Methods & Profile

**Endpoint**: `/api/users/{id}/payment-methods`

- **Fields**: id, userId, type, cardLast4, cardBrand, expiryMonth, expiryYear, isDefault, isActive, createdAt
- **Operations**: CRUD, set default, validate, process payments
- **Sub-endpoints**:
  - `/api/users/{id}/payment-methods/{methodId}/set-default`
  - `/api/users/{id}/payment-methods/{methodId}/validate`
  - `/api/users/{id}/billing-summary` - User's billing overview
  - `/api/users/{id}/payment-history` - Payment history

### 15. Audit Trail & History

**Endpoint**: `/api/projects/{id}/audit`

- **Fields**: id, action, entity, entityId, oldValue, newValue, userId, timestamp, ip
- **Operations**: Read-only, filtering, export
- **Sub-endpoints**:
  - `/api/projects/{id}/audit/export`
  - `/api/projects/{id}/audit/summary`

## Project Types & Specialized Fields

### Software Development Projects

- **repositoryUrl** (String) - Git repository
- **branch** (String) - Main branch
- **deploymentUrl** (String) - Live deployment
- **stagingUrl** (String) - Staging environment
- **techStack** (JSON) - Technologies used
- **architecture** (Text) - System architecture
- **apiDocumentation** (String) - API docs URL
- **testCoverage** (Decimal) - Test coverage percentage

### Marketing Campaigns

- **campaignType** (Enum) - Digital, Print, Social, Email, etc.
- **targetAudience** (Text) - Target demographic
- **budgetAllocation** (JSON) - Budget breakdown by channel
- **kpis** (JSON) - Key performance indicators
- **creativeAssets** (JSON) - Creative materials
- **launchDate** (Date) - Campaign launch
- **endDate** (Date) - Campaign end

### Construction Projects

- **siteAddress** (String) - Construction site
- **buildingType** (String) - Residential, Commercial, etc.
- **squareFootage** (Decimal) - Building size
- **permits** (JSON) - Required permits
- **inspections** (JSON) - Inspection schedule
- **materials** (JSON) - Material requirements
- **contractors** (JSON) - Contractor information

### Research Projects

- **researchType** (Enum) - Basic, Applied, Clinical, etc.
- **methodology** (Text) - Research methodology
- **hypothesis** (Text) - Research hypothesis
- **dataSources** (JSON) - Data collection sources
- **ethicsApproval** (String) - Ethics committee approval
- **publications** (JSON) - Related publications
- **grants** (JSON) - Funding sources

## Implementation Considerations

### Database Design

- Use JSON fields for flexible data (tags, customFields, metadata)
- Implement proper indexing for search and filtering
- Consider partitioning for large datasets
- Use foreign key constraints for data integrity

### API Design

- Implement proper pagination for large datasets
- Use consistent naming conventions
- Implement proper error handling and validation
- Consider GraphQL for complex queries

### Security

- Implement role-based access control
- Use proper authentication and authorization
- Encrypt sensitive data
- Implement audit logging

### Performance

- Use caching for frequently accessed data
- Implement database query optimization
- Consider CDN for file storage
- Use background jobs for heavy operations

### Scalability

- Design for horizontal scaling
- Use microservices architecture
- Implement proper data archiving
- Consider multi-tenancy support

## RBAC Capabilities and Role Recommendations

### Three-Role System Capabilities

Based on the three-role system (Client, Manager, Admin), here are the specific capabilities:

#### Client Capabilities

- `PROJECT_VIEW_ASSIGNED` - View assigned projects only
- `MILESTONE_MARK_COMPLETED` - Mark milestones as completed (when manager delivered)
- `SERVICE_MARK_DONE` - Mark services as done (when manager completed)
- `BILLING_VIEW_OWN` - View own billing information and prices
- `INVOICE_VIEW_OWN` - View own invoices
- `PAYMENT_VIEW_OWN` - View own payments
- `PAYMENT_PROCESS` - Process payments for own bills
- `PAYMENT_METHOD_MANAGE` - Manage own payment methods
- `PROFILE_VIEW_EDIT` - View and edit own profile

#### Manager Capabilities

- `PROJECT_CREATE` - Create new projects
- `PROJECT_VIEW_ALL` - View all projects
- `PROJECT_EDIT_ALL` - Edit all projects
- `PROJECT_EXPORT` - Export project data
- `SERVICE_CREATE` - Add services to projects
- `SERVICE_EDIT` - Edit services
- `SERVICE_ASSIGN` - Assign services to clients
- `MILESTONE_CREATE` - Create milestones
- `MILESTONE_EDIT` - Edit milestones
- `MILESTONE_MARK_DELIVERED` - Mark milestones as delivered
- `FILE_UPLOAD` - Upload files and documents
- `DASHBOARD_ACCESS` - Access dashboard
- `PROJECTS_ACCESS` - Access projects section

#### Admin Capabilities (Superuser)

- `ADMIN_ACCESS` - Access admin panel
- `PROJECT_DELETE` - Delete projects
- `USER_MANAGE_ALL` - Manage all users
- `BILLING_VIEW_ALL` - View all billing data
- `INVOICE_VIEW_ALL` - View all invoices
- `PAYMENT_VIEW_ALL` - View all payments
- `SYSTEM_SETTINGS` - Manage system settings
- `ANALYTICS_VIEW_ALL` - View all analytics
- `ROLE_MANAGE` - Manage roles and permissions
- `AUDIT_LOG_VIEW` - View audit logs
- `ALL_SECTIONS_ACCESS` - Access all sections (Dashboard, Projects, Billing, Users, Settings)

#### Restricted Capabilities (Manager CANNOT access)

- `BILLING_VIEW_ALL` - Managers cannot see billing information
- `INVOICE_VIEW_ALL` - Managers cannot see invoices
- `PRICE_VIEW` - Managers cannot see prices
- `FINANCIAL_DATA_VIEW` - Managers cannot see financial data
- `USER_MANAGE` - Managers cannot manage users
- `ADMIN_FUNCTIONS` - Managers cannot access admin functions

### User Role Structure & Permissions

#### Client Role

**What they CAN do:**

- ✅ View assigned projects
- ✅ Mark milestones as "completed" (when manager delivered)
- ✅ Mark services as "done" (when manager completed)
- ✅ View project progress and status
- ✅ View billing information and prices
- ✅ View invoices and payment history
- ✅ Make payments
- ✅ Manage own payment methods
- ✅ View own profile and settings

**What they CANNOT do:**

- ❌ Create projects
- ❌ Delete projects
- ❌ Edit project details
- ❌ Add/remove services
- ❌ See other users' projects
- ❌ Access admin functions

#### Manager Role

**What they CAN do:**

- ✅ Create new projects
- ✅ Edit project details
- ✅ Add services to projects
- ✅ Assign projects to clients
- ✅ Mark milestones as "delivered"
- ✅ Upload files and documents
- ✅ Manage project timeline
- ✅ View all projects
- ✅ Export project data
- ✅ Manage project settings
- ✅ Access Dashboard and Projects sections

**What they CANNOT do:**

- ❌ Delete projects
- ❌ See prices or billing information
- ❌ View invoices
- ❌ Access billing section
- ❌ See financial data
- ❌ Manage users
- ❌ Access admin functions

#### Admin Role (Superuser)

**What they CAN do:**

- ✅ Everything (full system access)
- ✅ Create, edit, delete projects
- ✅ Manage all users (clients, managers, admins)
- ✅ View all billing and financial data
- ✅ Access all sections (Dashboard, Projects, Billing, Users, Settings)
- ✅ Manage system settings
- ✅ View analytics and reports
- ✅ Manage roles and permissions
- ✅ Delete projects and users
- ✅ Access audit logs
- ✅ Manage payment methods for all users

### Implementation Notes

- Capabilities are checked at the API level using middleware
- Each endpoint validates the required capability before processing
- UI components can check capabilities to show/hide features
- Role assignments can be managed through the admin interface
- Capabilities are stored as strings in the database for flexibility
- The system supports both individual capability checks and role-based access

## Conclusion

This specification provides a comprehensive foundation for building a robust project management system. The modular design allows for incremental implementation, starting with core features and gradually adding specialized functionality based on specific use cases and requirements.

The key is to start with the essential fields and sub-endpoints, then expand based on actual user needs and feedback. This approach ensures a solid foundation while maintaining flexibility for future enhancements.
