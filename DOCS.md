# Team Voting System - Complete Documentation

A modern, democratic voting platform where members can register, join teams, and vote for their favorites. Built with FastAPI backend and React TypeScript frontend.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend API Documentation](#backend-api-documentation)
4. [Frontend Application](#frontend-application)
5. [Database Schema](#database-schema)
6. [Authentication & Security](#authentication--security)
7. [Deployment Guide](#deployment-guide)
8. [API Reference](#api-reference)
9. [User Workflows](#user-workflows)
10. [Development Guide](#development-guide)
11. [Testing](#testing)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### Purpose
The Team Voting System is a democratic voting platform designed for organizations, competitions, or events where participants can:
- Register using admin-generated tokens
- Join teams or participate independently
- Vote for their favorite teams (excluding their own)
- View real-time voting results
- Manage teams and members (admin functions)

### Key Features
- **Token-based Registration**: QR code system for secure member registration
- **Team Management**: Join/leave teams with validation rules
- **Democratic Voting**: One vote per member with business rule enforcement
- **Real-time Results**: Live vote counting and statistics
- **Admin Panel**: Comprehensive management interface
- **Modern UI**: Responsive design with smooth animations
- **Data Export**: CSV export functionality for results

### Business Rules
1. **Registration**: Members must have admin-generated tokens to register
2. **Team Membership**: Members can join only one team (optional)
3. **Voting Restrictions**: Cannot vote for own team, one vote per member
4. **Vote Changes**: Members can rollback and change their votes
5. **Independent Voting**: Members can vote without joining any team
6. **Admin Control**: Full CRUD operations for teams and members

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    HTTP/REST    ┌──────────────────┐
│  React Frontend │ ◄──────────────► │  FastAPI Backend │
│  (TypeScript)   │   JSON/Cookies   │    (Python)      │
└─────────────────┘                  └──────────────────┘
         │                                      │
         │                                      │
         ▼                                      ▼
┌─────────────────┐                  ┌──────────────────┐
│   Web Browser   │                  │   SQLite/PostgreSQL   │
│   (Client-side) │                  │    Database      │
└─────────────────┘                  └──────────────────┘
```

### Tech Stack

#### Backend
- **Framework**: FastAPI 0.104+ (Python)
- **Database**: SQLAlchemy ORM with SQLite (development) / PostgreSQL (production)
- **Authentication**: Cookie-based sessions + API key for admin
- **Validation**: Pydantic models for request/response validation
- **Documentation**: Auto-generated OpenAPI/Swagger docs
- **Testing**: Pytest with test database isolation

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and production builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn UI (Radix UI + Tailwind)
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: React Router v6 for client-side navigation
- **Animations**: Framer Motion for smooth transitions
- **HTTP Client**: Axios with interceptors and error handling

### Communication
- **API Protocol**: RESTful HTTP/JSON
- **Authentication**: HTTP-only cookies for members, API key headers for admin
- **Error Handling**: Standardized error responses with proper HTTP status codes
- **Real-time Updates**: Polling-based with React Query (WebSocket ready)

---

## 🔧 Backend API Documentation

### API Base Configuration
```python
Base URL: http://localhost:8000
API Version: v1
Full Endpoint: http://localhost:8000/v1/{endpoint}
```

### Authentication Methods

#### 1. Cookie Authentication (Members)
```http
Cookie: users-token=abc123def456ghi789
```
- Used for all member operations
- Set automatically during registration
- HTTPOnly cookie with 24-hour expiry

#### 2. API Key Authentication (Admin)
```http
x-api-key: your-admin-api-key-here
```
- Required for all admin operations
- Configured via environment variables
- Validates against `CONFIG__ADMIN__APIKEY`

### Core Endpoints

#### Member Management
```http
GET    /v1/token                    # Generate registration token (admin)
POST   /v1/register/{token}         # Register new member
GET    /v1/users/me                 # Get current member profile
PATCH  /v1/users/me                 # Update member profile
DELETE /v1/users/me                 # Delete member account
GET    /v1/users/reset/{token}      # Reset authentication cookie
```

#### Team Operations
```http
POST   /v1/users/join/{team_id}     # Join a team
POST   /v1/users/leave/             # Leave current team
GET    /v1/teams                    # List all teams (public)
GET    /v1/teams/{team_id}/users    # Get team members (public)
```

#### Voting System
```http
POST   /v1/voting/{team_id}         # Cast vote for team
POST   /v1/voting/rollback/         # Remove current vote
GET    /v1/voting/count             # Get voting results (public)
```

#### Admin Operations
```http
GET    /v1/admin/members            # List all members
GET    /v1/admin/member/{id}        # Get specific member
POST   /v1/admin/member             # Create member directly
PATCH  /v1/admin/member/{id}        # Update member
DELETE /v1/admin/member/{id}        # Delete member
POST   /v1/teams                    # Create team
PATCH  /v1/teams/{id}               # Update team
DELETE /v1/teams/{id}               # Delete team
```

### Request/Response Formats

#### Member Registration
```http
POST /v1/register/{token}
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe123"
}
```

```json
Response (201 Created):
{
  "name": "John Doe",
  "username": "johndoe123"
}
```

#### Voting
```http
POST /v1/voting/{team_id}
Cookie: users-token=abc123...
```

```json
Response (200 OK): 
(No content)
```

#### Voting Results
```http
GET /v1/voting/count
```

```json
Response (200 OK):
[
  {
    "name": "Team Alpha",
    "stats": {
      "votes": 5
    }
  },
  {
    "name": "Team Beta", 
    "stats": {
      "votes": 3
    }
  }
]
```

### Error Handling
All errors follow this format:
```json
{
  "detail": "Error description message"
}
```

Common HTTP status codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Successful request with no response body
- `400 Bad Request` - Invalid request data or business rule violation
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Valid auth but insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `406 Not Acceptable` - Logical data inconsistency

---

## 🖥️ Frontend Application

### Application Structure
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base Shadcn UI components
│   │   ├── common/         # Common app components
│   │   └── admin/          # Admin-specific components
│   ├── pages/              # Page components (routes)
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript definitions
│   ├── api/                # API client and utilities
│   └── lib/                # Utility functions
├── public/                 # Static assets
└── dist/                   # Production build output
```

### Pages Overview

#### 1. Home Page (`/`)
- **Purpose**: Landing page with system overview
- **Features**: Team previews, statistics, call-to-action buttons
- **Data**: Live team count, voting statistics
- **Authentication**: None required

#### 2. Registration (`/register`)
- **Purpose**: New member registration
- **Features**: QR code token support, form validation
- **Data**: Registration token, member details
- **Authentication**: Token-based registration

#### 3. Voting Interface (`/vote`)
- **Purpose**: Interactive voting and team management
- **Features**: Team joining/leaving, vote casting, profile editing
- **Data**: User profile, teams list, voting status
- **Authentication**: Cookie-based (required)

#### 4. Results Dashboard (`/results`)
- **Purpose**: Live voting results and analytics
- **Features**: Real-time updates, rankings, data export
- **Data**: Voting results, team statistics
- **Authentication**: None required (public)

#### 5. Profile Page (`/profile`)
- **Purpose**: User account management
- **Features**: Profile editing, account deletion, status overview
- **Data**: Current user profile, account status
- **Authentication**: Cookie-based (required)

#### 6. Admin Panel (`/admin`)
- **Purpose**: Administrative management interface
- **Features**: Token generation, member/team CRUD, QR codes
- **Data**: All members, teams, system statistics
- **Authentication**: API key (required)

#### 7. Login Page (`/login`)
- **Purpose**: Session recovery with authentication tokens
- **Features**: Token-based login, help information
- **Data**: Authentication token
- **Authentication**: Token recovery

### State Management

#### React Query Implementation
```typescript
// API Hooks Example
const { data: user } = useCurrentUser()
const { data: teams } = useTeams()
const voteMutation = useVoteForTeam()

// Usage in components
const handleVote = async (teamId: number) => {
  try {
    await voteMutation.mutateAsync(teamId)
    // React Query automatically updates related queries
  } catch (error) {
    // Error handled by hook with toast notifications
  }
}
```

#### Key Features
- **Automatic Caching**: Intelligent caching with background updates
- **Optimistic Updates**: Immediate UI feedback with rollback on errors
- **Error Handling**: Centralized error management with user notifications
- **Real-time Sync**: Automatic refetching and background synchronization

### UI Components

#### Design System
```typescript
// Component Examples
<Button variant="default | outline | destructive | ghost" size="sm | default | lg">
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
<Toast title="Success" description="Action completed" variant="default | destructive" />
```

#### Key Features
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Responsive Design**: Mobile-first approach with breakpoint utilities
- **Theme System**: CSS custom properties for consistent theming
- **Animation**: Framer Motion for smooth transitions and micro-interactions

---

## 🗄️ Database Schema

### Entity Relationship Diagram
```
┌─────────────────┐     ┌─────────────────┐
│      Member     │     │      Team       │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │──┐  │ id (PK)         │
│ name            │  │  │ name (UNIQUE)   │
│ username (UQ)   │  │  │ avatar          │
│ has_joined_team │  │  └─────────────────┘
│ has_voted       │  │           ▲
│ token (UQ)      │  │           │
│ team_id (FK)    │──┘           │ members
│ vote_id (FK)    │──────────────┘ voters
└─────────────────┘
```

### Tables

#### Members Table
```sql
CREATE TABLE members (
    id INTEGER PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    has_joined_team BOOLEAN NOT NULL,
    has_voted BOOLEAN NOT NULL,
    token VARCHAR UNIQUE NOT NULL,
    team_id INTEGER REFERENCES teams(id),
    vote_id INTEGER REFERENCES teams(id)
);
```

#### Teams Table
```sql
CREATE TABLE teams (
    id INTEGER PRIMARY KEY,
    name VARCHAR(32) UNIQUE NOT NULL,
    avatar VARCHAR NULL
);
```

### Relationships
- **Member → Team (team_id)**: Many-to-One relationship for team membership
- **Member → Team (vote_id)**: Many-to-One relationship for voting
- **Team → Members**: One-to-Many relationship via team_id
- **Team → Voters**: One-to-Many relationship via vote_id

### Business Logic Constraints
1. **Username Uniqueness**: Each member must have a unique username
2. **Token Uniqueness**: Each member must have a unique authentication token
3. **Team Name Uniqueness**: Each team must have a unique name
4. **Join Consistency**: If `has_joined_team` is True, `team_id` must be set
5. **Vote Consistency**: If `has_voted` is True, `vote_id` must be set

---

## 🔐 Authentication & Security

### Authentication Flow

#### Member Registration & Authentication
```mermaid
sequenceDiagram
    Admin->>Backend: Generate token (/v1/token)
    Backend-->>Admin: Return token
    Admin->>Member: Share QR code with token
    Member->>Backend: Register with token (/v1/register/{token})
    Backend->>Database: Create member record
    Backend-->>Member: Set users-token cookie
    Member->>Backend: Authenticated requests (cookie)
```

#### Admin Authentication
```mermaid
sequenceDiagram
    Admin->>Frontend: Enter API key
    Frontend->>Backend: Validate key (/v1/admin/members)
    Backend-->>Frontend: Success/Failure response
    Frontend->>Admin: Grant/Deny access
```

### Security Measures

#### Cookie Security
```javascript
// Cookie Configuration
{
  httpOnly: true,           // Prevent XSS access
  maxAge: 60 * 60 * 24,    // 24-hour expiry
  sameSite: 'lax',         // CSRF protection
  secure: true             // HTTPS only (production)
}
```

#### API Key Security
- Stored as environment variable (`CONFIG__ADMIN__APIKEY`)
- Never transmitted in URL or query parameters
- Always sent in request headers
- Validated on every admin request

#### Input Validation
```python
# Pydantic Models for Validation
class MemberIn(BaseModel):
    name: str = Field(max_length=20, min_length=1)
    username: str = Field(max_length=30, min_length=1)

class TeamIn(BaseModel):  
    name: str = Field(max_length=32)
    avatar: Optional[str] = None
```

#### Protection Against Common Attacks
- **SQL Injection**: SQLAlchemy ORM with parameterized queries
- **XSS**: JSON-only responses, no HTML injection
- **CSRF**: HTTP-only cookies with proper SameSite settings
- **Directory Traversal**: No file system access from user input
- **Rate Limiting**: Ready for implementation with FastAPI middleware

### Token Management
```python
# In-memory token storage (development)
TOKENS: dict[str, str] = {}

# Token lifecycle
def generate_token() -> str:
    token = create_random_token()
    TOKENS[token] = token
    return token

def consume_token(token: str) -> bool:
    if token in TOKENS:
        del TOKENS[token]
        return True
    return False
```

**Note**: Production deployments should use Redis or database-backed token storage for persistence and scalability.

---

## 🚀 Deployment Guide

### Environment Setup

#### Backend Configuration
```bash
# .env file
CONFIG__ADMIN__APIKEY=your-secure-admin-key-here
CONFIG__DB__URL=sqlite:///./voting.db  # or PostgreSQL URL
CONFIG__RUNTIME__HOST=0.0.0.0
CONFIG__RUNTIME__PORT=8000
```

#### Frontend Configuration
```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000  # or production API URL
```

### Development Deployment

#### Backend Setup
```bash
# Install Python dependencies
cd voting-app/
pip install -r requirements.txt

# Run database migrations
python -m alembic upgrade head

# Start development server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
# Install Node.js dependencies
cd voting-app/frontend/
npm install

# Start development server
npm run dev  # Runs on http://localhost:3000
```

### Production Deployment

#### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - CONFIG__ADMIN__APIKEY=${ADMIN_API_KEY}
      - CONFIG__DB__URL=postgresql://user:pass@db:5432/voting
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:8000

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: voting
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Cloud Deployment Options

**Backend Deployment**:
- **Heroku**: `git push heroku main` with Procfile
- **Railway**: Connect GitHub repo with automatic deployments
- **DigitalOcean App Platform**: Docker container deployment
- **AWS ECS/Fargate**: Container orchestration
- **Google Cloud Run**: Serverless container deployment

**Frontend Deployment**:
- **Vercel**: `vercel --prod` for instant deployment
- **Netlify**: Drag-and-drop or Git integration
- **AWS S3 + CloudFront**: Static hosting with CDN
- **GitHub Pages**: Free static hosting
- **Firebase Hosting**: Google's static hosting service

### Database Migration

#### SQLite to PostgreSQL
```python
# Update configuration
CONFIG__DB__URL=postgresql://user:password@host:5432/database

# Run migrations
python -c "from core.get_db import DatabaseHelper; db = DatabaseHelper(); db.create_database()"
```

### Monitoring & Logging

#### Application Monitoring
```python
# Add to main.py
import logging
logging.basicConfig(level=logging.INFO)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    return response
```

#### Health Checks
```python
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
```

---

## 📚 API Reference

### Complete Endpoint Documentation

See [BACKEND.md](./BACKEND.md) for comprehensive API documentation including:
- All 19 endpoints with full specifications
- Request/response schemas
- Authentication requirements
- Error codes and handling
- cURL examples for every endpoint
- Business rules and validation logic

### Quick Reference

#### Authentication Headers
```http
# Member endpoints
Cookie: users-token=abc123def456ghi789

# Admin endpoints  
x-api-key: your-admin-api-key
```

#### Common Response Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `406` - Not Acceptable (logical error)

---

## 👥 User Workflows

### Admin Workflow
```mermaid
flowchart TD
    A[Admin Login] --> B[Enter API Key]
    B --> C{Valid Key?}
    C -->|No| B
    C -->|Yes| D[Admin Dashboard]
    D --> E[Generate Token]
    E --> F[Create QR Code]
    F --> G[Share with Member]
    D --> H[Manage Teams]
    D --> I[Manage Members]
    H --> J[Create/Edit/Delete Teams]
    I --> K[View/Edit/Delete Members]
```

### Member Workflow
```mermaid
flowchart TD
    A[Scan QR Code] --> B[Registration Page]
    B --> C[Fill Name/Username]
    C --> D[Submit Registration]
    D --> E{Success?}
    E -->|No| F[Show Error]
    F --> C
    E -->|Yes| G[Set Cookie]
    G --> H[Voting Dashboard]
    H --> I[Join Team?]
    I -->|Yes| J[Select Team]
    J --> K[Team Joined]
    K --> L[Vote for Team]
    I -->|No| L[Vote for Team]
    L --> M[Vote Cast]
    M --> N[View Results]
    N --> O[Change Vote?]
    O -->|Yes| P[Rollback Vote]
    P --> L
    O -->|No| N
```

### Voting Process
```mermaid
flowchart TD
    A[Member Selects Team] --> B{Own Team?}
    B -->|Yes| C[Show Error: Cannot vote for own team]
    B -->|No| D{Already Voted?}
    D -->|Yes| E[Show Error: Already voted]
    D -->|No| F[Cast Vote]
    F --> G[Update Database]
    G --> H[Show Success Message]
    H --> I[Refresh Results]
```

### Team Management
```mermaid
flowchart TD
    A[Member Dashboard] --> B{Joined Team?}
    B -->|No| C[Show Available Teams]
    C --> D[Select Team]
    D --> E{Team Exists?}
    E -->|No| F[Show Error]
    E -->|Yes| G[Join Team]
    G --> H[Update Member Status]
    B -->|Yes| I[Show Current Team]
    I --> J[Leave Team Option]
    J --> K[Confirm Leave]
    K --> L[Update Member Status]
```

---

## 💻 Development Guide

### Backend Development

#### Project Structure
```
backend/
├── api/v1/                 # API route definitions
│   ├── admin.py           # Admin endpoints
│   ├── member.py          # Member endpoints  
│   ├── team.py            # Team endpoints
│   └── voting.py          # Voting endpoints
├── core/                   # Core application logic
│   ├── config.py          # Configuration management
│   ├── get_db.py          # Database connection
│   ├── db_models/         # SQLAlchemy models
│   └── schemas/           # Pydantic schemas
├── tests/                  # Test suite
├── main.py                 # FastAPI application entry
└── data.py                 # Utility functions
```

#### Adding New Endpoints
```python
# 1. Define Pydantic schema in core/schemas/
class NewFeature(BaseModel):
    name: str
    description: Optional[str] = None

# 2. Create database model in core/db_models/
class NewFeatureModel(Base):
    __tablename__ = "new_features"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str] = mapped_column(nullable=True)

# 3. Add endpoint in api/v1/
@router.post("/new-feature", response_model=NewFeature)
def create_new_feature(feature: NewFeature, session: SessionGetter):
    # Implementation here
    pass
```

#### Database Migrations
```python
# For new models, run:
from core.get_db import get_db
db = get_db()
db.create_database()  # Creates all tables
```

#### Testing
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_member.py

# Run with coverage
pytest --cov=api --cov=core
```

### Frontend Development

#### Project Structure
```
frontend/src/
├── components/
│   ├── ui/                # Base UI components
│   ├── common/            # Shared components
│   └── admin/             # Admin-specific components
├── pages/                 # Route components
├── hooks/                 # React Query hooks
├── types/                 # TypeScript definitions
├── api/                   # API client
└── lib/                   # utilities
```

#### Adding New Components
```typescript
// 1. Create base UI component in components/ui/
export function NewComponent({ children, ...props }: NewComponentProps) {
  return (
    <div className="new-component" {...props}>
      {children}
    </div>
  )
}

// 2. Add TypeScript types
interface NewComponentProps {
  children: ReactNode
  variant?: 'default' | 'outline'
}

// 3. Create API hook if needed
export function useNewFeature() {
  return useQuery({
    queryKey: ['new-feature'],
    queryFn: () => apiClient.getNewFeature(),
  })
}
```

#### Styling Guidelines
```typescript
// Use Tailwind classes for styling
<Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg">
  Click me
</Button>

// For custom styles, use CSS-in-JS or CSS modules
const customStyles = {
  container: "flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
}
```

#### State Management Patterns
```typescript
// Use React Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['teams'],
  queryFn: apiClient.getTeams,
  staleTime: 5 * 60 * 1000, // 5 minutes
})

// Use React state for UI state
const [isOpen, setIsOpen] = useState(false)

// Use mutations for updates
const updateMutation = useMutation({
  mutationFn: apiClient.updateTeam,
  onSuccess: () => {
    queryClient.invalidateQueries(['teams'])
    toast({ title: 'Team updated successfully' })
  },
})
```

### Code Quality Standards

#### Python (Backend)
```python
# Use type hints
def create_member(session: Session, member: MemberIn, token: str) -> Member:
    pass

# Add comprehensive docstrings
def vote_for_team(team_id: int, member: Member) -> None:
    """
    Cast a vote for a specific team.
    
    Args:
        team_id: ID of the team to vote for
        member: Current member casting the vote
        
    Raises:
        HTTPException: If member tries to vote for own team or has already voted
    """
    pass

# Use Pydantic for validation
class MemberCreate(BaseModel):
    name: str = Field(max_length=20, min_length=1)
    username: str = Field(max_length=30, min_length=1)
```

#### TypeScript (Frontend)
```typescript
// Use proper TypeScript types
interface TeamCardProps {
  team: Team
  onVote: (teamId: number) => Promise<void>
  canVote: boolean
}

// Use generic types for API responses
interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

// Export types for reuse
export type { Team, Member, VotingResult }
```

### Performance Optimization

#### Backend Optimization
```python
# Use database indexing
class Member(Base):
    __tablename__ = "members"
    username: Mapped[str] = mapped_column(unique=True, index=True)
    
# Implement caching (production)
from functools import lru_cache

@lru_cache(maxsize=100)
def get_team_stats(team_id: int) -> dict:
    pass
```

#### Frontend Optimization
```typescript
// Use React.memo for expensive components
const TeamCard = React.memo(({ team, onVote }: TeamCardProps) => {
  return <div>Team content</div>
})

// Implement virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window'

// Use React Query for caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
})
```

---

## 🧪 Testing

### Backend Testing

#### Test Structure
```
tests/
├── conftest.py           # Test configuration and fixtures
├── test_member.py        # Member endpoint tests
├── test_team.py          # Team endpoint tests
├── test_admin.py         # Admin endpoint tests
└── test_voting.py        # Voting endpoint tests
```

#### Test Examples
```python
# Fixture for test client
@pytest.fixture
def client():
    with TestClient(app) as client:
        yield client

# Test member registration
def test_register_member_success(client):
    token_response = client.get("/v1/token", headers={"x-api-key": "admin123"})
    token = token_response.json()
    
    response = client.post(f"/v1/register/{token}", json={
        "name": "John Doe",
        "username": "johndoe"
    })
    
    assert response.status_code == 201
    assert response.json()["name"] == "John Doe"

# Test voting restrictions
def test_cannot_vote_for_own_team(client, authenticated_member):
    response = client.post("/v1/voting/1")  # Member's own team
    assert response.status_code == 400
    assert "cannot vote for your own team" in response.json()["detail"].lower()
```

#### Running Tests
```bash
# Run all tests
pytest

# Run specific test file with verbose output
pytest tests/test_member.py -v

# Run tests with coverage report
pytest --cov=api --cov=core --cov-report=html

# Run tests in parallel
pytest -n auto
```

### Frontend Testing

#### Recommended Testing Stack
```typescript
// Jest + React Testing Library + MSW
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

// Mock API server
const server = setupServer(
  rest.get('/v1/teams', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Team Alpha', avatar: null }
    ]))
  })
)

