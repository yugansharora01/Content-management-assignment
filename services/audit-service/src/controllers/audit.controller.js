import AuditLog from '../models/AuditLog.model.js';

export const createLog = async (req, res) => {
    try {
        const { action, details, userId } = req.body;
        
        const newLog = new AuditLog({
            action,
            details,
            userId,
        });

        const savedLog = await newLog.save();
        
        // Audit service doesn't typically return full records to internal webhook hits, 
        // just an acknowledgment, but we'll return the object for assignment visibility.
        res.status(201).json({ message: 'Audit log created', data: savedLog });
    } catch (error) {
        res.status(500).json({ message: 'Error creating audit log', error: error.message });
    }
};

export const getLogs = async (req, res) => {
     try {
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 20;
          
          let query = {};
          if (req.query.userId) query.userId = req.query.userId;
          if (req.query.action) query.action = req.query.action;

           // Pagination skip
          const skip = (page - 1) * limit;

          const logs = await AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
          const total = await AuditLog.countDocuments(query);

          res.json({
              data: logs,
              page,
              totalPages: Math.ceil(total / limit),
              total
          });
     } catch (error) {
          res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
     }
}
