# 🏢 Contaboo - Arabic Real Estate CRM Platform

<div align="center">

![Contaboo Logo](https://img.icons8.com/color/96/real-estate.png)

**A modern, bilingual (Arabic/English) Customer Relationship Management system for real estate professionals**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[🚀 Live Demo](https://contaboo.com) • [📖 Technical Docs](./TECHNICAL.md) • [🐛 Report Bug](https://github.com/xinreal/contaboo/issues) • [💡 Request Feature](https://github.com/xinreal/contaboo/issues)

</div>

---

## ✨ Key Features

### 🏠 Property Management
- **Arabic Language Support** - Full RTL support for Arabic real estate terminology
- **WhatsApp Integration** - Import and analyze WhatsApp chat messages for property leads
- **Smart Search** - Advanced search with Arabic text processing and keyword recognition
- **Auto-Classification** - AI-powered property type detection (شقق، فيلات، أراضي، مكاتب، مخازن)
- **CSV Import** - Dynamic schema adaptation for property data imports
- **Mobile Privacy** - Smart phone number masking for unauthenticated users

### 🛠️ Technical Features
- **Dual Database Support** - SQLite (development) + PostgreSQL (production)
- **Modern UI/UX** - Glassmorphism design with Tailwind CSS
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Real-time Statistics** - Live property counts and analytics dashboard
- **Secure Authentication** - JWT-based login system
- **API-First Architecture** - RESTful APIs with comprehensive documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xinreal/contaboo.git
   cd contaboo
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Start development servers**
   ```bash
   # Terminal 1: Backend (http://localhost:3001)
   cd backend
   npm run dev
   
   # Terminal 2: Frontend (http://localhost:5173)
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api
   - Login: `xinreal` / `zerocall`

## 📁 Project Structure

```
Contaboo/
├── 📁 src/                     # React frontend
│   ├── 📁 components/          # React components
│   │   ├── HomePage.jsx        # Main interface with property filters
│   │   ├── Dashboard.jsx       # Admin dashboard
│   │   └── PropertyDetailPage.jsx
│   ├── 📁 services/
│   │   └── apiService.js       # API communication layer
│   └── 📁 utils/
│       └── arabicTextProcessor.js
├── 📁 backend/                 # Node.js backend
│   ├── server-production.js    # Main server file
│   └── package.json
├── 📁 api/                     # Vercel serverless functions
│   ├── auth/login.js
│   ├── search-all.js           # Unified search endpoint
│   └── stats.js
├── 📁 data/                    # SQLite database (development)
└── TECHNICAL.md                # Comprehensive technical documentation
```

## 🌐 API Documentation

### Core Endpoints

```javascript
// Authentication
POST /api/auth/login
{
  "username": "xinreal",
  "password": "zerocall"
}

// Get property statistics
GET /api/stats
Response: {
  "success": true,
  "stats": [
    {"property_type": "apartment", "count": 838},
    {"property_type": "land", "count": 565},
    {"property_type": "villa", "count": 222}
  ]
}

// Unified search (chat messages + properties)
GET /api/search-all?q=شقة&type=apartment&limit=50
Response: {
  "success": true,
  "data": [...],
  "total": 838
}

// Import CSV data with dynamic schema
POST /api/import-csv
{
  "tableName": "properties_import",
  "headers": ["property_type", "location", "price"],
  "data": [["شقة", "القاهرة", "500000"]]
}
```

## 🗄️ Database Schema

### Production (PostgreSQL - Neon)
- **chat_messages** (4,646 records) - WhatsApp message imports
- **properties** (39,116 records) - Property listings
- **properties_import** (15,039 records) - CSV imports
- **8 lookup tables** - Normalized master data

### Development (SQLite)
- Local database: `data/real_estate_chat.db`
- Automatic schema creation and seeding
- Sample data included for testing

## 🚀 Deployment

### Production (Vercel + Neon PostgreSQL)
The application is deployed at [contaboo.com](https://contaboo.com) using:
- **Frontend**: Vercel (React/Vite build)
- **Backend**: Vercel Serverless Functions
- **Database**: Neon PostgreSQL (58K+ records)

### Environment Variables
```env
# Production
DATABASE_URL=postgresql://...neon.tech/...
VITE_API_URL=/api
NODE_ENV=production

# Development  
VITE_API_URL=http://localhost:3001/api
NODE_ENV=development
```

## 🤖 Arabic Language Support

### Property Type Keywords
```javascript
const ARABIC_KEYWORDS = {
  apartment: ['شقة', 'شقق', 'دور', 'أدوار', 'طابق'],
  villa: ['فيلا', 'فيلات', 'قصر', 'قصور', 'بيت', 'منزل'],
  land: ['أرض', 'أراضي', 'قطعة', 'مساحة', 'متر', 'فدان'],
  office: ['مكتب', 'مكاتب', 'إداري', 'تجاري', 'محل'],
  warehouse: ['مخزن', 'مخازن', 'مستودع', 'ورشة']
};
```

### Mobile Number Processing
- **Egyptian Format Support**: 01012345678, +201012345678
- **Privacy Masking**: 010XXXX4567 for unauthenticated users
- **Multiple Patterns**: Handles spaced and broken number formats

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit: `git commit -m "Add new feature"`
5. Push: `git push origin feature/new-feature`
6. Create a Pull Request

### Development Guidelines
- Follow the established Arabic language patterns
- Test with both SQLite (dev) and PostgreSQL (staging)
- Ensure mobile responsiveness
- Add comprehensive error handling
- Update documentation for new features

## 📋 Technical Documentation

For comprehensive technical documentation, architecture details, and development history, see [TECHNICAL.md](./TECHNICAL.md).

## 📞 Support

- **Live Demo**: [contaboo.com](https://contaboo.com)
- **Technical Issues**: See [TECHNICAL.md](./TECHNICAL.md) for troubleshooting
- **Feature Requests**: Open an issue on GitHub

---

**Status**: ✅ Production Ready  
**Last Updated**: July 21, 2025  
**Database**: 58,762 properties across 5 categories  
**Languages**: Arabic (RTL) + English