// Test component rendering
test('displays team list', async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <TeamList />
    </QueryClientProvider>
  )
  
  await waitFor(() => {
    expect(screen.getByText('Team Alpha')).toBeInTheDocument()
  })
})
```

#### Integration Testing
```typescript
// Test complete user workflows
test('member can vote for team', async () => {
  const user = userEvent.setup()
  
  render(<VotingPage />)
  
  // Wait for teams to load
  await waitFor(() => screen.getByText('Team Alpha'))
  
  // Click vote button
  await user.click(screen.getByRole('button', { name: /vote/i }))
  
  // Verify success message
  await waitFor(() => {
    expect(screen.getByText('Vote cast successfully')).toBeInTheDocument()
  })
})
```

### End-to-End Testing

#### Cypress Configuration
```typescript
// cypress/e2e/voting-flow.cy.ts
describe('Voting Flow', () => {
  it('complete member voting workflow', () => {
    // Admin generates token
    cy.visit('/admin')
    cy.get('[data-testid="api-key-input"]').type('admin123')
    cy.get('[data-testid="login-button"]').click()
    cy.get('[data-testid="generate-token"]').click()
    
    // Member registers with token
    cy.get('[data-testid="registration-url"]').then((url) => {
      cy.visit(url.text())
      cy.get('[data-testid="name-input"]').type('John Doe')
      cy.get('[data-testid="username-input"]').type('johndoe')
      cy.get('[data-testid="register-button"]').click()
      
      // Vote for team
      cy.visit('/vote')
      cy.get('[data-testid="team-1-vote-button"]').click()
      cy.contains('Vote cast successfully').should('be.visible')
    })
  })
})
```

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

**1. Database Connection Errors**
```
Error: sqlite3.OperationalError: no such table: members
```
**Solution**: Run database creation
```python
from core.get_db import DatabaseHelper
db = DatabaseHelper()
db.create_database()
```

**2. Authentication Errors**
```
Error: 401 Unauthorized - Invalid or missing API Key
```
**Solution**: Check environment configuration
```bash
# Verify .env file
CONFIG__ADMIN__APIKEY=your-key-here

