import Notification from '../models/Notification.model.js';
import { broadcastEvent } from '../config/socket.js';

export const publishNotification = async (req, res) => {
    try {
        const { type, message, relatedId, userId } = req.body;
        
        const newNotification = new Notification({
            type,
            message,
            relatedId,
            userId,
        });

        const savedNotification = await newNotification.save();

        // Push real-time event
        broadcastEvent({
             _id: savedNotification._id,
             type: savedNotification.type,
             message: savedNotification.message,
             relatedId: savedNotification.relatedId,
             userId: savedNotification.userId,
             createdAt: savedNotification.createdAt
        });

        res.status(201).json({ message: 'Notification published', data: savedNotification });
    } catch (error) {
        res.status(500).json({ message: 'Error publishing notification', error: error.message });
    }
};

export const getUserNotifications = async (req, res) => {
     try {
          // In a real app, this comes from req.user set by an auth-middleware
          // For the assignment, we allow optionally passing `?userId=X` to simulate it
          let query = {};
          if (req.query.userId) {
               query = { $or: [{ userId: req.query.userId }, { userId: { $exists: false } }, { userId: null }] };
          }
          const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
          res.json(notifications);
     } catch (error) {
          res.status(500).json({ message: 'Error fetching notifications', error: error.message });
     }
}

export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
}
