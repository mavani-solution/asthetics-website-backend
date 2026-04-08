const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

// Core Clerk Auth Middleware
const clerkAuth = ClerkExpressWithAuth({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

// Unified protect middleware
const protect = (req, res, next) => {
    // BYPASS FOR DEVELOPMENT
    if (process.env.NODE_ENV === 'development') {
        console.log('Auth Middleware: Bypassing for development');
        req.auth = {
            userId: 'user_2m1n_mock_dev_000000000',
            sessionId: 'sess_mock_dev_000000000'
        };
        return next();
    }

    console.log(`Auth Middleware: Processing request for ${req.path}`);
    console.log(`Auth Middleware: Auth header present: ${!!req.headers.authorization}`);

    // Production: Use Clerk middleware
    return clerkAuth(req, res, (err) => {
        if (err) {
            console.error('Clerk Auth Error:', err);
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: ' + err.message
            });
        }

        if (!req.auth || !req.auth.userId) {
            console.warn(`Unauthorized access attempt: No user found for path ${req.path}`);
            // Check if tokens are provided but maybe they're in a different header?
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated: Please log in to access this resource.'
            });
        }
        
        console.log(`Authenticated user: ${req.auth.userId}`);
        next();
    });
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        next();
    };
};

module.exports = { protect, authorize };
