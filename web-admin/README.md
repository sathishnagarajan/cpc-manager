# CPC Admin Panel

Administration panel for Chennai Physio Care Management System.

## Setup

1. Install dependencies:
```bash
cd web-admin
pnpm install
```

2. Configure environment:
```bash
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL
```

3. Run development server:
```bash
pnpm dev
```

Admin panel will be available at: **http://localhost:3001**

## Default Access

Use your admin credentials created via CLI:
```bash
cd api
php spark shield:user create
# Follow prompts to create superadmin user
```

## Features

### User Management
- List all system users
- Create new users with roles:
  - Super Admin (full access)
  - Admin (user management, financials)
  - Staff (enquiries, patients, treatments)
  - Receptionist (enquiries, patients view)
- Edit user details and roles
- Deactivate users

### Planned Features
- Financial tracking and reports
- System settings
- Activity logs
- Dashboard analytics

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **API**: Axios with JWT authentication
- **TypeScript**: Full type safety
