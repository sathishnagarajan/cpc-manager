#!/usr/bin/env bash
set -e

BASE=/var/www/cpc-manager/dev

echo "Running cleanup-dev.sh as $(whoami)"

# Ensure base directories exist
mkdir -p "$BASE/releases"

# Clean only the staging directory used by CodeDeploy
if [ -d "$BASE/releases/latest" ]; then
  rm -rf "$BASE/releases/latest"
fi

mkdir -p "$BASE/releases/latest"

# Fix ownership (safe even if empty)
chown -R ec2-user:apache "$BASE/releases"
