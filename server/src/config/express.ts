import express, { Express, raw, Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import cors from 'cors';
import routes from '../api/routes/v1';
import swaggerFile from '../../swagger_output.json';

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(
  cors({
    // origin: ['http://localhost:3000', 'http://localhost:3001'],
    origin: '*', // enable this if testing from multiple devices
  }),
);

console.log('Routes Loaded');

// mount api v1 routes
app.use('/v1', routes);

/**
 * GET v1/docs
 */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

export default app;
