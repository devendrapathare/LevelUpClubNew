# LevelUp Club Setup Instructions

## Prerequisites

1. Node.js (v14 or higher)
2. PostgreSQL database
3. Gemini API key

## Database Setup

1. Install PostgreSQL on your system
2. Create a new database named `levelup_db`
3. Update the `DATABASE_URL` in `server/.env` with your database credentials

Example DATABASE_URL:

```
postgresql://username:password@localhost:5432/levelup_db
```

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/levelup_db

# JWT Secret Key for Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Configuration
PORT=5000
NODE_ENV=development

# Gemini API Configuration for AI Career Guidance
GEMINI_API_KEY=your_gemini_api_key_here

# Security & Privacy
SESSION_SECRET=your_session_secret_here
```

## Installation

1. Install root dependencies:

   ```bash
   npm install
   ```

2. Install server dependencies:

   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

## Database Migration

Run the following command to set up the database schema:

```bash
cd ../server
npx prisma migrate dev --name init
```

## Running the Application

### Development Mode

To run both the server and client in development mode:

```bash
cd ..
npm run dev
```

This will start:

- Server on http://localhost:5000
- Client on http://localhost:3000

### Running Server Only

```bash
cd server
npm run dev
```

### Running Client Only

```bash
cd client
npm run dev
```

## Building for Production

To build both the server and client for production:

```bash
npm run build
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

## Testing

To run tests:

```bash
npm test
```
