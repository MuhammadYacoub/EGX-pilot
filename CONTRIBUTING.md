# Contributing to EGXpilot

Thank you for your interest in contributing to EGXpilot! This document provides guidelines for contributing to the project.

## Development Setup

1. **Prerequisites**
   - Node.js 18+
   - SQL Server 2019+
   - Redis 6+ (optional for development)

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd EGXpilot
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update database credentials
   - Set JWT secret

4. **Database Setup**
   ```bash
   npm run init-db
   ```

## Code Style

- Use ESLint configuration provided
- Follow existing code patterns
- Write meaningful commit messages
- Add tests for new features

## Testing

- Run tests: `npm test`
- Run specific test: `npm test -- --testNamePattern="test name"`
- Check coverage: `npm run test:coverage`

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

## Code Review Process

- All submissions require review
- Maintain code quality standards
- Follow security best practices
- Update documentation as needed
