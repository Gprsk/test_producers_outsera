---
name: api-worst-movie-skill
description: Scaffold and architect the "api_worst_movie" unsecured TypeScript NestJS REST API with strict layered separation (HTTP presentation layer, business domain/processing layer, and infrastructure/external data-access layer) following Richardson Maturity Model Level 2, Fastify, TypeORM in-memory SQLite, npm, startup-only Movielist.csv ingestion, a Dockerfile, README.md, and Git repository setup/workflows. Use whenever the user asks to create, bootstrap, initialize, or build the api_worst_movie TypeScript NestJS application or REST API from scratch.
---

# NestJS Fastify TypeORM Layered API Architect (`api_worst_movie`)

Scaffold and structure the production-grade `api_worst_movie` TypeScript NestJS REST API powered by the Fastify HTTP adapter, TypeORM with an in-memory SQLite database (`:memory:`), `npm`, startup-only `Movielist.csv` ingestion, a multi-stage `Dockerfile`, a clear `README.md`, and clean Git repository configuration/workflows. The entire API is completely unsecured by design—no authentication, authorization, JWT/Bearer tokens, API keys, or auth guards. Enforce senior-level architectural discipline: strict layered architecture separating HTTP transport, domain/business logic, and external data access (database + filesystem/outbound I/O), Richardson Maturity Model (RMM) Level 2 HTTP semantics, fail-fast startup validation, and automated tests.

## When to Use

- User asks to create, scaffold, bootstrap, or initialize the `api_worst_movie` TypeScript NestJS application or REST API.
- User asks to set up a public/unsecured TypeScript NestJS backend with Fastify, TypeORM in-memory SQLite, `Movielist.csv` startup ingestion, Docker support, Git setup, and documentation.
- User asks for a clean, layered starter architecture for the Golden Raspberry Awards / worst movie API.

## Architecture & Engineering Standards

Apply these non-negotiable engineering practices to the generated project:

1. **Strict Three-Layer Separation & Dependency Direction:**
   Organize all application source code under three explicit architectural layers (`presentation/`, `domain/`, `infrastructure/`) with inward-only dependencies (`presentation -> domain <- infrastructure`):
   - **Presentation / HTTP Layer (`src/presentation/`):** Owns HTTP routes, Fastify request/response handling, HTTP methods (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`), HTTP status codes (`@HttpCode`), route parameter pipes, request/response DTOs, Swagger decorators, and HTTP exception filters. Controllers translate HTTP requests into domain service calls and map domain results into HTTP response DTOs—never containing business rules, SQL/TypeORM queries, or filesystem/external I/O.
   - **Business Domain & Processing Layer (`src/domain/`):** Owns core domain models, domain services, award-interval calculation/processing rules, domain exceptions, and repository interfaces/ports (`MovieRepositoryPort`). Services execute business logic and data processing using domain models and repository abstractions—never importing Fastify/HTTP types, TypeORM entities directly into transport contracts, or `fs`/external clients.
   - **Infrastructure & External Data-Access Layer (`src/infrastructure/`):** Groups **all** database operations and **all** external I/O (filesystem access such as reading `Movielist.csv`, external HTTP/API clients if ever added, TypeORM configuration, TypeORM `@Entity()` persistence schemas, TypeORM repository implementations, and startup CSV seeders). No code outside `src/infrastructure/` may touch TypeORM `Repository`, `DataSource`, `fs`, or outbound network clients.

2. **Git Repository Setup & Senior Version-Control Hygiene:**
   - Initialize the repository cleanly (`git init -b main`) and provide a tailored `.gitignore` that ignores `node_modules/`, `dist/`, `.env`, `.env.local`, `coverage/`, `*.log`, and OS/IDE artifacts while **explicitly tracking `Movielist.csv`**, `.env.example`, `Dockerfile`, `.dockerignore`, and `README.md`.
   - Enforce Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`) and logical atomic commits when scaffolding or guiding Git workflows (e.g., initial scaffold commit, domain/infrastructure implementation commit, integration tests & Docker commit).
   - When executing or recommending Git commands in a workspace, run safe non-destructive commands (`git init`, `git status`, `git add`, `git commit`, `git branch`, `git diff`, `git log`) and never force-push or rewrite shared history unless explicitly requested.

