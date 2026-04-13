# Authentication Requirements for Staff Module

## Current Status
The staff module has been implemented with multi-tenant support but authentication is currently disabled for development purposes.

## Multi-Tenant Structure
- Staff schema includes `schoolId` field for data isolation
- All CRUD operations filter by `schoolId`
- Default schoolId (`507f1f77bcf86cd799439011`) used for development

## Future Authentication Implementation

### 1. Enable Authentication Middleware
Add `verifyToken` middleware back to staff routes:

```javascript
// In /server/routes/administrative/staff.js
import { verifyToken } from '../../middleware/auth.js';

router.use(verifyToken);
```

### 2. Remove Default SchoolId
Remove development fallbacks from controllers:

```javascript
// Replace this:
const schoolId = req.user?.schoolId || '507f1f77bcf86cd799439011';

// With this:
const schoolId = req.user?.schoolId;
if (!schoolId) {
  return res.status(401).json({ 
    success: false,
    message: 'Authentication required' 
  });
}
```

### 3. Frontend Authentication
Frontend needs to:
- Include JWT token in API requests
- Handle authentication errors gracefully
- Implement login/logout functionality

### 4. Token Management
Tokens should include:
```javascript
{
  userId: "...",
  schoolId: "...",
  role: "...",
  email: "..."
}
```

### 5. Role-Based Access
Consider adding role restrictions:
```javascript
import { requireSchoolAdmin } from '../../middleware/auth.js';

router.use(requireSchoolAdmin);
```

## Security Considerations
- All staff operations should be authenticated
- School isolation must be enforced
- Email uniqueness should be per-school
- Audit logs for staff changes

## Migration Steps
1. Implement frontend authentication
2. Enable backend authentication middleware
3. Remove development fallbacks
4. Test with real user accounts
5. Deploy to production

## Files to Modify
- `/server/routes/administrative/staff.js` - Enable auth middleware
- `/server/controllers/administrative/staff.js` - Remove default schoolId
- Frontend components - Add token management
- Authentication middleware - Ensure schoolId in JWT payload
