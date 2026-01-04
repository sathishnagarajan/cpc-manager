# AWS Deployment Setup - Step by Step Guide

## Prerequisites (Already Available)
- ✅ AWS EC2 instance running (Amazon Linux 2 recommended)
- ✅ AWS RDS MySQL database running
- ✅ GitHub/CodeCommit repository with your code

## Overview of AWS Services We'll Use

```
GitHub Repository
       ↓
   CodePipeline (Orchestration)
       ↓
   CodeBuild (Build & Package)
       ↓
   S3 (Store Artifacts)
       ↓
   CodeDeploy (Deploy to EC2)
       ↓
   EC2 Instance (Your Application)
```

---

## STEP 1: Create IAM Roles

### 1.1 CodeDeploy Service Role

1. Go to **IAM Console** → **Roles** → **Create Role**
2. Select trusted entity: **AWS service**
3. Use case: **CodeDeploy** → Select **CodeDeploy**
4. Click **Next**
5. The policy `AWSCodeDeployRole` should be automatically attached
6. Role name: `CPC-CodeDeploy-ServiceRole`
7. **Create role**

### 1.2 CodeBuild Service Role

1. Go to **IAM Console** → **Roles** → **Create Role**
2. Select trusted entity: **AWS service**
3. Use case: **CodeBuild**
4. Attach policies:
   - `AmazonS3FullAccess` (or create custom policy for specific bucket)
   - `CloudWatchLogsFullAccess`
5. Role name: `CPC-CodeBuild-ServiceRole`
6. **Create role**

### 1.3 EC2 Instance Role (if not already exists)

1. Go to **IAM Console** → **Roles** → **Create Role**
2. Select trusted entity: **AWS service**
3. Use case: **EC2**
4. Attach policies:
   - `AmazonS3ReadOnlyAccess` (for CodeDeploy to download artifacts)
   - `CloudWatchAgentServerPolicy` (for logs)
5. Role name: `CPC-EC2-InstanceRole`
6. **Create role**
7. **Attach this role to your EC2 instance:**
   - Go to EC2 Console
   - Select your instance
   - Actions → Security → Modify IAM role
   - Select `CPC-EC2-InstanceRole`
   - **Save**

---

## STEP 2: Install CodeDeploy Agent on EC2

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 2.1 Install CodeDeploy Agent

```bash
# Update system
sudo yum update -y

# Install Ruby (required for CodeDeploy agent)
sudo yum install ruby wget -y

# Download and install CodeDeploy agent
cd /tmp
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto

# Verify installation
sudo service codedeploy-agent status
```

Should show: `The AWS CodeDeploy agent is running`

### 2.2 Enable CodeDeploy Agent on Boot

```bash
sudo systemctl enable codedeploy-agent
```

---

## STEP 3: Setup EC2 Directory Structure

Still on EC2 instance:

```bash
# Create base directories
sudo mkdir -p /var/www/cpc-manager/{dev,live}/shared/writable
sudo mkdir -p /var/log/cpc-manager

# Set ownership
sudo chown -R ec2-user:apache /var/www/cpc-manager
sudo chown -R ec2-user:apache /var/log/cpc-manager

# Create writable subdirectories
for ENV in dev live; do
  for DIR in cache logs session uploads; do
    sudo mkdir -p /var/www/cpc-manager/$ENV/shared/writable/$DIR
    echo "" | sudo tee /var/www/cpc-manager/$ENV/shared/writable/$DIR/index.html
  done
done

# Set permissions
sudo chmod -R 775 /var/www/cpc-manager
```

### 3.1 Create Environment Configuration Files

**Development environment:**
```bash
sudo nano /var/www/cpc-manager/dev/shared/.env
```

Add this content (update with your actual RDS details):
```env
CI_ENVIRONMENT = development

app.baseURL = 'https://dev.cpcmanager.com'

database.default.hostname = your-rds-endpoint.rds.amazonaws.com
database.default.database = cpc_manager_dev
database.default.username = admin
database.default.password = your-db-password
database.default.DBDriver = MySQLi
database.default.port = 3306

# Add other configs as needed
```

