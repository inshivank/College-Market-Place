# College Marketplace

College Marketplace is a full-stack campus buying and selling platform that enables students to buy, sell, and discover second-hand items within their college community. The platform features secure authentication, personalized recommendations, wishlists, role-based moderation, and an intuitive dashboard for administrators and managers.

---

## Features

- User registration and login using JWT authentication
- Role-based access (User, Manager, Admin)
- Browse marketplace listings with search, filters, and sorting
- View detailed product pages
- Create, edit, and delete listings
- Wishlist functionality
- TF-IDF and Cosine Similarity based item recommendations
- Manager dashboard for approving, rejecting, and marking listings as sold
- Admin dashboard for user management, roles, marketplace statistics, and listing moderation
- Image uploads using Cloudinary
- MongoDB database integration
- Render-ready deployment configuration

---

# Tech Stack

## Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Multer
- Cloudinary
- dotenv
- CORS

---

# Project Structure

```text
college-marketplace/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── _redirects
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── .env.example
│   └── package.json
│
├── package.json
└── README.md
```

---

# Prerequisites

Before running the project, make sure you have the following installed:

- Node.js (v18 or later recommended)
- npm
- MongoDB Atlas account (or a local MongoDB instance)
- Cloudinary account

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/college-marketplace.git
```

## 2. Navigate to the Project

```bash
cd college-marketplace
```

## 3. Install Dependencies

Install dependencies for both frontend and backend:

```bash
npm run install:all
```

Alternatively, install them manually:

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

---

# Environment Setup

## Backend

Navigate to the backend directory.

```bash
cd backend
```

Create a `.env` file.

Linux/Mac:

```bash
cp .env.example .env
```

Windows:

```bash
copy .env.example .env
```

Update the following variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college-marketplace

JWT_SECRET=replace_with_a_secure_secret

PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

CLOUDINARY_API_KEY=your_cloudinary_api_key

CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:5173
```

---

## Frontend

Navigate to the frontend directory.

```bash
cd frontend
```

Create a `.env` file.

Linux/Mac:

```bash
cp .env.example .env
```

Windows:

```bash
copy .env.example .env
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

---

# Running the Application

### Start the Backend

```bash
npm run dev:backend
```

### Start the Frontend

Open a second terminal and run:

```bash
npm run dev:frontend
```

---

# Local Development URLs

| Service | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

---

# Backend Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT authentication |
| `PORT` | Backend server port |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL |

For production:

```env
CLIENT_URL=https://college-marketplace-frontend.onrender.com
```

---

# Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000
```

For production:

```env
VITE_API_URL=https://college-marketplace-backend.onrender.com
```

---

# Render Deployment

## Backend (Web Service)

1. Create a **Render Web Service**.
2. Connect your GitHub repository.
3. Set the Root Directory to:

```
backend
```

4. Build Command:

```bash
npm install
```

5. Start Command:

```bash
npm start
```

6. Add all backend environment variables.

7. Deploy.

Verify:

```
https://your-backend-url.onrender.com/api/health
```

---

## Frontend (Static Site)

1. Create a **Render Static Site**.
2. Connect the same GitHub repository.
3. Root Directory:

```
frontend
```

4. Build Command

```bash
npm install && npm run build
```

5. Publish Directory

```
dist
```

6. Add

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

7. Deploy.

The included `frontend/public/_redirects` file ensures React Router works correctly after refreshing routes on Render.

---

# CORS

The backend accepts requests from:

- http://localhost:5173
- The deployed frontend URL specified in `CLIENT_URL`

This allows seamless switching between local development and production deployment.

---

# Recommendation System

The platform recommends similar listings using:

- TF-IDF Vectorization
- Cosine Similarity
- Item Tags

This enables users to discover related products based on listing metadata.

---

# Future Enhancements

- Real-time chat between buyers and sellers
- AI-powered product recommendations
- Price prediction
- Payment gateway integration
- Product reporting system
- Email notifications
- Order history
- Seller ratings and reviews

---

# License

This project is intended for educational and learning purposes.
