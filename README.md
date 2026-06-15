# College Marketplace

College Marketplace is a full-stack campus buying and selling platform for students. It includes a React frontend, an Express API, MongoDB persistence, JWT authentication, marketplace listings, wishlists, recommendation logic, and admin/manager moderation dashboards.

## Features

- User registration and login with JWT authentication
- Role-based access for users, managers, and admins
- Marketplace item browsing, search, filters, sorting, and detail pages
- Authenticated item creation, editing, and deletion
- Wishlist support
- Similar item recommendations using TF-IDF and cosine similarity on tags
- Admin dashboard for stats, users, roles, and item management
- Manager dashboard for approving, rejecting, and marking listings as sold
- Render-ready deployment setup for backend and frontend

## Tech Stack

Frontend:

- React
- Vite
- React Router
- Axios
- Tailwind CSS

Backend:

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv
- multer
- cloudinary

## Project Structure

```text
college-marketplace/
  backend/
    middleware/
    models/
    routes/
    Dockerfile
    .env.example
    package.json
    server.js
  frontend/
    public/
      _redirects
    src/
      api/
      components/
      context/
      pages/
    .env.example
    package.json
  package.json
  README.md
```

## Local Setup

Install all dependencies:

```bash
npm run install:all
```

Create backend environment file:

```bash
cd backend
cp .env.example .env
```

Create frontend environment file:

```bash
cd frontend
cp .env.example .env
```

Run the backend:

```bash
npm run dev:backend
```

Run the frontend in a second terminal:

```bash
npm run dev:frontend
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Backend Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college-marketplace
JWT_SECRET=replace_with_a_secure_secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

For Render, set `CLIENT_URL` to your deployed frontend URL, for example:

```env
CLIENT_URL=https://college-marketplace-frontend.onrender.com
```

## Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

For Render, set it to your deployed backend API URL:

```env
VITE_API_URL=https://college-marketplace-backend.onrender.com
```

## Render Deployment

### Backend Web Service

1. Create a new Render Web Service.
2. Connect the GitHub repository.
3. Set the root directory to `backend`.
4. Use Node or Docker deployment. The included `backend/Dockerfile` is ready for Docker.
5. If using Node directly:
   - Build command: `npm install`
   - Start command: `npm start`
6. Add the backend environment variables from the backend section.
7. Deploy and confirm `/api/health` returns a success response.

### Frontend Static Site

1. Create a new Render Static Site.
2. Connect the same GitHub repository.
3. Set the root directory to `frontend`.
4. Build command: `npm install && npm run build`
5. Publish directory: `dist`
6. Add `VITE_API_URL` with the deployed backend URL.
7. Deploy the frontend.

The file `frontend/public/_redirects` is included so React Router routes work after refreshes on Render static hosting.

## CORS

The backend accepts requests from:

- `http://localhost:5173`
- The deployed frontend URL configured in `CLIENT_URL`

This allows local development and Render deployment to use the same server code.
