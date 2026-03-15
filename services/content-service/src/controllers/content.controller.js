import Content from '../models/Content.model.js';
import redisClient from '../config/redis.js';
import { publishAuditEvent, publishNotificationEvent } from '../services/eventPublisher.service.js';

const CACHE_TTL = 3600; // 1 hour

// Helper to invalidate cache namespaces
const clearContentCache = async (contentId = null) => {
    try {
        // Clear paginated list caches (this is a simple implementation, standard in a real-world is scan and delete)
        const keys = await redisClient.keys('content:list:*');
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
        if (contentId) {
            await redisClient.del(`content:${contentId}`);
        }
    } catch (e) { console.error('Cache clear error', e); }
};

export const createContent = async (req, res) => {
    try {
        const { title, body, tags, status } = req.body;
        const authorId = req.body.authorId || req.headers['x-user-id'];
        
        const newContent = new Content({ title, body, authorId, tags, status });
        const saved = await newContent.save();

        await clearContentCache();
        
        // Asynchronous Events
        publishAuditEvent('CONTENT_CREATED', { contentId: saved._id, title: saved.title });
        publishNotificationEvent('CONTENT_CREATED', `New content created: ${title}`, saved._id);

        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: 'Error creating content', error: error.message });
    }
};

export const getAllContent = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const cacheKey = `content:list:${page}:${limit}`;

        // Attempt Cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }

        // Cache miss -> DB
        const skip = (page - 1) * limit;
        const contents = await Content.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Content.countDocuments();
        
        const responseData = {
            data: contents,
            page,
            totalPages: Math.ceil(total / limit),
            total
        };

        // Populate Cache
        await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: CACHE_TTL });

        res.json(responseData);
    } catch (error) {
         res.status(500).json({ message: 'Error fetching contents', error: error.message });
    }
};

export const getContentById = async (req, res) => {
    try {
        const cacheKey = `content:${req.params.id}`;
        
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
             return res.json(JSON.parse(cachedData));
        }

        const content = await Content.findById(req.params.id);
        if (!content) return res.status(404).json({ message: 'Content not found' });

        await redisClient.set(cacheKey, JSON.stringify(content), { EX: CACHE_TTL });
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching content', error: error.message });
    }
};

export const updateContent = async (req, res) => {
    try {
         const content = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true });
         if (!content) return res.status(404).json({ message: 'Content not found' });

         await clearContentCache(content._id);
         publishAuditEvent('CONTENT_UPDATED', { contentId: content._id, title: content.title });

         res.json(content);
    } catch (error) {
         res.status(500).json({ message: 'Error updating content', error: error.message });
    }
}

export const deleteContent = async (req, res) => {
    try {
         const content = await Content.findByIdAndDelete(req.params.id);
         if (!content) return res.status(404).json({ message: 'Content not found' });

         await clearContentCache(content._id);
         publishAuditEvent('CONTENT_DELETED', { contentId: content._id, title: content.title });

         res.json({ message: 'Content successfully deleted' });
    } catch (error) {
         res.status(500).json({ message: 'Error deleting content', error: error.message });
    }
}
