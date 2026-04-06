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
        req.auth = {
            userId: 'user_2m1n_mock_dev_000000000',
            sessionId: 'sess_mock_dev_000000000'
        };
        return next();
    }

    // Production: Use Clerk middleware
    return clerkAuth(req, res, () => {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated: Please log in to access this resource.'
            });
        }
        next();
    });
};

// Grant access to specific roles (Clerk roles/permissions can be checked here if needed)
// For now, any authenticated user is allowed since it's an admin-only app
const authorize = (...roles) => {
    return (req, res, next) => {
        // Clerk session info is available in req.auth
        // If you use Clerk organizations/roles, you can check them here
        next();
    };
};

module.exports = { protect, authorize };