**Production environment:**
```bash
sudo nano /var/www/cpc-manager/live/shared/.env
```

Add similar content with production values.

---

## STEP 4: Configure Apache/Nginx

### For Apache (Amazon Linux 2 default):

```bash
# Install Apache and PHP if not already installed
sudo yum install httpd php php-mysqlnd php-mbstring php-xml php-intl -y

# Create virtual host config
sudo nano /etc/httpd/conf.d/cpc-manager-dev.conf
```

Add this configuration:

```apache
<VirtualHost *:80>
    ServerName dev.cpcmanager.com
    DocumentRoot /var/www/cpc-manager/dev/current/public

    <Directory /var/www/cpc-manager/dev/current/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/cpc-manager/dev-error.log
    CustomLog /var/log/cpc-manager/dev-access.log combined
</VirtualHost>
```

Create production config:
```bash
sudo nano /etc/httpd/conf.d/cpc-manager-live.conf
```

```apache
<VirtualHost *:80>
    ServerName cpcmanager.com
    DocumentRoot /var/www/cpc-manager/live/current/public

    <Directory /var/www/cpc-manager/live/current/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/cpc-manager/live-error.log
    CustomLog /var/log/cpc-manager/live-access.log combined
</VirtualHost>
```

**Enable and restart Apache:**
```bash
sudo systemctl enable httpd
sudo systemctl restart httpd
```

---

## STEP 5: Create S3 Bucket for Artifacts

1. Go to **S3 Console**
2. Click **Create bucket**
3. Bucket name: `cpc-manager-deployments`
4. Region: Same as your EC2 (e.g., us-east-1)
5. **Block all public access**: Keep checked
6. **Create bucket**

---

## STEP 6: Setup CodeBuild Project

### 6.1 Create CodeBuild Project (Development)

1. Go to **CodeBuild Console**
2. Click **Create project**

**Project configuration:**
- Project name: `CPC-Manager-Dev-Build`
- Description: `Build and package CPC Manager API for dev environment`

**Source:**
- Source provider: **GitHub** (or CodeCommit)
- Repository: Connect to your GitHub repo
- Branch: `develop` (or your dev branch)

**Environment:**
- Environment image: **Managed image**
- Operating system: **Amazon Linux 2**
- Runtime: **Standard**
- Image: `aws/codebuild/amazonlinux2-x86_64-standard:4.0`
- Service role: Select `CPC-CodeBuild-ServiceRole` (created in Step 1.2)

**Buildspec:**
- Build specifications: **Use a buildspec file**
- Buildspec name: `buildspec-dev.yml`

**Artifacts:**
- Type: **Amazon S3**
- Bucket name: `cpc-manager-deployments`
- Name: Leave empty (will use default)
- Artifacts packaging: **Zip**

**Logs:**
- CloudWatch logs: **Enabled**
- Group name: `/aws/codebuild/cpc-manager-dev`

3. Click **Create build project**

### 6.2 Create CodeBuild Project (Production)

Repeat the same steps with these changes:
- Project name: `CPC-Manager-Live-Build`
- Branch: `main` (or your production branch)
- Buildspec name: `buildspec-live.yml`
- Log group: `/aws/codebuild/cpc-manager-live`

---

## STEP 7: Setup CodeDeploy

### 7.1 Create CodeDeploy Application

1. Go to **CodeDeploy Console**
2. Click **Create application**
3. Application name: `CPC-Manager`
4. Compute platform: **EC2/On-premises**
5. Click **Create application**

### 7.2 Create Deployment Group (Development)

1. Inside your application, click **Create deployment group**

**Deployment group configuration:**
- Deployment group name: `CPC-Manager-Dev`
- Service role: Select `CPC-CodeDeploy-ServiceRole` (created in Step 1.1)

