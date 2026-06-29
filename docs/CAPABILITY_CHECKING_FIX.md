# Capability Checking Fix Documentation

## Problem Description

Admin users were receiving "Permission Denied" errors when trying to access projects, despite having the correct capabilities. The error message showed:

```
Permission Denied
You do not have permission to view projects. Required capability: can_view_assigned_projects
```

## Root Cause Analysis

The issue was traced to a **401 Unauthorized** error when the frontend tried to fetch user capabilities from the `/api/users/[id]/capabilities` endpoint. This prevented the admin user's capabilities from being loaded, causing the permission check to fail.

### Debugging Process

1. **Added debug logs** to `src/app/dashboard/projects/page.tsx` to trace capability loading:

   ```typescript
   console.log("Checking permissions for user:", user);
   console.log("User capabilities:", user?.capabilities);
   console.log("Capabilities length:", user?.capabilities?.length);
   ```

2. **Created debug script** (`scripts/debug-admin-capabilities.ts`) to test the capabilities API directly:

   ```bash
   npx tsx scripts/debug-admin-capabilities.ts
   ```

3. **Identified the issue**: The capabilities API was returning 401 Unauthorized, indicating a session authentication problem.

## The Fix

### 1. Simplified Capabilities API Authorization

**File**: `src/app/api/users/[id]/capabilities/route.ts`

**Before** (causing circular dependency):

```typescript
// Users can only view their own capabilities unless they have admin access
const userCapabilities = await getUserCapabilities(session.user.id);
if (
  (session.user as any)?.id !== userId &&
  !userCapabilities.includes("can_manage_all_users")
) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

**After** (simplified check):

```typescript
// Users can only view their own capabilities unless they have admin access
// For now, allow users to view their own capabilities and admins to view any capabilities
if ((session.user as any)?.id !== userId) {
  // Check if user is admin by userType (simpler check)
  if ((session.user as any)?.userType !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
```

### 2. Why This Fixed the Issue

The original code was calling `getUserCapabilities(session.user.id)` to check if the current user could view other users' capabilities. This created a potential circular dependency or authentication issue because:

1. Frontend calls `/api/users/[id]/capabilities`
2. API calls `getUserCapabilities(session.user.id)` to check permissions
3. This could cause authentication problems or infinite loops

The simplified version uses a direct `userType` check instead of calling the capabilities function, avoiding the circular dependency.

## Key Lessons Learned

1. **Avoid circular dependencies** in API authorization checks
2. **Use simpler authorization patterns** when possible (e.g., `userType` checks vs. complex capability checks)
3. **Add debug logging** to trace capability loading issues
4. **Test API endpoints directly** when debugging authentication issues

## Files Modified

- `src/app/api/users/[id]/capabilities/route.ts` - Simplified authorization logic
- `src/app/dashboard/projects/page.tsx` - Added debug logging (can be removed in production)
- `scripts/debug-admin-capabilities.ts` - Created debug script (can be deleted)

## Testing

After the fix:

1. Admin users can now access projects without "Permission Denied" errors
2. Capabilities are loaded correctly from the API
3. Permission checks work as expected

## Prevention

To prevent similar issues in the future:

1. Keep API authorization logic simple and avoid circular dependencies
2. Use direct database queries for authorization checks when possible
3. Add comprehensive logging for capability-related operations
4. Test API endpoints independently when debugging authentication issues
