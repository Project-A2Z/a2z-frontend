# 🚀 A2Z E-Commerce Platform

> **"Improve People Life"** - A full-featured e-commerce platform emphasizing growth, community, and sustainability.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Project Overview

A2Z is a comprehensive e-commerce platform designed to provide a seamless, enjoyable shopping experience with advanced product management, payment processing, and user engagement features. The platform emphasizes growth, community, and sustainability, reflected in its tree-based logo symbolizing life and environmental responsibility.

## ✨ Key Features

### 🛠️ Modern Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 (mobile-first)
- **State Management**: React Context API + React Query
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT-based with refresh tokens
- **Icons**: Custom SVG icon set
- **Fonts**: Geist (Google Fonts)

### 🛍️ Core E-Commerce Features

#### Product Display & Categorization
- Alphabetical sorting (A-Z)
- Category-based grouping
- Advanced filtering by name, category, and attributes
- Integrated search bar for quick navigation

#### Product Detail Pages
- Complete product description & specifications
- High-quality image gallery
- Customer reviews and ratings (stars/points)

#### Shopping Cart
- Add/remove products easily
- Adjust quantities dynamically
- Real-time total price calculation
- Persistent cart via local storage

#### Checkout & Payment
- Shipping address and contact form
- Payment options: online payment or cash on delivery (with optional deposit)
- Order summary and confirmation

#### Favorites
- Save products for later review or purchase

#### Order Tracking
- Real-time order status updates
- Stages: Under Review → Preparing → Shipped → Delivered

#### User Profile
- Personal details management
- Order history (past & current)
- Account settings and profile editing

#### Account Management
- Sign up with email verification
- Sign in with session persistence
- Password reset process

#### Contact & Support
- Direct contact form
- Email support
- Technical help and FAQs

### 👨‍💼 Admin Panel Features
- Revenue statistics with tables and charts (monthly/yearly reports)
- Expense tracking with analytics
- Profit monitoring and performance indicators
- Customer statistics and growth trends
- Employee performance tracking
- Employee account management (add/edit roles)
- Full product management (add, update, categorize, adjust prices/quantities)
- Transaction management
- Review moderation (approve, reply, delete)
- Order management and shipping coordination

### 👷 Employee Panel Features
- Restricted permissions for daily store operations
- Product management (add/update images, prices, quantities)
- Transaction oversight and payment status updates
- Review handling and customer responses
- Customer message management
- Order preparation, shipping, and delivery tracking

## 🎨 Design System

### Brand Colors
- **Primary**: #88BE46 (Tree Green)
- **Secondary**: #4C9343 (Forest Green)
- **Accent**: #06B590 (Teal Green)
- **Text**: #241E20 (Dark Charcoal)

### Brand Identity
- **Logo**: "A2Z" with tree + human silhouettes
- **Slogan**: "Improve People Life"
- **Theme**: Growth, community, sustainability

## 📁 Project Structure

```
project-a2z/
├── app/               # Next.js App Router
│   ├── (auth)/        # Authentication pages
│   ├── cart/          # Cart page
│   ├── checkout/      # Checkout process
│   ├── favorites/     # Favorites list
│   ├── product/       # Product details
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Homepage
├── components/        # Reusable UI components
├── services/          # API service layer
│   ├── api/           # API client
│   ├── auth/          # Auth services
│   └── products/      # Product services
├── lib/               # Utility functions
├── types/             # TypeScript types
├── hooks/             # Custom hooks
├── styles/            # Global styles
├── public/            # Static assets
└── docs/              # Documentation
```

## ⚙️ Configuration

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=A2Z
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running (default: http://localhost:8000)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd project-a2z

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Open your browser
```
http://localhost:3000
```

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

## 🛠️ Development Workflow

### Sprints

#### UI/UX (from 6 Aug 2025)
- **Week 1**: Web Auth, Admin Auth, Home, Notification
- **Week 2**: Product, Cart, Favorites, Checkout, Profile
- **Week 3**: Stats, Manage Products, Comments, Orders, Support, Sales

#### Frontend (from 13 Aug 2025)
- **Week 1**: Auth Pages, Home, Notifications
- **Week 2**: Product, Profile, Cart, Checkout, Favorites

#### Backend (from 6 Aug 2025)
- **Week 1**: DB Design, Auth API, Product API, Notifications API, Support API
- **Week 2**: Cart API, Payment API, Comment API, Stats API, Operations API

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

## 🚀 Performance & Testing

### Performance Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Component and route lazy loading
- **Caching**: API response caching
- **Bundle Analysis**: Webpack bundle analyzer

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration testing
- **E2E Tests**: User journey testing
- **Accessibility Tests**: Screen reader and keyboard navigation

### Testing Tools
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Cypress** - E2E testing
- **MSW** - API mocking

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- ARIA labels and semantic HTML
- Color contrast compliance

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
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
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

*"Improve People Life"* 🌱
