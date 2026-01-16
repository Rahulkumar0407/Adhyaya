// Admin Dashboard Types - Generated from MongoDB Models

// User Interface
export interface IUser {
    _id: string;
    email: string;
    name: string;
    role: 'student' | 'mentor' | 'admin';
    avatar: string;
    phone?: string;
    bio?: string;
    location?: string;
    college?: string;
    course?: string;
    graduationYear?: number;
    socialLinks?: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
    };
    isActive: boolean;
    streakCount: number;
    longestStreak: number;
    lastActive: Date | string;
    xpPoints: number;
    level: number;
    problemsSolved: number;
    babuaCoins: number;
    codingProfiles?: {
        leetcode?: {
            username?: string;
            verified: boolean;
            stats?: {
                totalSolved: number;
                easySolved: number;
                mediumSolved: number;
                hardSolved: number;
                ranking?: number;
                contestRating?: number;
            };
        };
        codeforces?: {
            username?: string;
            verified: boolean;
            stats?: {
                rating?: number;
                maxRating?: number;
                rank?: string;
                solved: number;
            };
        };
    };
    revisionMode: 'adaptive' | 'manual' | 'unset';
    createdAt: Date | string;
    updatedAt: Date | string;
}

// Mentor Interface
export interface IMentor {
    _id: string;
    user: IUser | string;
    headline: string;
    bio?: string;
    expertise: string[];
    yearsOfExperience: number;
    currentCompany?: string;
    currentRole?: string;
    workHistory?: Array<{
        company: string;
        role: string;
        duration: string;
        isCurrent: boolean;
    }>;
    ratePerMinute: number;
    minCallDuration: number;
    isOnline: boolean;
    lastOnline: Date | string;
    availableSlots?: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }>;
    rating: number;
    totalReviews: number;
    totalSessions: number;
    totalMinutes: number;
    isVerified: boolean;
    applicationStatus: 'pending' | 'approved' | 'rejected';
    totalEarned: number;
    pendingPayout: number;
    instantCallEnabled: boolean;
    scheduledCallEnabled: boolean;
    createdAt: Date | string;
}

// Doubt Interface
export interface IDoubt {
    _id: string;
    student: IUser | string;
    assignedMentor?: IUser | string;
    mentorMatchScore?: number;
    subject: 'dsa' | 'dbms' | 'cn' | 'os' | 'system-design' | 'frontend' | 'backend';
    subTopic: string;
    title: string;
    description: string;
    codeBlocks?: Array<{
        language: string;
        code: string;
    }>;
    attachments?: Array<{
        type: 'image' | 'pdf' | 'document';
        url: string;
        filename: string;
        size: number;
    }>;
    status: 'pending' | 'ai-reviewed' | 'mentor-assigned' | 'in-progress' | 'answered' | 'resolved';
    priority: 'normal' | 'stuck' | 'urgent';
    stuckSince?: Date | string;
    basePrice: number;
    priorityMultiplier: number;
    totalPrice: number;
    isPaid: boolean;
    paymentId?: string;
    estimatedResponseTime: number;
    actualResponseTime?: number;
    firstResponseAt?: Date | string;
    resolvedAt?: Date | string;
    followUpCount: number;
    rating?: number;
    feedback?: string;
    isResolved: boolean;
    createdAt: Date | string;
}

// Call Interface
export interface ICall {
    _id: string;
    student: IUser | string;
    mentor: IMentor | string;
    callType: 'instant' | 'scheduled';
    scheduledFor?: Date | string;
    scheduledDuration?: number;
    confirmedAt?: Date | string;
    startedAt?: Date | string;
    endedAt?: Date | string;
    durationMinutes: number;
    ratePerMinute: number;
    totalCost: number;
    paymentStatus: 'pending' | 'completed' | 'refunded' | 'failed';
    transactionId?: string;
    status: 'scheduled' | 'confirmed' | 'waiting' | 'ongoing' | 'completed' | 'cancelled' | 'missed';
    cancelledBy?: 'student' | 'mentor' | 'system';
    cancellationReason?: string;
    roomId: string;
    isRecorded: boolean;
    callQuality?: 'excellent' | 'good' | 'fair' | 'poor';
    createdAt: Date | string;
}

// Transaction Interface
export interface ITransaction {
    _id: string;
    type: 'topup' | 'call_charge' | 'doubt_charge' | 'interview_charge' | 'refund' | 'bonus' | 'withdrawal';
    amount: number;
    description: string;
    callId?: string;
    doubtId?: string;
    paymentGateway?: 'razorpay' | 'stripe' | 'manual';
    gatewayTransactionId?: string;
    gatewayOrderId?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    balanceAfter: number;
    createdAt: Date | string;
}

// Wallet Interface
export interface IWallet {
    _id: string;
    user: IUser | string;
    balance: number;
    currency: string;
    transactions: ITransaction[];
    totalSpent: number;
    totalTopups: number;
    lowBalanceThreshold: number;
    createdAt: Date | string;
}

// Activity Interface
export interface IActivity {
    _id: string;
    user: string;
    date: Date | string;
    count: number;
    activities: Array<{
        type: 'video_watched' | 'quiz_taken' | 'problem_solved' | 'lesson_completed';
        timestamp: Date | string;
        metadata?: {
            courseId?: string;
            lessonId?: string;
            videoId?: string;
            quizId?: string;
        };
    }>;
}

// Admin Dashboard Specific Types
export interface IUserDossier extends IUser {
    wallet?: IWallet;
    activities?: IActivity[];
    totalWatchTime?: number;
    totalMoneySpent?: number;
    recentDoubts?: IDoubt[];
    recentCalls?: ICall[];
    revisionHistory?: Array<{
        topicId: string;
        topicTitle: string;
        understandingLevel: string;
        completedAt: Date | string;
    }>;
}

export interface IServerHealth {
    status: 'healthy' | 'degraded' | 'down';
    apiLatency: number;
    dbStatus: 'connected' | 'disconnected';
    dbLatency: number;
    activeConnections: number;
    uptime: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
}

export interface IAdminStats {
    totalUsers: number;
    totalMentors: number;
    totalRevenue: number;
    activeDoubts: number;
    activeCalls: number;
    todayTransactions: number;
}

export interface ICoupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxUses?: number;
    usedCount: number;
    validFrom: Date | string;
    validUntil: Date | string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date | string;
}
