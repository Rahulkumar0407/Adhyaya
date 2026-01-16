import mongoose from 'mongoose';

const systemConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ['maintenance', 'limits', 'global_settings']
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Helper method to get config
systemConfigSchema.statics.getConfig = async function (key) {
    const config = await this.findOne({ key });
    return config ? config.value : null;
};

// Helper method to set config
systemConfigSchema.statics.setConfig = async function (key, value, userId = null) {
    return await this.findOneAndUpdate(
        { key },
        {
            value,
            updatedBy: userId,
            lastUpdated: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

export default SystemConfig;
