# Express CRUD API with TypeScript & TypeORM

A RESTful API built with Express.js, TypeScript, and TypeORM.

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configuration

Copy the environment template and adjust settings:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
NODE_ENV=development
PORT=3000
DB_PATH=database.sqlite
DB_SYNC=true
DB_LOGGING=true
LOG_LEVEL=debug
CORS_ORIGIN=*
```

### 3. Run the Application

**Development Mode:**

```bash
yarn dev
```

**Production Mode:**

```bash
yarn build
yarn start
```

**Testing:**

```bash
yarn test
yarn test:coverage
```

## API Endpoints

Base URL: `http://localhost:3000/api`

| Method | Endpoint                | Description         |
| ------ | ----------------------- | ------------------- |
| GET    | `/health`               | Health check        |
| GET    | `/api/v1/resources`     | Get all resources   |
| POST   | `/api/v1/resources`     | Create new resource |
| GET    | `/api/v1/resources/:id` | Get resource by ID  |
| PUT    | `/api/v1/resources/:id` | Update resource     |
| DELETE | `/api/v1/resources/:id` | Delete resource     |

## Configuration Options

| Variable      | Description                           | Default           |
| ------------- | ------------------------------------- | ----------------- |
| `NODE_ENV`    | Environment                           | `development`     |
| `PORT`        | Server port                           | `3000`            |
| `DB_PATH`     | SQLite database file                  | `database.sqlite` |
| `DB_SYNC`     | Auto-sync database schema             | `true`            |
| `DB_LOGGING`  | Enable SQL query logging              | `true`            |
| `LOG_LEVEL`   | Logging level (debug/info/warn/error) | `debug`           |
| `CORS_ORIGIN` | CORS allowed origins                  | `*`               |

## API Usage Examples

### Create Resource

```bash
curl -X POST http://localhost:3000/api/v1/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Resource",
    "description": "A sample resource for testing",
    "category": "example"
  }'
```

### Get All Resources

```bash
curl http://localhost:3000/api/v1/resources
```

### Get Resources with Filters

```bash
curl "http://localhost:3000/api/v1/resources?category=example&limit=5"
```

### Update Resource

```bash
curl -X PUT http://localhost:3000/api/v1/resources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Resource Name"
  }'
```

### Delete Resource

```bash
curl -X DELETE http://localhost:3000/api/v1/resources/1
```

## Project Structure

```
src/
├── config/          # Configuration management
├── controllers/     # Request handlers & API controllers
├── dto/             # Data Transfer Objects & validation
├── entities/        # TypeORM entities
├── middleware/      # Express middleware
├── services/        # Business logic
├── routes/          # API routes
├── types/           # TypeScript types
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Testing

Run integration tests:

```bash
yarn test
```

Run with coverage:

```bash
yarn test:coverage
```

## Development

**Type checking:**

```bash
yarn lint
```

**Database operations:**

```bash
yarn typeorm --help
```

## Technologies

- Express.js
- TypeScript
- TypeORM
- SQLite
- Jest
