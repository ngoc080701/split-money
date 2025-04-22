# Money Splitting App

A collaborative expense tracking and bill splitting application that helps groups of people track shared expenses and settle debts efficiently.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
  - [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
  - [Authentication Module](#authentication-module)
  - [User Module](#user-module)
  - [Groups Module](#groups-module)
  - [Bills Module](#bills-module)
- [Business Logic](#business-logic)
- [Database Schema](#database-schema)
- [Development](#development)
  - [Running Tests](#running-tests)
  - [Migration Management](#migration-management)
- [Contributing](#contributing)
- [License](#license)

## Overview

Money Splitting App is a backend service designed to simplify tracking and settling expenses within groups. It allows users to create groups, add members, create bills, track who paid what, and automatically calculates how to settle debts efficiently.

The main problem the app solves is eliminating the complex math and mental tracking required when multiple people share expenses, especially when people pay different amounts on different occasions.

## Features

- **User Authentication**: Secure registration and login system
- **Group Management**: Create and manage groups of users
- **Bill Tracking**: Record expenses and track who paid what
- **Smart Debt Settlement**: Automatically calculates the optimal way to settle debts
- **Transaction Management**: Track the status of payments between users
- **Debt Visualization**: See who owes what to whom

## Tech Stack

- **Backend**: NestJS (Node.js framework)
- **Database**: MySQL with TypeORM
- **Authentication**: JWT-based authentication
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker and Docker Compose
- **Language**: TypeScript

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or later)
- PNPM package manager
- MySQL (v8.0 or later)
- Docker and Docker Compose (for containerized setup)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/money-splitting-app.git
   cd money-splitting-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=money_app

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d
```

### Running the Application

1. Start the MySQL database:
   ```bash
   # If running MySQL locally
   sudo service mysql start
   
   # Or with Docker
   docker-compose up -d db
   ```

2. Run database migrations:
   ```bash
   pnpm run migration:run
   ```

3. Start the application:
   ```bash
   # For development
   pnpm run start:dev
   
   # For production
   pnpm run build
   pnpm run start:prod
   ```

4. The API will be available at `http://localhost:3000`
   - Swagger documentation: `http://localhost:3000/api/docs`

### Docker Setup

To run the entire application using Docker:

1. Make sure Docker and Docker Compose are installed
2. Run:
   ```bash
   docker-compose up -d
   ```
3. The application will be available at `http://localhost:3000`

## API Documentation

The API is documented using Swagger. When the application is running, you can access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

This provides a comprehensive overview of all available endpoints, required parameters, and response formats.

## Project Structure

```
├── src/
│   ├── config/               # Configuration files
│   ├── database/             
│   │   ├── entities/         # Base entity classes
│   │   └── migrations/       # Database migrations
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Authentication module
│   │   ├── user/             # User management 
│   │   ├── groups/           # Group management
│   │   └── bills/            # Bill and transaction management
│   ├── app.module.ts         # Main application module
│   └── main.ts               # Application entry point
```

## Core Modules

### Authentication Module

Handles user registration, login, and JWT token management. 

Key endpoints:
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate and receive JWT token

### User Module

Manages user profiles and user-related operations.

Key endpoints:
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user information

### Groups Module

Manages groups and group membership. Users can create groups and add other users.

Key endpoints:
- `POST /groups` - Create a new group
- `GET /groups` - Get all groups or user's groups
- `GET /groups/:id` - Get group by ID
- `POST /groups/:id/members` - Add members to a group

### Bills Module

The core module that handles bills, expense tracking, and debt settlement.

Key endpoints:
- `POST /bills` - Create a new bill
- `GET /bills` - Get all bills or bills by group
- `POST /bills/:id/assign-users` - Assign users to a bill
- `POST /bills/:id/users` - Update bill users with paid amounts
- `GET /bills/:id/transactions` - Get transactions for a bill
- `PUT /transactions/:id/status` - Update transaction status

## Business Logic

### Bill Creation and Debt Distribution

1. A group member creates a bill with either:
   - A `totalAmount` (total bill cost to be divided among members)
   - A `perAmount` (specific amount per person, for individual or identical contributions)
2. Users must be assigned to the bill during creation.
3. When using `totalAmount`, the system calculates `perAmount` by dividing total by the number of assigned members.
4. The bill_users table tracks each user's financial position with two columns:
   - `debtAmount`: How much the user owes (positive value when perAmount is positive)
   - `surplusAmount`: How much the user is owed (positive value when perAmount is negative)
5. The system validates that total debts and surpluses within a bill are balanced (sum to zero).

### Transaction Generation

The system automatically:
1. Identifies who has surpluses (creditors) and who has debts (debtors)
2. Creates optimal transactions between debtors and creditors
3. Prioritizes larger debts first
4. Minimizes the total number of transactions needed

### Transaction Flow

1. All transactions start with `PENDING` status
2. When a debtor pays, they update status to `PROCESSING`
3. When a creditor confirms receipt, they update status to `DONE`

## Database Schema

The database consists of the following main tables:

- **users**: Stores user information
- **groups**: Stores group information
- **group_members**: Maps users to groups
- **bills**: Stores bill information (name, total amount, average amount)
- **bill_users**: Maps users to bills and tracks each user's payment status
- **transactions**: Records debt settlements between users

## Development

### Running Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

### Migration Management

```bash
# Generate a new migration
pnpm run migration:generate src/database/migrations/NameOfMigration

# Run pending migrations
pnpm run migration:run

# Revert the last migration
pnpm run migration:revert
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Contact

For any questions or suggestions, please open an issue in the repository.
