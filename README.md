# GemHire

A full-stack engineering job portal and applicant tracking system built with **Spring Boot 4 (Java 21)**, **React 19 (TypeScript)**, **PostgreSQL**, **Redis**, **Apache Kafka**, and **Google Gemini**.

I built this project to handle real-world backend and ATS problems that basic CRUD job boards usually skip: race conditions when multiple candidates apply for the last job opening, dual-write inconsistencies between PostgreSQL and Kafka, multi-column PDF resume parsing with hidden hyperlink extraction, prompt-injection sanitization before LLM calls, and dynamic single-page PDF resume generation.

---

## Architecture

The backend is split into two services sharing a PostgreSQL database and connected asynchronously over Kafka:

1. **`core-service` (`:8080`)**
   - Stateless JWT authentication + refresh token rotation (`Spring Security`)
   - Header anti-spoofing filter (`JwtAuthenticationFilter` overrides `X-User-Id` from verified JWT claims)
   - Company registration, job publishing, and strict employer ownership checks
   - Atomic job slot reservation using a Redis Lua script (`apply_slot_lock.lua`)
   - Transactional Outbox table (`outbox_events`) + background Kafka dispatcher (`OutboxDispatcherService`)

2. **`ai-worker-service` (`:8081`)**
   - Coordinate-sorted PDF parser (`Apache PDFBox`) + embedded PDF annotation/URI extractor (`PDAnnotationLink`)
   - Prompt-injection sanitizer (`PromptInjectionSanitizer`) that strips zero-width characters and instruction-override payloads before hitting the LLM
   - Single-page ATS PDF compiler with auto-scaling typography and clickable links (`LinkedIn`, `GitHub`, `LeetCode`, `Codeforces`, `CodeChef`, `HackerRank`, live project demos)
   - LaTeX resume parser and PDF builder
   - Gemini-powered project bullet extraction from GitHub/live URLs, external job posting scraper, adaptive cover letter drafting, and unified skill + project fit scoring

3. **`frontend` (`:5173`)**
   - React 19 + TypeScript + Tailwind CSS v4 + Vite
   - Candidate portal: multi-stack filtering (`ANY` / `ALL`), annual/monthly compensation range filter, live resume fit breakdown, Greenhouse-style autofill application modal, and PDF Resume Studio
   - Employer ATS dashboard: 1-click job import from external URLs, applicant pipeline management, inline PDF preview, and AI candidate screening
   - System-default dark/light theme support

---

## Key Engineering Highlights

### 1. Atomic Slot Locking with Redis + Lua
When a job has limited openings, concurrent requests can easily overbook the role if checked with standard read-then-write queries. `ApplicationSlotLockService` runs `apply_slot_lock.lua` atomically on Redis to verify duplicate applications and decrement `job:openings:{jobId}` in a single step. If the database transaction fails or an application is withdrawn, the slot is released back. If Redis is unavailable, the service falls back gracefully to database constraints.

### 2. Transactional Outbox for Kafka Events
When a candidate submits an application, `ApplicationServiceImpl` saves both the `Application` entity and an `OutboxEvent` record inside the same PostgreSQL transaction. `OutboxDispatcherService` polls unprocessed events and publishes them to the `job-applications-submitted` Kafka topic, marking them processed only after broker acknowledgment. `ai-worker-service` consumes the event and computes the candidate's screening score asynchronously.

### 3. Coordinate-Sorted PDF Parsing & Link Recovery
Standard text extraction scrambles two-column resumes and drops hyperlinks embedded behind anchor words like `"GitHub"` or `"Live Demo"`. `ResumeServiceImpl` sorts text tokens by `(Y, X)` coordinates via `PDFTextStripper.setSortByPosition(true)` and inspects `PDPage.getAnnotations()` to recover every embedded URI.

### 4. Dynamic 1-Page PDF Compiler
Whether a candidate uploads a resume, edits their profile in the modal, or pastes LaTeX code, the PDF generator measures total content height across sections and scales font size and line spacing so the output fits cleanly onto a single page with clickable header and project links.

---

## Tech Stack

- **Backend**: Java 21, Spring Boot 4.0.2, Spring Security, Spring Data JPA, Spring Data Redis, Spring for Apache Kafka, Apache PDFBox 2.0.30, JJWT
- **Database & Infra**: PostgreSQL 15, Redis 7, Apache Kafka + Zookeeper (Docker Compose)
- **AI Integration**: Google Gemini (`gemini-2.5-flash`) with regex/heuristic fallbacks when offline
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Axios

---

## Running Locally

### Prerequisites
- Java 21+ and Maven
- Node.js 20+ and npm
- Docker & Docker Compose (for PostgreSQL, Redis, and Kafka)

### 1. Start Infrastructure (PostgreSQL, Redis, Kafka)
```bash
docker compose up -d
```
PostgreSQL runs on `localhost:5433` (database: `nexushire`), Redis on `localhost:6379`, and Kafka on `localhost:9092`.

### 2. Start `core-service` (`:8080`)
```bash
mvn -f backend/core-service/pom.xml spring-boot:run
```

### 3. Start `ai-worker-service` (`:8081`)
Set your Gemini API key in `backend/ai-worker-service/src/main/resources/application.properties` or pass it as an environment variable:
```bash
export GEMINI_API_KEY="your_api_key_here"
mvn -f backend/ai-worker-service/pom.xml spring-boot:run
```

### 4. Start the Frontend (`:5173`)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Project Structure

```text
nexus-hire/
├── backend/
│   ├── core-service/          # Auth, Jobs, Companies, Applications, Redis Lua Locks, Kafka Outbox (:8080)
│   └── ai-worker-service/     # Resumes, PDFBox Parser/Generator, Prompt Sanitizer, Gemini AI (:8081)
├── frontend/                  # React 19 + TypeScript SPA (:5173)
└── docker-compose.yml         # PostgreSQL (:5433), Redis (:6379), Kafka (:9092), Zookeeper (:2181)
```

