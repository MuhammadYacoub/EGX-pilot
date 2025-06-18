# Scripts Directory

This directory contains utility scripts for EGXpilot management.

## Database Scripts:
- `init-database.js` - Initialize database schema and tables
- `create-db.js` - Create database if not exists
- `init-db.sh` - Shell script for database initialization
- `populate-data.js` - Populate database with sample data

## Deployment Scripts:
- `deploy.sh` - Full deployment script
- `quick-start.sh` - Quick development setup
- `backup.sh` - Database backup script
- `health-check.sh` - System health monitoring

## Usage:

### Database Setup:
```bash
npm run init-db
# or
./scripts/init-db.sh
```

### Quick Start:
```bash
./scripts/quick-start.sh
```

### Deployment:
```bash
./scripts/deploy.sh
```

### Health Check:
```bash
./scripts/health-check.sh
```
