# GearUp - Camping Gear Packing Application

GearUp helps you pack for camping trips quickly and without stress. Create gear lists, organize by category, and never forget essential items.

## 🎯 Features

- ✅ **User Authentication** - Secure sign-up and sign-in with Clerk
- ✅ **Personal Gear Lists** - Create and manage your own gear lists
- ✅ **Trip Planning** - Associate gear lists with specific trips
- ✅ **Gear Catalog** - Comprehensive database of camping gear
- ✅ **Category Organization** - Items grouped by category
- ✅ **Pack Tracking** - Mark items as packed
- ✅ **Responsive Design** - Works on mobile and desktop

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Clerk account (free tier available)
- Convex account (free tier available)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/GearUp.git
   cd GearUp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up authentication**

   Follow our [Quick Start Auth Guide](docs/QUICK_START_AUTH.md) (takes ~10 minutes)

   Or see the [Complete Authentication Setup](docs/AUTHENTICATION_SETUP.md)

4. **Run the development server**

   ```bash
   # Terminal 1: Start Convex
   npx convex dev

   # Terminal 2: Start Vite
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://localhost:5173](http://localhost:5173)

## 📚 Documentation

- **[Quick Start Auth Guide](docs/QUICK_START_AUTH.md)** - Get authentication working in 10 minutes
- **[Authentication Setup](docs/AUTHENTICATION_SETUP.md)** - Complete authentication documentation
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - What was implemented
- **[Technical Specification](docs/specs/AUTHENTICATION_SPEC.md)** - Detailed auth spec

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router 7** - Client-side routing
- **Clerk** - Authentication

### Backend

- **Convex** - Backend platform (database, API, real-time)
- **TypeScript** - Backend functions

## 🏗️ Project Structure

```
GearUp/
├── src/                        # Frontend source code
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   ├── signInPage.tsx
│   │   │   ├── signUpPage.tsx
│   │   │   ├── protectedRoute.tsx
│   │   │   └── authButton.tsx
│   │   ├── gearListForm.tsx   # Gear list form
│   │   ├── gearListPage.tsx   # Gear list page
│   │   └── header.tsx         # Header with auth
│   ├── api/                   # API utilities
│   ├── main.tsx              # App entry point
│   └── App.tsx               # Root component
├── convex/                    # Backend functions
│   ├── lib/
│   │   └── auth.ts           # Auth helpers
│   ├── schema.ts             # Database schema
│   ├── users.ts              # User management
│   ├── trips.ts              # Trip management
│   ├── gearLists.ts          # Gear list management
│   ├── gear.ts               # Gear catalog
│   └── auth.config.ts        # Auth configuration
├── docs/                      # Documentation
│   ├── QUICK_START_AUTH.md
│   ├── AUTHENTICATION_SETUP.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── specs/
│       └── AUTHENTICATION_SPEC.md
└── package.json
```

## 🔐 Authentication

GearUp uses **Clerk** for authentication and **Convex** for data management.

### Features

- Email/password authentication
- OAuth (Google, GitHub) - optional
- Secure session management
- User-scoped data isolation
- Automatic user creation

### Routes

- `/` - Public home page
- `/sign-in` - Sign-in page
- `/sign-up` - Sign-up page
- `/gear-list` - Protected gear list page (requires auth)

### Data Model

- **Users** - Synced from Clerk
- **Trips** - User-specific trips
- **Gear Lists** - User-specific lists
- **Gear List Items** - Items in lists
- **Gear** - Global catalog (shared)

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npx convex dev          # Start Convex in dev mode

# Build
npm run build           # Build for production

# Lint
npm run lint            # Run ESLint

# Other
npm run seed            # Seed gear catalog
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

See `.env.example` for template.

## 🚧 Current Status

### ✅ Implemented

- User authentication (sign-up, sign-in, sign-out)
- Protected routes
- User profile display
- Backend API for users, trips, and gear lists
- Database schema with user isolation
- Security and authorization

### ⏳ In Progress

- Gear list integration with authenticated backend
- Trip management UI
- Data migration from local storage

### 📋 Planned

- Profile management page
- Multiple gear lists per user
- Trip-specific gear lists
- Import/export functionality
- Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Authentication Issues

See the [Quick Start Guide](docs/QUICK_START_AUTH.md#troubleshooting) for common issues.

### Build Errors

```bash
# Clear Convex cache
npx convex dev --reset

# Clear npm cache
rm -rf node_modules package-lock.json
npm install

# Regenerate types
npx convex dev
```

### TypeScript Errors

Make sure Convex is running (`npx convex dev`) to generate types.

## 📞 Support

- **Documentation:** See `docs/` directory
- **Clerk Support:** [clerk.com/support](https://clerk.com/support)
- **Convex Support:** [docs.convex.dev](https://docs.convex.dev)

## 🙏 Acknowledgments

- Built with [Clerk](https://clerk.com) for authentication
- Powered by [Convex](https://convex.dev) for backend
- UI with [Tailwind CSS](https://tailwindcss.com)

---

**Made with ❤️ for campers who want to pack quickly and stress-free!**
