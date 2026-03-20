const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const { status, riskLevel, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('patient', 'name village patientId')
        .populate('alertedDoctor', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Alert.countDocuments(filter)
    ]);

    res.json({ alerts, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'acknowledged', acknowledgedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json({ alert });
  } catch (err) {
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
};

exports.getAlertStats = async (req, res) => {
  try {
    const stats = await Alert.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get alert stats' });
  }
};