3. **Unsecured, Open API Surface (Zero Auth):**
   - The entire API is intentionally public and unsecured. Do **not** generate auth modules, login endpoints, JWT/Passport strategies, Bearer token headers, API key checks, `@UseGuards(...)` auth guards, or `401 Unauthorized` / `403 Forbidden` auth flows.
   - Do not add `Authorization` security schemes to Swagger (`DocumentBuilder`), and document clearly in `README.md` that all endpoints are open without token or authentication requirements.

4. **In-Memory SQLite & Startup-Only `Movielist.csv` Ingestion:**
   - Configure TypeORM inside `src/infrastructure/database/` to use SQLite in memory (`type: 'sqlite'`, `database: ':memory:'`) with `synchronize: true` on the singleton `DataSource` so tables initialize automatically when the ephemeral in-memory database boots.
   - The file `Movielist.csv` is obligatory for the API to function and must be included in the project root (or configured via `CSV_FILE_PATH` defaulting to `./Movielist.csv`).
   - Validate the existence and readability of `Movielist.csv` inside `src/infrastructure/external/csv/` during application bootstrap (`OnApplicationBootstrap`). If `Movielist.csv` is missing, unreadable, or malformed, log a clear error and fail fast on startup rather than booting with empty data.
   - **Strict Database-Only Runtime Rule:** `Movielist.csv` is read **once at startup** by the infrastructure CSV loader to populate the in-memory SQLite database. After startup ingestion completes, **all API endpoints, domain services, and infrastructure repositories must interact exclusively with the SQLite database**—never read, query, or re-parse `Movielist.csv` during HTTP request handling.

5. **Richardson Maturity Model (RMM) Level 2 Compliance:**
   - **Level 1 - Resource-Oriented URIs:** Design routes in `src/presentation/http/controllers/` around plural nouns representing domain resources (`/movies`, `/movies/:id`, `/producers/award-intervals`), never RPC-style verb endpoints (`/getMovies`, `/createMovie`, `/deleteMovieById`).
   - **Level 2 - Proper HTTP Verbs & Idempotency:** Use HTTP methods strictly according to their semantics:
     - `GET` (safe, idempotent) for reading collections, single resources, or computed interval projections from SQLite.
     - `POST` (non-idempotent) for creating new resources in SQLite.
     - `PUT` (idempotent) for full resource replacement; `PATCH` for partial updates.
     - `DELETE` (idempotent) for removing resources from SQLite.
   - **Level 2 - Meaningful HTTP Status Codes:** Return accurate status codes rather than `200 OK` for everything:
     - `201 Created` on `POST` resource creation (paired with a `Location` header pointing to `/<resource>/:id` where appropriate).
     - `200 OK` on successful `GET`, `PUT`, or `PATCH` returning a body.
     - `204 No Content` (`@HttpCode(HttpStatus.NO_CONTENT)`) on successful `DELETE` or state transitions without a response payload.
     - `400 Bad Request` for malformed input/validation errors, `404 Not Found` for missing resources, `409 Conflict` for uniqueness or state conflicts, and `422 Unprocessable Entity` for semantic domain rule violations.

6. **TypeScript & Tooling (`npm`):**
   - Bootstrap via `npx @nestjs/cli@latest new api_worst_movie --package-manager npm --strict --language TypeScript`.
   - Enforce strict TypeScript compiler settings in `tsconfig.json`: `"strict": true`, `"noImplicitOverride": true`, `"noUncheckedIndexedAccess": true`, and `"exactOptionalPropertyTypes": true`.
   - Swap Express for `@nestjs/platform-fastify` and bind `app.listen(port, '0.0.0.0')` (Fastify defaults to `127.0.0.1`, which breaks container port mapping unless `0.0.0.0` is specified).

