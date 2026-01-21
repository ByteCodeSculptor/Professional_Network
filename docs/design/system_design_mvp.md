# System Design Document (SDD)
# AI-Powered Professional Network - MVP (Phase I)

**Version:** 1.0  
**Date:** 2025-10-27  
**Status:** Draft for Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Implementation Approach](#2-implementation-approach)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Data Models & Database Schema](#5-data-models--database-schema)
6. [API Design](#6-api-design)
7. [User & UI Interaction Patterns](#7-user--ui-interaction-patterns)
8. [Security Architecture](#8-security-architecture)
9. [Search Implementation](#9-search-implementation)
10. [Payment Integration](#10-payment-integration)
11. [Compliance Framework](#11-compliance-framework)
12. [Deployment Strategy](#12-deployment-strategy)
13. [Performance & Scalability](#13-performance--scalability)
14. [Monitoring & Observability](#14-monitoring--observability)
15. [Unclear Aspects](#15-unclear-aspects)

---

## 1. Executive Summary

This System Design Document outlines the technical architecture for the MVP (Phase I) of an AI-Powered Professional Network—a two-sided marketplace connecting tech professionals with companies for project-based work.

**Core Objectives:**
- Achieve marketplace liquidity (Liquidity Ratio: 1.5-2.5)
- Validate core matching hypothesis through keyword-based search
- Ensure GDPR/CCPA/PCI DSS compliance from day one
- Rapid time-to-market with monolithic architecture
- Foundation for future microservices migration (Phase II)

**Design Philosophy:**
- **MVP-First:** Monolithic architecture for speed, deferring microservices complexity
- **Security-First:** Encryption, RBAC, PII protection built-in
- **Compliance-First:** GDPR/CCPA consent management, data minimization
- **Scalability-Ready:** Clean separation of concerns for future decomposition

---

## 2. Implementation Approach

### 2.1 Critical Requirements

**Difficult/Critical Requirements:**
1. **Two-Sided Marketplace Liquidity:** Must attract both professionals and companies simultaneously
2. **PCI DSS Compliance:** Secure payment handling without storing card data
3. **GDPR/CCPA Compliance:** Explicit consent, data portability, right to erasure
4. **Real-time Messaging:** Low-latency communication between parties
5. **Search Relevance:** Effective keyword matching for projects and professionals

**Technology Choices:**
- **Frontend:** React + Shadcn-ui + TypeScript + Tailwind CSS
  - Rationale: Modern, component-based, type-safe, rapid UI development
- **Backend:** Node.js + Express + TypeScript
  - Rationale: JavaScript ecosystem consistency, async I/O for real-time features
- **Database:** PostgreSQL (AWS RDS or GCP Cloud SQL)
  - Rationale: ACID compliance, full-text search, JSON support, proven reliability
- **Authentication:** JWT + bcrypt
  - Rationale: Stateless, scalable, industry-standard
- **Payment:** Stripe (client-side tokenization)
  - Rationale: PCI Level 1 compliance, reduces scope to SAQ C-VT
- **Real-time:** Socket.io
  - Rationale: WebSocket support, fallback mechanisms, room-based messaging
- **File Storage:** AWS S3 or GCP Cloud Storage
  - Rationale: Scalable, durable, CDN integration
- **Deployment:** Docker + AWS ECS/Fargate or GCP Cloud Run
  - Rationale: Containerization for consistency, managed orchestration

### 2.2 Development Phases

**Phase I.1 - Core Platform (Weeks 1-4):**
- User authentication and authorization
- Professional and company profile management
- Basic project posting and browsing

**Phase I.2 - Marketplace Features (Weeks 5-8):**
- Project application workflow
- Basic messaging system
- Search functionality (keyword-based)

**Phase I.3 - Monetization & Compliance (Weeks 9-12):**
- Stripe payment integration
- Transaction management
- GDPR/CCPA consent management
- Data export/deletion tools

---

## 3. System Architecture

### 3.1 High-Level Architecture

```plantuml
@startuml
!define RECTANGLE class

package "Client Layer" {
    [Web Browser] as Browser
    [React SPA] as React
}

package "API Gateway Layer" {
    [Express API Server] as API
    [WebSocket Server] as WS
}

package "Application Layer" {
    [Auth Service] as Auth
    [User Service] as User
    [Project Service] as Project
    [Application Service] as Application
    [Message Service] as Message
    [Transaction Service] as Transaction
    [Search Service] as Search
    [Notification Service] as Notification
}

package "Data Layer" {
    database "PostgreSQL" as DB {
        [Users]
        [Projects]
        [Applications]
        [Messages]
        [Transactions]
    }
    [Redis Cache] as Cache
    [S3 Storage] as S3
}

package "External Services" {
    [Stripe API] as Stripe
    [Email Service] as Email
}

Browser --> React
React --> API : HTTPS/REST
React --> WS : WebSocket
React --> Stripe : Client-side Tokenization

API --> Auth
API --> User
API --> Project
API --> Application
API --> Message
API --> Transaction
API --> Search
API --> Notification

WS --> Message

Auth --> DB
User --> DB
Project --> DB
Application --> DB
Message --> DB
Transaction --> DB
Search --> DB

User --> S3 : Profile Images
Project --> S3 : Attachments

Auth --> Cache : Session Data
Search --> Cache : Search Results

Transaction --> Stripe : Payment Processing
Notification --> Email : Email Notifications

@enduml
```

### 3.2 Architecture Characteristics

**Monolithic with Service Boundaries:**
- Single deployable unit (Node.js application)
- Clear internal service boundaries for future extraction
- Shared database with logical schema separation
- Service-oriented code organization

**Key Design Decisions:**
1. **Monolith for MVP:** Faster development, simpler deployment, easier debugging
2. **Service Boundaries:** Prepare for Phase II microservices decomposition
3. **Stateless API:** JWT-based auth, horizontally scalable
4. **Caching Strategy:** Redis for sessions, search results, frequently accessed data
5. **Async Processing:** Background jobs for emails, notifications (Bull queue)

---

## 4. Technology Stack

### 4.1 Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 18.x | UI component library |
| UI Library | Shadcn-ui | Latest | Pre-built accessible components |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| State Management | Zustand | 4.x | Lightweight state management |
| Form Handling | React Hook Form | 7.x | Form validation |
| HTTP Client | Axios | 1.x | API communication |
| Real-time | Socket.io Client | 4.x | WebSocket communication |
| Routing | React Router | 6.x | Client-side routing |
| Build Tool | Vite | 5.x | Fast build and HMR |

### 4.2 Backend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 20.x LTS | JavaScript runtime |
| Framework | Express | 4.x | Web framework |
| Language | TypeScript | 5.x | Type safety |
| ORM | Prisma | 5.x | Database ORM |
| Authentication | jsonwebtoken | 9.x | JWT generation/verification |
| Password Hashing | bcrypt | 5.x | Password encryption |
| Validation | Zod | 3.x | Schema validation |
| Real-time | Socket.io | 4.x | WebSocket server |
| Job Queue | Bull | 4.x | Background job processing |
| File Upload | Multer | 1.x | Multipart form handling |
| Email | Nodemailer | 6.x | Email sending |

### 4.3 Infrastructure Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | PostgreSQL 15 | Primary data store |
| Cache | Redis 7 | Session cache, rate limiting |
| Storage | AWS S3 / GCP Cloud Storage | File storage |
| CDN | CloudFront / Cloud CDN | Static asset delivery |
| Container | Docker | Application containerization |
| Orchestration | AWS ECS/Fargate or GCP Cloud Run | Container orchestration |
| Load Balancer | AWS ALB / GCP Load Balancer | Traffic distribution |
| Monitoring | CloudWatch / Cloud Monitoring | Metrics and logs |
| Secrets | AWS Secrets Manager / GCP Secret Manager | Credential management |

---

## 5. Data Models & Database Schema

### 5.1 Entity Relationship Diagram

```plantuml
@startuml
!define TABLE class

entity "users" as users {
    * id : UUID <<PK>>
    --
    * email : VARCHAR(255) <<UNIQUE>>
    * password_hash : VARCHAR(255)
    * user_type : ENUM('professional', 'company')
    * status : ENUM('active', 'suspended', 'deleted')
    * email_verified : BOOLEAN
    * created_at : TIMESTAMP
    * updated_at : TIMESTAMP
    * last_login_at : TIMESTAMP
}

entity "professional_profiles" as prof {
    * id : UUID <<PK>>
    * user_id : UUID <<FK>>
    --
    * first_name : VARCHAR(100)
    * last_name : VARCHAR(100)
    headline : VARCHAR(200)
    bio : TEXT
    skills : JSONB
    experience_years : INTEGER
    hourly_rate : DECIMAL(10,2)
    availability : ENUM('available', 'busy', 'not_available')
    location : VARCHAR(200)
    timezone : VARCHAR(50)
    profile_image_url : VARCHAR(500)
    resume_url : VARCHAR(500)
    portfolio_url : VARCHAR(500)
    * created_at : TIMESTAMP
    * updated_at : TIMESTAMP
}

entity "company_profiles" as company {
    * id : UUID <<PK>>
    * user_id : UUID <<FK>>
    --
    * company_name : VARCHAR(200)
    * industry : VARCHAR(100)
    description : TEXT
    company_size : ENUM('1-10', '11-50', '51-200', '201-500', '500+')
    website_url : VARCHAR(500)
    logo_url : VARCHAR(500)
    location : VARCHAR(200)
    * created_at : TIMESTAMP
    * updated_at : TIMESTAMP
}

entity "projects" as projects {
    * id : UUID <<PK>>
    * company_id : UUID <<FK>>
    --
    * title : VARCHAR(200)
    * description : TEXT
    * required_skills : JSONB
    budget_min : DECIMAL(10,2)
    budget_max : DECIMAL(10,2)
    duration_weeks : INTEGER
    * status : ENUM('draft', 'open', 'in_progress', 'completed', 'cancelled')
    deadline : DATE
    * created_at : TIMESTAMP
    * updated_at : TIMESTAMP
    * published_at : TIMESTAMP
}

entity "applications" as applications {
    * id : UUID <<PK>>
    * project_id : UUID <<FK>>
    * professional_id : UUID <<FK>>
    --
    cover_letter : TEXT
    proposed_rate : DECIMAL(10,2)
    estimated_duration : INTEGER
    * status : ENUM('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn')
    * created_at : TIMESTAMP
    * updated_at : TIMESTAMP
}

entity "messages" as messages {
    * id : UUID <<PK>>
    * sender_id : UUID <<FK>>
    * receiver_id : UUID <<FK>>
    * application_id : UUID <<FK>>
    --
    * content : TEXT
    * is_read : BOOLEAN
    * created_at : TIMESTAMP
}

entity "transactions" as transactions {
    * id : UUID <<PK>>
    * project_id : UUID <<FK>>
    * professional_id : UUID <<FK>>
    * company_id : UUID <<FK>>
    --
    * amount : DECIMAL(10,2)
    * commission_rate : DECIMAL(5,2)
    * commission_amount : DECIMAL(10,2)
    * net_amount : DECIMAL(10,2)
    * stripe_payment_intent_id : VARCHAR(255)
    * status : ENUM('pending', 'processing', 'completed', 'failed', 'refunded')
    * created_at : TIMESTAMP
    * updated_at : TIMESTAMP
    * completed_at : TIMESTAMP
}

entity "consent_records" as consent {
    * id : UUID <<PK>>
    * user_id : UUID <<FK>>
    --
    * consent_type : VARCHAR(50)
    * consent_given : BOOLEAN
    * consent_text : TEXT
    * ip_address : VARCHAR(45)
    * user_agent : TEXT
    * created_at : TIMESTAMP
}

users ||--o| prof : "user_id"
users ||--o| company : "user_id"
company ||--o{ projects : "company_id"
projects ||--o{ applications : "project_id"
prof ||--o{ applications : "professional_id"
users ||--o{ messages : "sender_id"
users ||--o{ messages : "receiver_id"
applications ||--o{ messages : "application_id"
projects ||--o{ transactions : "project_id"
prof ||--o{ transactions : "professional_id"
company ||--o{ transactions : "company_id"
users ||--o{ consent : "user_id"

@enduml
```

### 5.2 Detailed Schema Definitions

#### 5.2.1 Users Table

```sql
CREATE TYPE user_type AS ENUM ('professional', 'company');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type user_type NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type_status ON users(user_type, status);
```

#### 5.2.2 Professional Profiles Table

```sql
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'not_available');

CREATE TABLE professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    headline VARCHAR(200),
    bio TEXT,
    skills JSONB DEFAULT '[]',
    experience_years INTEGER,
    hourly_rate DECIMAL(10,2),
    availability availability_status DEFAULT 'available',
    location VARCHAR(200),
    timezone VARCHAR(50),
    profile_image_url VARCHAR(500),
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prof_user_id ON professional_profiles(user_id);
CREATE INDEX idx_prof_skills ON professional_profiles USING GIN(skills);
CREATE INDEX idx_prof_availability ON professional_profiles(availability);
```

#### 5.2.3 Company Profiles Table

```sql
CREATE TYPE company_size AS ENUM ('1-10', '11-50', '51-200', '201-500', '500+');

CREATE TABLE company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    company_size company_size,
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_user_id ON company_profiles(user_id);
CREATE INDEX idx_company_name ON company_profiles(company_name);
```

#### 5.2.4 Projects Table

```sql
CREATE TYPE project_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    required_skills JSONB DEFAULT '[]',
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    duration_weeks INTEGER,
    status project_status DEFAULT 'draft' NOT NULL,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_published ON projects(published_at) WHERE status = 'open';
CREATE INDEX idx_projects_skills ON projects USING GIN(required_skills);

-- Full-text search index
ALTER TABLE projects ADD COLUMN search_vector tsvector;
CREATE INDEX idx_projects_search ON projects USING GIN(search_vector);

CREATE FUNCTION projects_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_search_update BEFORE INSERT OR UPDATE
ON projects FOR EACH ROW EXECUTE FUNCTION projects_search_trigger();
```

#### 5.2.5 Applications Table

```sql
CREATE TYPE application_status AS ENUM ('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn');

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    proposed_rate DECIMAL(10,2),
    estimated_duration INTEGER,
    status application_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, professional_id)
);

CREATE INDEX idx_applications_project ON applications(project_id);
CREATE INDEX idx_applications_professional ON applications(professional_id);
CREATE INDEX idx_applications_status ON applications(status);
```

#### 5.2.6 Messages Table

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_application ON messages(application_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

#### 5.2.7 Transactions Table

```sql
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    professional_id UUID NOT NULL REFERENCES professional_profiles(id),
    company_id UUID NOT NULL REFERENCES company_profiles(id),
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    status transaction_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_project ON transactions(project_id);
CREATE INDEX idx_transactions_professional ON transactions(professional_id);
CREATE INDEX idx_transactions_company ON transactions(company_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_stripe ON transactions(stripe_payment_intent_id);
```

#### 5.2.8 Consent Records Table

```sql
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_text TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consent_user ON consent_records(user_id);
CREATE INDEX idx_consent_type ON consent_records(consent_type);
```

---

## 6. API Design

### 6.1 API Architecture

**RESTful Principles:**
- Resource-based URLs
- HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Stateless communication
- JSON request/response format
- Consistent error handling

**Base URL:** `https://api.yourplatform.com/v1`

**Authentication:** Bearer token (JWT) in Authorization header

### 6.2 Authentication & Authorization Endpoints

#### POST /auth/register
Register a new user (professional or company)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "userType": "professional",
  "consents": {
    "terms": true,
    "privacy": true,
    "marketing": false
  }
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "userType": "professional",
    "emailVerified": false
  },
  "token": "jwt_token"
}
```

#### POST /auth/login
Authenticate user and receive JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "userType": "professional"
  },
  "token": "jwt_token"
}
```

#### POST /auth/logout
Invalidate current session (blacklist token in Redis)

#### POST /auth/verify-email
Verify email address with token

#### POST /auth/forgot-password
Request password reset email

#### POST /auth/reset-password
Reset password with token

### 6.3 Professional Profile Endpoints

#### GET /professionals/:id
Get professional profile by ID

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "headline": "Full-Stack Developer",
  "bio": "Experienced developer...",
  "skills": ["JavaScript", "React", "Node.js"],
  "experienceYears": 5,
  "hourlyRate": 75.00,
  "availability": "available",
  "location": "San Francisco, CA",
  "profileImageUrl": "https://...",
  "portfolioUrl": "https://..."
}
```

#### PUT /professionals/:id
Update professional profile (authenticated)

**Request:**
```json
{
  "headline": "Senior Full-Stack Developer",
  "bio": "Updated bio...",
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "hourlyRate": 85.00
}
```

#### GET /professionals
Search/list professionals (with filters)

**Query Parameters:**
- `skills`: Comma-separated skills
- `availability`: available|busy|not_available
- `minRate`: Minimum hourly rate
- `maxRate`: Maximum hourly rate
- `location`: Location string
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

### 6.4 Company Profile Endpoints

#### GET /companies/:id
Get company profile by ID

#### PUT /companies/:id
Update company profile (authenticated)

#### GET /companies
List companies (with filters)

### 6.5 Project Endpoints

#### POST /projects
Create a new project (company only)

**Request:**
```json
{
  "title": "E-commerce Website Development",
  "description": "We need a full-stack developer...",
  "requiredSkills": ["React", "Node.js", "PostgreSQL"],
  "budgetMin": 5000,
  "budgetMax": 8000,
  "durationWeeks": 8,
  "deadline": "2025-12-31",
  "status": "draft"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "title": "E-commerce Website Development",
  "status": "draft",
  "createdAt": "2025-10-27T10:00:00Z"
}
```

#### GET /projects/:id
Get project details

#### PUT /projects/:id
Update project (company owner only)

#### DELETE /projects/:id
Delete project (company owner only, only if no applications)

#### POST /projects/:id/publish
Publish a draft project

#### GET /projects
Search/list projects (with filters)

**Query Parameters:**
- `skills`: Comma-separated skills
- `status`: Project status
- `minBudget`: Minimum budget
- `maxBudget`: Maximum budget
- `search`: Keyword search
- `page`: Page number
- `limit`: Results per page

**Response (200):**
```json
{
  "projects": [
    {
      "id": "uuid",
      "title": "E-commerce Website Development",
      "description": "We need...",
      "requiredSkills": ["React", "Node.js"],
      "budgetMin": 5000,
      "budgetMax": 8000,
      "company": {
        "id": "uuid",
        "companyName": "Tech Corp",
        "logoUrl": "https://..."
      },
      "publishedAt": "2025-10-27T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 6.6 Application Endpoints

#### POST /applications
Submit application to a project

**Request:**
```json
{
  "projectId": "uuid",
  "coverLetter": "I am interested in this project...",
  "proposedRate": 80.00,
  "estimatedDuration": 7
}
```

#### GET /applications/:id
Get application details

#### PATCH /applications/:id
Update application status (company can shortlist/accept/reject)

**Request:**
```json
{
  "status": "accepted"
}
```

#### DELETE /applications/:id
Withdraw application (professional only, before acceptance)

#### GET /projects/:projectId/applications
Get all applications for a project (company owner only)

#### GET /professionals/:professionalId/applications
Get all applications by a professional

### 6.7 Messaging Endpoints

#### POST /messages
Send a message

**Request:**
```json
{
  "receiverId": "uuid",
  "applicationId": "uuid",
  "content": "Hello, I'd like to discuss..."
}
```

#### GET /messages/conversations
Get list of conversations (grouped by application)

#### GET /messages/conversations/:applicationId
Get messages for a specific application

#### PATCH /messages/:id/read
Mark message as read

### 6.8 Transaction Endpoints

#### POST /transactions
Create a transaction (initiate payment)

**Request:**
```json
{
  "projectId": "uuid",
  "professionalId": "uuid",
  "amount": 7500.00
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "amount": 7500.00,
  "commissionRate": 10.00,
  "commissionAmount": 750.00,
  "netAmount": 6750.00,
  "status": "pending",
  "stripeClientSecret": "pi_xxx_secret_xxx"
}
```

#### GET /transactions/:id
Get transaction details

#### GET /transactions
List transactions (filtered by user)

#### POST /transactions/:id/confirm
Confirm payment completion (webhook handler)

### 6.9 Search Endpoint

#### GET /search
Unified search across projects and professionals

**Query Parameters:**
- `q`: Search query
- `type`: projects|professionals|all
- `page`: Page number
- `limit`: Results per page

### 6.10 User Data Management (GDPR/CCPA)

#### GET /users/me/data
Export all user data (JSON format)

#### POST /users/me/delete
Request account deletion (soft delete, 30-day grace period)

#### GET /users/me/consents
Get user consent records

#### PUT /users/me/consents
Update consent preferences

### 6.11 Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Standard Error Codes:**
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)

---

## 7. User & UI Interaction Patterns

### 7.1 Professional User Journey

```plantuml
@startuml
state "Landing Page" as Landing
state "Sign Up" as Signup
state "Profile Setup" as ProfileSetup
state "Browse Projects" as Browse
state "Project Details" as ProjectDetails
state "Submit Application" as Apply
state "Messaging" as Message
state "Transaction" as Transaction

[*] --> Landing
Landing --> Signup : Click "Sign Up"
Signup --> ProfileSetup : Complete Registration
ProfileSetup --> Browse : Complete Profile
Browse --> ProjectDetails : Click Project
ProjectDetails --> Apply : Click "Apply"
Apply --> Message : Application Submitted
Message --> Transaction : Project Accepted
Transaction --> [*] : Payment Received

Browse --> Browse : Filter/Search
ProjectDetails --> Browse : Back to Projects
Message --> Message : Continue Conversation
@enduml
```

**Key Interactions:**
1. **Registration:** Email/password, user type selection, consent checkboxes
2. **Profile Creation:** Skills, experience, hourly rate, portfolio upload
3. **Project Discovery:** Keyword search, skill filters, budget filters
4. **Application:** Cover letter, proposed rate, estimated duration
5. **Communication:** Real-time messaging with companies
6. **Payment:** Receive payment via Stripe Connect (future phase)

### 7.2 Company User Journey

```plantuml
@startuml
state "Landing Page" as Landing
state "Sign Up" as Signup
state "Company Profile" as CompanyProfile
state "Create Project" as CreateProject
state "Review Applications" as ReviewApps
state "Messaging" as Message
state "Accept Application" as Accept
state "Payment" as Payment
state "Project Management" as ProjectMgmt

[*] --> Landing
Landing --> Signup : Click "Sign Up"
Signup --> CompanyProfile : Complete Registration
CompanyProfile --> CreateProject : Create New Project
CreateProject --> ReviewApps : Publish Project
ReviewApps --> Message : Contact Applicant
Message --> Accept : Accept Application
Accept --> Payment : Initiate Payment
Payment --> ProjectMgmt : Project In Progress
ProjectMgmt --> [*] : Project Completed

ReviewApps --> ReviewApps : Shortlist/Reject
Message --> Message : Continue Conversation
@enduml
```

**Key Interactions:**
1. **Registration:** Company details, industry, size
2. **Project Posting:** Title, description, skills, budget, deadline
3. **Application Review:** View applicants, filter by skills/rate
4. **Communication:** Discuss project details with applicants
5. **Selection:** Accept application, initiate contract
6. **Payment:** Secure payment via Stripe

### 7.3 UI Navigation Flow

```plantuml
@startuml
state "Home" as Home {
  [*] --> Home
}
state "Auth" as Auth {
  state "Login" as Login
  state "Register" as Register
}
state "Dashboard" as Dashboard {
  state "Professional Dashboard" as ProfDash
  state "Company Dashboard" as CompDash
}
state "Projects" as Projects {
  state "Browse Projects" as BrowseProj
  state "Project Details" as ProjDetails
  state "My Applications" as MyApps
}
state "Profile" as Profile {
  state "View Profile" as ViewProf
  state "Edit Profile" as EditProf
}
state "Messages" as Messages
state "Transactions" as Transactions

Home --> Auth : Not Authenticated
Home --> Dashboard : Authenticated

Auth --> Login
Auth --> Register
Login --> Dashboard
Register --> Dashboard

Dashboard --> ProfDash : Professional User
Dashboard --> CompDash : Company User

ProfDash --> Projects : Browse Projects
ProfDash --> Profile : My Profile
ProfDash --> Messages : Messages
ProfDash --> Transactions : Transactions

CompDash --> Projects : My Projects
CompDash --> Profile : Company Profile
CompDash --> Messages : Messages
CompDash --> Transactions : Transactions

Projects --> BrowseProj
BrowseProj --> ProjDetails : Select Project
ProjDetails --> MyApps : Submit Application

Profile --> ViewProf
ViewProf --> EditProf : Edit

Messages --> Dashboard : Back
Transactions --> Dashboard : Back
@enduml
```

**Navigation Depth:** Maximum 3 levels
**Back Navigation:** Clear breadcrumbs and back buttons at every level
**High-Frequency Actions:** Quick access to messages, notifications, profile

---

## 8. Security Architecture

### 8.1 Authentication & Authorization

**JWT Token Structure:**
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "userType": "professional",
  "iat": 1698400000,
  "exp": 1698486400
}
```

**Token Lifecycle:**
- **Access Token:** 24 hours expiry
- **Refresh Token:** 30 days expiry (stored in httpOnly cookie)
- **Token Blacklist:** Redis-based for logout/revocation

**Password Security:**
- bcrypt hashing (cost factor: 12)
- Minimum 8 characters, must include uppercase, lowercase, number, special char
- Password reset tokens expire in 1 hour

**Role-Based Access Control (RBAC):**

| Resource | Professional | Company | Admin |
|----------|-------------|---------|-------|
| View Projects | ✓ | ✓ (own) | ✓ |
| Create Project | ✗ | ✓ | ✓ |
| Apply to Project | ✓ | ✗ | ✗ |
| View Applications | ✓ (own) | ✓ (project) | ✓ |
| Accept Application | ✗ | ✓ (own project) | ✓ |
| Send Message | ✓ | ✓ | ✓ |
| Create Transaction | ✗ | ✓ | ✓ |
| View All Users | ✗ | ✗ | ✓ |

### 8.2 Data Encryption

**In Transit:**
- TLS 1.3 for all API communications
- HSTS headers (max-age: 31536000, includeSubDomains)
- Certificate pinning for mobile apps (future)

**At Rest:**
- PostgreSQL encryption at rest (AWS RDS/GCP Cloud SQL native)
- S3/Cloud Storage encryption (AES-256)
- Application-level encryption for PII fields using AES-256-GCM
  - Fields: email (when stored in logs), phone numbers, addresses

**Encryption Key Management:**
- AWS KMS / GCP Cloud KMS for master keys
- Key rotation every 90 days
- Separate keys for different environments (dev, staging, prod)

### 8.3 PII Protection

**Data Minimization:**
- Collect only essential information
- Optional fields clearly marked
- Regular audit of stored data

**PII Fields:**
- First/Last Name
- Email Address
- Phone Number (if collected)
- Physical Address (if collected)
- Payment Information (tokenized via Stripe)

**Access Controls:**
- PII access logged and audited
- Encryption at rest for sensitive fields
- Redaction in logs and error messages

**Anonymization for Analytics:**
- User IDs hashed for analytics
- IP addresses anonymized (last octet removed)
- No PII in client-side analytics

### 8.4 Security Headers

```typescript
// Express middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));
```

### 8.5 Rate Limiting

**API Rate Limits:**
- Anonymous: 10 requests/minute
- Authenticated: 100 requests/minute
- Search: 20 requests/minute
- File Upload: 5 requests/minute

**Implementation:** Redis-based with `express-rate-limit`

### 8.6 Input Validation & Sanitization

**Validation Strategy:**
- Zod schemas for all API inputs
- Server-side validation (never trust client)
- Sanitize HTML inputs to prevent XSS
- Parameterized queries to prevent SQL injection

**Example Validation Schema:**
```typescript
const createProjectSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  requiredSkills: z.array(z.string()).min(1).max(20),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  durationWeeks: z.number().int().positive().optional(),
  deadline: z.string().datetime().optional()
});
```

### 8.7 Audit Logging

**Logged Events:**
- Authentication attempts (success/failure)
- Authorization failures
- PII access
- Data modifications (create, update, delete)
- Payment transactions
- Consent changes

**Log Format:**
```json
{
  "timestamp": "2025-10-27T10:00:00Z",
  "eventType": "USER_LOGIN",
  "userId": "uuid",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "success": true,
  "metadata": {}
}
```

**Log Storage:**
- CloudWatch Logs / Cloud Logging
- Retention: 90 days for security logs, 30 days for application logs
- Encrypted at rest

---

## 9. Search Implementation

### 9.1 PostgreSQL Full-Text Search

**MVP Search Strategy:**
- PostgreSQL native full-text search (tsvector/tsquery)
- Suitable for MVP scale (< 100k projects)
- No additional infrastructure required

**Search Configuration:**
```sql
-- Already configured in projects table (Section 5.2.4)
-- search_vector column with GIN index
-- Automatic update via trigger
```

**Search Query Example:**
```typescript
async function searchProjects(query: string, filters: ProjectFilters) {
  const sql = `
    SELECT 
      p.*,
      ts_rank(p.search_vector, plainto_tsquery('english', $1)) as rank,
      c.company_name,
      c.logo_url
    FROM projects p
    JOIN company_profiles c ON p.company_id = c.id
    WHERE 
      p.status = 'open'
      AND p.search_vector @@ plainto_tsquery('english', $1)
      ${filters.skills ? 'AND p.required_skills ?| $2' : ''}
      ${filters.minBudget ? 'AND p.budget_max >= $3' : ''}
      ${filters.maxBudget ? 'AND p.budget_min <= $4' : ''}
    ORDER BY rank DESC, p.published_at DESC
    LIMIT $5 OFFSET $6
  `;
  
  return await db.query(sql, [query, filters.skills, ...]);
}
```

**Search Features:**
- Keyword matching in title and description
- Skill-based filtering (JSONB containment)
- Budget range filtering
- Relevance ranking (ts_rank)
- Pagination

**Professional Search:**
```typescript
async function searchProfessionals(query: string, filters: ProfessionalFilters) {
  const sql = `
    SELECT 
      pp.*,
      ts_rank(
        to_tsvector('english', pp.headline || ' ' || pp.bio),
        plainto_tsquery('english', $1)
      ) as rank
    FROM professional_profiles pp
    WHERE 
      (
        to_tsvector('english', pp.headline || ' ' || pp.bio) 
        @@ plainto_tsquery('english', $1)
        OR pp.skills ?| $2
      )
      ${filters.availability ? 'AND pp.availability = $3' : ''}
      ${filters.minRate ? 'AND pp.hourly_rate >= $4' : ''}
      ${filters.maxRate ? 'AND pp.hourly_rate <= $5' : ''}
    ORDER BY rank DESC
    LIMIT $6 OFFSET $7
  `;
  
  return await db.query(sql, [query, skillsArray, ...]);
}
```

### 9.2 Caching Strategy

**Redis Cache for Search Results:**
- Cache key: `search:projects:${hash(query+filters)}`
- TTL: 5 minutes
- Invalidation: On project create/update/delete

**Implementation:**
```typescript
async function getCachedSearch(cacheKey: string) {
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

async function setCachedSearch(cacheKey: string, results: any) {
  await redis.setex(cacheKey, 300, JSON.stringify(results));
}
```

### 9.3 Future Search Enhancements (Phase II)

- Elasticsearch/Meilisearch for advanced search
- Semantic search using embeddings
- Faceted filtering
- Autocomplete/suggestions
- Personalized ranking based on user behavior

---

## 10. Payment Integration

### 10.1 Stripe Integration Architecture

**Integration Type:** Client-side tokenization (SAQ C-VT compliance)

**Flow Diagram:**

```plantuml
@startuml
actor Company
participant "React App" as Client
participant "API Server" as API
participant "Stripe API" as Stripe
participant "Database" as DB

Company -> Client: Accept Application
Client -> API: POST /transactions
API -> DB: Create Transaction (status: pending)
API -> Stripe: Create PaymentIntent
Stripe --> API: PaymentIntent + client_secret
API --> Client: Return client_secret

Client -> Stripe: Confirm Payment (Stripe.js)
note right: Card data never touches our server
Stripe --> Client: Payment Success

Client -> API: Confirm Payment
API -> Stripe: Verify PaymentIntent
Stripe --> API: PaymentIntent confirmed
API -> DB: Update Transaction (status: completed)
API --> Client: Success Response

Stripe -> API: Webhook: payment_intent.succeeded
API -> DB: Update Transaction (if not already)
API -> API: Send Notification to Professional

@enduml
```

### 10.2 Transaction Flow

**Step 1: Create Transaction**
```typescript
// API endpoint: POST /transactions
async function createTransaction(data: CreateTransactionDTO) {
  // Calculate commission
  const commissionRate = 10.0; // 10%
  const commissionAmount = data.amount * (commissionRate / 100);
  const netAmount = data.amount - commissionAmount;
  
  // Create PaymentIntent in Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(data.amount * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      projectId: data.projectId,
      professionalId: data.professionalId,
      companyId: data.companyId
    }
  });
  
  // Store transaction in database
  const transaction = await db.transaction.create({
    data: {
      projectId: data.projectId,
      professionalId: data.professionalId,
      companyId: data.companyId,
      amount: data.amount,
      commissionRate,
      commissionAmount,
      netAmount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    }
  });
  
  return {
    transaction,
    clientSecret: paymentIntent.client_secret
  };
}
```

**Step 2: Client-side Payment Confirmation**
```typescript
// React component
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ clientSecret, transactionId }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: companyName
        }
      }
    });
    
    if (error) {
      // Handle error
      console.error(error);
    } else if (paymentIntent.status === 'succeeded') {
      // Confirm with backend
      await api.post(`/transactions/${transactionId}/confirm`);
      // Show success message
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pay</button>
    </form>
  );
}
```

**Step 3: Webhook Handler**
```typescript
// API endpoint: POST /webhooks/stripe
async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      await handlePaymentFailure(failedIntent);
      break;
  }
  
  res.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  await db.transaction.update({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: 'completed',
      completedAt: new Date()
    }
  });
  
  // Update project status
  const transaction = await db.transaction.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id }
  });
  
  await db.project.update({
    where: { id: transaction.projectId },
    data: { status: 'in_progress' }
  });
  
  // Send notifications
  await sendNotification(transaction.professionalId, 'Payment received');
}
```

### 10.3 PCI DSS Compliance

**SAQ C-VT Requirements:**
1. ✓ Use Stripe.js for card data collection (never touches our server)
2. ✓ Serve payment page over HTTPS (TLS 1.2+)
3. ✓ Implement Content Security Policy (CSP)
4. ✓ Validate Stripe webhook signatures
5. ✓ Log payment transactions
6. ✓ Regular security scans (quarterly)

**What We DON'T Store:**
- Credit card numbers
- CVV codes
- Expiration dates

**What We DO Store:**
- Stripe PaymentIntent IDs
- Transaction amounts
- Commission calculations
- Payment status

### 10.4 Refund Handling

```typescript
async function processRefund(transactionId: string, reason: string) {
  const transaction = await db.transaction.findUnique({
    where: { id: transactionId }
  });
  
  if (transaction.status !== 'completed') {
    throw new Error('Cannot refund non-completed transaction');
  }
  
  // Create refund in Stripe
  const refund = await stripe.refunds.create({
    payment_intent: transaction.stripePaymentIntentId,
    reason: 'requested_by_customer'
  });
  
  // Update transaction
  await db.transaction.update({
    where: { id: transactionId },
    data: { status: 'refunded' }
  });
  
  // Send notifications
  await sendNotification(transaction.companyId, 'Refund processed');
  await sendNotification(transaction.professionalId, 'Payment refunded');
}
```

---

## 11. Compliance Framework

### 11.1 GDPR Compliance

**Data Subject Rights Implementation:**

#### Right to Access (Article 15)
```typescript
// API: GET /users/me/data
async function exportUserData(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  const profile = await db.professionalProfile.findUnique({ where: { userId } });
  const projects = await db.project.findMany({ where: { companyId: profile?.id } });
  const applications = await db.application.findMany({ where: { professionalId: profile?.id } });
  const messages = await db.message.findMany({ where: { OR: [
    { senderId: userId },
    { receiverId: userId }
  ]}});
  const transactions = await db.transaction.findMany({ where: { OR: [
    { professionalId: profile?.id },
    { companyId: profile?.id }
  ]}});
  const consents = await db.consentRecord.findMany({ where: { userId } });
  
  return {
    user,
    profile,
    projects,
    applications,
    messages,
    transactions,
    consents,
    exportedAt: new Date().toISOString()
  };
}
```

#### Right to Erasure (Article 17)
```typescript
// API: POST /users/me/delete
async function requestAccountDeletion(userId: string) {
  // Soft delete with 30-day grace period
  await db.user.update({
    where: { id: userId },
    data: {
      status: 'deleted',
      deletionRequestedAt: new Date()
    }
  });
  
  // Schedule hard delete after 30 days
  await scheduleJob('hard-delete-user', userId, { delay: 30 * 24 * 60 * 60 * 1000 });
  
  // Send confirmation email
  await sendEmail(user.email, 'Account deletion requested');
}