# Or set environment variable
export CONFIG__ADMIN__APIKEY=your-key-here
```

**3. Token Validation Errors**
```
Error: 401 Unauthorized - Invalid token
```
**Solution**: Token may have expired or been consumed
- Generate new token from admin panel
- Check TOKENS dictionary is properly managed

#### Frontend Issues

**1. API Connection Errors**
```
Network Error: ERR_CONNECTION_REFUSED
```
**Solution**: Verify backend is running and VITE_API_BASE_URL is correct
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify frontend environment
cat frontend/.env
VITE_API_BASE_URL=http://localhost:8000
```

**2. Build Errors**
```
Error: Module not found: Can't resolve '@/components/ui/button'
```
**Solution**: Check TypeScript path mapping in vite.config.ts
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**3. Cookie Authentication Issues**
```
Error: 401 Unauthorized - Missing token cookie
```
**Solution**: Check cookie configuration and domain settings
- Ensure cookies are enabled in browser
- Check cookie domain matches current domain
- Verify HTTPOnly and SameSite settings

#### Deployment Issues

**1. CORS Errors**
```
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```
**Solution**: Configure CORS in FastAPI
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourfrontend.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**2. Environment Variable Issues**
```
Error: KeyError: 'CONFIG__ADMIN__APIKEY'
```
**Solution**: Verify environment variables are loaded
```python
# Check current environment
import os
print(os.environ.get('CONFIG__ADMIN__APIKEY'))

# Or use default values
CONFIG__ADMIN__APIKEY = os.environ.get('CONFIG__ADMIN__APIKEY', 'default-key')
```

