const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');


// Load environment variables
dotenv.config();


// Initialize express app
const app = express();


// Connect to MongoDB
connectDB();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Auth routes (public)
app.use('/api/auth', require('./routes/authRoutes'));

// Protected routes (require authentication)
const authMiddleware = require('./middleware/authMiddleware');
app.use('/api/projects', authMiddleware, require('./routes/projectRoutes'));
app.use('/api/tasks', authMiddleware, require('./routes/taskRoutes'));
app.use('/api/team', authMiddleware, require('./routes/teamRoutes'));


// Health check
app.get('/', (req, res) => {
  res.json({ message: 'VZNX API Running' });
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
