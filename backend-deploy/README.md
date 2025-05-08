# Taskify Backend API

This is the backend API for the Taskify task management application.

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository 
3. Configure the service:
   - Name: taskify-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   
4. Add the following environment variables:
   - PORT: 10000 (Render will override this with its own PORT)
   - NODE_ENV: production
   - MONGODB_URI: your_mongodb_atlas_connection_string
   - JWT_SECRET: your_secure_jwt_secret
   - JWT_EXPIRES_IN: 7d
   - CLIENT_URL: your_vercel_frontend_url
   - EMAIL_SERVICE: gmail
   - EMAIL_USER: your_email@gmail.com
   - EMAIL_PASS: your_email_app_password
   - EMAIL_FROM: your_email@gmail.com

5. Deploy! 