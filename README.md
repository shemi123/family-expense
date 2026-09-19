# 🏡 Family Budget Management Application

A full-stack, multi-tenant family budget and financial planning application built with **React 18 + TypeScript**, **Spring Boot 3 (Java 21)**, and **PostgreSQL**.

---

## 🚀 Features

- **Multi-Tenant by Family**: Households are strictly isolated by `family_id`. Multi-user access with roles (`ADMIN`, `MEMBER`).
- **Financial Accounts & Running Balances**: Track Cash, Checking/Bank, Savings, and Credit Cards with real-time atomic balance updates.
- **Double-Entry Style Ledger**: Income and expense transactions tied to accounts, categories, users, dates, notes, and receipts.
- **Smart Category Management**: 17 global pre-seeded categories (Housing, Utilities, Groceries, Dining, Salary, Freelance, etc.) plus customizable family-specific categories.
- **Monthly Budgets & Real-Time Alerts**: Set monthly spending limits per category with visual progress bars and over-budget warnings.
- **Automated Recurring Transactions**: Automatic scheduled generation for rent, recurring bills, and wages with customizable frequencies (Daily, Weekly, Bi-weekly, Monthly, Yearly).
- **Consolidated Dashboard Analytics**:
  - Total Net Worth, Monthly Inflow, Outflow, and Net Savings Rate.
  - Interactive **Recharts** visualizations: 6-month cash flow trends (Area Chart) and current month category breakdown (Donut Chart).
- **Filtered Transactions & CSV Export**: Search, filter by account/category/date range/type, and export directly to CSV.
- **Security & RFC 7807 Compliance**: Stateless JWT authentication, role-based authorization, and standardized RFC 7807 Problem Detail error handling.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, TanStack Query v5, Zustand, Recharts, Tailwind CSS, Lucide Icons, Vite |
| **Backend** | Java 21, Spring Boot 3.3.x, Spring Security (JWT), Spring Data JPA, Hibernate, Flyway Migrations |
| **Database** | PostgreSQL 16 (UUID primary keys, ACID transactions, composite tenant indexing) |
| **DevOps** | Docker Compose, Multi-stage Docker builds, Nginx reverse proxy |

---

## 📂 Project Structure

```
family-budget/
├── docker-compose.yml          # One-command full-stack container orchestration
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/familybudget/
│       │   │   ├── config/             # SecurityConfig, OpenApiConfig
│       │   │   ├── security/           # JWT Provider, Auth Filter, TenantContext
│       │   │   ├── exception/          # GlobalExceptionHandler (RFC 7807 ProblemDetail)
│       │   │   ├── domain/             # Entities: Family, User, Account, Category, etc.
│       │   │   ├── repository/         # JPA Repositories & Specifications
│       │   │   ├── dto/                # Request & Response DTOs
│       │   │   ├── service/            # Business logic & balance management
│       │   │   ├── scheduler/          # Daily recurring transaction batch processor
│       │   │   └── controller/         # REST Controllers under /api/v1
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/
│       │           ├── V1__init_schema.sql
│       │           └── V2__seed_default_categories.sql
│       └── test/
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── api/                # Axios client & typed API services
        ├── store/              # Zustand auth & tenant state store
        ├── types/              # TypeScript domain models
        ├── components/         # Layout, Navbar, Sidebar, Recharts charts, Modals
        └── pages/              # Dashboard, Accounts, Transactions, Budgets, Recurring, Family
```

---

## ⚡ Quick Start with Docker Compose

Run the full stack with PostgreSQL, Spring Boot backend, and React frontend with a single command:

```bash
cd family-budget
docker compose up --build -d
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- **OpenAPI / Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **PostgreSQL Database**: `localhost:5432` (`db: family_budget`, `user: postgres`, `pass: postgres`)

---

## 💻 Local Development Setup

### Prerequisites
- Java 21+ & Maven 3.9+
- Node.js 20+ & npm
- PostgreSQL 14+ running locally

### 1. Backend Setup

```bash
cd backend

# Configure database credentials in src/main/resources/application.yml or pass via env vars:
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/family_budget
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres

# Run migrations and start server
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will run at `http://localhost:5173` and automatically proxies `/api` calls to `http://localhost:8080`.

---

## 📡 Key REST API Endpoints (`/api/v1`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new household & admin user | Public |
| `POST` | `/api/v1/auth/login` | Login and obtain JWT token | Public |
| `POST` | `/api/v1/auth/members` | Add household member (spouse, child) | ADMIN |
| `GET` | `/api/v1/auth/members` | List household members | Authenticated |
| `GET` | `/api/v1/accounts` | List active accounts with running balances | Authenticated |
| `POST` | `/api/v1/accounts` | Create financial account | Authenticated |
| `GET` | `/api/v1/categories` | List system & custom categories | Authenticated |
| `POST` | `/api/v1/categories` | Add custom category | Authenticated |
| `GET` | `/api/v1/transactions` | Paginated & filterable transaction ledger | Authenticated |
| `POST` | `/api/v1/transactions` | Record transaction (updates account balance) | Authenticated |
| `GET` | `/api/v1/transactions/export` | Download transactions as CSV file | Authenticated |
| `GET` | `/api/v1/budgets/summary` | Monthly spending limits vs actuals & alerts | Authenticated |
| `POST` | `/api/v1/budgets` | Set or update category budget ceiling | Authenticated |
| `GET` | `/api/v1/recurring` | List recurring schedules | Authenticated |
| `POST` | `/api/v1/recurring/process`| Trigger batch execution of due schedules | Authenticated |
| `GET` | `/api/v1/dashboard` | Consolidated metrics, trends & breakdown | Authenticated |
# family-expense
