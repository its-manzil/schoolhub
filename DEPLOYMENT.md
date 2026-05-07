# SchoolHub Deployment Guide

## Project Structure
```
schoolhub/
├── frontend/          # Next.js frontend (deploy to Vercel)
├── server/           # Express.js backend (deploy to Render)
└── DEPLOYMENT.md     # This file
```

## Environment Variables

### Frontend (Vercel)
1. Copy `frontend/.env.example` to `frontend/.env.local`
2. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
3. In Vercel dashboard, add this as an environment variable

### Backend (Render)
1. Copy `server/.env.example` to `server/.env`
2. Set the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a strong secret key
   - `CORS_ORIGIN`: Your Vercel frontend URL
   - `PORT`: Render automatically sets this to 10000

## Deployment Steps

### Backend (Render)
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

### Frontend (Vercel)
1. Push your code to GitHub
2. Create a new project on Vercel
3. Import your GitHub repository
4. Set the root directory to `frontend`
5. Add `NEXT_PUBLIC_API_URL` environment variable
6. Deploy

## Important Notes

- The frontend API calls are proxied to the backend via Next.js rewrites
- CORS is configured on the backend to allow requests from your frontend
- Environment variables are properly separated between frontend and backend
- Both `.gitignore` files are configured to exclude sensitive files

## Production URLs

After deployment:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.onrender.com`

Update the `NEXT_PUBLIC_API_URL` in Vercel to point to your Render backend URL.
