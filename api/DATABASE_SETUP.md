# Database Setup Instructions

## Create Database

You need to create the MySQL database manually. Choose one of the following methods:

### Option 1: Using phpMyAdmin
1. Open phpMyAdmin in your browser
2. Click "New" to create a new database
3. Database name: `cpc_manager`
4. Collation: `utf8mb4_general_ci`
5. Click "Create"

### Option 2: Using MySQL Command Line
```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE cpc_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

### Option 3: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Right-click in the Schemas panel
4. Select "Create Schema"
5. Name: `cpc_manager`
6. Charset: `utf8mb4`
7. Collation: `utf8mb4_general_ci`
8. Click "Apply"

## Update Database Configuration

After creating the database, update the database credentials in:
`/Users/sathishnagarajan/Sites/cpc-manager/api/.env`

```
database.default.hostname = localhost
database.default.database = cpc_manager
database.default.username = YOUR_USERNAME
database.default.password = YOUR_PASSWORD
```

## Run Migrations

Once the database is created and configured:

```bash
cd /Users/sathishnagarajan/Sites/cpc-manager/api
php spark migrate --all
```

This will create all necessary tables including:
- Shield authentication tables (users, auth_tokens, etc.)
- Enquiries table
