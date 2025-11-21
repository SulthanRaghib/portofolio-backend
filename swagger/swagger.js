const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Portfolio Backend API',
            version: '1.0.0',
            description: 'RESTful API untuk manajemen portfolio projects dan certifications dengan autentikasi JWT',
            contact: {
                name: 'Sulthan Raghib Fillah',
                email: 'sulthan.raghib09@gmail.com',
                url: 'https://github.com/SulthanRaghib'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: process.env.BASE_URL || 'http://localhost:5000',
                description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Masukkan JWT token yang didapat dari endpoint /api/auth/login'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com'
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe',
                            nullable: true
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                Project: {
                    type: 'object',
                    required: ['title', 'descriptionEn', 'descriptionId', 'technologies', 'image'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        title: {
                            type: 'string',
                            example: 'E-Commerce Platform'
                        },
                        descriptionEn: {
                            type: 'string',
                            example: 'A full-stack e-commerce platform built with MERN stack'
                        },
                        descriptionId: {
                            type: 'string',
                            example: 'Platform e-commerce full-stack yang dibangun dengan MERN stack'
                        },
                        image: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://res.cloudinary.com/demo/image/upload/v1234567890/portfolio-projects/project.jpg'
                        },
                        technologies: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['React', 'Node.js', 'MongoDB', 'Express']
                        },
                        demoUrl: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://demo.example.com',
                            nullable: true
                        },
                        githubUrl: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://github.com/username/repo',
                            nullable: true
                        },
                        featured: {
                            type: 'boolean',
                            example: true,
                            default: false
                        },
                        order: {
                            type: 'integer',
                            example: 1,
                            default: 0
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                Certification: {
                    type: 'object',
                    required: ['title', 'issuer', 'issuedAt', 'image'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        title: {
                            type: 'string',
                            example: 'AWS Certified Solutions Architect'
                        },
                        issuer: {
                            type: 'string',
                            example: 'Amazon Web Services'
                        },
                        issuedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        expirationAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2027-01-01T00:00:00.000Z',
                            nullable: true
                        },
                        credentialUrl: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://www.credly.com/badges/xxxxx',
                            nullable: true
                        },
                        credentialId: {
                            type: 'string',
                            example: 'ABC123XYZ',
                            nullable: true
                        },
                        skills: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['AWS', 'Cloud Architecture', 'DevOps']
                        },
                        image: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://res.cloudinary.com/demo/image/upload/v1234567890/portfolio-projects/cert.pdf'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z'
                        }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        currentPage: {
                            type: 'integer',
                            example: 1
                        },
                        totalPages: {
                            type: 'integer',
                            example: 5
                        },
                        totalItems: {
                            type: 'integer',
                            example: 50
                        },
                        itemsPerPage: {
                            type: 'integer',
                            example: 10
                        },
                        hasNextPage: {
                            type: 'boolean',
                            example: true
                        },
                        hasPrevPage: {
                            type: 'boolean',
                            example: false
                        },
                        nextPage: {
                            type: 'integer',
                            example: 2,
                            nullable: true
                        },
                        prevPage: {
                            type: 'integer',
                            example: null,
                            nullable: true
                        }
                    }
                },
                PaginatedLinks: {
                    type: 'object',
                    properties: {
                        self: {
                            type: 'string',
                            format: 'uri',
                            example: 'http://localhost:5000/api/projects?page=1&limit=10'
                        },
                        first: {
                            type: 'string',
                            format: 'uri',
                            example: 'http://localhost:5000/api/projects?page=1&limit=10'
                        },
                        last: {
                            type: 'string',
                            format: 'uri',
                            example: 'http://localhost:5000/api/projects?page=5&limit=10'
                        },
                        next: {
                            type: 'string',
                            format: 'uri',
                            example: 'http://localhost:5000/api/projects?page=2&limit=10',
                            nullable: true
                        },
                        prev: {
                            type: 'string',
                            format: 'uri',
                            example: null,
                            nullable: true
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Error message here'
                        },
                        errors: {
                            type: 'object',
                            additionalProperties: true,
                            example: { field: 'Field error message' }
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'admin@example.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'password123'
                        }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: {
                            type: 'string',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Token tidak valid atau tidak diberikan',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                message: 'Authentication required'
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource tidak ditemukan',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                message: 'Resource not found'
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Input validation error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                message: 'Validation Error',
                                errors: {
                                    title: 'Title is required',
                                    email: 'Invalid email format'
                                }
                            }
                        }
                    }
                },
                ServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                message: 'Internal server error'
                            }
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Auth',
                description: 'Endpoint untuk autentikasi dan manajemen user'
            },
            {
                name: 'Projects',
                description: 'CRUD operations untuk portfolio projects'
            },
            {
                name: 'Certifications',
                description: 'CRUD operations untuk certifications'
            },
            {
                name: 'Health',
                description: 'Health check dan monitoring endpoints'
            }
        ]
    },
    apis: ['./swagger/paths/*.js'] // Path ke file dokumentasi endpoints
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
