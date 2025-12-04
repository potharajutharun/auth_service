import 'dotenv/config';

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { db } from "./config/db.js";

// dotenv.config();

import 'dotenv/config';
console.log('ENV DB_HOST=', process.env.DB_HOST);
console.log('ENV DB_USER=', process.env.DB_USER);
console.log('ENV DB_PASSWORD present=', !!process.env.DB_PASSWORD);
console.log('ENV DB_PASS present=', !!process.env.DB_PASS);

const app = express();
const options = {
  origin: ['http://localhost:3000','https://adminportal-2r3x.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(options));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

// Health check
// app.get('/', (req, res) => console.log("hi"));  

const PORT = process.env.PORT || 4000;

db.getConnection()
  .then(() => {
    console.log('✅ Connected to MySQL');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ DB connection failed:', err.message));
