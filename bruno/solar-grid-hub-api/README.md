# Smart Solar Microgrid API - Bruno Test Collection

This directory contains Bruno API test collections for the Smart Solar Microgrid Trading System API.

## Prerequisites

- Bruno API Client installed
- Backend API running on http://localhost:5281

## Setup

1. Open Bruno and import this collection
2. Set environment variables:
   - `token`: JWT token obtained from login
   - `userId`: User ID for user-specific operations

## Test Collections

### Authentication

1. **login.yml** - Test user login with email and password
   - Default credentials: admin@smartsolar.com / Admin@123
   - Returns JWT token

2. **register.yml** - Test user registration
   - Creates a new prosumer account
   - Returns user data (requires backoffice activation)

3. **google-login-challenge.yml** - Initiate Google OAuth flow
   - Redirects to Google sign-in page

4. **facebook-login-challenge.yml** - Initiate Facebook OAuth flow
   - Redirects to Facebook sign-in page

5. **apple-login-challenge.yml** - Initiate Apple OAuth flow
   - Redirects to Apple sign-in page

### Users

6. **get-all-users.yml** - Retrieve all users (Backoffice only)
   - Requires JWT token

7. **get-user-by-id.yml** - Retrieve specific user by ID
   - Requires JWT token and userId

8. **get-current-user.yml** - Retrieve current authenticated user
   - Requires JWT token

9. **update-current-user.yml** - Update current user profile
   - Requires JWT token
   - Can update firstName, lastName, phoneNumber

10. **activate-user.yml** - Activate a user account (Backoffice only)
    - Requires JWT token and userId

11. **deactivate-user.yml** - Deactivate a user account (Backoffice only)
    - Requires JWT token and userId

12. **get-pending-activations.yml** - Get users pending activation (Backoffice only)
    - Requires JWT token

13. **request-deactivation.yml** - Request account deactivation (Prosumer)
    - Requires JWT token

14. **delete-user.yml** - Delete a user account (Backoffice only)
    - Requires JWT token and userId

## Testing Workflow

### 1. Login Test
1. Run `login.yml`
2. Copy the `token` from response
3. Set `token` environment variable in Bruno

### 2. Registration Test
1. Run `register.yml`
2. Note the user ID from response
3. Login as backoffice user
4. Run `get-pending-activations.yml`
5. Run `activate-user.yml` with the new user ID

### 3. User Management Test
1. Run `get-all-users.yml`
2. Run `get-user-by-id.yml` with a specific userId
3. Run `update-current-user.yml` to update profile
4. Run `get-current-user.yml` to verify changes

### 4. OAuth Test
1. Run `google-login-challenge.yml` - Opens Google sign-in
2. Run `facebook-login-challenge.yml` - Opens Facebook sign-in
3. Run `apple-login-challenge.yml` - Opens Apple sign-in

Note: OAuth tests will redirect to the provider's sign-in page. Complete the sign-in flow in the browser, and you'll be redirected back to the frontend with a token.

## Expected Responses

### Success Responses
- **200 OK**: Operation successful
- **201 Created**: Resource created successfully

### Error Responses
- **400 Bad Request**: Invalid input or duplicate data
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found

## Notes

- All user management endpoints (except current user operations) require backoffice permissions
- Prosumer accounts require activation by backoffice after registration
- OAuth callbacks require users to exist in the database with matching email
- JWT tokens expire after 60 minutes (configurable in appsettings.json)
