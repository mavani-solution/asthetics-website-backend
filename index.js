const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Security Headers
// NOTE: helmet might restrict image rendering from same origin if not configured perfectly, specially cross-origin header, but standard helmet is usually fine for GET requests. For static assets we cross origin config later if need.
app.use(helmet({ crossOriginResourcePolicy: false }));

// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/conference-data', require('./src/routes/conferenceDataRoutes'));
app.use('/api/courses', require('./src/routes/courseRoutes'));

// Basic status route
app.get('/status', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
    res.send('Aesthetic Institute of India Backend API is running...');
});

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
