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
app.use(cors({
    origin: true, // Echoes back the request origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

// Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/conference-data', require('./src/routes/conferenceDataRoutes'));
app.use('/api/courses', require('./src/routes/courseRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
app.use('/api/testimonials', require('./src/routes/testimonialRoutes'));
app.use('/api/blogs', require('./src/routes/blogRoutes'));
app.use('/api/hero', require('./src/routes/heroRoutes'));
app.use('/api/inquiries', require('./src/routes/inquiryRoutes'));

// Basic status route
app.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        env: process.env.NODE_ENV,
        clerkConfigured: !!process.env.CLERK_SECRET_KEY
    });
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
    console.log(`Clerk Publishable Key set: ${!!process.env.CLERK_PUBLISHABLE_KEY}`);
    console.log(`Clerk Secret Key set: ${!!process.env.CLERK_SECRET_KEY}`);
});
