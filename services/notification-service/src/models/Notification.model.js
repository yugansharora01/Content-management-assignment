import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true, 
        // Example: 'CONTENT_CREATED', 'REPORT_GENERATED', 'SYSTEM_ALERT'
    },
    message: {
        type: String,
        required: true,
    },
    relatedId: {
        type: String, 
        // Can be contentId, reportId etc.
    },
    userId: {
        type: String,
        // Null means broadcast to all
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
