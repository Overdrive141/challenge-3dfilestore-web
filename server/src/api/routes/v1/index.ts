import express from 'express';

import fileRoutes from './file.route';

const router = express.Router();

router.use('/file', fileRoutes);

export default router;
