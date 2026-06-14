# College Marketplace

A full-stack college marketplace application scaffolded as a monorepo.

The original project was a static HTML/CSS/JavaScript app that used localStorage.
This version prepares the app for a MongoDB-backed Express API and a Vite React
frontend.

## Project Structure

```text
college-marketplace/
  backend/
    controllers/
    middleware/
    models/
    routes/
    .env.example
    package.json
    server.js
  frontend/
    src/
      api/
      components/
      context/
      pages/
      App.jsx
      main.jsx
      styles.css
    index.html
    package.json
  README.md
```

## Backend

The backend is a Node.js and Express API server with MongoDB support through
Mongoose.

Included dependencies:

- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- multer
- cloudinary

Health check route:

```text
GET /api/health
```

## Frontend

The frontend is a Vite React app shell using React Router.

Included dependencies:

- react
- react-dom
- react-router-dom
- axios
- vite

## Getting Started

Install dependencies separately in each app:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Set `CLIENT_URL` in `backend/.env` to the frontend dev server URL, usually:

```text
http://localhost:5173
```
