# Deadlands Campaign Manager

A comprehensive web-based campaign management system for Deadlands Reloaded tabletop RPG. Manage characters, track campaign progress, maintain a wiki, and generate NPCs and locations on the fly.

## Features

- **User Authentication & Authorization**
  - Player and Game Master roles
  - JWT-based authentication
  - Secure password hashing

- **Character Management**
  - Full character sheet support for Deadlands Reloaded
  - Attributes, Skills, Edges, Hindrances
  - Equipment and Arcane Powers tracking
  - Wound tracking by location

- **Campaign Wiki** (Coming Soon)
  - Permission-based content unlocking
  - Campaign lore and session notes
  - NPC and location database

- **Generators** (Coming Soon)
  - NPC generator with full stats
  - Location generator
  - Random encounter tables

## Tech Stack

### Backend
- **Spring Boot 3.2.1** (Java 17)
- **PostgreSQL** database
- **Spring Security** with JWT
- **Hibernate/JPA** for ORM
- **Maven** for dependency management

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **React Query** for data fetching
- **Zustand** for state management
- **Vite** for build tooling

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher
- Maven 3.8 or higher

## Quick Start

**Want to get up and running immediately with all 7 characters imported?**

See **[QUICKSTART.md](QUICKSTART.md)** - Get your campaign running in 15 minutes!

For character import details, see **[CHARACTER_IMPORT.md](CHARACTER_IMPORT.md)**

## Detailed Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```bash
createdb deadlands
```

Or using psql:

```sql
CREATE DATABASE deadlands;
CREATE USER deadlands WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE deadlands TO deadlands;
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a local configuration file:

```bash
cp src/main/resources/application-local.yml.example src/main/resources/application-local.yml
```

Edit `application-local.yml` with your database credentials and JWT secret.

Build and run the application:

```bash
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Project Structure

```
deadlands-campaign/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/deadlands/campaign/
│   │   │   │   ├── config/          # Security & app configuration
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   ├── model/           # JPA entities
│   │   │   │   ├── repository/      # Data repositories
│   │   │   │   ├── security/        # JWT & authentication
│   │   │   │   └── service/         # Business logic
│   │   │   └── resources/
│   │   │       └── application.yml  # Configuration
│   │   └── test/                    # Unit tests
│   └── pom.xml                      # Maven dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API services
│   │   ├── store/                   # State management
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   ├── package.json                 # NPM dependencies
│   └── vite.config.ts              # Vite configuration
│
└── Character Sheets/                # Original character sheets
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Characters
- `GET /api/characters` - Get all characters
- `GET /api/characters/{id}` - Get character by ID
- `POST /api/characters` - Create new character
- `PUT /api/characters/{id}` - Update character
- `DELETE /api/characters/{id}` - Delete character (GM only)

## Deployment

### Recommended Hosting: Railway.app

1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
3. Login and initialize:
   ```bash
   railway login
   railway init
   ```
4. Add PostgreSQL database:
   ```bash
   railway add
   # Select PostgreSQL
   ```
5. Deploy:
   ```bash
   railway up
   ```

### Alternative: Render.com

1. Create account at [render.com](https://render.com)
2. Create new PostgreSQL database
3. Create new Web Service
4. Connect your GitHub repository
5. Set environment variables
6. Deploy

### Environment Variables for Production

Backend:
```
DATABASE_URL=jdbc:postgresql://host:5432/dbname
DATABASE_USERNAME=username
DATABASE_PASSWORD=password
JWT_SECRET=your-secure-secret-key
CORS_ORIGINS=https://your-frontend-domain.com
```

Frontend:
```
VITE_API_URL=https://your-backend-domain.com/api
```

## Development Roadmap

- [x] Project structure setup
- [x] Authentication system
- [x] Basic character management
- [x] Character sheet viewing
- [ ] Full character creation form
- [ ] Character editing interface
- [ ] Wiki system with markdown support
- [ ] Permission-based wiki content
- [ ] NPC generator
- [ ] Location generator
- [ ] Random tables and generators
- [ ] Session management
- [ ] Combat tracker
- [ ] File uploads for character images
- [ ] Export characters to PDF

## Contributing

This is a private campaign management tool. If you'd like to use it for your own campaign, feel free to fork and customize.

## License

Private project - All rights reserved.

## Acknowledgments

- Deadlands Reloaded by Pinnacle Entertainment Group
- Character sheet templates from the official Deadlands materials
