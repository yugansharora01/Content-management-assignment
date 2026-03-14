import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        // Example: 'CONTENT_CREATED', 'USER_LOGGED_IN'
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        // Stores payload references dynamically (e.g. contentId, reportType)
    },
    userId: {
        type: String, 
        // Optional
    }
}, {
    timestamps: true, // Automatically provides `createdAt` and `updatedAt`
});

// Index to quickly sort/query timeseries audit log lists
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
