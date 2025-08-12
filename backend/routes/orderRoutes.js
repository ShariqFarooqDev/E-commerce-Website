import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  createStripePaymentIntent, // New controller for Stripe
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/mine').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid); // This will now confirm the payment
router.route('/:id/create-stripe-intent').post(protect, createStripePaymentIntent); // New route
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router;