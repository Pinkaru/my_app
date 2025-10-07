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

## Code Quality

Run linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

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
