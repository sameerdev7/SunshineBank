# NexBank

A full-stack digital banking portal built with Spring Boot and React. Covers the core flows of a real banking application — account management, fund transfers, transaction history, PIN management, and OTP-based authentication — with a focus on security, validation, and clean API design.

## Architecture

```
[React Frontend]          ← TanStack Router, Tailwind CSS, shadcn/ui
        │
        ▼
[Spring Boot API]         ← REST, JWT auth, Spring Security
        │
     ┌──┴──┐
     ▼     ▼
  [MySQL] [Redis]         ← Persistent storage + token/idempotency cache
        │
        ▼
  [Email Service]         ← Login notifications, OTP delivery, bank statements
```

## Engineering Highlights

**JWT authentication with token persistence**
Tokens are not just validated cryptographically — they are stored in MySQL and validated against the database on every request. This enables true server-side logout: invalidating a token removes it from the store, making it unusable even if it hasn't expired.

**OTP login flow**
Users can authenticate via email OTP as an alternative to password login. OTP generation is rate-limited using Caffeine cache with a 15-minute retry window. Attempts are tracked per account and blocked after 3 consecutive generations to prevent abuse.

**Idempotency on mutation endpoints**
Deposit, withdrawal, fund transfer, and PIN operations are decorated with `@Cacheable` using a composite key of account number + endpoint + request hash. Duplicate requests within the cache window return the cached response without re-executing the operation.

**Password validation with detailed feedback**
Rather than returning a generic "invalid password" error, the backend builds a specific message listing exactly which requirements are missing — uppercase, lowercase, digit, special character. This is surfaced directly in the frontend error display.

**Phone number validation with libphonenumber**
Registration validates phone numbers using Google's libphonenumber library against the provided country code — rejecting structurally invalid numbers before they reach the database.

**Login geolocation notifications**
Every login triggers an async email notification with the login time and approximate location resolved from the request IP via a geolocation API. Failures in geolocation gracefully fall back to "Unknown" without blocking the login flow.

**Redis + Caffeine dual cache**
Redis handles token storage and idempotency keys with TTL-based expiry. Caffeine handles OTP attempt tracking in-process for low-latency reads. A `RedisConnectionFailureException` handler returns a clean 503 instead of crashing.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 17, Spring Boot 3 |
| Security | Spring Security, JWT (jjwt) |
| Database | MySQL, Spring Data JPA |
| Cache | Redis, Caffeine |
| Validation | Spring Validation, libphonenumber |
| Email | Spring Mail, JavaMail |
| Mapping | MapStruct |
| Docs | SpringDoc OpenAPI (Swagger) |
| Frontend | React, TypeScript, TanStack Router |
| Styling | Tailwind CSS, shadcn/ui |
| Build | Maven, Bun |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/users/register` | Register new user with validation |
| POST | `/api/users/login` | Password-based login, returns JWT |
| POST | `/api/users/generate-otp` | Generate OTP for email login |
| POST | `/api/users/verify-otp` | Verify OTP, returns JWT |
| GET | `/api/users/logout` | Invalidate JWT server-side |
| GET | `/api/dashboard/user` | Authenticated user details |
| GET | `/api/dashboard/account` | Account details and balance |
| GET | `/api/account/pin/check` | Check if PIN is set |
| POST | `/api/account/pin/create` | Create transaction PIN |
| POST | `/api/account/pin/update` | Update transaction PIN |
| POST | `/api/account/deposit` | Cash deposit |
| POST | `/api/account/withdraw` | Cash withdrawal |
| POST | `/api/account/fund-transfer` | Transfer to another account |
| GET | `/api/account/transactions` | Transaction history |
| GET | `/api/account/send-statement` | Email bank statement |

## Running Locally

**Prerequisites:** Java 17+, Maven, MySQL, Redis, Bun

```bash
# Backend
cp src/main/resources/application.properties.sample src/main/resources/application.properties
# Fill in DB credentials, JWT secret, mail config, Redis config
docker-compose up -d   # starts MySQL + Redis
./mvnw spring-boot:run

# Frontend
cd sunshine-bank
bun install
bun run dev   # points to http://localhost:8180 by default
```

Swagger UI available at `http://localhost:8180/swagger-ui.html`

## Configuration

All backend configuration is managed via `src/main/resources/application.properties`:

| Property | Description |
|----------|-------------|
| `spring.datasource.url` | MySQL connection URL |
| `spring.data.redis.host` | Redis host |
| `jwt.secret` | JWT signing secret (Base64) |
| `jwt.expiration` | Token expiry in ms |
| `spring.mail.*` | SMTP configuration |
| `geo.api.url` | Geolocation API endpoint |
| `geo.api.key` | Geolocation API key |

---

Built by Sameer
