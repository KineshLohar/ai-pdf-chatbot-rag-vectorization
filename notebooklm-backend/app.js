import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ensureSchema, checkWeaviateConnection } from './services/vectorStore.js';
import uploadRouter from './routes/upload.route.js';
import askRouter from './routes/ask.route.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'  // fallback to * if not set
}));
app.use(express.json({ limit: '50mb' }));

app.use('/api/upload', uploadRouter);
app.use('/api/ask', askRouter);

async function startServer() {
    try {
        await checkWeaviateConnection();
      } catch (err) {
        console.error("ERROR CHECKING",err.message);
        process.exit(1);
      }
    
      try {
        await ensureSchema();
      } catch (err) {
        console.error('Schema setup failed:', err.message);
        process.exit(1);
      }
      
    try {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });
    } catch (err) {
        console.error("Fatal error during startup:", err);
        process.exit(1); 
    }
}

startServer();
