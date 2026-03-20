const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name role')
      .populate({
        path: 'patient',
        select: 'name village currentRiskLevel patientId'
      })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, notifications });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};
