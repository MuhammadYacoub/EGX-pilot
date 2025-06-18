# Docker Configuration

This directory contains Docker-related files for EGXpilot deployment.

## Files:
- `Dockerfile` - Main application container definition
- `docker-compose.yml` - Production Docker Compose configuration
- `docker-compose.test.yml` - Test environment Docker Compose configuration

## Usage:

### Development:
```bash
docker-compose up -d redis
npm run dev
```

### Production:
```bash
docker-compose up -d
```

### Testing:
```bash
docker-compose -f docker-compose.test.yml up -d
npm test
```
