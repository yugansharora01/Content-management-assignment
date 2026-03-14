import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    trigger: {
        type: String,
        enum: ['manual', 'cron'],
        default: 'manual',
    },
    errorDetails: {
        type: String,
    }
}, {
    timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