**Deployment type:**
- Select: **In-place**

**Environment configuration:**
- Select: **Amazon EC2 instances**
- Tag group:
  - Key: `Environment` 
  - Value: `Development`
  
  **(You need to tag your EC2 instance with this tag)**
  - Go to EC2 Console → Select instance → Tags → Add tag
  - Key: `Environment`, Value: `Development`

**Agent configuration:**
- Install AWS CodeDeploy Agent: **Never** (we already installed it)

**Deployment settings:**
- Deployment configuration: **CodeDeployDefault.AllAtOnce**

**Load balancer:**
- Uncheck "Enable load balancing" (unless you have ALB)

2. Click **Create deployment group**

### 7.3 Create Deployment Group (Production)

Repeat with these changes:
- Deployment group name: `CPC-Manager-Live`
- Tag: Key: `Environment`, Value: `Production`
- Deployment configuration: **CodeDeployDefault.OneAtATime** (for safer production deploys)

**Tag your EC2 for production:**
- Add another tag: Key: `Environment`, Value: `Production`

---

## STEP 8: Create CodePipeline

### 8.1 Development Pipeline

1. Go to **CodePipeline Console**
2. Click **Create pipeline**

**Pipeline settings:**
- Pipeline name: `CPC-Manager-Dev-Pipeline`
- Service role: **New service role** (let AWS create it)
- Role name: `AWSCodePipelineServiceRole-CPC-Dev`
- Click **Next**

**Source stage:**
- Source provider: **GitHub (Version 2)**
- Connection: Click **Connect to GitHub** (first time only)
  - Connection name: `GitHub-CPC-Manager`
  - Authorize AWS to access your GitHub
- Repository: Select your repository
- Branch: `develop`
- Output artifact format: **CodePipeline default**
- Click **Next**

**Build stage:**
- Build provider: **AWS CodeBuild**
- Region: Your region
- Project name: Select `CPC-Manager-Dev-Build`
- Build type: **Single build**
- Click **Next**

**Deploy stage:**
- Deploy provider: **AWS CodeDeploy**
- Region: Your region
- Application name: `CPC-Manager`
- Deployment group: `CPC-Manager-Dev`
- Click **Next**

**Review and create:**
- Review all settings
- Click **Create pipeline**

The pipeline will automatically start running!

### 8.2 Production Pipeline

Repeat the same steps with:
- Pipeline name: `CPC-Manager-Live-Pipeline`
- Branch: `main`
- Build project: `CPC-Manager-Live-Build`
- Deployment group: `CPC-Manager-Live`

---

## STEP 9: Test Your Deployment

### 9.1 Make a Code Change

1. Make a small change in your code
2. Commit and push to `develop` branch:
```bash
git add .
git commit -m "Test deployment"
git push origin develop
```

3. Go to **CodePipeline Console**
4. Watch the `CPC-Manager-Dev-Pipeline` run through:
   - ✅ Source (Pull from GitHub)
   - ✅ Build (CodeBuild packages the app)
   - ✅ Deploy (CodeDeploy deploys to EC2)

### 9.2 Monitor Deployment

**Watch CodeDeploy logs on EC2:**
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip

# CodeDeploy agent logs
sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log

# Application activation logs
sudo tail -f /var/log/cpc-manager/activate-dev.log
```

### 9.3 Verify Deployment

1. Check the symlink:
```bash
ls -la /var/www/cpc-manager/dev/current
# Should point to latest release
```

2. Check the application:
```bash
curl http://your-ec2-ip/health
# Should return: {"status":"ok","timestamp":"..."}
```

3. Test via browser:
```
http://dev.cpcmanager.com/health
```

---

## STEP 10: Setup Health Check Endpoint

Add health check controller in your API:

**Create:** `api/app/Controllers/HealthController.php`
```php
<?php
namespace App\Controllers;

