const PricingRule = require('../models/PricingRule');

// --- GET ALL RULES ---
exports.getRules = async (req, res) => {
  try {
    const rules = await PricingRule.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: rules });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch pricing rules.' });
  }
};

// --- CREATE RULE ---
exports.createRule = async (req, res) => {
  try {
    const rule = await PricingRule.create({ ...req.body, createdBy: req.user?.id });
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create pricing rule.' });
  }
};

// --- UPDATE RULE ---
exports.updateRule = async (req, res) => {
  try {
    const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' });
    res.status(200).json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update pricing rule.' });
  }
};

// --- DELETE RULE ---
exports.deleteRule = async (req, res) => {
  try {
    const rule = await PricingRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete pricing rule.' });
  }
};

// --- PRICING ENGINE CALCULATION (Core & Preview) ---
exports.calculatePrice = async (req, res) => {
  try {
    const {
      originCity, destCity,
      originPincode, destPincode,
      distanceKm = 0,
      actualWeight = 1,
      length = 10, width = 10, height = 10,
      category = 'General Parcel',
      speed = 'Standard',
      parcelValue = 0
    } = req.body;

    const movementType = originCity === destCity ? 'Intracity' : 'Intercity';
    
    // 1. Calculate Volumetric Weight (L x W x H / 5000)
    const volWeight = (length * width * height) / 5000;
    const chargeableWeight = Math.max(actualWeight, volWeight);

    // 2. Fetch Active Rules
    const activeRules = await PricingRule.find({ isActive: true });

    // 3. Find the best Base/Slab rule
    let baseRule = null;
    let appliedRules = [];

    // Filter potential base rules
    const baseCandidates = activeRules.filter(r => !r.isSurcharge && (r.movementType === 'Any' || r.movementType === movementType));
    
    // Pick the most specific base rule based on weight, city, or pincode
    // For simplicity, we just pick the first matching base rule based on weight
    for (const rule of baseCandidates) {
      const wMatch = (!rule.conditions.minWeight || chargeableWeight >= rule.conditions.minWeight) &&
                     (!rule.conditions.maxWeight || chargeableWeight <= rule.conditions.maxWeight);
      const cMatch = (!rule.conditions.originCity || rule.conditions.originCity === originCity) &&
                     (!rule.conditions.destCity || rule.conditions.destCity === destCity);
      
      if (wMatch && cMatch) {
        baseRule = rule;
        appliedRules.push(rule.ruleName);
        break; // take first match (can be improved to sort by specificity)
      }
    }

    if (!baseRule) {
      // Fallback defaults if no rule matches
      baseRule = {
        rates: { basePrice: 50, perKgRate: 10, perKmRate: 0, handlingFee: 0, gstPercentage: 18, insurancePercentage: 0 }
      };
      appliedRules.push('Default Fallback Rule');
    }

    // 4. Calculate Base Cost
    let priceBase = baseRule.rates.basePrice;
    let priceWeight = chargeableWeight * baseRule.rates.perKgRate;
    let priceDistance = distanceKm * baseRule.rates.perKmRate;
    let subtotal = priceBase + priceWeight + priceDistance + baseRule.rates.handlingFee;

    // 5. Apply Surcharges
    const surchargeCandidates = activeRules.filter(r => r.isSurcharge);
    let totalSurcharges = 0;

    for (const rule of surchargeCandidates) {
      let apply = false;
      
      // Speed Surcharge (e.g. Express)
      if (rule.speed === speed && speed !== 'Any' && speed !== 'Standard') {
        apply = true;
      }
      
      // Category Surcharge (e.g. Fragile)
      if (rule.conditions.category === category) {
        apply = true;
      }

      if (apply) {
        appliedRules.push(rule.ruleName);
        subtotal += rule.rates.basePrice; // add fixed surcharge
        subtotal += (chargeableWeight * rule.rates.perKgRate); // add weight based surcharge
        totalSurcharges += (rule.rates.basePrice + (chargeableWeight * rule.rates.perKgRate));
      }
    }

    // 6. Insurance
    const insuranceCost = (parcelValue * (baseRule.rates.insurancePercentage / 100));
    subtotal += insuranceCost;

    // 7. Margin / Internal Cost vs Selling Price
    // Example: Internal cost is estimated as 70% of the customer selling price before tax.
    const internalCost = Math.round(subtotal * 0.7);
    const profitMargin = subtotal - internalCost;

    // 8. Tax (GST)
    const gstAmount = subtotal * (baseRule.rates.gstPercentage / 100);
    const totalCustomerPrice = subtotal + gstAmount;

    res.status(200).json({
      success: true,
      data: {
        movementType,
        chargeableWeight: parseFloat(chargeableWeight.toFixed(2)),
        actualWeight,
        volumetricWeight: parseFloat(volWeight.toFixed(2)),
        breakdown: {
          baseCost: priceBase,
          weightCost: parseFloat(priceWeight.toFixed(2)),
          distanceCost: parseFloat(priceDistance.toFixed(2)),
          handlingFee: baseRule.rates.handlingFee,
          surcharges: parseFloat(totalSurcharges.toFixed(2)),
          insurance: parseFloat(insuranceCost.toFixed(2)),
          subtotal: parseFloat(subtotal.toFixed(2)),
          gst: parseFloat(gstAmount.toFixed(2)),
          totalCustomerPrice: Math.round(totalCustomerPrice),
        },
        profitability: {
          estimatedInternalCost: internalCost,
          grossMargin: parseFloat(profitMargin.toFixed(2)),
          marginPercentage: parseFloat(((profitMargin / subtotal) * 100).toFixed(1)) || 0
        },
        appliedRules
      }
    });

  } catch (err) {
    console.error('[Pricing Engine]', err.message);
    res.status(500).json({ success: false, error: 'Pricing calculation failed.' });
  }
};
