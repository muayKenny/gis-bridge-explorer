# GIS Bridge Explorer

An interactive web application for visualizing and exploring the National Bridge Inventory (NBI) dataset, focusing on Pennsylvania's bridge infrastructure.

## Project Overview

This application provides an interactive interface to explore bridge data from the National Bridge Inventory, featuring:

- 3D visualization of bridge locations using Cesium.js
- Filtering and search capabilities
- Detailed bridge information display
- Geographic analysis tools

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- React
- Cesium.js for 3D visualization
- Tailwind CSS for styling
- shadcn/ui for UI components

### Backend

- Node.js
- PostgreSQL with PostGIS for spatial data
- Prisma as ORM
- tRPC for type-safe API communication

### Development Environment

- Turborepo for monorepo management
- Docker for database containerization
- TypeScript
- PNPM as package manager

## Prerequisites

- Node.js 18+
- PNPM
- Docker Desktop
- PostgreSQL with PostGIS (handled via Docker)

## Getting Started

1. Clone the repository:

```bash
git clone
cd gis-bridge-explorer
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the database and create the schema:

```bash
pnpm db:up              # Start PostgreSQL container
pnpm db:generate        # Generate Prisma client
pnpm db:push           # Push schema to database
pnpm db:seed           # Seed the database with bridge data
```

4. Start the development server:

```bash
pnpm dev               # Starts both frontend and backend
```

The application will be available at `http://localhost:3000`

## Data Source

This project uses the National Bridge Inventory (NBI) dataset from the Federal Highway Administration (FHWA), specifically focusing on Pennsylvania's bridge data. The dataset includes detailed information about bridge locations, conditions, and attributes.

Source: [FHWA NBI Data](https://www.fhwa.dot.gov/bridge/nbi/ascii2022.cfm)

Currently the seed script is hard coded to load the [Delimited Pennsylvania file](https://www.fhwa.dot.gov/bridge/nbi/2022/delimited/PA22.txt) which is located at packages/database/data/PA22.txt

## Project Structure

```
gis-bridge-explorer/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Backend API
├── packages/
│   ├── database/         # Prisma + PostGIS setup
│   └── shared/           # Shared types and utilities
├── docker-compose.yml    # Database container config
└── turbo.json           # Turborepo config
```

## Environment Variables

Required environment variables:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=bridges
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/bridges"
```

## License

MIT

## Acknowledgments

- National Bridge Inventory (NBI) data provided by the Federal Highway Administration
- Built using the Mach9 infrastructure visualization framework
