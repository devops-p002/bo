# Gaming Platform Admin Dashboard

An advanced administration dashboard for gaming platform management, built with React, Vite, TailwindCSS, and GraphQL.

## Features

- 🔐 **User Authentication**: Secure login system with role-based permissions
- 📊 **Dashboard**: Real-time statistics, activities, and key metrics
- 💰 **Financial Management**: Deposits, withdrawals, and transaction history
- 👥 **User Management**: Member profiles, activities, and account details
- 🎮 **Gaming**: Game settings, bet limits, and management tools
- 🎁 **Bonuses**: Manage bonus offers, templates, and distribution
- 📊 **Reports**: Comprehensive reporting system with exportable data
- 📱 **Responsive Design**: Fully responsive layout for all devices

## Tech Stack

- **Frontend**:

  - React 18
  - Vite
  - TailwindCSS for styling
  - React Router for navigation
  - Context API for state management
  - GraphQL for data fetching

- **Backend**:
  - Node.js
  - Express
  - GraphQL API
  - PostgreSQL database
  - Redis for caching
  - JWT authentication

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone [repository-url]
cd gaming-platform
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:4000
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

## Project Structure

```
gaming-platform/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # React context providers
│   ├── graphql/        # GraphQL queries and mutations
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── router/         # Routing configuration
│   ├── services/       # API services
│   ├── styles/         # Global styles
│   ├── utils/          # Utility functions
│   ├── App.js          # App component
│   └── main.js         # Entry point
├── server/             # Backend code
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [GraphQL](https://graphql.org/)
