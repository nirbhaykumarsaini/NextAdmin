# NextAdmin - Comprehensive Authentication System

A modern, secure, and scalable authentication system built with Next.js 15, TypeScript, Prisma, Redis, and comprehensive security features.

## 🚀 Features

- ✅ **Complete Authentication System** - Signup, signin, logout, token refresh
- ✅ **JWT-based Security** - Access and refresh tokens with automatic renewal
- ✅ **Password Security** - Strong password requirements with bcrypt hashing
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Session Management** - Comprehensive session tracking and management
- ✅ **Redis Caching** - High-performance caching and session storage
- ✅ **Input Validation** - Zod-based schema validation
- ✅ **TypeScript Support** - Full type safety throughout the application
- ✅ **Responsive UI** - Modern React components with Tailwind CSS
- ✅ **Error Handling** - Comprehensive error handling and user feedback
- ✅ **Database Integration** - Prisma ORM with PostgreSQL
- ✅ **Health Monitoring** - System health checks and monitoring

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (with Prisma dev server)
- **Caching:** Redis with ioredis
- **Authentication:** JWT with jsonwebtoken
- **Validation:** Zod schemas
- **UI Components:** shadcn/ui, Radix UI
- **Security:** bcryptjs, rate-limiter-flexible
- **Development:** ESLint, TypeScript

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+
- npm or yarn
- PostgreSQL (or use Prisma dev server)
- Redis server (optional, for caching)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd nextadmin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment variables and configure them:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database (Prisma dev server URL is already configured)
DATABASE_URL="prisma+postgres://localhost:51213/..."

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-this-in-production"
JWT_REFRESH_EXPIRES_IN="30d"

# Redis Configuration (optional)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# Security
BCRYPT_ROUNDS="12"
SESSION_TIMEOUT="86400000"
```

### 4. Database Setup

Start the Prisma development server:

```bash
npx prisma dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev --name init
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📖 Documentation

- [Authentication System Documentation](docs/AUTHENTICATION.md) - Comprehensive guide to the authentication system
- [API Documentation](docs/API.md) - Complete API reference with examples

## 🔐 Authentication Flow

1. **User Registration** - Users can create accounts with email/password
2. **Email Validation** - Strong password requirements and email format validation
3. **Secure Login** - JWT-based authentication with rate limiting
4. **Token Management** - Automatic token refresh and secure storage
5. **Session Tracking** - Comprehensive session management with device tracking
6. **Secure Logout** - Token invalidation and session cleanup

## 🛡️ Security Features

- **Password Security:** bcrypt hashing with configurable rounds
- **Rate Limiting:** Protection against brute force attacks
- **JWT Security:** Secure token generation with blacklisting
- **Input Validation:** Comprehensive validation with Zod schemas
- **Session Management:** Secure session tracking and cleanup
- **CORS Protection:** Proper CORS configuration
- **Error Handling:** Secure error messages without information leakage

## 📱 Usage Examples

### Frontend Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, signin, signup, logout, isAuthenticated } = useAuth()

  const handleSignin = async () => {
    const result = await signin('user@example.com', 'password')
    if (result.success) {
      // Redirect to dashboard
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.firstName}!</p>
      ) : (
        <button onClick={handleSignin}>Sign In</button>
      )}
    </div>
  )
}
```

### API Usage

```javascript
// Signup
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    acceptTerms: true
  })
})

const data = await response.json()
```

## 🧪 Testing

The system includes comprehensive test utilities:

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring

### Health Check

Check system health at: `GET /api/health`

```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy" }
  }
}
```

### Rate Limiting

Monitor rate limiting through response headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## 🚀 Deployment

### Environment Variables for Production

Ensure these are set in production:

```env
NODE_ENV="production"
JWT_SECRET="your-production-jwt-secret"
JWT_REFRESH_SECRET="your-production-refresh-secret"
DATABASE_URL="your-production-database-url"
REDIS_URL="your-production-redis-url"
```

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secrets
- [ ] Configure proper CORS
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Database backups
- [ ] Rate limiting configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Review the [API reference](docs/API.md)
- Check system health at `/api/health`

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





my-next-app/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── (auth)/             # Route group (doesn't affect URL)
│   │   ├── (marketing)/        # Another route group
│   │   ├── about/
│   │   │   └── page.js         # About page
│   │   ├── blog/
│   │   │   ├── [slug]/
│   │   │   │   └── page.js     # Dynamic blog post page
│   │   │   └── page.js         # Blog index page
│   │   ├── dashboard/
│   │   │   └── page.js         # Dashboard page (protected)
│   │   ├── layout.js           # Root layout
│   │   └── page.js             # Home page
│   │
│   ├── pages/                  # Pages Router (legacy, if used)
│   │   ├── _app.js             # Custom App component
│   │   ├── _document.js        # Custom Document component
│   │   ├── api/                # API routes
│   │   │   └── hello.js
│   │   ├── index.js            # Home page
│   │   └── blog/
│   │       ├── [slug].js       # Dynamic blog post page
│   │       └── index.js        # Blog index page
│   │
│   ├── components/             # Reusable components
│   │   ├── ui/                 # UI components (buttons, cards, etc.)
│   │   ├── layout/             # Layout components
│   │   └── shared/            # Shared components
│   │
│   ├── lib/                    # Utility functions/libs
│   ├── hooks/                  # Custom React hooks
│   ├── styles/                 # Global/styles
│   │   ├── globals.css         # Global CSS
│   │   └── theme.js            # Theme configuration
│   │
│   ├── constants/              # Application constants
│   ├── contexts/               # React contexts
│   ├── providers/              # Context providers
│   ├── store/                  # State management (Redux, Zustand, etc.)
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   └── assets/                 # Static assets (images, fonts, etc.)
│       ├── images/
│       └── fonts/
│
├── public/                     # Static files (favicon, robots.txt, etc.)
│   ├── favicon.ico
│   └── images/                 # Publicly accessible images
│
├── .env.local                  # Environment variables
├── .eslintrc.js                # ESLint config
├── .gitignore                  # Git ignore rules
├── next.config.js              # Next.js config
├── package.json                # Project dependencies
└── README.md                   # Project documentation