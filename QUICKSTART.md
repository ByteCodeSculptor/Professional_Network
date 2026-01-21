# Quick Start Guide

Get the AI-Powered Professional Network MVP running locally in 5 minutes.

## Prerequisites

Make sure you have installed:
- Node.js 20.x LTS
- PostgreSQL 15+
- Redis 7+
- Git

## Step 1: Clone and Install

```bash
# Navigate to the project
cd /workspace/professional_network_mvp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Setup Database

```bash
# Start PostgreSQL (if not running)
# On macOS with Homebrew:
brew services start postgresql@15

# On Linux:
sudo systemctl start postgresql

# Create database
createdb professional_network

# Or using psql:
psql -U postgres
CREATE DATABASE professional_network;
\q
```

## Step 3: Setup Redis

```bash
# Start Redis (if not running)
# On macOS with Homebrew:
brew services start redis

# On Linux:
sudo systemctl start redis

# Verify Redis is running:
redis-cli ping
# Should return: PONG
```

## Step 4: Configure Environment

```bash
# Backend environment
cd backend
cp .env.example .env

# Edit .env and update:
# - DATABASE_URL (if different from default)
# - JWT_SECRET (generate a strong random string)
# - STRIPE_SECRET_KEY (get from Stripe dashboard)
# - Other variables as needed

# Frontend environment
cd ../frontend
echo "VITE_API_BASE_URL=http://localhost:3000/api/v1" > .env
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx" >> .env
```

## Step 5: Initialize Database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database with sample data
npm run prisma:seed
```

## Step 6: Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# Should see:
# Server is running on port 3000
# Database connected successfully
# Redis connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# Should see:
# VITE v5.0.8  ready in 500 ms
# ➜  Local:   http://localhost:5173/
```

## Step 7: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/health
- **API Docs**: http://localhost:3000/api-docs (if configured)

## Step 8: Create Your First Account

1. Click "Sign Up" on the landing page
2. Choose "Professional" or "Company"
3. Fill in registration details
4. Complete your profile
5. Start exploring!

## Using Docker (Alternative)

If you prefer using Docker:

```bash
# Make sure Docker is running
docker --version

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Common Issues

### Database Connection Error
```bash
# Check if PostgreSQL is running
pg_isready

# Check connection string in .env
# Make sure DATABASE_URL matches your PostgreSQL setup
```

### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping

# Check REDIS_URL in .env
```

### Port Already in Use
```bash
# Backend (port 3000)
lsof -ti:3000 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### Prisma Client Not Generated
```bash
cd backend
npm run prisma:generate
```

## Next Steps

- Read the [README.md](README.md) for detailed documentation
- Check [docs/todo.md](docs/todo.md) for implementation status
- Review [docs/design/system_design_mvp.md](docs/design/system_design_mvp.md) for architecture
- Explore the API endpoints in [docs/api.md](docs/api.md)

## Development Workflow

```bash
# Run linter
npm run lint

# Run tests
npm test

# Build for production
npm run build

# View Prisma Studio (database GUI)
npm run prisma:studio
```

## Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review error logs in `backend/logs/`
- Check browser console for frontend errors
- Ensure all environment variables are set correctly

## Default Test Accounts

After seeding the database, you can use:

**Professional Account:**
- Email: professional@test.com
- Password: Test123!@#

**Company Account:**
- Email: company@test.com
- Password: Test123!@#

---

**Happy coding! 🚀**