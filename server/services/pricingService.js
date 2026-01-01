/**
 * Calculate doubt price based on subject and priority
 * @param {String} subject - Subject area
 * @param {String} priority - normal | stuck | urgent
 * @returns {Object} Pricing details
 */
export const calculateDoubtPrice = (subject, priority = 'normal') => {
    // Base pricing per subject
    const basePrices = {
        'dsa': 99,
        'dbms': 79,
        'cn': 79,
        'os': 79,
        'system-design': 149,
        'frontend': 119,
        'backend': 119
    };

    // Priority multipliers
    const priorityMultipliers = {
        'normal': 1,
        'stuck': 1.5,
        'urgent': 2
    };

    // Estimated response times (in minutes)
    const estimatedTimes = {
        'normal': 120,    // 2 hours
        'stuck': 60,      // 1 hour
        'urgent': 30      // 30 minutes
    };

    const basePrice = basePrices[subject] || 99;
    const multiplier = priorityMultipliers[priority] || 1;
    const totalPrice = Math.round(basePrice * multiplier);
    const estimatedTime = estimatedTimes[priority] || 120;

    return {
        basePrice,
        multiplier,
        totalPrice,
        estimatedTime,
        currency: 'INR'
    };
};

/**
 * Calculate follow-up price
 * @param {Number} followUpCount - Current follow-up count
 * @param {Number} freeLimit - Free follow-ups allowed
 * @returns {Number} Price for this follow-up
 */
export const calculateFollowUpPrice = (followUpCount, freeLimit = 2) => {
    if (followUpCount < freeLimit) {
        return 0; // First 2 are free
    }

    if (followUpCount === freeLimit) {
        return 29; // 3rd follow-up
    }

    return 49; // 4th and beyond
};

/**
 * Calculate mentor earnings
 * @param {Number} doubtPrice - Total doubt price
 * @returns {Object} Earning breakdown
 */
export const calculateMentorEarnings = (doubtPrice) => {
    const platformFee = 0.20; // 20% platform fee
    const mentorShare = 0.80; // 80% to mentor

    return {
        totalPrice: doubtPrice,
        platformFee: Math.round(doubtPrice * platformFee),
        mentorEarning: Math.round(doubtPrice * mentorShare),
        mentorSharePercent: 80
    };
};

/**
 * Calculate dynamic pricing based on mentor quality
 * @param {Number} basePrice
 * @param {Number} mentorQualityScore - 0-100
 * @returns {Number}
 */
export const calculateDynamicPrice = (basePrice, mentorQualityScore) => {
    // Top mentors (90+) can charge 10% more
    if (mentorQualityScore >= 90) {
        return Math.round(basePrice * 1.1);
    }

    // Average mentors (70-89) charge base price
    if (mentorQualityScore >= 70) {
        return basePrice;
    }

    // New/lower rated mentors (below 70) charge 10% less
    return Math.round(basePrice * 0.9);
};

/**
 * Generate pricing summary for student
 * @param {String} subject
 * @param {String} priority
 * @param {Object} mentor - Optional mentor object
 * @returns {Object}
 */
export const getPricingSummary = (subject, priority = 'normal', mentor = null) => {
    const basePricing = calculateDoubtPrice(subject, priority);

    let finalPrice = basePricing.totalPrice;

    // Adjust for mentor quality if provided
    if (mentor && mentor.qualityScore) {
        finalPrice = calculateDynamicPrice(finalPrice, mentor.qualityScore);
    }

    return {
        subject,
        priority,
        basePrice: basePricing.basePrice,
        priorityMultiplier: basePricing.multiplier,
        finalPrice,
        estimatedResponseTime: basePricing.estimatedTime,
        breakup: {
            base: basePricing.basePrice,
            priorityCharge: finalPrice - basePricing.basePrice,
            total: finalPrice
        },
        currency: 'INR',
        followUpInfo: {
            freeFollowUps: 2,
            thirdFollowUpPrice: 29,
            beyondPrice: 49
        }
    };
};

export default {
    calculateDoubtPrice,
    calculateFollowUpPrice,
    calculateMentorEarnings,
    calculateDynamicPrice,
    getPricingSummary
};
