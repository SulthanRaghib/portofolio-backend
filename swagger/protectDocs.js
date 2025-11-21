const rateLimit = require('express-rate-limit');

/**
 * Basic Authentication Middleware for Swagger Docs
 * Melindungi /api-docs dengan username & password di production
 */
const basicAuth = (req, res, next) => {
    // Skip basic auth di development
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.set('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
        return res.status(401).json({
            message: 'Authentication required to access API documentation'
        });
    }

    try {
        // Decode Base64 credentials
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');

        const validUsername = process.env.SWAGGER_USERNAME || 'admin';
        const validPassword = process.env.SWAGGER_PASSWORD || 'swagger123';

        if (username === validUsername && password === validPassword) {
            return next();
        }

        res.set('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
        return res.status(401).json({
            message: 'Invalid credentials'
        });
    } catch (error) {
        res.set('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
        return res.status(401).json({
            message: 'Invalid authentication format'
        });
    }
};

/**
 * Rate Limiter untuk Swagger Docs
 * Membatasi akses ke dokumentasi untuk menghindari abuse
 */
const docsRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: process.env.NODE_ENV === 'production' ? 30 : 100, // Production: 30 req/15min, Dev: 100 req/15min
    message: {
        message: 'Too many requests to API documentation. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Custom Swagger UI Options
 * Disable "Try it out" di production untuk keamanan
 */
const getSwaggerUiOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        customCss: `
      .swagger-ui .topbar { display: none }
      ${isProduction ? `
        .swagger-ui .try-out, 
        .swagger-ui .btn.try-out__btn,
        .swagger-ui .auth-wrapper,
        .swagger-ui .authorization__btn {
          display: none !important;
        }
        .swagger-ui .info {
          margin-top: 20px;
        }
        .swagger-ui .info::before {
          content: "⚠️ Interactive features disabled in production";
          display: block;
          padding: 10px;
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffc107;
          border-radius: 4px;
          margin-bottom: 20px;
          font-weight: bold;
        }
      ` : ''}
    `,
        customSiteTitle: 'Portfolio API Documentation',
        customfavIcon: '/favicon.ico',
        swaggerOptions: {
            persistAuthorization: !isProduction, // Jangan persist auth di production
            displayRequestDuration: true,
            filter: true,
            tryItOutEnabled: !isProduction, // Disable try-it-out di production
            requestInterceptor: isProduction ? (req) => {
                // Di production, block semua request execution
                console.warn('Request execution is disabled in production');
                return null;
            } : undefined,
        }
    };
};

module.exports = {
    basicAuth,
    docsRateLimiter,
    getSwaggerUiOptions
};