async function hardDeleteUser(userId: string) {
  // Anonymize instead of delete to preserve referential integrity
  await db.user.update({
    where: { id: userId },
    data: {
      email: `deleted-${userId}@anonymized.local`,
      passwordHash: 'DELETED',
      status: 'deleted'
    }
  });
  
  // Delete PII from profiles
  await db.professionalProfile.update({
    where: { userId },
    data: {
      firstName: 'DELETED',
      lastName: 'USER',
      bio: 'This account has been deleted',
      profileImageUrl: null,
      resumeUrl: null
    }
  });
  
  // Delete files from S3
  await deleteUserFiles(userId);
}
```

#### Right to Rectification (Article 16)
- Implemented via profile update endpoints (PUT /professionals/:id, PUT /companies/:id)

#### Right to Data Portability (Article 20)
- Implemented via data export endpoint (GET /users/me/data)
- JSON format for machine-readability

### 11.2 Consent Management

**Consent Types:**
1. **Terms of Service:** Required for registration
2. **Privacy Policy:** Required for registration
3. **Marketing Communications:** Optional
4. **Analytics Cookies:** Optional (cookie banner)

**Consent Storage:**
```typescript
async function recordConsent(userId: string, consentData: ConsentData, req: Request) {
  await db.consentRecord.create({
    data: {
      userId,
      consentType: consentData.type,
      consentGiven: consentData.given,
      consentText: consentData.fullText,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      createdAt: new Date()
    }
  });
}
```

**Consent Withdrawal:**
```typescript
// API: PUT /users/me/consents
async function updateConsent(userId: string, consentType: string, given: boolean) {
  // Record new consent state
  await recordConsent(userId, {
    type: consentType,
    given,
    fullText: await getConsentText(consentType)
  }, req);
  
  // Take action based on consent type
  if (consentType === 'marketing' && !given) {
    await unsubscribeFromMarketing(userId);
  }
}
```

### 11.3 CCPA Compliance

**California Consumer Rights:**

#### Right to Know
- Same implementation as GDPR Right to Access

#### Right to Delete
- Same implementation as GDPR Right to Erasure

#### Right to Opt-Out of Sale
```typescript
// API: POST /users/me/do-not-sell
async function optOutOfDataSale(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { doNotSell: true }
  });
  
  // Disable third-party analytics
  await disableThirdPartyTracking(userId);
}
```

**"Do Not Sell My Personal Information" Link:**
- Prominent link in footer
- Simple one-click opt-out process

### 11.4 Data Minimization

**Principles:**
1. Collect only necessary data for service provision
2. Optional fields clearly marked
3. Regular data retention audits
4. Automatic deletion of expired data

**Data Retention Policy:**
- Active user data: Retained indefinitely
- Deleted user data: 30-day grace period, then anonymized
- Transaction records: 7 years (legal requirement)
- Audit logs: 90 days
- Application logs: 30 days
- Inactive accounts: Notification after 2 years, deletion after 3 years

**Scheduled Cleanup Job:**
```typescript
async function cleanupExpiredData() {
  // Delete expired password reset tokens
  await db.passwordResetToken.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });
  
  // Hard delete users past grace period
  const usersToDelete = await db.user.findMany({
    where: {
      status: 'deleted',
      deletionRequestedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  });
  
  for (const user of usersToDelete) {
    await hardDeleteUser(user.id);
  }
  
  // Notify inactive users
  const inactiveUsers = await db.user.findMany({
    where: {
      lastLoginAt: { lt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) },
      status: 'active'
    }
  });
  
  for (const user of inactiveUsers) {
    await sendEmail(user.email, 'Account inactivity notice');
  }
}
```

### 11.5 Privacy by Design

**Principles Applied:**
1. **Proactive not Reactive:** Privacy measures built from the start
2. **Privacy as Default:** Strictest privacy settings by default
3. **Privacy Embedded:** Privacy integral to system design
4. **Full Functionality:** Positive-sum, not zero-sum
5. **End-to-End Security:** Lifecycle protection
6. **Visibility and Transparency:** Clear privacy policies
7. **User-Centric:** User control over their data

---

## 12. Deployment Strategy

### 12.1 Infrastructure Architecture

**Cloud Provider:** AWS (primary) or GCP (alternative)

**AWS Architecture:**

```plantuml
@startuml
!define AWSPuml https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/v14.0/dist
!include AWSPuml/AWSCommon.puml
!include AWSPuml/Compute/ECS.puml
!include AWSPuml/Compute/Fargate.puml
!include AWSPuml/Database/RDS.puml
!include AWSPuml/Database/ElastiCache.puml
!include AWSPuml/Storage/S3.puml
!include AWSPuml/NetworkingContentDelivery/CloudFront.puml
!include AWSPuml/NetworkingContentDelivery/ApplicationLoadBalancer.puml

