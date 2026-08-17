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
      parcelValue = 0,
      vehicle = 'GoFast'
    } = req.body;

    // Mock distance if not provided
    const calcDistance = distanceKm > 0 ? distanceKm : (originCity === destCity ? 15 : 350);

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
      const pMatch = (!rule.conditions.originPincode || rule.conditions.originPincode === originPincode) &&
                     (!rule.conditions.destPincode || rule.conditions.destPincode === destPincode);
      
      if (wMatch && cMatch && pMatch) {
        baseRule = rule;
        appliedRules.push(rule.ruleName);
        break; // take first match (can be improved to sort by specificity)
      }
    }

    if (!baseRule) {
      // Dynamic fallback rules based on vehicle
      let vBase = 50; let vPerKm = 5; let vPerKg = 10;
      if (vehicle === 'Bike') { vBase = 40; vPerKm = 8; vPerKg = 5; }
      else if (vehicle === 'Auto') { vBase = 60; vPerKm = 10; vPerKg = 12; }
      else if (vehicle === 'Car') { vBase = 100; vPerKm = 12; vPerKg = 10; }
      else if (vehicle === 'Mini Truck') { vBase = 150; vPerKm = 15; vPerKg = 10; }
      else if (vehicle === 'Heavy Truck') { vBase = 500; vPerKm = 25; vPerKg = 8; }

      baseRule = {
        rates: { basePrice: vBase, perKgRate: vPerKg, perKmRate: vPerKm, handlingCost: 0, minimumCharge: vBase, gstPercentage: 18, insurancePercentage: 0, discountPercentage: 0, partnerCost: vBase * 0.4, riderCost: vBase * 0.3, marginPercentage: 20 }
      };
      appliedRules.push(`Default ${vehicle} Rule`);
    }

    // 4. Calculate Base Costs & Customer Price
    let calculatedBase = baseRule.rates.basePrice + (chargeableWeight * baseRule.rates.perKgRate) + (calcDistance * baseRule.rates.perKmRate);
    let priceBase = Math.max(calculatedBase, baseRule.rates.minimumCharge || 0);
    
    let internalPartnerCost = baseRule.rates.partnerCost + (chargeableWeight * (baseRule.rates.partnerCost > 0 ? 2 : 0)); // mock scaling of partner cost
    let internalRiderCost = baseRule.rates.riderCost;
    let totalHandlingCost = baseRule.rates.handlingCost;

    let subtotal = priceBase + totalHandlingCost;

    // 5. Apply Surcharges
    const surchargeCandidates = activeRules.filter(r => r.isSurcharge);
    let totalSurcharges = 0;

    for (const rule of surchargeCandidates) {
      let apply = false;
      
      // Speed Surcharge (e.g. Express)
      if (rule.speed === speed && speed !== 'Any' && speed !== 'Standard') apply = true;
      
      // Category Surcharge (e.g. Fragile)
      if (rule.conditions.category === category) apply = true;

      if (apply) {
        appliedRules.push(rule.ruleName);
        let surchargeAmount = rule.rates.basePrice + (chargeableWeight * rule.rates.perKgRate);
        subtotal += surchargeAmount;
        totalSurcharges += surchargeAmount;
        
        internalPartnerCost += rule.rates.partnerCost || 0;
        internalRiderCost += rule.rates.riderCost || 0;
        totalHandlingCost += rule.rates.handlingCost || 0;
      }
    }

    // 6. Insurance & Discounts
    const insuranceCost = (parcelValue * (baseRule.rates.insurancePercentage / 100));
    const discountAmount = subtotal * (baseRule.rates.discountPercentage / 100);
    const taxableAmount = subtotal - discountAmount + insuranceCost;

    // 7. Margin / Internal Cost vs Selling Price
    const internalCost = internalPartnerCost + internalRiderCost + totalHandlingCost;
    const profitMargin = (subtotal - discountAmount) - internalCost;

    // 8. Tax (GST)
    const gstAmount = taxableAmount * (baseRule.rates.gstPercentage / 100);
    const totalCustomerPrice = taxableAmount + gstAmount;

    res.status(200).json({
      success: true,
      data: {
        movementType,
        chargeableWeight: parseFloat(chargeableWeight.toFixed(2)),
        actualWeight,
        distanceKm: calcDistance,
        volumetricWeight: parseFloat(volWeight.toFixed(2)),
        breakdown: {
          baseCost: parseFloat(priceBase.toFixed(2)),
          handlingFee: parseFloat(totalHandlingCost.toFixed(2)),
          surcharges: parseFloat(totalSurcharges.toFixed(2)),
          insurance: parseFloat(insuranceCost.toFixed(2)),
          discount: parseFloat(discountAmount.toFixed(2)),
          subtotal: parseFloat(taxableAmount.toFixed(2)),
          gst: parseFloat(gstAmount.toFixed(2)),
          totalCustomerPrice: Math.round(totalCustomerPrice),
        },
        profitability: {
          partnerCost: parseFloat(internalPartnerCost.toFixed(2)),
          riderCost: parseFloat(internalRiderCost.toFixed(2)),
          totalInternalCost: parseFloat(internalCost.toFixed(2)),
          grossMargin: parseFloat(profitMargin.toFixed(2)),
          marginPercentage: parseFloat(((profitMargin / (subtotal - discountAmount)) * 100).toFixed(1)) || 0,
          expectedMarginPercentage: baseRule.rates.marginPercentage
        },
        appliedRules
      }
    });

  } catch (err) {
    console.error('[Pricing Engine]', err.message);
    res.status(500).json({ success: false, error: 'Pricing calculation failed.' });
  }
};
