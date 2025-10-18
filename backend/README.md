# Goals Tracker Backend

Backend API for the Goals Tracker application built with Fastify, Prisma, and PostgreSQL.

## Tech Stack

- **Fastify** - Fast and low overhead web framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety

## Prerequisites

- Node.js 18+
- PostgreSQL running locally
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and update with your local PostgreSQL credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/goals?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Replace:**
- `YOUR_USERNAME` - your Postgres username (often `postgres`)
- `YOUR_PASSWORD` - your Postgres password
- `goals` - database name (you can change this)

### 3. Create the Database

First, create the database in PostgreSQL:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE goals;

# Exit psql
\q
```

### 4. Run Prisma Migrations

Generate Prisma Client and create database tables:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push the schema to your database
npm run prisma:push
```

### 5. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

Test it by visiting:
- Health check: `http://localhost:3001/health`
- Test API: `http://localhost:3001/api/test`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:push` - Push schema changes to database (good for dev)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── index.ts          # Application entry point
│   ├── server.ts         # Fastify server setup
│   ├── config.ts         # Configuration
│   └── db.ts             # Prisma client
├── .env                  # Environment variables (create this)
├── .env.example          # Environment template
└── package.json
```

## Database Schema

The app has two main models:

- **Goal** - Stores goal definitions (title, type, target, etc.)
- **WeeklyProgress** - Stores weekly progress for each goal

## Prisma Studio

To view and edit your database with a GUI:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555`

## Troubleshooting

### "Can't reach database server"
- Make sure PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Verify database exists: `psql -U postgres -l`

### "Role does not exist"
- Create the user in PostgreSQL:
  ```sql
  CREATE USER your_username WITH PASSWORD 'your_password';
  ALTER USER your_username CREATEDB;
  ```

### Port already in use
- Change PORT in `.env` to a different number (e.g., 3002)

## Next Steps

Ready to implement the API endpoints! The structure is set up and ready for:
- `/api/goals` - CRUD operations for goals
- `/api/goals/:id/progress` - Track weekly progress
- Authentication (if needed later)
