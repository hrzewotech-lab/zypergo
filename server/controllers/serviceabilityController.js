const ServiceabilityRule = require('../models/ServiceabilityRule');

// --- GET ALL RULES ---
exports.getRules = async (req, res) => {
  try {
    const rules = await ServiceabilityRule.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: rules });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch rules.' });
  }
};

// --- CREATE RULE ---
exports.createRule = async (req, res) => {
  try {
    const rule = await ServiceabilityRule.create({ ...req.body, createdBy: req.user?.id });
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create rule.' });
  }
};

// --- UPDATE RULE ---
exports.updateRule = async (req, res) => {
  try {
    const rule = await ServiceabilityRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' });
    res.status(200).json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update rule.' });
  }
};

// --- DELETE RULE ---
exports.deleteRule = async (req, res) => {
  try {
    const rule = await ServiceabilityRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete rule.' });
  }
};

// --- THE ENGINE: CHECK SERVICEABILITY ---
exports.checkServiceability = async (req, res) => {
  try {
    const {
      originPincode, destPincode,
      originCity, destCity,
      weight = 0,
      length = 0, width = 0, height = 0,
      category,
      itemDescription = ''
    } = req.body;

    const volume = length * width * height;

    // Fetch all active rules
    const activeRules = await ServiceabilityRule.find({ isActive: true });

    for (const rule of activeRules) {
      // 1. Global Constraints
      if (rule.ruleType === 'GlobalConstraint') {
        if (rule.maxWeight && weight > rule.maxWeight) {
          return res.status(200).json({ isServiceable: false, reason: rule.reason });
        }
        if (rule.maxVolume && volume > rule.maxVolume) {
          return res.status(200).json({ isServiceable: false, reason: rule.reason });
        }
      }

      // 2. Prohibited Items (Regex / Keyword match)
      if (rule.ruleType === 'ProhibitedItem' && rule.keyword) {
        const regex = new RegExp(rule.keyword, 'i');
        if (regex.test(itemDescription)) {
          return res.status(200).json({ isServiceable: false, reason: rule.reason });
        }
      }

      // 3. Category Blocks
      if (rule.ruleType === 'CategoryBlock' && rule.category) {
        if (rule.category === category) {
          return res.status(200).json({ isServiceable: false, reason: rule.reason });
        }
      }

      // 4. City Blocks
      if (rule.ruleType === 'CityBlock' && rule.city) {
        if (rule.city === originCity || rule.city === destCity) {
          return res.status(200).json({ isServiceable: false, reason: rule.reason });
        }
      }

      // 5. Pincode Blocks
      if (rule.ruleType === 'PincodeBlock' && rule.originPincode) {
        // A rule might block a specific pincode entirely (both origin or dest)
        if (rule.originPincode === originPincode || rule.originPincode === destPincode) {
          return res.status(200).json({ isServiceable: false, reason: rule.reason });
        }
      }

      // 6. Route Blocks (Origin to Dest specific)
      if (rule.ruleType === 'RouteBlock' && rule.originPincode && rule.destPincode) {
        if (rule.originPincode === originPincode && rule.destPincode === destPincode) {
          return res.status(200).json({ isServiceable: false, reason: rule.reason });
        }
      }
    }

    // Passed all checks!
    return res.status(200).json({ isServiceable: true, reason: 'Service is available for this route and item.' });

  } catch (err) {
    console.error('[Serviceability Engine]', err.message);
    res.status(500).json({ success: false, error: 'Serviceability check failed.' });
  }
};
