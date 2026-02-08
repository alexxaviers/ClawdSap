# ClawdSap

A full-stack application built with a modern web stack.

## Project Structure

```
├── frontend/   # Next.js web application (React 19, Tailwind CSS)
├── backend/    # Flask API server
├── run.sh      # Starts both frontend and backend
└── README.md
```

## Frontend

The frontend is a [Next.js](https://nextjs.org/) app using:

- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **Radix UI** component primitives
- **Recharts** for data visualization
- **React Hook Form** + **Zod** for form handling and validation

### Getting Started

```bash
cd frontend
pnpm install
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Backend

The backend is a [Flask](https://flask.palletsprojects.com/) API server.

### Setup

```bash
cd backend
./setup.sh
```

This creates a Python virtual environment and installs dependencies.

### Endpoints

- `GET /api/health` — returns `{"status": "ok"}`

## Running the Full Stack

```bash
./run.sh
```

This will:
- Create the backend venv and install dependencies (if needed)
- Start the Flask backend on [http://localhost:5000](http://localhost:5000)
- Start the Next.js frontend on [http://localhost:3000](http://localhost:3000)
- Clean up both processes on Ctrl+C
