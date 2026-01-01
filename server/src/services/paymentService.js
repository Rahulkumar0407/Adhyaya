import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import AppError from '../utils/appError.js';

class PaymentService {
    /**
     * Create a Razorpay order
     * @param {number} amount - Amount in basic unit (e.g. INR)
     * @param {string} currency - 'INR'
     * @param {string} receipt - Unique receipt ID (Order ID)
     */
    static async createRazorpayOrder(amount, currency = 'INR', receipt) {
        try {
            const options = {
                amount: amount * 100, // Razorpay expects amount in paise
                currency,
                receipt,
                payment_capture: 1
            };

            const order = await razorpay.orders.create(options);
            return order;
        } catch (error) {
            throw new AppError(`Razorpay Order Creation Failed: ${error.message}`, 500);
        }
    }

    /**
     * Verify Razorpay signature
     */
    static verifySignature(orderId, paymentId, signature) {
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${orderId}|${paymentId}`);
        const generatedSignature = hmac.digest('hex');

        return generatedSignature === signature;
    }

    /**
     * Mock verification for hackathon demo
     */
    static verifyMockPayment(orderId) {
        // In a real mock, we just return true to simulate success
        return true;
    }
}

export default PaymentService;
