# Team Voting System - Frontend

A modern, responsive web interface for the Team Voting System built with vanilla HTML, CSS, and JavaScript.

## Features

### 🏠 Home Page (`index.html`)
- Welcome message and system overview
- Live team preview with vote counts
- How-it-works section with step-by-step guide
- Responsive hero section with call-to-action buttons

### 👤 Member Registration (`register.html`)
- Token-based registration system
- Real-time form validation
- QR code support for token input
- User-friendly error messages
- Automatic redirect after successful registration

### 🗳️ Voting Interface (`vote.html`)
- User profile management (view, edit, delete)
- Team joining/leaving functionality
- Interactive voting interface with restrictions
- Vote rollback capability
- Real-time status updates
- Token-based login recovery

### 📊 Results Dashboard (`results.html`)
- Live voting results with auto-refresh
- Interactive charts (bar chart and pie chart)
- Detailed results table with rankings
- Team performance cards
- Data export functionality (CSV)
- Real-time statistics

### ⚙️ Admin Panel (`admin.html`)
- Admin authentication with API key
- Token generation with QR codes
- Team management (CRUD operations)
- Member management (CRUD operations)
- Bulk operations and data management
- Modal-based editing interface

## Technical Architecture

### 🎨 Frontend Stack
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid/Flexbox, custom properties
- **Vanilla JavaScript**: ES6+ with async/await, modular code
- **Chart.js**: Interactive data visualization
- **Font Awesome**: Icon library

### 🔧 Key Components

#### API Client (`js/api.js`)
- Centralized API communication
- Error handling and retry logic
- Authentication management
- Request/response interceptors
- TypeScript-style JSDoc comments

#### Main Application (`js/main.js`)
- Global application initialization
- Common utilities and helpers
- Event handling and state management
- Notification system
- Mobile responsiveness

#### Styling (`css/styles.css`)
- CSS custom properties for theming
- Responsive design with mobile-first approach
- Component-based architecture
- Smooth transitions and animations
- Dark/light theme ready

## Page Structure

```
frontend/
├── index.html          # Home page
├── register.html       # Member registration
├── vote.html          # Voting interface
├── results.html       # Results dashboard
├── admin.html         # Admin panel
├── css/
│   └── styles.css     # Main stylesheet
├── js/
│   ├── api.js         # API client
│   └── main.js        # Main application logic
├── images/            # Image assets
└── README.md          # This file
```

## API Integration

The frontend communicates with the FastAPI backend through RESTful endpoints:

### Public Endpoints
- `GET /v1/teams` - List all teams
- `GET /v1/teams/{id}/users` - Get team members
- `GET /v1/voting/count` - Get voting results

### User Endpoints (Cookie Auth)
- `GET /v1/users/me` - Get current user
- `PATCH /v1/users/me` - Update profile
- `DELETE /v1/users/me` - Delete account
- `POST /v1/users/join/{team_id}` - Join team
- `POST /v1/users/leave/` - Leave team
- `POST /v1/voting/{team_id}` - Cast vote
- `POST /v1/voting/rollback/` - Remove vote

### Admin Endpoints (API Key Auth)
- `GET /v1/token` - Generate registration token
- `GET /v1/admin/members` - List all members
- `POST /v1/admin/member` - Create member
- `PATCH /v1/admin/member/{id}` - Update member
- `DELETE /v1/admin/member/{id}` - Delete member
- `POST /v1/teams` - Create team
- `PATCH /v1/teams/{id}` - Update team
- `DELETE /v1/teams/{id}` - Delete team

## Features Breakdown

### 🔐 Authentication System
- Cookie-based session management
- Token-based registration
- Admin API key authentication
- Automatic token cleanup
- Session recovery with token reset

### 🎯 Voting Logic
- Prevent self-voting (can't vote for own team)
- One vote per member
- Vote rollback functionality
- Real-time vote counting
- Anonymous voting results

### 👥 Team Management
- Dynamic team creation
- Avatar support with fallback
- Member count tracking
- Team statistics
- Bulk operations

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Adaptive layouts
- Progressive enhancement
- Accessibility compliance

### 🔄 Real-time Updates
- Auto-refresh voting results
- Live team statistics
- WebSocket ready architecture
- Page visibility handling
- Background synchronization

## User Workflows

### New Member Registration
1. Admin generates registration token
2. Token shared via QR code or URL
3. Member accesses registration page
4. Fills form with token, name, username
5. Account created with authentication cookie
6. Redirected to voting interface

### Voting Process
1. Member logs in (or uses existing session)
2. Views available teams
3. Optionally joins a team
4. Casts vote for different team
5. Can change vote using rollback
6. Views real-time results

### Admin Management
1. Admin logs in with API key
2. Generates tokens for new members
3. Manages teams and members
4. Monitors system statistics
5. Performs data operations

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: ES6+ features (async/await, destructuring, modules)
- **CSS**: Grid, Flexbox, Custom Properties, CSS3 animations
- **APIs**: Fetch API, Clipboard API, Notification API

## Performance Optimizations

- Lazy loading of non-critical resources
- Debounced API calls
- Efficient DOM manipulation
- CSS-only animations where possible
- Minimal JavaScript bundle size
- Optimized image loading

## Security Considerations

- XSS protection with safe DOM manipulation
- CSRF protection via cookie settings
- Input validation and sanitization
- Secure API key handling
- No sensitive data in localStorage
- Content Security Policy ready

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Progressive Web App (PWA) features
- [ ] Dark theme toggle
- [ ] Multi-language support
- [ ] Advanced charts and analytics
- [ ] Bulk import/export functionality
- [ ] Email notifications
- [ ] Mobile app using WebView

## Development Notes

### Code Style
- Consistent naming conventions
- Comprehensive error handling
- Modular architecture
- Extensive documentation
- Type hints via JSDoc

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API calls
- End-to-end tests for user workflows
- Cross-browser compatibility testing
- Accessibility testing

### Deployment
- Static file serving
- CDN-ready assets
- Environment configuration
- Build optimization
- Cache management

## Contributing

1. Follow the existing code style
2. Add JSDoc comments for functions
3. Test across different browsers
4. Ensure accessibility compliance
5. Update documentation as needed

## License

This frontend is part of the Team Voting System project.