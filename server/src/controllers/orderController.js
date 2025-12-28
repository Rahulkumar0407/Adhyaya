import Order from '../models/Order.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import PaymentService from '../services/paymentService.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const createOrder = catchAsync(async (req, res, next) => {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
        return next(new AppError('Course not found', 404));
    }

    // Check if course is free
    if (course.pricing.type === 'free') {
        // Direct enrollment logic can be here
        return res.status(400).json({ status: 'fail', message: 'Course is free. Use enrollment instead.' });
    }

    const amount = course.pricing.discountedPrice || course.pricing.amount;

    // Create record in our database
    const order = await Order.create({
        user: req.user.id,
        items: [{
            itemType: 'course',
            item: course._id,
            title: course.title,
            price: amount
        }],
        subtotal: amount,
        totalAmount: amount,
        paymentProvider: 'razorpay',
        status: 'pending'
    });

    // Create Razorpay order (or use mock for hackathon)
    let rpOrder = { id: 'mock_order_' + Date.now() };

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key') {
        try {
            rpOrder = await PaymentService.createRazorpayOrder(amount, 'INR', order._id.toString());
        } catch (error) {
            console.log('Razorpay failed, falling back to Mock for demo purpose.');
        }
    }

    order.providerOrderId = rpOrder.id;
    await order.save();

    res.status(201).json({
        status: 'success',
        data: {
            order,
            razorpayOrder: rpOrder,
            isMock: rpOrder.id.startsWith('mock_')
        }
    });
});

export const verifyPayment = catchAsync(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

    let isValid = false;
    if (isMock || razorpay_order_id.startsWith('mock_')) {
        isValid = PaymentService.verifyMockPayment(razorpay_order_id);
    } else {
        isValid = PaymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    }

    if (!isValid) {
        return next(new AppError('Invalid payment signature', 400));
    }

    const order = await Order.findOne({ providerOrderId: razorpay_order_id });

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    order.status = 'paid';
    order.providerPaymentId = razorpay_payment_id;
    order.providerSignature = razorpay_signature;
    order.paidAt = new Date();
    await order.save();

    // Unlock access to courses
    for (const item of order.items) {
        if (item.itemType === 'course') {
            await Enrollment.create({
                user: order.user,
                course: item.item,
                status: 'active'
            });
        }
    }

    res.status(200).json({
        status: 'success',
        message: 'Payment verified and access granted',
        data: { order }
    });
});