7. **Containerization (`Dockerfile` & `.dockerignore`):**
   - Generate a production-ready multi-stage `Dockerfile` at the root of `api_worst_movie/`:
     - **Builder stage:** Uses an LTS Node image (e.g., `node:22-bookworm-slim` or `node:22-alpine` with native build tools for `sqlite3`), installs dependencies via `npm ci`, and compiles TypeScript (`npm run build`).
     - **Production stage:** Uses a minimal Node runtime image, sets `NODE_ENV=production`, installs only production dependencies (`npm ci --omit=dev`), copies `dist/` and the mandatory `Movielist.csv` file into the working directory, runs as a non-root user (`node`), exposes the API port (`3000`), defines a container `HEALTHCHECK` against `/health`, and starts with `node dist/main.js`.
   - Generate `.dockerignore` excluding `node_modules`, `dist`, `.git`, `.env`, and test artifacts while explicitly keeping `Movielist.csv`.

8. **Mandatory Documentation (`README.md`):**
   - Generate a comprehensive `README.md` at the root of `api_worst_movie/` containing at minimum:
     - **Project Overview & Layered Architecture:** Summary of the unsecured API, tech stack (TypeScript, NestJS, Fastify, TypeORM, SQLite `:memory:`), the three-layer architecture (`presentation`, `domain`, `infrastructure`), RMM Level 2 conventions, and startup-only `Movielist.csv` ingestion behavior.
     - **Prerequisites & Manual Setup:** Node.js/npm versions, environment variables (`.env.example`), ensuring `Movielist.csv` is present in the root directory, installing dependencies (`npm install`), and running the project manually in development (`npm run start:dev`) and production (`npm run build && npm run start:prod`) modes, including the Swagger UI URL (`/docs`).
     - **Running Integration Tests:** Exact commands to execute the end-to-end / integration test suite (`npm run test:e2e`), plus unit tests (`npm test`), explaining how the integration tests verify startup CSV seeding and database-backed HTTP endpoints.
     - **Running with Docker:** Exact `docker build` and `docker run` commands (including port mapping `-p 3000:3000` and optional volume/env overrides for `Movielist.csv`).

9. **Layered Folder Structure:**
   Keep `Movielist.csv`, `Dockerfile`, `.gitignore`, and `README.md` at the project root, and separate HTTP routes/responses (`presentation/`), business logic/data processing (`domain/`), and database/file/external I/O (`infrastructure/`):

   ```text
   api_worst_movie/
   ├── Movielist.csv                               # Obligatory startup seed dataset loaded into SQLite on boot
   ├── Dockerfile                                  # Multi-stage production container build
   ├── .dockerignore
   ├── .gitignore                                  # Excludes build/env artifacts while tracking Movielist.csv
   ├── README.md                                   # Manual setup, integration test, and Docker instructions
   ├── .env.example
   ├── package.json
   ├── tsconfig.json
   ├── src/
   │   ├── presentation/                           # Layer 1: HTTP routes, verbs, status codes, DTOs, filters
   │   │   ├── http/
   │   │   │   ├── controllers/
   │   │   │   │   ├── health.controller.ts
   │   │   │   │   └── <feature>.controller.ts
   │   │   │   ├── dto/
   │   │   │   │   ├── create-<feature>.dto.ts
   │   │   │   │   ├── update-<feature>.dto.ts
   │   │   │   │   └── <feature>-response.dto.ts
   │   │   │   ├── filters/
   │   │   │   │   └── all-exceptions.filter.ts
   │   │   │   └── interceptors/
   │   │   │       └── logging.interceptor.ts
   │   │   └── presentation.module.ts
   │   ├── domain/                                 # Layer 2: Business rules, data processing, domain models & ports
   │   │   ├── models/
   │   │   │   └── <feature>.model.ts
   │   │   ├── ports/
   │   │   │   └── <feature>-repository.port.ts
   │   │   ├── services/
   │   │   │   ├── <feature>.service.ts
   │   │   │   └── <feature>.service.spec.ts
   │   │   ├── errors/
   │   │   │   └── domain.error.ts
   │   │   └── domain.module.ts
   │   ├── infrastructure/                         # Layer 3: Database (TypeORM/SQLite) & external I/O (CSV/APIs)
   │   │   ├── config/
   │   │   │   └── env.validation.ts
   │   │   ├── database/
   │   │   │   ├── entities/
   │   │   │   │   └── <feature>.orm-entity.ts
   │   │   │   ├── repositories/
   │   │   │   │   └── typeorm-<feature>.repository.ts
   │   │   │   ├── health-check.adapter.ts
   │   │   │   └── typeorm.config.ts
   │   │   ├── external/
   │   │   │   └── csv/
   │   │   │       └── movie-csv-loader.service.ts # Startup-only Movielist.csv reader & database seeder
   │   │   └── infrastructure.module.ts
   │   ├── app.module.ts
   │   └── main.ts
   └── test/
       └── <feature>.e2e-spec.ts
   ```