class HealthController extends BaseController
{
    public function index()
    {
        return $this->response->setJSON([
            'status' => 'ok',
            'timestamp' => date('Y-m-d H:i:s'),
            'environment' => ENVIRONMENT
        ]);
    }
}
```

**Add route in** `api/app/Config/Routes.php`:
```php
$routes->get('health', 'HealthController::index');
```

Commit and push this change to test the pipeline!

---

## Common Issues & Troubleshooting

### Issue 1: CodeDeploy Agent Not Running
```bash
# Restart agent
sudo service codedeploy-agent restart

# Check status
sudo service codedeploy-agent status
```

### Issue 2: Permission Denied Errors
```bash
# Fix ownership
sudo chown -R ec2-user:apache /var/www/cpc-manager
sudo chmod -R 775 /var/www/cpc-manager
```

### Issue 3: Composer Install Fails
```bash
# Install composer globally on EC2
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
```

### Issue 4: Database Connection Fails
- Verify RDS security group allows inbound from EC2 security group
- Check .env file has correct database credentials
- Test connection:
```bash
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p
```

### Issue 5: Deployment Failed
```bash
# Check CodeDeploy logs
sudo tail -100 /opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log

# Check specific deployment
sudo tail -100 /opt/codedeploy-agent/deployment-root/[deployment-id]/logs/scripts.log
```

---

## Pipeline Flow Summary

```
1. Developer pushes code to GitHub (develop/main branch)
   ↓
2. CodePipeline detects change (webhook trigger)
   ↓
3. Source stage: Pull code from GitHub
   ↓
4. Build stage: CodeBuild runs
   - Uses buildspec-dev.yml or buildspec-live.yml
   - Copies api/ folder
   - Creates artifact with appspec.yml and scripts/
   - Uploads artifact.zip to S3
   ↓
5. Deploy stage: CodeDeploy runs
   - Downloads artifact from S3
   - Runs BeforeInstall: cleanup-dev.sh
   - Copies files to /var/www/cpc-manager/dev/releases/latest
   - Runs AfterInstall: composer-dev.sh
   - Runs ApplicationStart: activate-dev.sh
     * Timestamps the release
     * Creates symlinks for writable and .env
     * Updates 'current' symlink
     * Restarts PHP-FPM/Apache
   - Runs ValidateService: healthcheck-dev.sh
   ↓
6. Application is live! ✅
```

---

## Next Steps

1. **Setup SSL/HTTPS:**
   - Install Certbot
   - Get Let's Encrypt certificates
   - Update Apache configs

2. **Setup CloudWatch Alarms:**
   - Monitor deployment failures
   - Monitor EC2 health
   - Alert on errors

3. **Enable Rollback:**
   - CodeDeploy automatic rollback on deployment failure
   - Manual rollback: Change `current` symlink to previous release

4. **Blue/Green Deployment (Advanced):**
   - Setup Load Balancer
   - Use CodeDeploy Blue/Green deployment type

5. **Add Approval Stage (Production):**
   - Add manual approval before production deployment
   - Pipeline: Source → Build → **[Manual Approval]** → Deploy

---

## Cost Optimization

- CodePipeline: $1/month per active pipeline
- CodeBuild: $0.005/build minute (100 min free/month)
- CodeDeploy: Free for EC2
- S3: ~$0.023/GB (minimal for artifacts)
- **Estimated cost: $2-5/month** for both dev and production pipelines

---

## Security Best Practices

1. ✅ Use IAM roles with least privilege
2. ✅ Store .env files on EC2 (never in repository)
3. ✅ Use AWS Secrets Manager for sensitive data
4. ✅ Enable MFA for AWS console access
5. ✅ Regular security group audits
6. ✅ Keep CodeDeploy agent updated
7. ✅ Use private S3 buckets
8. ✅ Enable CloudTrail for audit logs

---

**Your deployment pipeline is now ready! 🚀**

Push code to test the complete workflow!
