#!/usr/bin/env bash
set -euo pipefail
exec > >(tee -a /var/log/cpc-manager/activate-dev.log) 2>&1
date
echo "=== Activating CPC Manager dev release ==="

BASE=/var/www/cpc-manager/dev
TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASE_DIR=$BASE/releases/$TIMESTAMP

# Ensure base dirs
mkdir -p "$BASE/releases"
mkdir -p "$BASE/shared/writable"

# Move old latest into timestamped release if it exists
if [ -d "$BASE/releases/latest" ]; then
  mv "$BASE/releases/latest" "$RELEASE_DIR"
else
  mkdir -p "$RELEASE_DIR"
fi

# Ensure CI4 writable subdirs exist in shared
for DIR in cache logs session uploads; do
  mkdir -p "$BASE/shared/writable/$DIR"
  if [ ! -f "$BASE/shared/writable/$DIR/index.html" ]; then
    echo "" > "$BASE/shared/writable/$DIR/index.html"
  fi
done

# Replace writable in release with symlink to shared
if [ -d "$RELEASE_DIR/writable" ]; then
  rm -rf "$RELEASE_DIR/writable"
fi
ln -sfn "$BASE/shared/writable" "$RELEASE_DIR/writable"

# Copy shared .env if available
if [ -f "$BASE/shared/.env" ]; then
  cp -f "$BASE/shared/.env" "$RELEASE_DIR/.env"
  echo "Copied .env into $RELEASE_DIR"
else
  echo "WARNING: $BASE/shared/.env not found"
fi

# Fix ownership and perms
chown -R ec2-user:apache "$BASE"
chmod -R 775 "$BASE/shared/writable" || true

# Update current symlink
sudo -u ec2-user ln -sfn "$RELEASE_DIR" "$BASE/current"
sudo chown -h ec2-user:apache "$BASE/current" || sudo chgrp -h apache "$BASE/current" || true

# ensure parent permissions
sudo chmod 775 "$BASE/current"

echo "Current release: $RELEASE_DIR"

# Restart/reload services if available
if command -v systemctl >/dev/null 2>&1; then
  systemctl try-restart php-fpm || true
  systemctl try-reload-or-restart httpd || systemctl reload httpd || true
fi

echo "=== CPC Manager dev activation finished successfully ==="
