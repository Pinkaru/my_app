import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ DB connected successfully!');
  } catch (err) {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  }
};

// Define Schema and Model
const dataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

const Data = mongoose.model('Data', dataSchema);

// Initialize counter data
const initializeCounter = async () => {
  try {
    const data = await Data.findOne({ name: 'myData' });
    if (!data) {
      const newData = await Data.create({ name: 'myData', count: 0 });
      console.log('✅ Counter initialized:', newData);
    }
  } catch (err) {
    console.error('❌ Counter initialization error:', err);
  }
};

// Configure Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', async (req, res) => {
  try {
    const data = await Data.findOne({ name: 'myData' });
    if (!data) {
      return res.status(404).send('Data not found');
    }

    data.count++;
    await data.save();

    res.render('index', { count: data.count });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/reset', async (req, res) => {
  try {
    const data = await Data.findOne({ name: 'myData' });
    if (!data) {
      return res.status(404).send('Data not found');
    }

    data.count = 0;
    await data.save();

    res.render('index', { count: data.count });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/set/count', async (req, res) => {
  try {
    const newCount = parseInt(req.query.count, 10);
    if (isNaN(newCount)) {
      return res.status(400).send('Invalid count value');
    }

    const data = await Data.findOne({ name: 'myData' });
    if (!data) {
      return res.status(404).send('Data not found');
    }

    data.count = newCount;
    await data.save();

    res.render('index', { count: data.count });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/set/:num', async (req, res) => {
  try {
    const newCount = parseInt(req.params.num, 10);
    if (isNaN(newCount)) {
      return res.status(400).send('Invalid number');
    }

    const data = await Data.findOne({ name: 'myData' });
    if (!data) {
      return res.status(404).send('Data not found');
    }

    data.count = newCount;
    await data.save();

    res.render('index', { count: data.count });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Export for testing
export { app, connectDB, initializeCounter, Data };

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    await connectDB();
    await initializeCounter();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  };

  startServer();
}
