# A2Z Project - Frontend

> **"Improve People Life"** - A comprehensive e-commerce platform built with Next.js 15, React 19, and TypeScript.

## 🚀 Project Overview

A2Z is a modern e-commerce platform designed to provide a seamless shopping experience while promoting sustainability and community growth. The project features a tree-based logo symbolizing life, growth, and environmental consciousness.

### ✨ Features

- **Modern Tech Stack**: Next.js 15, React 19, TypeScript
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Authentication System**: JWT-based auth with refresh tokens
- **Product Management**: Categories, brands, search, and filtering
- **Shopping Cart**: Persistent cart with local storage
- **User Dashboard**: Profile management, order history, favorites
- **API Integration**: RESTful backend integration
- **Performance Optimized**: Code splitting, image optimization

## 🎨 Design System

### Brand Colors
- **Primary**: #88BE46 (Tree Green)
- **Secondary**: #4C9343 (Forest Green)  
- **Accent**: #06B590 (Teal Green)
- **Text**: #241E20 (Dark Charcoal)

### Brand Identity
- **Logo**: A2Z with tree and human silhouettes
- **Slogan**: "Improve People Life"
- **Theme**: Growth, community, sustainability

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + React Query
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT tokens
- **Icons**: Custom SVG icons
- **Fonts**: Geist (Google Fonts)

## 📁 Project Structure

```
project-a2z/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── favorites/         # User wishlist
│   ├── product/           # Product details
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/             # Reusable UI components
├── services/               # API service layer
│   ├── api/               # API client & endpoints
│   ├── auth/              # Authentication services
│   └── products/          # Product services
├── lib/                    # Utility functions
├── types/                  # TypeScript definitions
├── hooks/                  # Custom React hooks
├── styles/                 # Additional CSS
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (default: http://localhost:8000)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-a2z
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file based on `env.example`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=A2Z
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

### Backend API

The frontend expects a RESTful API with the following structure:

- **Base URL**: Configurable via `NEXT_PUBLIC_API_URL`
- **Authentication**: JWT tokens with refresh mechanism
- **Endpoints**: See `services/api/endpoints.ts` for full list

## 🎯 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing (when implemented)
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```

## 🔌 API Integration

### Service Layer

The project includes a comprehensive service layer for backend integration:

- **API Client**: Axios-based with interceptors
- **Authentication**: JWT token management
- **Error Handling**: Centralized error handling
- **Type Safety**: Full TypeScript support

### Example API Call

```typescript
import { authService } from '@/services/auth/authService';

// Login user
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

if (response.success) {
  // Handle successful login
  console.log('User logged in:', response.data.user);
}
```

## 🎨 Styling & Components

### Tailwind CSS

Custom Tailwind configuration with brand colors and utilities:

```typescript
// Custom brand colors
bg-primary-500    // #88BE46
bg-secondary-500  // #4C9343
bg-accent-500    // #06B590
text-text-900     // #241E20
```

### Component Library

Pre-built components with consistent styling:

```tsx
// Button variants
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>
<button className="btn-outline">Outline Button</button>

// Form components
<input className="input-field" placeholder="Enter text..." />
<div className="form-group">
  <label className="form-label">Label</label>
  <input className="input-field" />
</div>
```

## 🔐 Authentication

### Features

- JWT-based authentication
- Automatic token refresh
- Protected routes
- Persistent sessions
- Secure token storage

### Usage

```typescript
import { authService } from '@/services/auth/authService';

// Check authentication status
if (authService.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = authService.getCurrentUser();
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px  
- **Desktop**: 1024px+
- **Large Desktop**: 1280px+

### Mobile-First Approach

All components are designed mobile-first with progressive enhancement for larger screens.

## 🚀 Performance

### Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Component and route lazy loading
- **Caching**: API response caching
- **Bundle Analysis**: Webpack bundle analyzer

### Monitoring

- Core Web Vitals tracking
- Performance metrics monitoring
- Error tracking and reporting

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration testing
- **E2E Tests**: User journey testing
- **Accessibility Tests**: Screen reader and keyboard navigation

### Testing Tools

- Jest (Unit testing)
- React Testing Library (Component testing)
- Cypress (E2E testing)
- MSW (API mocking)

## 📚 Documentation

### Additional Resources

- `PROJECT_STRUCTURE.md` - Detailed project structure
- `CONTRIBUTING.md` - Development guidelines
- `API.md` - API documentation
- `DEPLOYMENT.md` - Deployment instructions

### Key Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use consistent code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- Check the documentation
- Search existing issues
- Create a new issue with detailed information
- Contact the development team

### Common Issues

- **Build errors**: Check Node.js version and dependencies
- **API errors**: Verify backend is running and environment variables
- **Styling issues**: Ensure Tailwind CSS is properly configured

## 🗺️ Roadmap

### Upcoming Features

- [ ] Advanced search and filtering
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] PWA capabilities
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

### Version History

- **v1.0.0** - Initial release with core e-commerce features
- **v1.1.0** - Enhanced authentication and user management
- **v1.2.0** - Advanced product features and search

---

**Built with ❤️ by the A2Z Development Team**

*"Improve People Life"*