### Debug Mode

#### Backend Debugging
```python
# Enable debug mode in main.py
if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="debug"
    )
```

#### Frontend Debugging
```typescript
// Enable React Query Devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>{/* routes */}</Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### Performance Monitoring

#### Backend Monitoring
```python
# Add request timing middleware
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

#### Database Query Monitoring
```python
# Enable SQL query logging
DatabaseHelper(
    url="sqlite:///./voting.db",
    echo=True,  # Logs all SQL queries
    echo_pool=True  # Logs connection pool events
)
```

#### Frontend Performance
```typescript
// React DevTools Profiler
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component:', id, 'Phase:', phase, 'Duration:', actualDuration)
}

<Profiler id="VotingPage" onRender={onRenderCallback}>
  <VotingPage />
</Profiler>
```

### Logging Configuration

#### Backend Logging
```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('voting-app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Use in endpoints
@router.post("/vote/{team_id}")
def vote_for_team(team_id: int):
    logger.info(f"Vote cast for team {team_id} by member {member.id}")
```

#### Frontend Error Boundary
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}
```

---

## 📝 Conclusion

The Team Voting System is a comprehensive, modern web application that demonstrates best practices in full-stack development. With its robust backend API, intuitive frontend interface, and comprehensive documentation, it provides a solid foundation for democratic voting processes in various organizational contexts.

### Key Achievements
- **Secure Authentication**: Token-based registration with admin oversight
- **Business Logic Enforcement**: Proper voting restrictions and validations  
- **Real-time Updates**: Live data synchronization across all clients
- **Modern Architecture**: Scalable, maintainable, and well-documented codebase
- **Professional UI/UX**: Responsive, accessible, and animated interface
- **Comprehensive Testing**: Unit, integration, and end-to-end test coverage

### Extensibility
The system is designed for easy extension with features like:
- WebSocket real-time updates
- Advanced analytics and reporting
- Multi-language support
- Mobile applications
- Integration with external systems

This documentation serves as a complete reference for developers, administrators, and stakeholders involved in deploying, maintaining, or extending the Team Voting System.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Authors**: Development Team  
**License**: MIT