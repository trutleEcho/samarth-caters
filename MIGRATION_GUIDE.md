# Migration from Supabase to Neon Database

This guide explains the migration from Supabase to Neon database with username/password authentication.

## Changes Made

### 1. Database Migration
- **From**: Supabase PostgreSQL
- **To**: Neon PostgreSQL
- **Schema**: Complete database schema created with all tables, indexes, and triggers

### 2. Authentication System
- **From**: Supabase Auth with Google OAuth
- **To**: Custom JWT-based authentication with username/password
- **Features**: 
  - User registration and login
  - JWT token-based sessions
  - Password hashing with bcryptjs

### 3. API Layer
- **From**: Supabase client queries
- **To**: Direct SQL queries using Neon serverless driver
- **Authentication**: All API routes now require JWT authentication

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup
1. Create a Neon database
2. Get your connection string
3. Set the `DATABASE_URL` environment variable
4. Run the migration:

```bash
npm run migrate
```

### 3. Start the Application
```bash
npm run dev
```

## Database Schema

The migration creates the following tables:
- `users` - User authentication
- `customers` - Customer information
- `orders` - Order management
- `events` - Event details
- `menus` - Menu items
- `payments` - Payment tracking
- `expenses` - Expense management
- `employees` - Employee records
- `update_logs` - Audit trail

## Authentication Flow

1. **Registration**: Users can register with username, password, and optional email
2. **Login**: Users authenticate with username and password
3. **JWT Tokens**: Successful authentication returns a JWT token
4. **API Access**: All API routes require the JWT token in the Authorization header
5. **Session Management**: Tokens are stored in localStorage and validated on each request

## API Changes

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Protected Endpoints
All existing API endpoints now require authentication:
- `GET/POST/PUT/DELETE /api/customers`
- `GET/POST/PUT/DELETE /api/orders`
- `GET/POST/PUT/DELETE /api/event`
- `GET/POST/PUT/DELETE /api/expenses`
- `GET/POST/PUT/DELETE /api/menu`
- `GET/POST/PUT/DELETE /api/payment`

## Breaking Changes

1. **Authentication**: Google OAuth removed, replaced with username/password
2. **Database**: All queries now use raw SQL instead of Supabase client
3. **Session Storage**: Changed from Supabase session to localStorage JWT tokens
4. **API Responses**: Some response formats may have changed due to direct SQL queries

## Migration Checklist

- [x] Create Neon database schema
- [x] Implement JWT authentication system
- [x] Update all API routes to use Neon
- [x] Update frontend authentication flow
- [x] Remove Supabase dependencies
- [x] Update data entities
- [x] Create migration scripts
- [x] Update environment configuration

## Testing

1. Start the development server
2. Navigate to `/login`
3. Register a new user account
4. Test the authentication flow
5. Verify all API endpoints work with authentication
6. Test CRUD operations for all entities

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure `DATABASE_URL` is correctly set
2. **JWT Secret**: Make sure `JWT_SECRET` is set and secure
3. **Migration Errors**: Check database permissions and connection string
4. **Authentication Issues**: Verify JWT token is being sent in requests

### Support

If you encounter issues during migration, check:
1. Database connection and permissions
2. Environment variables
3. JWT token validity
4. API endpoint responses