package "AWS Cloud" {
  CloudFront(cdn, "CloudFront", "CDN")
  ApplicationLoadBalancer(alb, "ALB", "Load Balancer")
  
  package "VPC" {
    package "Public Subnet" {
      ECS(ecs, "ECS Cluster", "")
      Fargate(fargate, "Fargate Tasks", "API Containers")
    }
    
    package "Private Subnet" {
      RDS(rds, "RDS PostgreSQL", "Database")
      ElastiCache(redis, "ElastiCache Redis", "Cache")
    }
  }
  
  S3(s3, "S3", "File Storage")
}

cdn --> alb
alb --> fargate
fargate --> rds
fargate --> redis
fargate --> s3

@enduml
```

### 12.2 Container Configuration

**Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["dumb-init", "node", "dist/server.js"]
```

**docker-compose.yml (for local development):**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/devdb
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret
    depends_on:
      - postgres
      - redis
    volumes:
      - ./src:/app/src

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=devdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 12.3 Environment Configuration

**Environment Variables:**
```bash
# Application
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.yourplatform.com

# Database
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/proddb
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://elasticache-endpoint:6379

# JWT
JWT_SECRET=<strong-random-secret>
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=30d

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# AWS S3
AWS_REGION=us-east-1
AWS_S3_BUCKET=yourplatform-uploads
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>

# Email (SendGrid/SES)
EMAIL_FROM=noreply@yourplatform.com
SENDGRID_API_KEY=<api-key>

# Monitoring
SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=info
```

