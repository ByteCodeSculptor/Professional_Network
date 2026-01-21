# AI-Powered Professional Network MVP

A two-sided marketplace platform connecting tech professionals with companies for project-based work.

## 🚀 Features

### Core Features (MVP)
- **User Authentication**: Secure JWT-based authentication for professionals and companies
- **Profile Management**: Comprehensive profiles for both user types
- **Project Posting**: Companies can post detailed project requirements
- **Project Discovery**: Professionals can search and browse projects
- **Application System**: Apply to projects with cover letters and proposals
- **Messaging**: Real-time communication between parties
- **Payment Processing**: Secure Stripe integration with commission handling
- **GDPR/CCPA Compliance**: Data export, deletion, and consent management

### Security Features
- TLS encryption for all communications
- Password hashing with bcrypt (cost factor: 12)
- JWT token-based authentication
- Rate limiting on all endpoints
- PII protection and anonymization
- Role-based access control (RBAC)

## 📋 Prerequisites

- Node.js 20.x LTS
- PostgreSQL 15+
- Redis 7+
- Stripe Account (for payments)
- AWS Account (for S3 storage) or local file storage

## 🛠️ Installation

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL, REDIS_URL, JWT_SECRET, STRIPE keys, etc.

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3000/api/v1" > .env

# Start development server
npm run dev
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User authentication and basic info
- `professional_profiles` - Professional user profiles
- `company_profiles` - Company user profiles
- `projects` - Project postings
- `applications` - Project applications
- `messages` - User messaging
- `transactions` - Payment transactions
- `consent_records` - GDPR/CCPA consent tracking

## 🔐 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/professional_network
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
AWS_S3_BUCKET=your-bucket-name
COMMISSION_RATE=10.0
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Project Endpoints
- `POST /api/v1/projects` - Create project (company only)
- `GET /api/v1/projects` - List/search projects
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `POST /api/v1/projects/:id/publish` - Publish draft project
- `DELETE /api/v1/projects/:id` - Delete project

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t professional-network-api:latest ./backend

# Run with Docker Compose
docker-compose up -d
```

### AWS Deployment

1. **Database**: Deploy PostgreSQL on RDS
2. **Cache**: Deploy Redis on ElastiCache
3. **Storage**: Configure S3 bucket for file uploads
4. **Container**: Deploy to ECS/Fargate
5. **Load Balancer**: Configure ALB with SSL certificate
6. **CDN**: Set up CloudFront for static assets

See `docs/deployment.md` for detailed deployment instructions.

## 📊 Monitoring

- **Application Logs**: Winston logger with CloudWatch integration
- **Error Tracking**: Sentry integration
- **Performance**: CloudWatch metrics
- **Uptime**: Route 53 health checks

## 🔒 Security

- HTTPS only (TLS 1.3)
- Helmet.js security headers
- CORS configuration
- Rate limiting (100 req/min authenticated, 10 req/min anonymous)
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team

- Product Manager: Vishnu Vardhan
- Architect: Vishnu Vardhan
- Engineer: Vishnu Vardhan

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, email ramki3244@gmail.com or join our Slack channel.

## 🗺️ Roadmap

### Phase II (Future)
- AI-powered matching algorithm
- Mobile applications (iOS/Android)
- Advanced analytics dashboard
- Video conferencing integration
- Multi-language support
- Cryptocurrency payments
- Review and rating system
- Project milestones
- Team projects support

## 📖 Documentation

- [System Design Document](docs/design/system_design_mvp.md)
- [Product Requirements Document](docs/prd/professional_network_mvp.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guidelines](docs/security.md)
