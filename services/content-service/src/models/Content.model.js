import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    body: {
        type: String,
        required: true,
    },
    authorId: {
        type: String,
        required: true, // Typically referenced from auth token
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true,
});

const Content = mongoose.model('Content', contentSchema);
export default Content;
