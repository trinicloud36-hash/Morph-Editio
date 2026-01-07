# GitHub Actions Workflows

## Overview

This repository uses GitHub Actions for continuous integration and deployment. All workflows are automatically triggered based on repository events.

## Workflows

### 1. CI - Build and Test (`ci.yml`)
**Triggers**: Push to main/develop, Pull Requests

**What it does**:
- Installs dependencies
- Runs ESLint for code style
- Performs TypeScript type checking
- Builds the application for production
- Tests on Node.js 18.x and 20.x
- Uploads build artifacts

**Branch Protection**: ✅ Required to pass

### 2. Type Check (`typecheck.yml`)
**Triggers**: Changes to src/, websockets/, or tsconfig.json

**What it does**:
- Fast TypeScript validation
- Reports type errors immediately
- Validates on every change

**Branch Protection**: ✅ Required to pass

### 3. Code Quality (`quality.yml`)
**Triggers**: Push to main, Pull Requests

**What it does**:
- Security audit (npm audit)
- Code formatting check (Prettier)
- ESLint analysis
- Bundle size reporting
- Generates quality report

**Branch Protection**: ⚠️ Non-blocking

### 4. Deploy to Production (`deploy.yml`)
**Triggers**: Push to main, Manual workflow dispatch

**What it does**:
- Builds the production bundle
- Creates deployment artifacts
- Preserves artifacts for 30 days
- Generates GitHub releases for tags
- Sends deployment notifications

**Environment**: Production

## Workflow Status

View real-time status and logs at:
https://github.com/trinicloud36-hash/Morph-Editio/actions

## Configuration

### Required Status Checks
These workflows **must pass** before merging:
- ✅ CI - Build and Test
- ✅ Type Check

### Optional Checks
These provide information but don't block merging:
- ⚠️ Code Quality

## Local Pre-commit

Run these locally before pushing:

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

## Artifacts

Build artifacts are available in:
- GitHub Actions Artifacts (5-30 days)
- GitHub Releases (tagged releases)

Download from: https://github.com/trinicloud36-hash/Morph-Editio/actions

## Troubleshooting

### Build Failed
1. Check the workflow logs
2. Run `npm ci` locally
3. Run `npm run build` to reproduce

### Type Errors
1. Run `npx tsc --noEmit` locally
2. Fix TypeScript errors
3. Push changes

### Deployment Issues
1. Check deploy.yml logs
2. Verify production requirements
3. Check branch protection settings

## Environment Variables

Currently using defaults. To add secrets:
1. Go to Settings → Secrets and variables → Actions
2. Add new secret
3. Update workflow files to reference secret: `${{ secrets.SECRET_NAME }}`

## Adding New Workflows

To add a new workflow:
1. Create `.github/workflows/new-workflow.yml`
2. Define triggers and jobs
3. Test locally with act (optional)
4. Commit and push

## Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Workflow Syntax](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)
