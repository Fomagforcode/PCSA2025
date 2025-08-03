# PCSA2025 - FunRun Registration System

A secure and scalable registration system built with modern web technologies.

## 🚀 Tech Stack

### Core Framework
- **Next.js 14** - React framework with App Router, Server Components, and API routes
- **React 18** - UI library for building components

### UI & Styling
- **shadcn/ui** - Reusable UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL, Auth, Storage)
- **PostgreSQL** - Primary database

### Authentication & Security
- **JWT (jose)** - Secure token handling
- **bcrypt** - Password hashing
- **Zod** - Input validation

### State Management & Forms
- **Zustand** - State management
- **React Hook Form** - Form handling

### Development Tools
- **TypeScript** - Type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Additional Libraries
- **date-fns** - Date manipulation
- **react-hot-toast** - Notifications
- **rate-limiter-flexible** - Rate limiting

## 🛠️ Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (create `.env.local` file):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔒 Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with Zod
- Rate limiting on API routes
- Secure cookie handling
- CSRF protection

## 📝 License
This project is licensed under the MIT License.