10. **Fail-Fast Configuration & Global Pipeline:**
    - Validate all required environment variables (including `CSV_FILE_PATH` defaulting to `Movielist.csv`) at startup in `ConfigModule.forRoot({ isGlobal: true, validate })` so missing configuration or file paths crash immediately on boot rather than at runtime.
    - Register global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`, the presentation layer's global exception filter (translating domain errors into RMM Level 2 HTTP status codes and consistent JSON payloads `{ statusCode, timestamp, path, message }`), `@fastify/helmet`, CORS, and `@nestjs/swagger` mounted at `/docs`.

## Step-by-Step Scaffolding Workflow

1. **Clarify Minimal Inputs (Only If Missing):**
   - Project name (`api_worst_movie`), unsecured public access (no auth/tokens), language (`TypeScript`), strict three-layer architecture (`presentation`, `domain`, `infrastructure`), database (`sqlite` with `:memory:`), startup-only `Movielist.csv` ingestion, Git setup, `Dockerfile`, and `README.md` are fixed. Confirm required endpoints/resources if not already specified.

2. **Initialize & Install Dependencies (`npm`):**
   Provide exact shell commands:

   ```bash
   npx @nestjs/cli@latest new api_worst_movie --package-manager npm --strict --language TypeScript
   cd api_worst_movie
   npm uninstall @nestjs/platform-express
   npm install @nestjs/platform-fastify @nestjs/config @nestjs/typeorm typeorm sqlite3 @nestjs/swagger @fastify/helmet class-validator class-transformer
   ```

3. **Configure Bootstrap (`src/main.ts`):**
   - Instantiate `NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }))`.
   - Register `@fastify/helmet` and `app.enableCors()`.
   - Configure `ValidationPipe`, `AllExceptionsFilter`, and Swagger (`DocumentBuilder` + `SwaggerModule.setup('docs', app, document)`) without any auth security definitions.
   - Enable `app.enableShutdownHooks()` for clean SQLite connection shutdown on `SIGTERM`/`SIGINT`, and call `await app.listen(port, '0.0.0.0')`.

4. **Implement Infrastructure Layer (`src/infrastructure/`):**
   - Place `Movielist.csv` at the root of `api_worst_movie/`.
   - Create `.env.example` and `src/infrastructure/config/env.validation.ts` validating `NODE_ENV`, `PORT`, and `CSV_FILE_PATH`.
   - Wire `TypeOrmModule.forRootAsync` with `type: 'sqlite'`, `database: ':memory:'`, `autoLoadEntities: true`, and `synchronize: true`.
   - Create TypeORM ORM entities (`*.orm-entity.ts`) and repository adapters (`TypeOrm*Repository`) implementing domain repository ports, plus `HealthCheckAdapter` (`DataSource.query('SELECT 1')`).
   - Implement `MovieCsvLoaderService` (`OnApplicationBootstrap`) under `src/infrastructure/external/csv/` to verify `fs.access` on `CSV_FILE_PATH` (failing fast if missing or unreadable), parse rows once at boot, and persist them via the database repository inside a transaction.

5. **Implement Business Domain Layer (`src/domain/`):**
   - Define pure TypeScript domain models, domain errors (`EntityNotFoundError`, `DomainConflictError`, `DomainValidationError`), repository port interfaces/tokens, and domain services containing all business rules and data processing (e.g., producer award-interval computation) using only repository ports.
   - Add unit tests (`*.service.spec.ts`) testing domain services against in-memory/mocked repository ports without HTTP or TypeORM coupling.

6. **Implement Presentation Layer (`src/presentation/`), Docker, Docs & Git:**
   - Build thin RMM Level 2 HTTP controllers (`HealthController`, feature controllers) under `src/presentation/http/controllers/` with plural routes, proper HTTP verbs (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete` with `@HttpCode(HttpStatus.NO_CONTENT)`), request/response DTOs, and `AllExceptionsFilter` mapping domain errors to `404`/`409`/`422`.
   - Generate `Dockerfile` and `.dockerignore` ensuring `Movielist.csv` is copied into the final runtime image and `sqlite3` runs cleanly.
   - Generate `README.md` with clear sections covering the layered architecture, running the project manually, running integration tests (`npm run test:e2e`), and building/running the Docker container.
   - Configure `.gitignore` (ensuring `Movielist.csv` is not ignored by any wildcard `*.csv` rule) and initialize/commit cleanly with Git (`git init -b main`, `git add`, `git commit` with Conventional Commits).
   - Run `npm run build`, `npm test`, and `npm run test:e2e` to confirm zero TypeScript or runtime errors.

