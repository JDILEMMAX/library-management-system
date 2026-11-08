<div align="center">

# Library Management System

### Full-Stack NestJS + Prisma + PostgreSQL API

![Stack](https://img.shields.io/badge/stack-NestJS%20%7C%20Prisma%20%7C%20PostgreSQL-blueviolet?style=flat-square)
![Language](https://img.shields.io/badge/language-TypeScript-3178C6?style=flat-square)
![ORM](https://img.shields.io/badge/ORM-Prisma%20v6-2D3748?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)
![PLP Cohort](https://img.shields.io/badge/PLP-Exclusive%20SE%20Cohort-purple?style=flat-square)

*Power Learn Project - Exclusive Software Engineering Cohort | Week 1: NestJS and Prisma Data Layer*

</div>

---

## Executive Summary

A production-grade library management API built on NestJS 12, Prisma 6 and PostgreSQL. The system models a full library domain: users with role-based access (Patron and Librarian), a normalized genre catalogue, a book inventory with per-copy tracking, a stretch Review entity for reader feedback. The data layer is designed for 3NF normalization from the ground up, enabling indexed relational queries and referential integrity that document-store embedding cannot provide.

---

## Domain Model

```
  User (PATRON | LIBRARIAN)
   |
   | 1 ------ * Review * ------ 1
                                |
  Genre 1 --- * Book 1 ---------+
```

| Entity | Key Fields | Notes |
|---|---|---|
| `User` | `id`, `email`, `name`, `role`, timestamps | Role default: PATRON |
| `Genre` | `id`, `name`, `slug` | Unique slug for URL-safe lookups |
| `Book` | `id`, `title`, `author`, `isbn`, `totalCopies`, `availableCopies`, `genreId`, timestamps | FK to Genre |
| `Review` | `id`, `rating`, `comment`, `bookId`, `userId`, timestamps | Stretch entity |

---

## Repository Structure

```
library-management-system/
|
|-- .gitignore
|-- LICENSE
|-- README.md                         This file
|
+-- api/                              NestJS application
    |-- .env.example                  Sanitized DATABASE_URL template
    |-- .oxlintrc.json                Linting configuration
    |-- .prettierrc                   Formatter configuration
    |-- AGENTS.md                     AI agent guidelines
    |-- README.md                     NestJS default README
    |-- jest.config.ts                Jest test runner configuration
    |-- nest-cli.json                 NestJS CLI build settings
    |-- package.json                  Dependencies + prisma seed script
    |-- package-lock.json             Lockfile
    |-- tsconfig.json                 TypeScript compiler options
    |-- tsconfig.build.json           Build-specific TS overrides
    |
    |-- prisma/
    |   |-- schema.prisma             Data model: Role enum, User, Genre, Book, Review
    |   +-- seed.ts                   Idempotent seed: 5 genres, 16 books via upsert
    |
    |-- src/
    |   |-- app.module.ts             Root module (imports PrismaModule)
    |   |-- app.controller.ts         Health-check controller
    |   |-- app.controller.spec.ts    Controller unit tests
    |   |-- app.service.ts            Root service
    |   |-- main.ts                   Application bootstrap
    |   +-- prisma/
    |       |-- prisma.module.ts      Exports PrismaService globally
    |       +-- prisma.service.ts     PrismaClient + OnModuleInit lifecycle
    |
    +-- test/
        |-- app.e2e-spec.ts           End-to-end test suite
        +-- jest-e2e.json             E2E test configuration
```

---

## Prerequisites

- Node.js 20.19 or higher
- npm 9 or higher
- A PostgreSQL database (local or hosted, e.g. Neon, Supabase or Railway)

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/JDILEMMAX/library-management-system.git
cd library-management-system
```

### 2. Configure environment

```bash
cp api/.env.example api/.env
```

Open `api/.env` and replace the placeholder with your actual connection string:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

### 3. Install dependencies

```bash
cd api
npm install
```

### 4. Generate the Prisma client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 6. Seed the database

Inserts 5 genres and 16 books idempotently (safe to re-run):

```bash
npx prisma db seed
```

### 7. Start the development server

```bash
npm run start:dev
```

The API is available at `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Full PostgreSQL connection string including credentials and database name |

The `api/.env` file is Git-ignored. Never commit it. Use `api/.env.example` as the source of truth for required variables.

---

## Schema Decisions

### Why `Book` references `Genre` via a foreign key rather than embedding

The schema places genre data in its own `Genre` table and links each `Book` row to it through a `genreId` integer foreign key. This is a deliberate application of Third Normal Form (3NF) normalization. The reasoning follows three axes:

**Avoiding update anomalies**

If genre data were embedded directly inside each book row - as a plain string column or a JSON blob - then correcting a genre name (for example changing "Sci-Fi" to "Science Fiction") would require a bulk update touching every book row that held that value. With a separate `Genre` table, a single `UPDATE genres SET name = 'Science Fiction' WHERE id = 1` propagates the change to all related books instantly, because books hold only the reference (`genreId`), not the data itself.

**Referential integrity**

The foreign key constraint means the database engine guarantees that no `Book` row can reference a `genreId` that does not exist in the `Genre` table. Embedding a genre string provides no such guarantee: two books could store "sci-fi" and "Sci-Fi" and "science fiction" as three separate values with no enforcement that they represent the same concept.

**Indexed relational queries**

Because `genreId` is a typed integer foreign key, PostgreSQL can index it and answer queries like "give me all books in genre 3" via an efficient index scan. Filtering on an embedded string requires a full table scan or a more expensive expression index. Joining `books` to `genres` on an integer key is one of the most optimized operations a relational database performs.

**Contrast with document database embedding**

In a document database such as MongoDB, embedding the genre object inside each book document is a common and often correct pattern. Document stores are optimized for fetching a complete document in one read: if the application almost always needs the genre name together with the book, embedding avoids a join. The tradeoff is that updating the genre name requires a multi-document write. There is no built-in referential integrity. For a library system where genres are shared reference data that changes independently of books, a relational foreign key is the more appropriate model. The normalized design also makes it straightforward to add genre-level metadata (description, parent category, display order) without altering the `Book` table at all.

---

<div align="center">

[Jesse Vincent](https://github.com/JDILEMMAX) - Power Learn Project - Exclusive SE Cohort 2026

</div>
