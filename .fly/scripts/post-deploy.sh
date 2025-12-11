#!/bin/sh
# Post-deployment script for Fly.io
# This runs after the container starts

echo "Running post-deployment tasks..."

# Run database migrations
echo "Running database migrations..."
node src/scripts/run_missing_tables.js

# Seed initial data if needed
# echo "Seeding initial data..."
# node backend/seedPermissions.js

echo "Post-deployment tasks completed!"
