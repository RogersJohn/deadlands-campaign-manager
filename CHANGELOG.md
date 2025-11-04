# Changelog

All notable changes to the Deadlands Campaign Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Character creation wizard with step-by-step workflow
- Campaign management features (sessions, notes, tracking)
- Interactive character sheet with dice rolling
- Wound tracking and Fate Chip management
- Campaign wiki system with markdown support
- NPC and location generators
- Mobile optimization and responsive design
- Character export to PDF
- Enhanced search and filtering for reference data
- Character import improvements with auto-matching

## [1.0.0] - 2025-11-04

### Added

#### Reference Data System
- Created comprehensive reference data database with 5 new tables:
  - `skill_references` - 60+ canonical skill definitions
  - `edge_references` - Edge definitions with requirements
  - `hindrance_references` - Hindrance definitions with game effects
  - `equipment_references` - Weapons, armor, and gear with full stats
  - `arcane_power_references` - Spell/power definitions with mechanics
- Integrated reference data from official Deadlands sourcebooks
- Added REST API endpoints for reference data access:
  - `GET /api/reference/skills`
  - `GET /api/reference/edges`
  - `GET /api/reference/hindrances`
  - `GET /api/reference/equipment`
  - `GET /api/reference/powers`
- Made reference endpoints publicly accessible (no authentication required)

#### Character Sheet Enhancements
- Implemented interactive tooltips using Material-UI
- Added hover descriptions for all character sheet elements:
  - Skills show description, linked attribute, and default die value
  - Edges show requirements, rank, and effects
  - Hindrances show mechanical game effects
  - Equipment shows damage, range, and special notes
  - Powers show power points, range, duration, and effects
- Alphabetically sorted all character sheet sections (skills, edges, hindrances, equipment, powers)

#### Database & Models
- Extended existing entity models with optional reference links:
  - `Skill.java` - Added `skillReference` field
  - `Edge.java` - Added `edgeReference` field
  - `Hindrance.java` - Added `hindranceReference` field
  - `Equipment.java` - Added `equipmentReference` field
  - `ArcanePower.java` - Added `powerReference` field
- Created JPA repositories for all reference data entities
- Maintained backward compatibility with legacy data

#### Frontend Services
- Created `referenceDataService.ts` for API integration
- Implemented reference data caching in frontend
- Enhanced `CharacterSheet.tsx` with tooltip system

#### Documentation & Tools
- Added reference data loading scripts (`load-reference-data.sh`, `load-reference-data.bat`)
- Created seed data SQL script with sample reference data
- Extracted 6 Deadlands sourcebooks to text format for parsing
- Updated security configuration documentation

### Changed
- Modified `SecurityConfig.java` to permit public access to reference endpoints
- Updated character sheet component to fetch and display reference data
- Restructured API controller paths for better organization

### Fixed
- Resolved PDF size issues by converting to text format
- Fixed controller path conflicts between `/api/reference` and server context
- Corrected SQL column name mismatches (armor_piercing → ap)
- Fixed 403 Forbidden errors on reference endpoints
- Resolved missing reference tables after Docker deployment
- Fixed skill name mismatches between classic and Savage Worlds naming
- Fixed frontend tooltips not appearing after Docker rebuild

## [0.1.0] - 2025-11-03

### Added

#### Core Application Structure
- Initial project setup with Spring Boot 3.2.1 and React 18
- Maven-based backend with multi-module structure
- Vite-based frontend with TypeScript support
- PostgreSQL database configuration

#### Authentication & Authorization
- JWT-based authentication system
- User registration and login endpoints (`/auth/register`, `/auth/login`)
- Role-based access control (PLAYER, GAME_MASTER)
- BCrypt password hashing
- Spring Security configuration with CORS support
- Token-based authorization for protected endpoints

#### Character Management
- Complete character entity model for Deadlands Reloaded:
  - 8 attributes (Cognition, Deftness, Knowledge, Mien, Quickness, Smarts, Spirit, Vigor)
  - Derived stats (Pace, Size, Wind/Strain, Grit)
  - Skills with die values and categories
  - Edges (Background, Combat, Social, Professional)
  - Hindrances (Major/Minor)
  - Equipment (weapons, armor, gear) with full stat blocks
  - Arcane powers (Blessed, Huckster, Shaman, Mad Science)
  - Wound tracking by location (Head, Arms, Guts, Legs)
- Character CRUD operations via REST API:
  - `GET /api/characters` - List all characters
  - `GET /api/characters/{id}` - Get character details
  - `POST /api/characters` - Create new character
  - `PUT /api/characters/{id}` - Update character
  - `DELETE /api/characters/{id}` - Delete character (GM only)
