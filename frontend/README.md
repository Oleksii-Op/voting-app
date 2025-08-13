# Team Voting System - Modern React Frontend

A modern, responsive React application for the Team Voting System built with TypeScript, Tailwind CSS, and cutting-edge web technologies.

## 🚀 Tech Stack

- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better reliability and developer experience
- **Vite** - Next-generation frontend tooling for fast development and building
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Shadcn/UI** - High-quality, accessible UI components built with Radix UI
- **Framer Motion** - Production-ready motion library for React animations
- **React Query (@tanstack/react-query)** - Powerful data fetching and state management
- **React Router** - Declarative routing for single-page applications
- **Axios** - Promise-based HTTP client for API communication

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   │   ├── common/         # Common components (Navigation, QR Code, etc.)
│   │   ├── admin/          # Admin-specific components
│   │   ├── auth/           # Authentication components
│   │   └── voting/         # Voting-related components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   │   ├── api.ts          # API hooks using React Query
│   │   └── use-toast.ts    # Toast notification hook
│   ├── lib/                # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── api/                # API client and configuration
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🎯 Features

### 🔐 Authentication System
- **Token-based registration** with QR code scanning support
- **Cookie-based session management** for persistent authentication
- **Admin API key authentication** for administrative functions
- **Session recovery** with token reset functionality

### 👥 Team Management
- **Join/leave teams** with real-time updates
- **Team creation and management** (admin only)
- **Team member visualization** with avatars
- **Dynamic team statistics** and member counts

### 🗳️ Voting System
- **Interactive voting interface** with team cards
- **Vote casting and rollback** functionality
- **Real-time vote counting** with auto-refresh
- **Voting restrictions** (can't vote for own team, one vote per member)
- **Visual voting progress** with animations

### 📊 Results Dashboard
- **Live voting results** with auto-refresh every 30 seconds
- **Interactive charts and visualizations** with progress bars
- **Team rankings** with medal system (🥇🥈🥉)
- **Export functionality** (CSV download)
- **Comprehensive statistics** (total votes, participation rate, etc.)

### ⚙️ Admin Panel
- **Secure admin authentication** with API key validation
- **Token generation** with QR code creation
- **Member management** (create, update, delete)
- **Team management** (create, update, delete)
- **System statistics** and monitoring
- **Bulk operations** and data management

### 🎨 Modern UI/UX
- **Responsive design** that works on all devices
- **Dark/light theme support** with CSS custom properties
- **Smooth animations** with Framer Motion
- **Accessible components** built with Radix UI
- **Professional color scheme** and typography
- **Loading states and error handling**

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running on port 8000

### Installation

1. **Clone the repository**
```bash
cd voting-app/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Edit .env file
VITE_API_BASE_URL=http://localhost:8000
```

4. **Start development server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:3000
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### API Integration
The frontend communicates with the FastAPI backend through:
- **Base URL**: Configured via environment variable
- **Authentication**: Cookie-based sessions and API key headers
- **Error Handling**: Centralized error processing with user-friendly messages
- **Request/Response**: JSON format with TypeScript type safety

## 📱 Pages Overview

### 🏠 Home Page (`/`)
- Welcome message with system overview
- Live team previews with vote counts
- Feature showcase with step-by-step process
- Call-to-action buttons for registration and voting

### 👤 Registration (`/register`)
- Token-based registration form
- QR code token input support
- Real-time form validation
- Registration process explanation

### 🗳️ Voting Interface (`/vote`)
- User profile management
- Team joining/leaving functionality
- Interactive voting with visual feedback
- Vote rollback capability

### 📊 Results Dashboard (`/results`)
- Live voting results with rankings
- Interactive progress bars and statistics
- Data export functionality (CSV)
- Auto-refresh every 30 seconds

### 👤 Profile Page (`/profile`)
- User profile viewing and editing
- Account status information
- Quick action buttons
- Account deletion (danger zone)

### ⚙️ Admin Panel (`/admin`)
- Secure admin authentication
- Token generation with QR codes
- Team and member management
- System statistics and monitoring

### 🔑 Login Page (`/login`)
- Token-based authentication
- Session recovery functionality
- Help and guidance information

## 🎨 UI Components

### Core Components
- **Button** - Multiple variants (default, outline, destructive, ghost)
- **Card** - Container with header, content, and footer sections
- **Input** - Form input with validation states
- **Toast** - Notification system with different types

### Custom Components
- **QRCodeGenerator** - QR code creation with download/copy functionality
- **Navigation** - Responsive navigation with mobile menu
- **AnimatedLayout** - Page transitions with Framer Motion

## 🔄 State Management

### React Query Integration
- **Caching** - Intelligent caching with automatic invalidation
- **Background Updates** - Seamless data refreshing
- **Error Handling** - Centralized error management
- **Loading States** - Built-in loading state management
- **Optimistic Updates** - Immediate UI feedback

### Custom Hooks
- `useCurrentUser()` - Current user data with auto-refresh
- `useVoteForTeam()` - Vote casting with success/error handling
- `useAdminMembers()` - Admin member management
- `useGenerateToken()` - Token generation for admin

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel/Netlify** - Static hosting with automatic deployments
- **AWS S3 + CloudFront** - Scalable static hosting
- **Docker** - Containerized deployment
- **GitHub Pages** - Free static hosting

### Environment Configuration
- Set `VITE_API_BASE_URL` to your production API endpoint
- Ensure CORS is configured on the backend
- Configure proper cookie settings for HTTPS

## 🔒 Security Features

- **XSS Protection** - Safe DOM manipulation and data rendering
- **CSRF Protection** - Secure cookie configuration
- **Input Validation** - Client-side validation with type safety
- **API Key Security** - Secure handling of admin credentials
- **Content Security Policy** - Ready for CSP implementation

## 🎯 Performance Optimizations

- **Code Splitting** - Automatic route-based code splitting
- **Tree Shaking** - Dead code elimination
- **Asset Optimization** - Optimized images and assets
- **Caching Strategy** - Intelligent data caching with React Query
- **Bundle Analysis** - Webpack bundle analyzer integration

## 🧪 Testing Strategy

### Recommended Testing Stack
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **MSW** - API mocking for tests
- **Cypress** - End-to-end testing

### Testing Areas
- Component rendering and interactions
- API integration and error handling
- User workflows (registration, voting, admin)
- Responsive design and accessibility

## 🌐 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES2020, CSS Grid, Flexbox, CSS Custom Properties

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Implement proper error handling
4. Add JSDoc comments for functions
5. Ensure accessibility compliance
6. Test across different browsers

## 🔮 Future Enhancements

- [ ] **WebSocket Integration** - Real-time updates without polling
- [ ] **PWA Features** - Offline support and app installation
- [ ] **Multi-language Support** - Internationalization (i18n)
- [ ] **Advanced Analytics** - Detailed voting analytics dashboard
- [ ] **Mobile App** - React Native or Capacitor mobile app
- [ ] **Theme Customization** - User-selectable themes
- [ ] **Email Notifications** - Voting reminders and updates
- [ ] **Advanced Charts** - More visualization options

## 📄 License

This project is part of the Team Voting System. Built with modern web technologies for a superior user experience.

---

**Built with ❤️ using React, TypeScript, and modern web technologies**