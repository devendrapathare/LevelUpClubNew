<<<<<<< HEAD
# LevelUp Club

A hybrid web platform combining AI-driven personalized career guidance with a LinkedIn-like professional community.

## Project Structure

```
level-up-club/
├── client/          # React frontend with Tailwind CSS
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React context providers
│   │   ├── services/      # API service files
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Entry point
│   └── vite.config.js     # Vite configuration
└── server/          # Node.js/Express backend
    ├── routes/            # API routes
    ├── services/          # Business logic
    ├── prisma/            # Database schema and client
    ├── index.js           # Server entry point
    └── .env               # Environment variables
```

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (comes with Node.js)
- PostgreSQL database
- Git (optional, for version control)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd level-up-club
```

### 2. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### 3. Database Setup

1. Make sure PostgreSQL is installed and running on your system
2. Create a new database named `levelupclub`:
   ```sql
   CREATE DATABASE levelupclub;
   ```
3. Update the `.env` file with your database credentials (see Environment Variables section below)
4. Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev
   ```

### 4. Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/levelupclub
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5001
```

Replace the placeholders with your actual values:

- `username` and `password`: Your PostgreSQL credentials
- `your_jwt_secret_here`: A secure random string for JWT token generation
- `your_gemini_api_key_here`: Your Gemini API key (for AI career recommendations)

### 5. Frontend Setup

Navigate to the client directory and install dependencies:

```bash
cd ../client
npm install
```

### 6. Running the Application

#### Option 1: Run Both Servers Separately

1. Start the backend server:

   ```bash
   cd ../server
   npm start
   ```

   The backend will be available at: http://localhost:5001

2. Start the frontend development server:
   ```bash
   cd ../client
   npm run dev
   ```
   The frontend will be available at: http://localhost:3002 (or the next available port)

#### Option 2: Run Both Servers with One Command

From the root directory:

```bash
npm run dev
```

This will start both the backend and frontend servers simultaneously.

### 7. Access the Application

1. Open your browser and navigate to the frontend URL (typically http://localhost:3002)
2. Register a new account or log in with existing credentials
3. Explore the various features:
   - Career Assessment
   - Job Marketplace
   - Professional Networking
   - Community Feed
   - Messaging
   - User Profile

## Troubleshooting

### "Page Not Found" Error on Frontend

If you're seeing a "page not found" error when accessing the frontend URL, try these steps:

1. **Check if the frontend server is running**:

   ```bash
   npm run verify
   ```

   This will check if both frontend and backend servers are running.

2. **Verify the index.html file exists**:
   The frontend requires an `index.html` file in the `client` directory. If it's missing, create it:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <link rel="icon" type="image/svg+xml" href="/vite.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>LevelUp Club - Career Guidance Platform</title>
     </head>
     <body>
       <div id="root"></div>
       <script type="module" src="/src/main.jsx"></script>
     </body>
   </html>
   ```

3. **Restart both servers**:
   Sometimes a simple restart fixes the issue:

   ```bash
   # Stop both servers (Ctrl+C)
   npm run dev
   ```

4. **Check for port conflicts**:
   If port 3000 is already in use, Vite will automatically use the next available port. Check the terminal output for the actual URL.

5. **Clear node_modules and reinstall**:
   If the above steps don't work, try clearing dependencies and reinstalling:
   ```bash
   # In both client and server directories
   rm -rf node_modules package-lock.json
   npm install
   ```

### Tailwind CSS Issues

If you're experiencing issues with Tailwind CSS:

1. **Ensure all dependencies are installed**:

   ```bash
   cd client
   npm install -D tailwindcss@latest postcss@latest autoprefixer@latest @tailwindcss/postcss
   ```

2. **Check configuration files**:

   - `tailwind.config.js` should be in the client root directory
   - `postcss.config.js` should reference `@tailwindcss/postcss`

3. **Verify Tailwind is working**:
   Visit the "Tailwind Test" page in the application to verify styling is applied correctly.

### Common Issues

1. **Port already in use**: If you see "Error: listen EADDRINUSE", change the PORT in the .env file to a different port number.

2. **Database connection failed**: Ensure PostgreSQL is running and your DATABASE_URL in the .env file is correct.

3. **Frontend not connecting to backend**: Check that the Vite proxy in `client/vite.config.js` matches your backend port.

### Resetting the Database

If you need to reset your database:

```bash
cd server
npx prisma migrate reset
```

## Project Features

### Authentication

- User registration and login
- JWT-based authentication
- Role-based access control (Student, Professional, Recruiter)

### Career Guidance

- Multi-dimensional career assessment
- AI-powered career recommendations
- Personalized daily tasks

### Professional Networking

- Connection management
- Suggested connections
- Pending requests

### Job Marketplace

- Job browsing and searching
- Job application system
- Personalized job recommendations

### Community Features

- Post creation and sharing
- Like and comment functionality
- Real-time community feed

### Messaging System

- Real-time messaging
- Conversation management
- Unread message tracking

### User Profile

- Profile customization
- Skill management
- Experience and education tracking
- Profile picture upload

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/upload/profile-picture` - Upload profile picture

### Assessments

- `POST /api/assessments/start` - Start a new assessment
- `POST /api/assessments/submit` - Submit assessment answers

### Career Recommendations

- `GET /api/career/recommendations` - Get AI career recommendations

### Connections

- `GET /api/connections` - Get user connections
- `POST /api/connections/request` - Send connection request

### Jobs

- `GET /api/jobs` - Browse jobs
- `POST /api/jobs/apply` - Apply to job

### Community

- `GET /api/posts` - Get community posts
- `POST /api/posts` - Create new post

### Messaging

- `GET /api/messages/conversations` - Get user conversations
- `POST /api/messages/send` - Send a message

## Technologies Used

### Frontend

- React with Vite
- Tailwind CSS for styling
- React Context API for state management

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Gemini AI API

## Development

### Frontend Development

The frontend uses Vite for fast development and hot module replacement.
Tailwind CSS is used for styling with a mobile-first approach.

### Backend Development

The backend uses Express.js with Prisma ORM for database operations.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.
=======
# LevelUpClubNew
a ai based career guidance platform
>>>>>>> 5b333fc557274133f8dcef8a44206300fe29c2f3
