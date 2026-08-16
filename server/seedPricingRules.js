require('dotenv').config();
const mongoose = require('mongoose');
const PricingRule = require('./models/PricingRule');

async function seedPricingRules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing rules
    await PricingRule.deleteMany({});
    console.log('Cleared existing pricing rules');

    const rules = [
      {
        ruleName: 'Base - Default (Rest of India)',
        ruleType: 'Base',
        movementType: 'Any',
        speed: 'Any',
        isSurcharge: false,
        isActive: true,
        conditions: {},
        rates: {
          basePrice: 80, 
          perKgRate: 20,
          perKmRate: 0,
          minimumCharge: 80,
          handlingCost: 10,
          partnerCost: 40,
          riderCost: 15,
          marginPercentage: 20,
          discountPercentage: 0,
          gstPercentage: 18,
          insurancePercentage: 0
        }
      },
      {
        ruleName: 'Base - Intracity (Hyderabad)',
        ruleType: 'Base',
        movementType: 'Intracity',
        speed: 'Any',
        isSurcharge: false,
        isActive: true,
        conditions: { originCity: 'Hyderabad', destCity: 'Hyderabad' },
        rates: {
          basePrice: 60, // selling base
          perKgRate: 15,
          perKmRate: 0,
          minimumCharge: 60,
          handlingCost: 5,
          partnerCost: 30,
          riderCost: 10,
          marginPercentage: 20,
          discountPercentage: 0,
          gstPercentage: 18,
          insurancePercentage: 0
        }
      },
      {
        ruleName: 'Base - Intercity (Hyd to Vizag)',
        ruleType: 'Route',
        movementType: 'Intercity',
        speed: 'Any',
        isSurcharge: false,
        isActive: true,
        conditions: { originCity: 'Hyderabad', destCity: 'Visakhapatnam' },
        rates: {
          basePrice: 120, // selling base
          perKgRate: 40,
          perKmRate: 0,
          minimumCharge: 150,
          handlingCost: 20,
          partnerCost: 60,
          riderCost: 20,
          marginPercentage: 25,
          discountPercentage: 0,
          gstPercentage: 18,
          insurancePercentage: 0
        }
      },
      {
        ruleName: 'Surcharge - Express Delivery',
        ruleType: 'Surcharge',
        movementType: 'Any',
        speed: 'Express',
        isSurcharge: true,
        isActive: true,
        conditions: {},
        rates: {
          basePrice: 50, // extra 50 fixed
          perKgRate: 5, // extra 5 per kg
          perKmRate: 0,
          minimumCharge: 0,
          handlingCost: 10,
          partnerCost: 25,
          riderCost: 15,
          marginPercentage: 30,
          discountPercentage: 0,
          gstPercentage: 18,
          insurancePercentage: 0
        }
      },
      {
        ruleName: 'Surcharge - Fragile Item',
        ruleType: 'Surcharge',
        movementType: 'Any',
        speed: 'Any',
        isSurcharge: true,
        isActive: true,
        conditions: { category: 'Fragile Item' },
        rates: {
          basePrice: 30, // extra 30 fixed
          perKgRate: 2, // extra 2 per kg
          perKmRate: 0,
          minimumCharge: 0,
          handlingCost: 15,
          partnerCost: 15,
          riderCost: 5,
          marginPercentage: 20,
          discountPercentage: 0,
          gstPercentage: 18,
          insurancePercentage: 0
        }
      },
      {
        ruleName: 'Base - Heavy Goods Slab (>20kg)',
        ruleType: 'Slab',
        movementType: 'Any',
        speed: 'Any',
        isSurcharge: false,
        isActive: true,
        conditions: { minWeight: 20 },
        rates: {
          basePrice: 200, 
          perKgRate: 25,
          perKmRate: 0,
          minimumCharge: 300,
          handlingCost: 50,
          partnerCost: 120,
          riderCost: 50,
          marginPercentage: 15,
          discountPercentage: 0,
          gstPercentage: 18,
          insurancePercentage: 0
        }
      }
    ];

    await PricingRule.insertMany(rules);
    console.log(`Seeded ${rules.length} pricing rules successfully!`);

  } catch (error) {
    console.error('Error seeding rules:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedPricingRules();
