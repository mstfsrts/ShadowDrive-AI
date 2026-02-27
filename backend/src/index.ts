// ─── ShadowDrive AI — Backend Entry Point ───

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { generateRouter } from './routes/generate';
import { authRouter } from './routes/auth';
import { progressRouter } from './routes/progress';
import { favoritesRouter } from './routes/favorites';
import { coursesRouter } from './routes/courses';
import { healthRouter } from './routes/health';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Global Middleware ───
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

// ─── Routes ───
app.use('/api', healthRouter);
app.use('/api', generateRouter);
app.use('/api/auth', authRouter);
app.use('/api', progressRouter);
app.use('/api', favoritesRouter);
app.use('/api', coursesRouter);

// ─── Error Handler ───
app.use(errorHandler);

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`\n🚀 ShadowDrive Backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Generate: POST http://localhost:${PORT}/api/generate\n`);
});

export default app;
