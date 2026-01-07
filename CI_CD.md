# CI/CD Status

[![CI - Build and Test](https://github.com/trinicloud36-hash/Morph-Editio/actions/workflows/ci.yml/badge.svg)](https://github.com/trinicloud36-hash/Morph-Editio/actions/workflows/ci.yml)
[![Type Check](https://github.com/trinicloud36-hash/Morph-Editio/actions/workflows/typecheck.yml/badge.svg)](https://github.com/trinicloud36-hash/Morph-Editio/actions/workflows/typecheck.yml)
[![Code Quality](https://github.com/trinicloud36-hash/Morph-Editio/actions/workflows/quality.yml/badge.svg)](https://github.com/trinicloud36-hash/Morph-Editio/actions/workflows/quality.yml)
[![Deploy to Production](https://github.com/trinicloud36-hash/Morph-Editio/actions/workflows/deploy.yml/badge.svg)](https://github.com/trinicloud36-hash/Morph-Editio/actions/workflows/deploy.yml)

## GitHub Actions Workflows

### Workflows Included

#### 1. **CI - Build and Test** (`ci.yml`)
- ✅ Runs on push to main/develop and pull requests
- ✅ Tests on Node.js 18.x and 20.x
- ✅ ESLint code linting
- ✅ TypeScript type checking
- ✅ Production build verification
- ✅ Build artifact upload

#### 2. **Type Check** (`typecheck.yml`)
- ✅ TypeScript validation on source changes
- ✅ Fast feedback on type errors
- ✅ Runs only when src or config changes

#### 3. **Code Quality** (`quality.yml`)
- ✅ NPM security audit
- ✅ Code formatting check (Prettier)
- ✅ ESLint analysis
- ✅ Bundle size reporting

#### 4. **Deploy to Production** (`deploy.yml`)
- ✅ Automated deployment on push to main
- ✅ Build artifact creation and storage
- ✅ Release generation for tagged commits
- ✅ 30-day artifact retention

## Features

### Automated Checks
- **Type Safety**: Full TypeScript compilation
- **Code Quality**: ESLint, Prettier, dependency audits
- **Build Verification**: Production build testing
- **Multi-version Testing**: Node 18 and 20

### Notifications
- ✅ GitHub status checks on PRs
- ✅ Detailed build logs
- ✅ Artifact preservation for deployments
- ✅ Automatic release creation

### Configuration

All workflows respect:
- Branch protection rules
- Pull request requirements
- Commit status checks
- Environment variables

## View Workflow Status

Visit the [Actions tab](https://github.com/trinicloud36-hash/Morph-Editio/actions) to see:
- Real-time build status
- Workflow run history
- Detailed logs
- Artifact downloads

## Local Testing

Run workflows locally with:
```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```
