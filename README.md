# ratio1-drive

A Next.js application for decentralized file management with Docker support, built on the Ratio1 Edge Network.

## Features

- **Decentralized File Storage**: Upload and manage files on the Ratio1 Edge Network
- **Real-time Status Monitoring**: Monitor CStore and R1FS service status
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Docker Support**: Containerized deployment with environment configuration
- **TypeScript**: Full type safety throughout the application

## Current Version

**v0.4.1** - Latest stable release

## GitHub Actions Workflows

This repository includes three GitHub Actions workflows:

### 1. CI (Main Workflow)

Orchestrates the entire CI/CD pipeline, including version checking and Docker builds.

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

### 2. Version Check

Automatically checks if the version in `package.json` was incremented and creates a tag if it was, or fails if it wasn't.

**Behavior:**
- ✅ If version was incremented: Creates and pushes a tag (e.g., `v0.4.1`)
- ❌ If version was not incremented: Fails the workflow with clear error message

### 3. Docker Build and Push

Automatically builds and pushes Docker images to `tvitalii/ratio1-drive` on Docker Hub.

**Setup Required:**

To enable the Docker build workflow, you need to add the following secrets to your GitHub repository:

1. Go to your repository settings → Secrets and variables → Actions
2. Add the following secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_TOKEN`: Your Docker Hub personal access token

**Triggers:**
- Called by CI workflow when version is incremented

**Image Tags:**
The workflow automatically creates tags based on:
- Latest tag for the most recent version
- Multi-platform support (linux/amd64, linux/arm64)

## Running the Container

The container expects API URLs to be passed as environment variables when starting:

```bash
docker run -p 3333:3333 \
  -e EE_CHAINSTORE_API_URL=http://host.docker.internal:8001 \
  -e EE_R1FS_API_URL=http://host.docker.internal:8002 \
  -e CSTORE_HKEY=ratio1-drive-demo-1 \
  tvitalii/ratio1-drive:latest
```

### Environment Variables

- `EE_CHAINSTORE_API_URL`: URL for the CStore API service (default: `http://localhost:30000`)
- `EE_R1FS_API_URL`: URL for the R1FS API service (default: `http://localhost:30001`)
- `CSTORE_HKEY`: Hash key for CStore operations (default: `ratio1-drive-test`)
- `NODE_ENV`: Node.js environment (default: `production`)
- `NEXT_TELEMETRY_DISABLED`: Disable Next.js telemetry (default: `1`)
- `MAX_FILE_SIZE_MB`: Maximum file size in MB (default: `10`)
- `DEBUG`: Enable debug logging (default: `false`)

## Docker Compose

For local development with Docker Compose:

```bash
docker-compose up -d
```

This will start the application on port 3333 with the default environment configuration.

## Local Development

```bash
npm install
npm run dev
```

The development server will start on port 3333.

## Building Locally

```bash
docker build -t ratio1-drive .
docker run -p 3333:3333 ratio1-drive
```

## API Integration

The application integrates with the Ratio1 Edge Network using the `@ratio1/edge-node-client` SDK:

- **CStore API**: For metadata storage and file indexing
- **R1FS API**: For file upload/download operations

## Project Structure

```
ratio1-drive/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── file/[cid]/        # File detail pages
│   └── page.tsx           # Main application page
├── components/             # React components
├── lib/                    # Shared libraries
│   ├── api-client.ts      # API client implementation
│   ├── config.ts          # Configuration management
│   ├── contexts/          # React contexts
│   └── services/          # Service layer
├── mock-services/          # Mock services for development
└── Dockerfile             # Container configuration
```

## Technologies Used

- **Next.js 15.4.4**: React framework with App Router
- **React 19.1.0**: UI library
- **TypeScript 5.8.3**: Type safety
- **Tailwind CSS 4.1.11**: Styling
- **ratio1-edge-node-client 1.0.0**: Ratio1 Edge Network SDK
- **Docker**: Containerization
- **GitHub Actions**: CI/CD automation
