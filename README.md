# Civic Admin Portal

A comprehensive admin web application for managing civic issue reports. Built with React, TypeScript, Tailwind CSS, and Leaflet maps for municipal staff to efficiently handle citizen-submitted service requests.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time overview with key metrics and interactive map
- **Ticket Management**: Complete CRUD operations with filtering and search
- **Interactive Maps**: Leaflet-powered maps with custom markers and clustering
- **Real-time Updates**: Socket.IO integration for live notifications
- **Role-based Access**: Support for Super Admin, Admin, Worker, and Viewer roles
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices

### Key Components
- **Authentication**: OTP-based login system with JWT tokens
- **Status Tracking**: Complete ticket lifecycle management
- **Assignment System**: Assign tickets to departments and workers
- **SLA Management**: Track resolution times and overdue tickets
- **Analytics**: Performance metrics and reporting
- **File Upload**: Support for before/after photos

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom color scheme
- **Maps**: Leaflet + React-Leaflet + OpenStreetMap
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.IO client
- **Routing**: React Router DOM
- **UI Components**: Headless UI + Heroicons
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Backend API** running on port 3000 (see API section)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd civic-admin-portal
npm install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# VITE_API_URL=http://localhost:3000/api
```

### 3. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, Topbar)
│   ├── map/             # Map-related components
│   ├── tickets/         # Ticket management components
│   └── shared/          # Reusable UI components
├── pages/               # Main page components
├── services/            # API and Socket.IO services
├── store/               # Context providers and state
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
└── assets/              # Static assets
```

## 🔌 API Integration

### Required Backend Endpoints

```typescript
// Authentication
POST /auth/login         // Send OTP
POST /auth/verify-otp    // Verify OTP and get token
GET  /auth/me           // Get current user

// Tickets
GET    /api/tickets      // List tickets with filters
GET    /api/tickets/:id  // Get ticket details
POST   /api/tickets/:id/assign   // Assign ticket
PATCH  /api/tickets/:id/status   // Update status
POST   /api/tickets/:id/comments // Add comment

// Workers
GET   /api/workers       // List workers
PATCH /api/workers/:id/status    // Update worker status

// Analytics
GET /api/analytics/sla   // SLA metrics
GET /api/analytics/top-hotspots  // Hotspot data
```

### WebSocket Events

```typescript
// Server -> Client
'ticket.created'   // New ticket notification
'ticket.updated'   // Ticket status change
'ticket.assigned'  // Ticket assignment
'worker.status'    // Worker status change
```

## 🎨 Customization

### Color Scheme

The app uses a custom Tailwind color palette:

- **Primary**: Blue tones for main actions
- **Secondary**: Gray tones for text and backgrounds  
- **Success**: Green for completed/resolved states
- **Warning**: Orange for pending/attention states
- **Danger**: Red for urgent/error states

### Map Configuration

Default map center is set to Gorakhpur coordinates. Update in:

```typescript
// src/components/map/LeafletMap.tsx
center = [26.7606, 83.3732] // [latitude, longitude]
```

## 🔐 Authentication & Roles

### User Roles

- **Super Admin**: Full system access, user management
- **Admin**: Ticket management, assignment, analytics
- **Worker**: View assigned tickets, update progress
- **Viewer**: Read-only access to tickets and reports

### Login Flow

1. Enter phone number or email
2. Receive OTP (handled by backend)
3. Verify OTP to get JWT token
4. Token stored in localStorage
5. Automatic login on subsequent visits

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation, multi-column layouts
- **Tablet**: Collapsible sidebar, optimized grid layouts  
- **Mobile**: Bottom navigation, single-column layouts

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: React and TypeScript rules
- **Tailwind**: Utility-first CSS approach
- **Component Structure**: Functional components with hooks

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the dist/ folder to your hosting provider
```

### Environment Variables

Set these in your deployment environment:

```bash
VITE_API_URL=https://your-api-domain.com/api
```

## 🐛 Troubleshooting

### Common Issues

1. **Maps not loading**: Check if Leaflet CSS is imported
2. **API errors**: Verify backend is running and CORS is configured
3. **Socket connection fails**: Ensure WebSocket support on hosting
4. **Build fails**: Clear node_modules and reinstall

### Performance Tips

- Use React.memo for expensive components
- Implement virtual scrolling for large ticket lists
- Optimize map markers with clustering
- Use lazy loading for images

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**Civic Admin Portal v1.0** - Built for efficient municipal service management.