**Secrets Management:**
- AWS Secrets Manager for sensitive credentials
- Environment-specific secrets (dev, staging, prod)
- Automatic rotation for database passwords

### 12.4 Deployment Pipeline

**CI/CD Flow:**

```plantuml
@startuml
start

:Developer pushes code to GitHub;

:GitHub Actions triggered;

partition "Build Stage" {
  :Run linter (ESLint);
  :Run tests (Jest);
  :Build Docker image;
  :Push to ECR;
}

if (Tests passed?) then (yes)
  partition "Deploy to Staging" {
    :Update ECS task definition;
    :Deploy to staging cluster;
    :Run smoke tests;
  }
  
  if (Staging tests passed?) then (yes)
    :Manual approval required;
    
    if (Approved?) then (yes)
      partition "Deploy to Production" {
        :Update ECS task definition;
        :Blue/Green deployment;
        :Health checks;
        :Switch traffic;
      }
      :Notify team (Slack);
      stop
    else (no)
      :Cancel deployment;
      stop
    endif
  else (no)
    :Rollback staging;
    :Notify team;
    stop
  endif
else (no)
  :Build failed;
  :Notify team;
  stop
endif

@enduml
```

**GitHub Actions Workflow:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Build and push Docker image
        run: |
          docker build -t yourplatform-api:${{ github.sha }} .
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker tag yourplatform-api:${{ github.sha }} ${{ secrets.ECR_REGISTRY }}/yourplatform-api:staging
          docker push ${{ secrets.ECR_REGISTRY }}/yourplatform-api:staging
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster staging-cluster --service api-service --force-new-deployment

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      # Similar to staging but with production configuration
      - uses: actions/checkout@v3
      # ... (similar steps with production targets)
