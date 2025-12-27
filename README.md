# DevSync - Developer Portfolio Dashboard

A **production-grade** monorepo showcasing modern full-stack development with Django and Next.js. Features containerized microservices architecture, CI/CD pipelines, and cloud deployment.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.11, Django 5.0, Django REST Framework |
| **Database** | PostgreSQL 16 (Docker) / SQLite (local) |
| **Caching** | Redis 7 |
| **Authentication** | JWT (SimpleJWT) |
| **API Docs** | OpenAPI 3.0 (Swagger/ReDoc) |
| **Containerization** | Docker, Docker Compose |
| **Reverse Proxy** | Nginx |
| **CI/CD** | GitHub Actions |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS |

## 🏗️ Architecture

```
devsync-v2/
├── backend/                 # Django REST API
│   ├── accounts/           # Custom User Model + JWT Auth
│   ├── core/               # Health checks & utilities
│   ├── config/             # Django settings (12-factor app)
│   ├── tests/              # Pytest test suite (20+ tests)
│   └── Dockerfile          # Multi-stage production build
├── frontend/               # Next.js 15 App Router
├── nginx/                  # Reverse proxy configuration
│   ├── nginx.conf          # Main config
│   └── conf.d/             # Server blocks
├── scripts/                # DevOps automation scripts
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Container orchestration
├── render.yaml             # Infrastructure as Code (Render)
└── README.md
```

## 🐳 Docker Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/devsync-v2.git
cd devsync-v2

# Start all services with Docker Compose
cp .env.docker .env
docker compose up -d

# Run database migrations
docker compose exec backend python manage.py migrate

# Create admin user
docker compose exec backend python manage.py createsuperuser

# View logs
docker compose logs -f backend
```

### Access Points
- **API**: http://localhost:8000/api/v1/
- **Swagger Docs**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Admin Panel**: http://localhost:8000/admin/

## 🚀 Local Development (No Docker)

```bash
# One-command setup
./scripts/run_local.sh setup

# Start server
./scripts/run_local.sh run

# Run tests
./scripts/run_local.sh test
```

## 🧪 Testing

```bash
# Run with Docker
docker compose exec backend pytest -v

# Run locally
cd backend && source venv/bin/activate && pytest -v

# With coverage report
pytest --cov=. --cov-report=html
```

**Test Coverage**: 20+ unit tests covering:
- Custom User Model (email-based auth)
- User Registration & Validation
- JWT Authentication Flow
- Profile Management
- Health Check Endpoints

## 📚 API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register/` | POST | User registration |
| `/api/v1/auth/login/` | POST | Get JWT tokens |
| `/api/v1/auth/token/refresh/` | POST | Refresh access token |
| `/api/v1/auth/token/verify/` | POST | Verify token validity |
| `/api/v1/auth/logout/` | POST | Logout user |

### User Profile
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/profile/` | GET | Get user profile |
| `/api/v1/auth/profile/` | PATCH | Update profile |
| `/api/v1/auth/change-password/` | POST | Change password |

### System
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/core/health/` | GET | Health check |

## 🐳 Docker Architecture

```yaml
Services:
  ├── backend      # Django API (Port 8000)
  ├── db           # PostgreSQL 16 (Port 5432)
  ├── redis        # Redis 7 (Port 6379)
  ├── celery_worker # Background tasks
  ├── celery_beat   # Scheduled tasks
  └── nginx        # Reverse proxy (Port 80/443)
```

### Docker Commands
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild after code changes
docker compose up -d --build

# View logs
docker compose logs -f [service_name]

# Execute commands in container
docker compose exec backend python manage.py shell

# Prune unused resources
docker system prune -a
```

## 🔐 Security Features

- ✅ JWT Authentication with token refresh
- ✅ Password validation (min 8 chars, complexity rules)
- ✅ CORS protection
- ✅ CSRF protection
- ✅ Rate limiting (100/hr anon, 1000/hr user)
- ✅ SQL injection protection (Django ORM)
- ✅ XSS protection headers
- ✅ Environment-based secrets (python-dotenv)

## 🌐 Deployment

### Render.com (Free Tier)
```bash
# Uses render.yaml for Infrastructure as Code
# Connect GitHub repo → Auto-deploys on push
```

### Manual Docker Deployment
```bash
# Build production image
docker build -t devsync-backend:latest --target production ./backend

# Run with production settings
docker run -d -p 8000:8000 \
  -e DJANGO_DEBUG=False \
  -e DATABASE_URL=postgresql://... \
  devsync-backend:latest
```

## 📊 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DJANGO_DEBUG` | Debug mode | `True` |
| `DJANGO_SECRET_KEY` | Secret key | Required |
| `DATABASE_URL` | PostgreSQL URL | SQLite |
| `REDIS_URL` | Redis URL | Memory cache |
| `USE_CELERY` | Enable Celery | `False` |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`pytest -v`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ using Django, Docker, and modern DevOps practices**
