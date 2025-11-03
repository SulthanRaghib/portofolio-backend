# 🚀 Portfolio Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748.svg)](https://www.prisma.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20Hosting-FFDD00.svg)](https://cloudinary.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)

A professional REST API backend for managing portfolio projects with authentication, built with Node.js, Express, Prisma, PostgreSQL (Supabase) and Cloudinary for image storage.

## ✨ Features

- 🔐 **JWT Authentication** - Secure login system
- 📁 **Project Management** - Full CRUD operations for portfolio projects
- 📄 **Pagination** - Professional pagination with metadata and links
- 🔍 **Search & Filter** - Search projects by title, description, or technologies
- 📊 **Sorting** - Flexible sorting options for projects
- 🌐 **Multi-language Support** - English & Indonesian descriptions
- 🖼️ **Image Upload** - Cloudinary integration for optimized image hosting
- 🔒 **Protected Routes** - Role-based access control
- 🗄️ **PostgreSQL Database** - Supabase-hosted with Prisma ORM
- ⚡ **Rate Limiting** - API protection against abuse
- 🛡️ **Security Headers** - Helmet.js for enhanced security

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Image Storage:** Cloudinary
- **File Upload:** Multer
- **Security:** Helmet, CORS, bcryptjs

## 📋 Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Supabase account
- Cloudinary account

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd portfolio-backend
npm install
```

### 2. Environment Setup

Create `.env` file in root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (Supabase)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:[PASSWORD]@xxx.pooler.supabase.com:5432/postgres"

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed admin user
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin"
  }
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Projects

#### Get All Projects (Public)

```http
GET /api/projects
GET /api/projects?page=1&limit=10
GET /api/projects?featured=true
GET /api/projects?search=react
GET /api/projects?sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)
- `featured` - Filter featured projects (true/false)
- `search` - Search in title, description, or technologies
- `sortBy` - Sort field (title, createdAt, updatedAt, order, featured)
- `sortOrder` - Sort direction (asc/desc)

**Response:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  },
  "links": {
    "self": "http://localhost:5000/api/projects?page=1&limit=10",
    "first": "http://localhost:5000/api/projects?page=1&limit=10",
    "last": "http://localhost:5000/api/projects?page=5&limit=10",
    "next": "http://localhost:5000/api/projects?page=2&limit=10",
    "prev": null
  }
}
```

#### Get Single Project (Public)

```http
GET /api/projects/:id
```

#### Create Project (Protected)

```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- title: string (required)
- descriptionEn: string (required)
- descriptionId: string (required)
- technologies: ["React","Node.js"] or React,Node.js (required)
- demoUrl: string (optional)
- githubUrl: string (optional)
- featured: boolean (optional, default: false)
- order: number (optional, default: 0)
- image: file (required)
```

#### Update Project (Protected)

```http
PUT /api/projects/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data: (all optional)
- title, descriptionEn, descriptionId
- technologies, demoUrl, githubUrl
- featured, order, image
```

#### Delete Project (Protected)

```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

## 📁 Project Structure

```
portfolio-backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Prisma client
│   │   └── cloudinary.js     # Cloudinary setup
│   ├── controllers/
│   │   ├── authController.js
│   │   └── projectController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   ├── upload.js         # File upload config
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── projectRoutes.js
│   ├── utils/
│   │   ├── validation.js     # Input validation
│   │   └── pagination.js     # Pagination utilities
│   └── index.js              # App entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.js               # Database seeder
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🗄️ Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Project Model

```prisma
model Project {
  id            String   @id @default(uuid())
  title         String
  descriptionEn String   @db.Text
  descriptionId String   @db.Text
  image         String
  technologies  String[]
  demoUrl       String?
  githubUrl     String?
  featured      Boolean  @default(false)
  order         Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Rate limiting (100 req/15min)
- ✅ Input validation & sanitization
- ✅ File upload restrictions (5MB, images only)

## 🧪 Testing

### Using Postman/Thunder Client

1. **Login** to get JWT token
2. Copy the `token` from response
3. Add `Authorization: Bearer <token>` header for protected routes
4. Use `form-data` for file uploads

### Example: Create Project with curl

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Project" \
  -F "descriptionEn=English description" \
  -F "descriptionId=Deskripsi Indonesia" \
  -F "technologies=[\"React\",\"Node.js\"]" \
  -F "featured=true" \
  -F "image=@/path/to/image.jpg"
```

## 📦 Available Scripts

```bash
npm run dev       # Start development server with nodemon
npm start         # Start production server
npm run seed      # Seed admin user to database
npx prisma studio # Open Prisma Studio (database GUI)
npx prisma migrate dev # Run database migrations
```

## 🚢 Deployment

### Environment Variables

Ensure all production values are set:

- Strong `JWT_SECRET`
- Production database URLs
- Cloudinary credentials
- Change `NODE_ENV=production`

### Recommended Platforms

- **Vercel** - Serverless deployment
- **Railway** - Full-stack hosting
- **Render** - Free tier available
- **Heroku** - Classic PaaS

<!-- ## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request -->

## 👨‍💻 Author

**Sulthan Raghib Fillah**

- Email: sulthan.raghib09@gmail.com
- GitHub: [@SulthanRaghib](https://github.com/SulthanRaghib)

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Supabase](https://supabase.com/)
- [Cloudinary](https://cloudinary.com/)

---

Made with ❤️ for Portfolio Management
