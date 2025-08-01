# Contaboo Real Estate CRM

A comprehensive real estate CRM system built with Next.js 15, TypeScript, and SQLite. This local-only application provides a complete solution for managing real estate agents, clients, and properties.

## Features

- **User Management**: Admin, Agent, and Client roles
- **Authentication**: Mobile number-based authentication with your email integration
- **Property Management**: Add, edit, and manage real estate listings
- **Dashboard**: Role-based dashboards with statistics and management tools
- **Local Database**: SQLite database for complete local data control
- **Mobile-First Design**: Responsive UI built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd contaboo
npm install
```

2. **Set up the database:**
```bash
# Generate Prisma client
npm run db:generate

# Create and seed the database
npm run db:push
npm run db:seed
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## Admin Access

**Admin Login Credentials:**
- Email: `ahmedgfathy@gmail.com`
- Password: `ZeroCall20!@H`
- Mobile Number: `01002778090`

You can login using either your email or mobile number.

## Environment Variables

The application uses these environment variables (already configured in `.env.local`):

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET=your_secret_key
ADMIN_EMAIL=ahmedgfathy@gmail.com
ADMIN_MOBILE=01002778090
ADMIN_PASSWORD=ZeroCall20!@H
```

## Database Commands

```bash
# Reset database and reseed
npm run db:reset

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Seed database with sample data
npm run db:seed
```

## Project Structure

```
contaboo/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Database seeding script
├── src/
│   ├── app/
│   │   ├── admin/        # Admin dashboard
│   │   ├── crm/          # CRM dashboard
│   │   ├── auth/         # Authentication pages
│   │   └── api/          # API routes
│   ├── components/
│   │   └── auth/         # Authentication components
│   └── lib/
│       ├── prisma.ts     # Database client
│       └── auth.ts       # Authentication logic
├── dev.db                # SQLite database file
└── .env.local           # Environment variables
```

## Authentication System

The application uses a custom JWT-based authentication system:

- **Admin**: Full access to all features and user management
- **Agent**: Access to CRM features and assigned properties
- **Client**: Access to property browsing and inquiries

## Database Schema

The SQLite database includes tables for:
- Users (admin, agents, clients)
- Agents (agent-specific data)
- Clients (client-specific data)
- Properties (real estate listings)
- Property Images
- Leads and Appointments
- Transactions

## Development

This is a local-only application with no external dependencies:
- ✅ No cloud database required
- ✅ No external authentication service
- ✅ Complete data privacy and control
- ✅ Works offline
- ✅ Easy backup (just copy `dev.db` file)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is private and proprietary.
