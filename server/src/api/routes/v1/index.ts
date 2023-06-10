import express from 'express';

import fileRoutes from './file.route';

const router = express.Router();

/**
 * GET v1/docs
 */
// router.use("/docs", express.static("docs"));

router.use('/file', fileRoutes);

export default router;
