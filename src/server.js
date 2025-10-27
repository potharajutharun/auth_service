import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { db } from './config/db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

// Health check
app.get('/', (req, res) => res.send('Auth Service Running'));

const PORT = process.env.PORT || 4000;

db.getConnection()
  .then(() => {
    console.log('✅ Connected to MySQL');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ DB connection failed:', err.message));
