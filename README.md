# Aesthetic Institute of India - Admin Backend

Full Express.js backend setup for the Aesthetic Institute of India admin panel.

## Features
- **JWT Authentication**: Secure login and registration.
- **Role-based Access Control**: Admin and Sub-admin roles.
- **Environment Configuration**: using `dotenv`.
- **Database Integration**: MongoDB with Mongoose.
- **Security**: Helmet, CORS, and Express-compliant middleware.
- **Error Handling**: Global error handling with Mongoose integration.
- **Developer Experience**: Nodemon for automatic server restarts.

## Prerequisites
- Node.js installed.
- MongoDB running (locally or on Atlas).

## Getting Started

1.  **Clone the repository** (if you haven't already).
2.  **Environment Setup**:
    Update the `.env` file with your credentials:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/aesthetic_india
    JWT_SECRET=your_super_secret_jwt_key
    NODE_ENV=development
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Run in development mode**:
    ```bash
    npm run dev
    ```
5.  **Run in production mode**:
    ```bash
    npm start
    ```

## Project Structure
```text
backend/
├── index.js             # Entry point
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── src/
    ├── config/          # Database & other configs
    ├── controllers/     # API logic
    ├── middleware/      # Auth & Error middlewares
    ├── models/          # Data schemas (Mongoose)
    ├── routes/          # API endpoints
    └── utils/           # Helper functions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` (Register an admin)
- `POST /api/auth/login` (Login and receive token)
- `GET /api/auth/me` (Get current user profile - **Protected**)

### Status
- `GET /status` (Server status check)
