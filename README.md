# Contaboo Real Estate CRM

A modern Real Estate CRM application built with Next.js, TypeScript, and Supabase.

## Features

- **Public Website**: Landing page for property browsing and agent registration
- **Authentication System**: Login and registration for real estate agents
- **CRM Dashboard**: Management interface for agents (coming soon)
- **Supabase Integration**: Real-time database and authentication
- **Responsive Design**: Built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Deployment**: Vercel

## Project Structure

```
contaboo/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── auth/           # Authentication pages
│   │   └── crm/            # CRM dashboard pages
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Shared components
│   │   ├── public/        # Public website components
│   │   └── crm/           # CRM-specific components
│   ├── lib/               # Utility functions and configurations
│   │   └── supabase/      # Supabase client configurations
│   ├── types/             # TypeScript type definitions
│   └── hooks/             # Custom React hooks
├── middleware.ts          # Next.js middleware for auth
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Environment Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Supabase Setup

1. Create a new Supabase project
2. Set up authentication providers
3. Create necessary database tables
4. Configure Row Level Security (RLS)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary.
