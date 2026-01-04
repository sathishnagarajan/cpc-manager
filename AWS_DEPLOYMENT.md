# AWS Deployment Configuration

This directory contains AWS CodeDeploy and CodeBuild configuration files for deploying the CPC Manager API to AWS EC2.

## Files

### AppSpec Files
- `appspec-dev.yml` - AppSpec for development environment
- `appspec-live.yml` - AppSpec for production environment

### BuildSpec Files
- `buildspec-dev.yml` - Build specification for dev deployment
- `buildspec-live.yml` - Build specification for live deployment

### Deployment Scripts (`scripts/`)
- `cleanup-dev.sh` / `cleanup-live.sh` - Clean up before deployment
- `composer-dev.sh` / `composer-live.sh` - Install PHP dependencies
- `activate-dev.sh` / `activate-live.sh` - Activate the new release
- `healthcheck-dev.sh` / `healthcheck-live.sh` - Validate deployment

## Deployment Structure

The deployment creates the following structure on the EC2 instance:

```
/var/www/cpc-manager/
├── dev/
│   ├── current -> releases/20260104120000
│   ├── releases/
│   │   ├── 20260104120000/
│   │   ├── 20260104130000/
│   │   └── latest/
│   └── shared/
│       ├── .env
│       └── writable/
│           ├── cache/
│           ├── logs/
│           ├── session/
│           └── uploads/
└── live/
    ├── current -> releases/20260104120000
    ├── releases/
    │   └── ...
    └── shared/
        ├── .env
        └── writable/
```

## Setup Requirements

### On EC2 Instance

1. **Create base directories:**
```bash
sudo mkdir -p /var/www/cpc-manager/{dev,live}/shared/writable
sudo mkdir -p /var/log/cpc-manager
sudo chown -R ec2-user:apache /var/www/cpc-manager
sudo chown -R ec2-user:apache /var/log/cpc-manager
```

2. **Create environment files:**

Development:
```bash
sudo nano /var/www/cpc-manager/dev/shared/.env
```

Production:
```bash
sudo nano /var/www/cpc-manager/live/shared/.env
```

Add your environment configuration (database, API keys, etc.)

3. **Configure Apache/Nginx:**

Point your virtual host to:
- Dev: `/var/www/cpc-manager/dev/current/public`
- Live: `/var/www/cpc-manager/live/current/public`

### In AWS

1. **CodeBuild Project:**
   - Source: GitHub/CodeCommit repository
   - Buildspec: `buildspec-dev.yml` or `buildspec-live.yml`
   - Environment: Amazon Linux 2, PHP 8.1
   - Artifacts: Store in S3

2. **CodeDeploy Application:**
   - Compute platform: EC2/On-premises
   - Deployment group: Your EC2 instances
   - Service role: CodeDeploy service role

3. **CodePipeline:**
   - Source: GitHub/CodeCommit
   - Build: CodeBuild project
   - Deploy: CodeDeploy application

## Health Check Endpoint

Add a health check endpoint in your API:

`api/app/Controllers/HealthController.php`:
```php
<?php
namespace App\Controllers;

class HealthController extends BaseController
{
    public function index()
    {
        return $this->response->setJSON([
            'status' => 'ok',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}
```

Route in `api/app/Config/Routes.php`:
```php
$routes->get('health', 'HealthController::index');
```

## Deployment Process

1. Push code to repository
2. CodePipeline triggers automatically
3. CodeBuild packages the application
4. CodeDeploy deploys to EC2:
   - BeforeInstall: Cleanup old files
   - Install: Copy new files
   - AfterInstall: Run composer install
   - ApplicationStart: Activate release, update symlinks
   - ValidateService: Run health check

## Troubleshooting

### Check deployment logs:
```bash
# CodeDeploy logs
tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log

# Application activation logs
tail -f /var/log/cpc-manager/activate-dev.log
tail -f /var/log/cpc-manager/activate-live.log
```

### Manual rollback:
```bash
# List releases
ls -la /var/www/cpc-manager/dev/releases/

# Switch to previous release
sudo ln -sfn /var/www/cpc-manager/dev/releases/PREVIOUS_TIMESTAMP /var/www/cpc-manager/dev/current
sudo systemctl reload httpd
```

## Notes

- Based on the LinkBazaar deployment configuration
- Maintains multiple releases for easy rollback
- Shared `.env` and `writable` directory across releases
- Zero-downtime deployments with symlink switching