```

### 12.5 Scaling Strategy

**Horizontal Scaling:**
- Auto-scaling based on CPU/memory metrics
- Target: 70% CPU utilization
- Min instances: 2 (high availability)
- Max instances: 10 (cost control)

**ECS Auto-scaling Configuration:**
```json
{
  "targetTrackingScalingPolicies": [
    {
      "targetValue": 70.0,
      "predefinedMetricSpecification": {
        "predefinedMetricType": "ECSServiceAverageCPUUtilization"
      },
      "scaleInCooldown": 300,
      "scaleOutCooldown": 60
    }
  ]
}
```

**Database Scaling:**
- RDS instance: db.t3.medium (2 vCPU, 4GB RAM) for MVP
- Read replicas for read-heavy workloads (future)
- Connection pooling (max 10 connections per instance)

**Redis Scaling:**
- ElastiCache: cache.t3.micro (0.5GB) for MVP
- Cluster mode for high availability (future)

---

## 13. Performance & Scalability

### 13.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | < 200ms | CloudWatch |
| API Response Time (p99) | < 500ms | CloudWatch |
| Database Query Time (p95) | < 50ms | Prisma metrics |
| Page Load Time (p95) | < 2s | Lighthouse |
| Time to Interactive (p95) | < 3s | Lighthouse |
| WebSocket Latency | < 100ms | Custom metrics |

### 13.2 Optimization Strategies

**Database Optimization:**
1. **Indexing:** All foreign keys, search fields, and filter fields indexed
2. **Query Optimization:** Use EXPLAIN ANALYZE for slow queries
3. **Connection Pooling:** Reuse connections, max 10 per instance
4. **Prepared Statements:** Prevent SQL injection, improve performance

**API Optimization:**
1. **Response Caching:** Redis cache for frequently accessed data
2. **Pagination:** Limit results to 20 per page
3. **Field Selection:** Allow clients to specify required fields
4. **Compression:** Gzip compression for responses > 1KB

**Frontend Optimization:**
1. **Code Splitting:** Lazy load routes and components
2. **Image Optimization:** WebP format, responsive images, lazy loading
3. **CDN:** Serve static assets via CloudFront
4. **Bundle Size:** Target < 200KB initial bundle

**Caching Strategy:**
```typescript
// Cache configuration
const cacheConfig = {
  userProfile: { ttl: 300 }, // 5 minutes
  projectList: { ttl: 60 }, // 1 minute
  searchResults: { ttl: 300 }, // 5 minutes
  staticContent: { ttl: 3600 } // 1 hour
};

