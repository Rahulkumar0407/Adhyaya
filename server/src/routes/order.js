import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createOrder, verifyPayment } from '../controllers/orderController.js';

const router = express.Router();

router.use(protect);

router.post('/create', createOrder);
router.post('/verify', verifyPayment);

export default router;
