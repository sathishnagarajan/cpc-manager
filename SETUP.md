# CPC Manager - Setup Instructions

## Database Setup

1. **Create MySQL Database:**
   ```sql
   CREATE DATABASE cpc_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   ```

2. **Configure Database Credentials:**
   - Open `api/.env` file
   - Update the database credentials:
     ```
     database.default.hostname = localhost
     database.default.database = cpc_manager
     database.default.username = your_username
     database.default.password = your_password
     ```

## API Setup (CodeIgniter 4)

1. **Install Dependencies:**
   ```bash
   cd api
   composer install
   ```

2. **Run Migrations:**
   ```bash
   php spark migrate --all
   ```

3. **Create Initial User (Optional):**
   You can create users directly in the database or use Shield commands:
   ```bash
   php spark shield:user create
   ```
   Follow the prompts to create an admin user.

4. **Start API Server:**
   ```bash
   php spark serve
   ```
   API will be available at: `http://localhost:8080`

## Web Frontend Setup (Next.js)

1. **Install Dependencies:**
   ```bash
   cd web
   npm install
   ```

2. **Configure Environment:**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Update API URL if needed (default: `http://localhost:8080/api`)

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Web app will be available at: `http://localhost:3000`

## Testing the API

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "your_password"}'
```

### Create Enquiry (with token)
```bash
curl -X POST http://localhost:8080/api/enquiries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "John Doe",
    "phone": "1234567890",
    "enquiry_date": "2026-01-03",
    "complaint": "Back pain",
    "status": "new"
  }'
```

### Get All Enquiries
```bash
curl -X GET http://localhost:8080/api/enquiries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
cpc-manager/
├── api/                    # CodeIgniter 4 Backend
│   ├── app/
│   │   ├── Controllers/
│   │   │   └── API/
│   │   │       ├── AuthController.php
│   │   │       └── EnquiryController.php
│   │   ├── Models/
│   │   │   └── EnquiryModel.php
│   │   └── Database/
│   │       └── Migrations/
│   └── .env                # Database & app configuration
├── web/                    # Next.js Frontend
│   ├── app/                # App router pages
│   ├── lib/
│   │   └── api.ts          # API service layer
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── .env.local          # Frontend configuration
└── reference-code/         # Reference materials
```

## Next Steps

1. Create a user in the database
2. Test the login endpoint
3. Start building frontend pages (you mentioned you'll paste code)
4. Later: Set up web-admin dashboard

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `api/.env`
- Ensure database exists

### CORS Issues
- Check `api/app/Config/Filters.php` for CORS configuration
- May need to add CORS filter for API routes

### Token Issues
- Ensure Shield is properly installed
- Check `api/app/Config/Auth.php` for token configuration
