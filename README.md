# Task Management System (Taskify)

A full-stack task management application built with Next.js, Express, and MongoDB. Taskify allows teams to create, assign, track, and manage tasks efficiently with a modern, responsive interface.

## Features

- **User Authentication**: Secure registration, login, and password recovery
- **Task Management**: Create, update, delete, and view tasks with priorities and due dates
- **Team Collaboration**: Assign tasks to team members with real-time notifications
- **Task Status Tracking**: Track tasks through their lifecycle (To Do, In Progress, Review, Completed)
- **Real-time Notifications**: In-app notifications with badge indicators for new task assignments and updates
- **Email Notifications**: Optional email alerts for important task activities
- **Dashboard**: Visual summary of tasks assigned to you, tasks you created, and overdue tasks
- **Advanced Search and Filtering**: Find tasks quickly with text search and category-based filters
- **Task Comments**: Add comments to tasks for better team communication
- **Responsive Design**: Optimized for both desktop and mobile devices with a dedicated mobile menu
- **Dark Mode UI**: Modern dark-themed interface for reduced eye strain

## Technology Stack

- **Frontend**: Next.js 15 (App Router) with React 19
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS with modern glassmorphic elements
- **Notifications**: Real-time notification system
- **Icons**: Bootstrap Icons integration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local instance or MongoDB Atlas)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/task-management.git
   cd task-management
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-management
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your_super_secret_key_for_jwt_tokens
   JWT_EXPIRES_IN=7d
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   EMAIL_FROM=your-email@gmail.com
   ```

4. Start the development server
   ```
   # Run both frontend and backend
   npm run dev:full
   
   # Or run them separately
   npm run dev  # Frontend
   npm run dev:server  # Backend
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

1. Build the application
   ```
   npm run build
   ```

2. Start the production server
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password
- `PUT /api/auth/updatepassword` - Update password
- `PUT /api/auth/updatedetails` - Update user details

### Tasks
- `GET /api/tasks` - Get all tasks with pagination and filters
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a single task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PUT /api/tasks/:id/assign` - Assign a task to a user
- `POST /api/tasks/:id/comments` - Add a comment to a task
- `GET /api/tasks/search` - Search tasks
- `GET /api/tasks/filter/overdue` - Get overdue tasks
- `GET /api/tasks/filter/assigned` - Get tasks assigned to current user
- `GET /api/tasks/filter/created` - Get tasks created by current user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a single user

### Notifications
- `GET /api/notifications` - Get all notifications for current user
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete a notification
- `PUT /api/notifications/preferences` - Update notification preferences

## Project Structure

```
task-management/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── components/            # React components
│   │   │   ├── layout/            # Layout components (Header, Footer)
│   │   │   ├── task/              # Task-related components
│   │   │   └── ui/                # UI components (Toast, LoadingSpinner)
│   │   ├── context/               # React context providers
│   │   ├── services/              # API service functions
│   │   ├── styles/                # CSS styles
│   │   ├── layout.js              # Root layout
│   │   ├── page.js                # Home page
│   │   ├── dashboard/             # Dashboard page
│   │   ├── tasks/                 # Tasks pages (list, create, view, edit)
│   │   ├── auth/                  # Authentication pages (login, register)
│   │   ├── components/            # React components
│   │   ├── context/               # React context providers
│   │   ├── services/              # API service functions
│   │   ├── layout.js              # Root layout
│   │   ├── page.js                # Home page
│   ├── server/                    # Express backend
│   │   ├── controllers/           # Route controllers
│   │   ├── middleware/            # Express middleware
│   │   ├── models/                # Mongoose models
│   │   ├── routes/                # Express routes
│   │   ├── utils/                 # Utility functions
│   │   ├── index.js               # Server entry point
├── public/                        # Static files
├── .env                           # Environment variables
├── package.json                   # Dependencies and scripts
```

## Recent Updates

### Version 1.1.0
- Added proper population of assigned user and creator references in task cards
- Enhanced notification system with badge indicator that only appears when notifications exist
- Fixed search functionality to properly handle single character searches
- Improved mobile user experience with a dedicated mobile menu
- Added dark mode throughout the application
- Enhanced task card design with modern glassmorphic elements
- Optimized database queries for better performance

## Task Status Flow

Tasks in the system follow a standard workflow:

1. **To Do**: Initial state for newly created tasks
2. **In Progress**: Tasks that are currently being worked on
3. **Review**: Tasks that are completed and awaiting review
4. **Completed**: Tasks that have been reviewed and approved

## User Roles

The application supports three user roles:

1. **User**: Can view and manage their assigned tasks
2. **Manager**: Can create tasks and assign them to users
3. **Admin**: Has full access to all features and user management

## Deployment

This application can be deployed to platforms like Vercel, Netlify, Render, or Railway.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
