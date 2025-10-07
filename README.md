# My App - Visitor Counter

A modern visitor counter web application built with Express.js and MongoDB.

## Features

- 📊 Real-time visitor counting
- 🔄 Counter reset functionality
- ⚙️ Custom counter value setting
- 🎨 Modern, responsive UI
- 🚀 Built with latest technologies

## Tech Stack

- **Node.js** 18+
- **Express.js** 4.x
- **MongoDB** with Mongoose 8.x
- **EJS** templating engine
- **ES Modules** (modern JavaScript)

## Prerequisites

- Node.js 18.0.0 or higher
- MongoDB instance (local or cloud)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Pinkaru/my_app.git
cd my_app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

## Running the Application

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

- `GET /` - Main page (increments counter)
- `GET /reset` - Reset counter to 0
- `GET /set/count?count=N` - Set counter to specific value N
- `GET /set/:num` - Set counter to specific value (URL parameter)

## Project Structure

```
my_app/
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
├── views/             # EJS templates
│   └── index.ejs      # Main page template
└── public/            # Static files
    └── stylesheets/
        └── master.css # Styles
```

## Testing

The project includes comprehensive unit and integration tests using Jest and Supertest.

### Running Tests

Run all tests:
```bash
npm test
```

Run unit tests only:
```bash
npm run test:unit
```

Run integration tests only:
```bash
npm run test:integration
```

Generate coverage report:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Structure

```
test/
├── unit/               # Unit tests
│   ├── models/        # MongoDB model tests
│   └── services/      # Business logic tests
├── integration/       # Integration tests
│   ├── routes/        # API endpoint tests
│   └── e2e.test.js   # End-to-end scenarios
└── helpers/           # Test utilities
```

### Running Tests with Docker

For integration tests that require MongoDB:

1. Start the test MongoDB container:
```bash
docker-compose -f docker-compose.test.yml up -d
```

2. Run the tests:
```bash
npm test
```

3. Stop the container:
```bash
docker-compose -f docker-compose.test.yml down -v
```

## Code Quality

Run linting:
```bash
npm run lint
```

Auto-fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

## CI/CD Pipeline

This project uses Jenkins for continuous integration and delivery. The pipeline includes:

### Pipeline Stages

1. **Checkout** - Clone source code from repository
2. **Setup** - Install Node.js dependencies
3. **Lint** - Run ESLint for code quality
4. **Format Check** - Verify code formatting with Prettier
5. **Start Test Database** - Launch MongoDB container for testing
6. **Unit Tests** - Run isolated unit tests
7. **Integration Tests** - Run API and database integration tests
8. **Test Coverage** - Generate code coverage report
9. **Build** - Prepare production build
10. **Archive Artifacts** - Store build artifacts

### Build Status

The Jenkins pipeline automatically runs on every push to the repository. Build status is reported back to GitHub via commit statuses.

### Pipeline Configuration

The pipeline is configured in `Jenkinsfile` and uses:
- Docker Compose for test database
- Jest for testing framework
- ESLint & Prettier for code quality
- Automated cleanup after each build

### Test Environment

Tests run in an isolated environment with:
- MongoDB 7 in Docker container
- Separate test database (`myapp_test`)
- In-memory MongoDB for fast unit tests

## Changes from Legacy Version

### Updated Dependencies
- Express: 4.13.4 → 4.21.2
- Mongoose: 4.4.15 → 8.9.3
- EJS: 2.4.1 → 3.1.10

### Code Improvements
- ✅ ES6+ syntax (const/let, arrow functions, async/await)
- ✅ Environment variables for configuration
- ✅ Improved error handling
- ✅ Modern MongoDB connection
- ✅ Better project structure
- ✅ ESLint & Prettier integration
- ✅ Removed deprecated mlab connection

### Removed Legacy Code
- Removed `exam_0508/FizzBuzz.js` practice file
- Removed old EJS template
- Cleaned up unused code

## License

ISC


Test auto build trigger
