# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Setup
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env to configure VITE_API_URL (defaults to http://localhost:3000/api)
```

### Testing & Validation
```bash
# Type checking
npx tsc --noEmit

# Lint specific files/directories
npx eslint src/

# Format code (if prettier is added)
npx prettier --write src/
```

## Architecture Overview

### Frontend Stack
- **React 19** with TypeScript in strict mode
- **Vite** as build tool and dev server
- **Tailwind CSS v4** with custom color palette defined in CSS (primary/secondary/success/warning/danger)
- **React Router DOM v7** for client-side routing
- **Axios** for HTTP client with interceptors for auth tokens
- **Socket.IO Client** for real-time updates
- **Leaflet + React-Leaflet** for interactive maps
- **Headless UI + Heroicons** for accessible UI components

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Layout, Sidebar, Topbar)
│   ├── map/            # Map-related components (LeafletMap)
│   ├── shared/         # Shared UI components (StatusBadge, LoadingSpinner)
│   └── tickets/        # Ticket management components
├── pages/              # Route-level page components
├── services/           # External service integrations
│   ├── api.ts         # Centralized API service with axios
│   └── socket.ts      # Socket.IO service for real-time features
├── store/             # State management
│   └── AuthContext.tsx # Authentication context provider
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
├── hooks/             # Custom React hooks
└── assets/            # Static assets
```

### Authentication Architecture
- **OTP-based authentication** via phone/email
- **JWT token storage** in localStorage with automatic injection via axios interceptors
- **Role-based access control** with 4 roles: `super_admin`, `admin`, `worker`, `viewer`
- **Automatic token refresh** and redirect to login on 401 errors
- **Socket.IO authentication** using the same JWT token

### API Integration Patterns
- **Centralized API service** (`src/services/api.ts`) using axios with:
  - Automatic Bearer token injection
  - Base URL from environment variables
  - Response/request interceptors for error handling
- **TypeScript interfaces** for all API responses and request payloads
- **Consistent error handling** with automatic logout on authentication failures

### Real-time Features
- **Socket.IO integration** for live updates on:
  - `ticket.created` - New ticket notifications
  - `ticket.updated` - Status changes
  - `ticket.assigned` - Assignment notifications  
  - `worker.status` - Worker status updates
- **Connection management** tied to authentication state
- **Room-based subscriptions** for targeted updates

### Routing Architecture
- **Protected routes** requiring authentication with loading states
- **Public routes** with automatic redirect if already authenticated
- **Nested routing** under Layout component for authenticated pages
- **Route-based code splitting** ready (components are placeholder-ready for lazy loading)

### Map Integration
- **Leaflet-based mapping** with React-Leaflet components
- **Custom markers** and clustering support for ticket visualization
- **Hotspot analysis** with bbox-based API calls
- **Default center** set to Gorakhpur coordinates [26.7606, 83.3732]

## Development Patterns

### Component Patterns
- **Functional components** with hooks (no class components)
- **TypeScript strict mode** with comprehensive type definitions
- **Context-based state management** for authentication
- **Custom hooks** for reusable stateful logic
- **Consistent prop typing** with interfaces in `types/index.ts`

### Styling Conventions
- **Tailwind utility-first** approach with custom color palette defined in CSS using `@theme`
- **Responsive design** with mobile-first breakpoints
- **Custom animations** defined using CSS keyframes
- **Semantic color usage**: primary (blue), secondary (gray), success (green), warning (orange), danger (red)
- **Tailwind v4 configuration**: Colors and theme defined in `src/index.css` using CSS custom properties

### API Conventions
- **RESTful endpoints** following `/api/resource` pattern
- **Bulk operations** supported for tickets (assign, status update)
- **Pagination** with `page`, `limit`, and `total` in responses
- **Filtering** through query parameters with TypeScript interfaces

### Error Handling
- **Global error boundaries** for component error handling
- **API error interception** with automatic token management
- **User-friendly error messages** in UI components
- **Console logging** for development debugging

## Backend Dependencies

This frontend requires a compatible backend API running on port 3000 (configurable via VITE_API_URL) with:

### Required Endpoints
- `POST /auth/login` - Send OTP
- `POST /auth/verify-otp` - Verify OTP and get JWT
- `GET /auth/me` - Get current user profile  
- `GET /api/tickets` - List tickets with filtering
- `GET /api/tickets/:id` - Get ticket details
- `POST /api/tickets/:id/assign` - Assign ticket to worker/department
- `PATCH /api/tickets/:id/status` - Update ticket status
- `GET /api/workers` - List workers
- `GET /api/departments` - List departments
- `GET /api/analytics/sla` - Get SLA metrics
- `GET /api/analytics/top-hotspots` - Get hotspot data

### WebSocket Support
Backend must support Socket.IO with JWT authentication for real-time features.

## Environment Variables

### Required
- `VITE_API_URL` - Backend API base URL (defaults to http://localhost:3000/api)

### Optional
- `NODE_ENV` - Environment (development/production)
- `VITE_MAPBOX_TOKEN` - MapBox token for enhanced maps (currently using OpenStreetMap)

## Key Files to Modify

### Adding New Routes
1. Add route component in `src/pages/`
2. Update `src/App.tsx` routing configuration
3. Add navigation items to `src/components/layout/Sidebar.tsx`

### Adding New API Endpoints
1. Add method to `src/services/api.ts`
2. Add TypeScript types to `src/types/index.ts` 
3. Update API service instantiation if needed

### Extending Socket Events
1. Add event type to `SocketEvents` interface in `src/types/index.ts`
2. Add event handlers in `src/services/socket.ts`
3. Connect event listeners in relevant components

### Custom Styling
- Extend color palette in `src/index.css` using `@theme` directive and CSS custom properties
- Add custom animations and keyframes in CSS
- Use existing semantic color classes for consistency
- **Important**: This project uses Tailwind CSS v4 - configuration is done in CSS files, not JS config files
