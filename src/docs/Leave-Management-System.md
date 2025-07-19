# Leave Management System - Role-Based Implementation

## Overview

The leave management system has been updated to implement proper role-based authentication and authorization, allowing admins to approve or cancel leave requests while regular employees can only manage their own requests.

## API Integration

The system is now fully integrated with the provided Swagger API at `https://project-management-web-api-1.onrender.com/swagger/v1/swagger.json`.

### API Endpoints Used

- `GET /api/LeaveRequests` - Get all leave requests (admin only)
- `GET /api/LeaveRequests/GetMyLeaves` - Get current user's leave requests
- `POST /api/LeaveRequests` - Create a new leave request
- `PUT /api/LeaveRequests/{id}` - Update a leave request
- `PUT /api/LeaveRequests/{id}/approve` - Approve/reject a leave request (admin only)
- `PUT /api/LeaveRequests/{id}/cancel` - Cancel/uncancel a leave request (admin only)
- `DELETE /api/LeaveRequests/{id}` - Delete a leave request

### Data Models

#### LeaveRequest (Response)
```typescript
interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  requestComments?: string;
  approved: boolean | null; // null = pending, true = approved, false = rejected
  cancelled: boolean;
  requestingEmployeeId: string;
  approvedById?: string | null;
  leaveTypeId: string;
  leaveTypeName?: string;
}
```

#### CreateLeaveRequestDto (Request)
```typescript
interface CreateLeaveRequestDto {
  startDate: string;
  endDate: string;
  leaveTypeId: string;
  requestComments: string; // Required field
  requestingEmployeeId: string; // Required field
}
```

## Role-Based Access Control

### Admin Users
- **Can view all leave requests** across the organization
- **Can approve or reject** pending leave requests
- **Can cancel or uncancel** leave requests
- **Can edit and delete** any leave request
- **Can create** leave requests on behalf of employees

### Regular Employees
- **Can only view their own leave requests**
- **Cannot approve or reject** any leave requests
- **Cannot cancel** leave requests (only admins can)
- **Can edit and delete** only their own leave requests
- **Can create** new leave requests for themselves

## Implementation Details

### Authentication Context

The system uses the `AuthContext` to manage user authentication and role-based permissions:

```typescript
const { user, isAdmin, getCurrentUserId } = useAuth();
```

Key methods:
- `isAdmin()` - Returns true if user has ADMIN role
- `getCurrentUserId()` - Returns the current user's ID
- `hasRole(role)` - Checks if user has a specific role
- `hasAnyRole(roles)` - Checks if user has any of the specified roles

### Leave Request Columns

The `getLeaveRequestColumns` function implements role-based action visibility:

```typescript
const isPending = request.approved === null && !request.cancelled;
const currentUserId = getCurrentUserId();
const isOwnRequest = request.requestingEmployeeId === currentUserId;
const isAdminUser = isAdmin();

// Admin actions - only show for admins
{isAdminUser && isPending && (
  <>
    <DropdownMenuItem onClick={() => onApprove(request, true)}>
      Approve
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onApprove(request, false)}>
      Reject
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onCancel(request, true)}>
      Cancel
    </DropdownMenuItem>
  </>
)}

// Edit/Delete actions - only for own requests or admins
{(isOwnRequest || isAdminUser) && (
  <>
    <DropdownMenuItem onClick={() => onEdit(request)}>
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onDelete(request)}>
      Delete
    </DropdownMenuItem>
  </>
)}
```

### Service Layer

The `LeaveRequestService` handles all API communication:

```typescript
// Approve or reject a leave request
async approveLeaveRequest(id: string, approved: boolean): Promise<void> {
  await axios.put(`/api/LeaveRequests/${id}/approve`, null, {
    params: { approved },
  });
}

// Cancel a leave request
async cancelLeaveRequest(id: string, cancel: boolean): Promise<void> {
  await axios.put(`/api/LeaveRequests/${id}/cancel`, null, {
    params: { cancel },
  });
}
```