- Character sheet viewing interface with Material-UI
- Permission system (players can only view/edit own characters, GMs see all)

#### Database Schema
- Created 9 core database tables:
  - `users` - User accounts and authentication
  - `characters` - Character basic information
  - `skills` - Character skills (one-to-many)
  - `edges` - Character edges (one-to-many)
  - `hindrances` - Character hindrances (one-to-many)
  - `equipment` - Character equipment (one-to-many)
  - `arcane_powers` - Character arcane powers (one-to-many)
  - `wounds` - Character wound tracking (one-to-many)
  - Proper foreign key relationships and constraints
- Hibernate auto-DDL for table creation
- JPA entity mappings with proper cascading

#### Character Import System
- JSON-based character import from original character sheets
- Imported 7 pre-configured characters:
  - Mexicali Bob (Apprentice Shaman)
  - Cornelius Wilberforce III (Wealthy Scholar)
  - Doc Emett Von Braun (Mad Scientist, 1863)
  - John Henry Farraday (Doctor/Hexslinger)
  - Jack Horner (Old Prospector)
  - Lucas Turner (Gunslinger/Marshal)
  - George C Dobbs (Basic Template)
- Created 6 user accounts with role assignments
- Data seeding via SQL scripts

#### Frontend Application
- React 18 with TypeScript and strict mode
- Material-UI component library integration
- React Router for client-side routing
- React Query for server state management
- Zustand for authentication state with persistence
- Axios HTTP client with JWT interceptors
- Pages implemented:
  - Login/Register pages
  - Dashboard with character roster
  - Character sheet viewer
- Responsive layout with navigation
- Form validation with React Hook Form and Zod

#### Docker Support
- Multi-container Docker Compose setup
- Containers for PostgreSQL, Backend (Spring Boot), Frontend (Nginx)
- Volume persistence for database
- Docker networking between services
- Production-ready Dockerfiles
- Environment variable configuration

#### Documentation
- `README.md` - Project overview and features
- `ARCHITECTURE.md` - Complete system architecture documentation
- `QUICKSTART.md` - 15-minute setup guide
- `SETUP.md` - Detailed installation instructions
- `CHARACTER_IMPORT.md` - Character import guide
- `SESSION_STATUS.md` - Development session tracking
- API endpoint documentation
- Technology stack explanation
- Deployment guides for Railway.app and Render.com

### Technical Details

#### Backend (Spring Boot)
- Java 17 with Maven dependency management
- Spring Boot 3.2.1 with embedded Tomcat
- Spring Data JPA with Hibernate ORM
- Spring Security with JWT token validation
- RESTful API design with proper HTTP status codes
- Exception handling with custom error responses
- Application configuration with YAML
- Development and production profiles

#### Frontend (React + TypeScript)
- React 18.2.0 with TypeScript 5.3.3
- Vite 5.0.11 for fast development and building
- Material-UI 5.15.3 for UI components
- React Query 5.17.9 for data fetching and caching
- Zustand 4.4.7 for lightweight state management
- Axios 1.6.5 for HTTP requests
- React Router 6.21.1 for navigation
- ESLint with TypeScript rules for code quality

#### Database
- PostgreSQL 14 for data persistence
- Proper normalization with foreign keys
- Indexes on frequently queried columns
- Support for complex character data models
- Connection pooling for performance

### Security
- JWT tokens with configurable secret and expiration
- Password hashing with BCrypt (strength 10)
- CORS configuration for cross-origin requests
- SQL injection prevention via JPA/Hibernate
- XSS prevention via React's built-in escaping
- Role-based access control on all endpoints
- Authorization checks at service layer

### Performance
- Frontend code splitting and lazy loading
- React Query caching to reduce API calls
- JPA lazy loading for related entities
- Database connection pooling
- Optimized SQL queries with proper indexes
- Fast development server (Vite) with HMR
- Production builds with minification

---

## Version History Summary

- **v1.0.0** (2025-11-04) - Reference data system with tooltips, alphabetical sorting
- **v0.1.0** (2025-11-03) - Initial release with character management and authentication

---

## Contributing

This is a private campaign management tool. For bug reports or feature requests, please contact the project maintainer.

## License

Private project - All rights reserved.

## Acknowledgments

- Deadlands Reloaded by Pinnacle Entertainment Group
- Character sheet templates from official Deadlands materials
- Spring Boot and React communities for excellent documentation