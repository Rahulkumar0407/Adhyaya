import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minPurchase: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null // For percentage coupons, cap the max discount
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    perUserLimit: {
        type: Number,
        default: 1 // How many times a single user can use this
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validTo: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableTo: {
        type: String,
        enum: ['all', 'course', 'mentorship', 'doubt'],
        default: 'all'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    usedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        usedAt: {
            type: Date,
            default: Date.now
        },
        orderId: mongoose.Schema.Types.ObjectId
    }]
}, {
    timestamps: true
});

// Index for faster lookups
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validTo: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return this.isActive &&
        now >= this.validFrom &&
        now <= this.validTo &&
        (this.usageLimit === null || this.usedCount < this.usageLimit);
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function (amount) {
    if (!this.isValid()) return 0;

    if (amount < this.minPurchase) return 0;

    let discount = 0;
    if (this.discountType === 'percentage') {
        discount = (amount * this.discountValue) / 100;
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else {
        discount = this.discountValue;
    }

    return Math.min(discount, amount); // Don't exceed order amount
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
