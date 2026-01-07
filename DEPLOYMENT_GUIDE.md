# Morph-Editio Deployment Guide

## What's Included
This bundle contains a production-ready Next.js application with:
- Pre-built Next.js application (`.next/` folder)
- All source code (src, websockets, components)
- Configuration files (tsconfig, postcss, eslint, etc.)
- Fixed project structure with proper path aliases

## System Requirements
- **Node.js** 18.17+ or **Bun** 1.0+
- **npm** or **yarn** (included with Node.js)

## Installation & Deployment

### Option 1: Using Node.js (Recommended)

```bash
# Extract the bundle
tar -xzf Morph-Editio-FIXED.tar.gz
cd Morph-Editio

# Install dependencies
npm install

# Run the production server
NODE_ENV=production npm start
```

The app will be available at `http://localhost:3000`

### Option 2: Using Bun (Faster Alternative)

```bash
# Install Bun if not already installed
curl -fsSL https://bun.sh/install | bash

# Extract and navigate
tar -xzf Morph-Editio-FIXED.tar.gz
cd Morph-Editio

# Install dependencies with Bun
bun install

# Run the production server
bun .next/standalone/server.js
```

### Option 3: Docker

```bash
# Build Docker image
docker build -t morph-editio .

# Run container
docker run -p 3000:3000 morph-editio
```

## What Was Fixed

✅ **Project Structure**
- Renamed `scr/` to `src/` (corrected typo)
- Moved components from `src/app/api/compontens/` to `src/components/ui/`
- Created `src/lib/utils.ts` with `cn()` utility function

✅ **Path Aliases**
- Fixed TypeScript path aliases in `tsconfig.json`
- All `@/lib/utils` imports now resolve correctly
- All `@/components/ui/*` imports now work

✅ **Build Status**
- Production build compiles successfully
- Zero TypeScript errors
- All component modules properly exported

## Environment Setup

If you need database configuration, create a `.env.local` file:

```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production
```

## Build for Production (Optional)

If you need to rebuild:

```bash
npm install
npm run build
NODE_ENV=production npm start
```

## Troubleshooting

### Port Already in Use
```bash
PORT=3001 npm start
```

### Database Issues
```bash
npm run db:push      # Initialize database
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
```

### Module Not Found Errors
All imports use the `@/` alias which maps to `./src/`. Ensure files are in the correct locations:
- Components: `src/components/ui/`
- Utilities: `src/lib/`
- Hooks: `src/hooks/`

## Performance Notes

- The `.next/standalone` folder contains all necessary production files
- Static assets are pre-optimized
- WebSocket support enabled for real-time features
- Suitable for deployment on Node.js servers or serverless platforms

---

**Bundle created**: January 7, 2026
**Fixed**: Project structure, path aliases, TypeScript errors
**Status**: ✅ Production-ready