// Cache middleware
async function cacheMiddleware(req, res, next) {
  const cacheKey = `cache:${req.method}:${req.path}:${JSON.stringify(req.query)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Store original send function
  const originalSend = res.json;
  
  // Override send function
  res.json = function(data) {
    redis.setex(cacheKey, cacheConfig[req.route.name]?.ttl || 60, JSON.stringify(data));
    originalSend.call(this, data);
  };
  
  next();
}
```

### 13.3 Load Testing

**Tools:**
- k6 for API load testing
- Lighthouse CI for frontend performance

**Load Test Scenarios:**
1. **Normal Load:** 100 concurrent users, 1000 requests/minute
2. **Peak Load:** 500 concurrent users, 5000 requests/minute
3. **Stress Test:** 1000+ concurrent users until failure

**Example k6 Script:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://api.yourplatform.com/v1/projects');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

---

## 14. Monitoring & Observability

### 14.1 Monitoring Stack

**Metrics Collection:**
- AWS CloudWatch (or GCP Cloud Monitoring)
- Custom application metrics
- Database performance metrics

**Logging:**
- Structured JSON logging
- CloudWatch Logs (or Cloud Logging)
- Log aggregation and search

**Error Tracking:**
- Sentry for error monitoring
- Source maps for stack traces

**Uptime Monitoring:**
- AWS Route 53 health checks
- Third-party: Pingdom or UptimeRobot

### 14.2 Key Metrics

**Application Metrics:**
```typescript
// Custom metrics using CloudWatch
import { CloudWatch } from 'aws-sdk';
const cloudwatch = new CloudWatch();

async function recordMetric(metricName: string, value: number, unit: string) {
  await cloudwatch.putMetricData({
    Namespace: 'YourPlatform/API',
    MetricData: [{
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Timestamp: new Date()
    }]
  }).promise();
}

// Usage
await recordMetric('ProjectCreated', 1, 'Count');
await recordMetric('ApplicationSubmitted', 1, 'Count');
await recordMetric('TransactionCompleted', transaction.amount, 'None');
```

**Business Metrics:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Projects posted per day
- Applications submitted per day
- Conversion rate (applications to hires)
- Average transaction value
- Liquidity ratio

**Technical Metrics:**
- API request rate
- API error rate
- API response time (p50, p95, p99)
- Database query time
- Cache hit rate
- WebSocket connections

### 14.3 Alerting

**Alert Rules:**
```yaml
alerts:
  - name: HighErrorRate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    notification: pagerduty
    
  - name: SlowAPIResponse
    condition: p95_response_time > 500ms
    duration: 10m
    severity: warning
    notification: slack
    
  - name: DatabaseConnectionPoolExhausted
    condition: db_connections > 90% of max
    duration: 5m
    severity: critical
    notification: pagerduty
    
  - name: LowCacheHitRate
    condition: cache_hit_rate < 70%
    duration: 15m
    severity: warning
    notification: slack
```

**Notification Channels:**
- PagerDuty for critical alerts (24/7 on-call)
- Slack for warnings and informational alerts
- Email for daily/weekly reports

### 14.4 Logging Strategy

**Log Levels:**
- ERROR: Application errors, exceptions
- WARN: Potential issues, deprecated usage
- INFO: Important business events
- DEBUG: Detailed diagnostic information (dev/staging only)

**Structured Logging Format:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.CloudWatch({
      logGroupName: '/aws/ecs/yourplatform-api',
      logStreamName: process.env.HOSTNAME
    })
  ]
});

