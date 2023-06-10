import express, { Express, raw, Request, Response } from 'express';
import dotenv from 'dotenv';

import cors from 'cors';
import routes from '../api/routes/v1';

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    // origin: '*', // enable this if testing from multiple devices
  }),
);

console.log('Routes Loaded');

// mount api v1 routes
app.use('/v1', routes);

export default app;
