# ZyperGo

**Enterprise Logistics & Delivery Platform**

ZyperGo is a modern, high-performance web application designed to handle complex logistics operations. Whether it's hyper-local intracity delivery or robust intercity logistics, ZyperGo simplifies the entire supply chain with real-time tracking, an elegant UI, and a powerful scalable architecture.

## 🚀 Features

- **Multi-Tenant Subdomain Architecture**: Seamlessly route to different applications (Admin, Customer, Partner, Hub, Raider, etc.) using host-based routing.
- **5-Star Premium UI**: Beautiful glassmorphism, dynamic 3D hover effects, scroll-linked animations, and highly responsive Tailwind CSS design.
- **Perfect SEO**: Dynamically injected meta tags, Open Graph tags, and descriptions via our custom lightweight React hook.
- **Monorepo Structure**: Frontend (Vite/React) and Backend (Express/Node.js) living in perfect harmony.
- **Vercel Ready**: Optimized for serverless deployment with a single `vercel.json` configuration handling static assets and API proxying simultaneously.

## 🏗 Architecture & Stack

### Frontend (Client)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Native CSS Modules
- **Animations**: Framer Motion + 3D CSS Transforms
- **Icons**: Lucide React
- **Routing**: React Router DOM (with custom `AppRouter` for Subdomain parsing)

### Backend (Server)
- **Framework**: Node.js + Express
- **Architecture**: RESTful API ready for Serverless (Vercel)
- **Database**: Extensible for MongoDB / PostgreSQL integration

## 🛠 Local Development

This project uses a monorepo structure. You can run the frontend and backend simultaneously.

### 1. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Start Development Servers
The frontend is configured via Vite Proxy to forward `/api` requests to the local backend on port `5000`.

**Start Backend (Terminal 1)**
```bash
cd server
npm run dev
```

**Start Frontend (Terminal 2)**
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🌍 Vercel Deployment & Subdomains

This project is configured to deploy effortlessly on Vercel as a single project.

### Deployment Steps
1. Push this complete folder to a GitHub repository.
2. In Vercel, import the repository.
3. Keep the **Framework Preset** as `Vite` or `Other`.
4. Leave the **Root Directory** as `/` (the root of the repo).
5. Deploy. Vercel will automatically read the `vercel.json` file, build the `client`, and deploy the `server/server.js` as a serverless function.

### Subdomain Routing
ZyperGo uses client-side host parsing (`window.location.hostname`) to serve different experiences based on the URL.

To enable this in production:
1. Go to your project settings in Vercel.
2. Navigate to **Domains**.
3. Add your base domain (e.g., `zypergo.com`).
4. Add your subdomains or a wildcard domain (e.g., `*.zypergo.com`).
5. Now, visiting `admin.zypergo.com` will automatically render the Admin Dashboard, while `partner.zypergo.com` will render the Partner Portal. No extra server configuration is needed!

## 📄 License
Copyright © 2026 ZyperGo Inc. All rights reserved.