// Usage
logger.info('User registered', {
  userId: user.id,
  userType: user.userType,
  timestamp: new Date().toISOString()
});

logger.error('Payment failed', {
  transactionId: transaction.id,
  error: error.message,
  stack: error.stack
});
```

**Log Retention:**
- Application logs: 30 days
- Security logs: 90 days
- Audit logs: 7 years (compliance)

---

## 15. Unclear Aspects

### 15.1 Business Logic Clarifications Needed

1. **Commission Structure:**
   - Fixed 10% commission or tiered based on transaction value?
   - Who pays the commission: company, professional, or split?
   - Minimum transaction amount?

2. **Project Lifecycle:**
   - Can a project have multiple professionals (team projects)?
   - What happens if a project is not completed?
   - Dispute resolution process?

3. **Application Limits:**
   - Maximum applications per professional per day?
   - Can professionals apply to the same project multiple times?
   - Can companies reject applications without reason?

4. **Messaging Restrictions:**
   - Can users message each other without an active application?
   - Message retention period?
   - File attachments in messages?

5. **Profile Verification:**
   - Identity verification process for professionals?
   - Company verification (business registration)?
   - Badge/certification system?

### 15.2 Technical Decisions Deferred

1. **Real-time Notifications:**
   - Push notifications for mobile (future)?
   - Email notification preferences?
   - In-app notification center?

2. **File Upload Limits:**
   - Maximum file size for profile images?
   - Maximum file size for project attachments?
   - Allowed file types?

3. **Rate Limiting Specifics:**
   - Different limits for different endpoints?
   - Rate limit by IP or by user?
   - Grace period for exceeding limits?

4. **Search Ranking Algorithm:**
   - Weight factors for search relevance?
   - Personalization based on user history?
   - Boost for premium listings (future)?

5. **Internationalization:**
   - Multi-language support in MVP?
   - Currency conversion for international transactions?
   - Timezone handling for deadlines?

### 15.3 Assumptions Made

1. **MVP Scope:**
   - Single currency (USD) for MVP
   - English language only for MVP
   - North America focus for MVP
   - No mobile apps in MVP (web-only)

2. **User Behavior:**
   - Professionals will complete profiles before applying
   - Companies will provide detailed project descriptions
   - Users will respond to messages within 48 hours

3. **Scale:**
   - < 10,000 users in first 6 months
   - < 1,000 projects posted per month
   - < 100 concurrent WebSocket connections

4. **Integration:**
   - Stripe is the only payment processor for MVP
   - Email is the only notification channel for MVP
   - No third-party integrations (LinkedIn, GitHub) in MVP

---

## Appendix

### A. Technology Evaluation Matrix

| Criteria | Node.js/Express | Python/FastAPI | Go/Gin |
|----------|----------------|----------------|---------|
| Development Speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Ecosystem | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Real-time Support | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Team Familiarity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Total** | **23** | **18** | **18** |

**Decision:** Node.js/Express chosen for MVP due to:
- Fastest development speed
- Excellent real-time support (Socket.io)
- Consistent JavaScript ecosystem (frontend + backend)
- Large community and library ecosystem

### B. Database Schema Diagram (PlantUML)

See Section 5.1 for complete ER diagram.

### C. API Endpoint Summary

Total Endpoints: 45+

**Authentication:** 6 endpoints
**Professionals:** 4 endpoints
**Companies:** 4 endpoints
**Projects:** 6 endpoints
**Applications:** 6 endpoints
**Messages:** 4 endpoints
**Transactions:** 5 endpoints
**Search:** 1 endpoint
**User Data:** 4 endpoints
**Webhooks:** 1 endpoint

### D. Deployment Checklist

**Pre-Launch:**
- [ ] Security audit completed
- [ ] Load testing passed
- [ ] GDPR/CCPA compliance verified
- [ ] PCI DSS SAQ C-VT completed
- [ ] SSL certificates configured
- [ ] DNS configured
- [ ] Monitoring and alerting set up
- [ ] Backup and disaster recovery tested
- [ ] Privacy policy and terms of service published
- [ ] Support email configured

**Post-Launch:**
- [ ] Monitor error rates
- [ ] Track key business metrics
- [ ] Collect user feedback
- [ ] Plan Phase II features
- [ ] Optimize based on real usage patterns

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-27  
**Next Review:** 2025-11-27  
**Owner:** Architecture Team  
**Status:** Ready for Implementation