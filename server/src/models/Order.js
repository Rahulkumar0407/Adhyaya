import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Order items
    items: [{
        itemType: {
            type: String,
            enum: ['course', 'subscription'],
            required: true
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'items.itemType'
        },
        title: String,
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
    }],
    
    // Pricing
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        amount: { type: Number, default: 0 },
        code: String,
        type: { type: String, enum: ['percentage', 'fixed'] }
    },
    tax: {
        amount: { type: Number, default: 0 },
        percentage: Number
    },
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    
    // Payment details
    paymentProvider: {
        type: String,
        enum: ['razorpay', 'stripe', 'free'],
        required: true
    },
    providerOrderId: String, // razorpay_order_id or stripe_payment_intent_id
    providerPaymentId: String, // razorpay_payment_id or stripe_charge_id
    providerSignature: String,
    
    // Status
    status: {
        type: String,
        enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    
    // Timestamps for payment
    paidAt: Date,
    refundedAt: Date,
    cancelledAt: Date,
    
    // Payment metadata
    paymentMethod: String, // card, upi, netbanking, wallet
    metadata: mongoose.Schema.Types.Mixed,
    
    // Receipt
    receiptUrl: String,
    invoiceNumber: String,
    
    // Refund details
    refund: {
        amount: Number,
        reason: String,
        processedAt: Date,
        refundId: String
    }
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ providerOrderId: 1 });
orderSchema.index({ invoiceNumber: 1 });

// Generate invoice number
orderSchema.pre('save', function(next) {
    if (!this.invoiceNumber && this.status === 'paid') {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        this.invoiceNumber = `INV-${year}${month}-${this._id.toString().slice(-6).toUpperCase()}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