## Gotchas

- **Git Ignoring `Movielist.csv`:** Never put `*.csv` in `.gitignore` without negating `!Movielist.csv`; because `Movielist.csv` is mandatory for startup, excluding it from Git will break fresh clones and CI builds.
- **Layer Boundary Leaks:** Never import `@nestjs/typeorm`, `typeorm`, `*.orm-entity.ts`, or `fs` inside `src/domain/` or `src/presentation/`. Controllers must not inject TypeORM repositories directly, and domain services must not import Fastify or `@nestjs/common` HTTP exceptions when domain errors can be mapped cleanly in `AllExceptionsFilter`.
- **No Auth Boilerplate:** Do not install `@nestjs/jwt`, `@nestjs/passport`, `passport`, or `bcrypt`, and do not generate `AuthGuard`, `JWT_SECRET` env vars, or `401`/`403` tests. Keep the API surface completely open.
- **Native `sqlite3` in Docker:** When using `node:*-alpine` in `Dockerfile`, `sqlite3` may require `python3`, `make`, and `g++` during `npm ci` if prebuilt musl binaries are unavailable, or use `node:22-bookworm-slim` for frictionless `sqlite3` installation. Always copy `Movielist.csv` into the production stage of the `Dockerfile` so the container does not fail fast on boot.
- **Single In-Memory SQLite Connection:** With `database: ':memory:'`, each separate connection creates its own isolated empty database. Ensure TypeORM shares a single connection pool (default singleton `DataSource` in `TypeOrmModule.forRootAsync`) so the startup seeder and all runtime repositories read and write the exact same in-memory SQLite database.
- **Startup-Only CSV Access:** Do not inject `MovieCsvLoaderService` or use `fs` inside presentation controllers or domain services. All runtime queries and mutations must go strictly through database repositories so `POST`, `PUT`, `PATCH`, and `DELETE` mutations are immediately reflected in subsequent `GET` requests.
- **Fastify Host Binding:** Fastify binds to `localhost` (`127.0.0.1`) by default. Always pass `'0.0.0.0'` as the second argument to `app.listen(port, '0.0.0.0')` so Docker and reverse proxies can reach the container.
- **RMM Level 2 Anti-Patterns:** Avoid RPC-style action routes (like `POST /movies/delete` or `GET /getAllMovies`), returning `200 OK` on `POST` creation instead of `201 Created`, or returning a JSON body on `DELETE` when `204 No Content` is expected.
