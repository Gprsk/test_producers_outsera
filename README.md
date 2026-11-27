# api_worst_movie

REST API built with **TypeScript**, **NestJS**, **Fastify**, **TypeORM**, and an **in-memory SQLite (`:memory:`)** database. Built exclusively to answer requisites sent by Outsera.

## Architecture Overview

The application is **unsecured** (no authentication, tokens, or guards) due to its simplicity and to allow quick tests. It also follows **Richardson Maturity Model (RMM) Level 2** HTTP semantics:

- `POST /database/reload` — Discards the current in-memory SQLite dataset and reloads `Movielist.csv` atomically (`204 No Content`). No need to restart the API to load a new CSV file.
- `GET /producers/awards-top-intervals` — Returns the **top 2** producers with the smallest (`min`) and largest (`max`) consecutive award win intervals (`200 OK`).
- `GET /producers/awards-top-intervals/:limit` — Returns the **top N** producers for both `min` and `max` intervals (`200 OK`, or `400 Bad Request` for invalid limits).
- `GET /docs` — Interactive Swagger UI.

### Layered Structure (`src/`)

1. **`src/presentation/` (HTTP Layer):** Controllers, routes and status codes, validation pipes, and HTTP exception filters.
2. **`src/domain/` (Business & Processing Layer):** Domain models, repository/reload ports, and consecutive producer interval calculation logic.
3. **`src/infrastructure/` (Database & External I/O Layer):** TypeORM in-memory SQLite configuration, ORM entities, repository adapters, and the `Movielist.csv` loader. It also provides an exclusive layer for any other I/O that might be needed in the future, as can be observed mostly in TDD and DDD based architectures.

> **Data Lifecycle Rule:** `Movielist.csv` is required at the project root (`CSV_FILE_PATH`, expects by default `./Movielist.csv`). It is read **only on application startup** and when **`POST /database/reload`** is explicitly triggered. All `GET` endpoints read exclusively from the in-memory SQLite database.

---

## Prerequisites

- **Node.js** `>= 22.23.5` (LTS Recommended)
- **npm** `>= 10.x`
- **`Movielist.csv`** placed in the root directory following this column schema: `year;title;studios;producers;winner`

---

## Running the Project Manually

1. **Place `Movielist.csv` in the project root:**
   Ensure `./Movielist.csv` exists before starting the server (missing or unreadable CSV files will cause problems and failures).

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables for execution:**
   ```bash
   cp .env.example .env
   ```

4. **Start in development mode (watch):**
   ```bash
   npm run start:dev
   ```

5. **Or build and start in production mode:**
   ```bash
   npm run build
   npm run start:prod
   ```

Once running, the API listens on `http://localhost:3000` and Swagger documentation is available at `http://localhost:3000/docs`.

---

## Running Integration Tests

The end-to-end integration test suite boots the full application, verifies startup CSV ingestion and loads a fake-generated CSV file into the TEMP folder, validates HTTP status codes (`200`, `204`, `400`), tests top-2 and top-N interval queries, and verifies `POST /database/reload`:

```bash
npm run test:e2e
```

To run domain unit tests:

```bash
npm test
```

---

## Running with Docker

Ensure `Movielist.csv` is present in the project root before building the image:

```bash
docker build -t api_worst_movie .
docker run -d --name api_worst_movie -p 3000:3000 api_worst_movie
```

To supply an updated `Movielist.csv` at runtime without rebuilding the image:

```bash
docker run -d --name api_worst_movie -p 3000:3000 \
  -v "$(pwd)/Movielist.csv:/app/Movielist.csv:ro" \
  api_worst_movie
```
