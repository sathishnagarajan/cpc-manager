# CPC Manager

A comprehensive clinic management system for tracking enquiries, treatments, appointments, and exercises.

## Project Structure

```
cpc-manager/
├── api/              # CodeIgniter 4 backend API with JWT authentication
├── web/              # Next.js frontend application
├── web-admin/        # Next.js admin dashboard (future)
└── reference-code/   # Reference code for development
```

## Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 18+ and npm/yarn
- MySQL/MariaDB database

## Setup Instructions

### 1. API Setup (CodeIgniter 4)

```bash
cd api
composer install
cp env .env
# Configure database and other settings in .env
php spark migrate
php spark serve
```

Default API URL: `http://localhost:8080`

### 2. Web Frontend Setup (Next.js)

```bash
cd web
npm install
cp .env.example .env.local
# Configure API URL in .env.local
npm run dev
```

Default Web URL: `http://localhost:3000`

### 3. Database Configuration

Create a MySQL database and update the `.env` file in the `api/` folder with your database credentials.

## Features

### Current
- User authentication (JWT tokens)
- Enquiry management (CRUD operations)

### Planned
- Treatment tracking and attendance
- Appointment booking
- Exercise management
- Admin dashboard with patient and revenue tracking

## API Endpoints

- `POST /api/auth/login` - User login
- `GET /api/enquiries` - List all enquiries
- `POST /api/enquiries` - Create enquiry
- `GET /api/enquiries/{id}` - Get single enquiry
- `PUT /api/enquiries/{id}` - Update enquiry
- `DELETE /api/enquiries/{id}` - Delete enquiry

## Environment Variables

### API (.env)
```
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8080'
database.default.hostname = localhost
database.default.database = cpc_manager
database.default.username = root
database.default.password = 
```

### Web (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## License

Private Project
