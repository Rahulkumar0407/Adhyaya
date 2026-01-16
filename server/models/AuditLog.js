import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
        // Examples: 'CREATE_JOB', 'APPLY_JOB', 'UPDATE_STATUS'
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resourceType: {
        type: String,
        required: true
        // 'Job', 'Application'
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed
        // Details about changes or the object state
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