### Form Validation

The leave request form uses Zod schema validation:

```typescript
export const leaveRequestSchema = z
  .object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    leaveTypeId: z.string().min(1, 'Leave type is required'),
    requestComments: z.string().min(1, 'Request comments are required'),
    requestingEmployeeId: z.string().min(1, 'Employee ID is required'),
  })
  .refine(dateRangeValidator('startDate', 'endDate'), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });
```

## User Interface

### Leave Requests Page (Admin)
- Shows all leave requests in the organization
- Displays employee information and request details
- Provides approve/reject/cancel actions for pending requests
- Allows editing and deleting any request

### My Leave Requests Page (Employee)
- Shows only the current user's leave requests
- No approve/reject/cancel actions available
- Allows editing and deleting own requests
- Clean, focused interface for personal leave management

### Status Indicators

The system uses color-coded badges to indicate request status:

- **Pending** (Gray) - `approved: null, cancelled: false`
- **Approved** (Green) - `approved: true, cancelled: false`
- **Rejected** (Red) - `approved: false, cancelled: false`
- **Cancelled** (Red) - `cancelled: true`

## Security Features

### Role-Based Route Protection

Routes are protected using the `AdminRoute` component:

```typescript
{
  path: 'leave-requests',
  element: (
    <AdminRoute>
      <LeaveRequestsPage />
    </AdminRoute>
  ),
},
{
  path: 'my-leave-requests',
  element: (
    <EmployeeRoute>
      <MyLeaveRequestsPage />
    </EmployeeRoute>
  ),
},
```

### JWT Token Validation

The system validates JWT tokens and extracts user roles:

```typescript
export const decodeJwtToken = (token: string): DecodedUserInfo | null => {
  const decoded = jwtDecode<JwtPayload>(token);
  return {
    id: decoded.nameid,
    email: decoded.email,
    firstName: decoded.name[0] || '',
    lastName: decoded.name[1] || '',
    roles: Array.isArray(decoded.role) ? decoded.role : [decoded.role],
    exp: decoded.exp,
    iat: decoded.iat,
  };
};
```

## Error Handling

The system implements comprehensive error handling:

- **API Errors**: Centralized error handling with user-friendly messages
- **Validation Errors**: Form-level validation with clear error messages
- **Authentication Errors**: Automatic logout on token expiration
- **Network Errors**: Retry mechanisms with exponential backoff

## Usage Examples

### Admin Approving a Leave Request

1. Navigate to "Leave Requests" page
2. Find the pending request in the table
3. Click the actions menu (three dots)
4. Select "Approve" or "Reject"
5. Confirmation toast will appear

### Employee Creating a Leave Request

1. Navigate to "My Leave Requests" page
2. Click "New Leave Request" button
3. Fill in the required fields:
   - Leave Type
   - Start Date
   - End Date
   - Comments (required)
4. Submit the request
5. Request will appear as "Pending"

### Admin Cancelling a Leave Request

1. Navigate to "Leave Requests" page
2. Find the request to cancel
3. Click the actions menu
4. Select "Cancel"
5. Request status will change to "Cancelled"

## Future Enhancements

- **Email Notifications**: Send email notifications for status changes
- **Bulk Operations**: Allow admins to approve/reject multiple requests
- **Leave Balance Integration**: Check leave balance before approval
- **Workflow Approvals**: Multi-level approval process
- **Calendar Integration**: Visual calendar view of leave requests
- **Reporting**: Generate leave reports and analytics

## Testing

To test the role-based functionality:

1. **Login as Admin**:
   - Should see all leave requests
   - Should have approve/reject/cancel actions
   - Should be able to edit/delete any request

2. **Login as Employee**:
   - Should only see own leave requests
   - Should not have approve/reject/cancel actions
   - Should only be able to edit/delete own requests

3. **Test API Integration**:
   - Verify all API calls work correctly
   - Check error handling for invalid requests
   - Test authentication token validation 