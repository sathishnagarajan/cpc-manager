#!/usr/bin/env bash
set -euo pipefail
BASE=/var/www/cpc-manager/live
RELEASE_DIR=$BASE/releases/latest
if [ -f "$RELEASE_DIR/composer.json" ]; then
  cd "$RELEASE_DIR"
  sudo -u ec2-user composer install --no-dev --optimize-autoloader --no-interaction
fi
