#!/usr/bin/env bash
set -euo pipefail
BASE=/var/www/cpc-manager/dev
sudo rm -rf $BASE/releases/latest || true
mkdir -p $BASE/releases/latest
chown -R ec2-user:apache $BASE/releases || true
