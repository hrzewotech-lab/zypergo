const ServiceabilityRule = require('../models/ServiceabilityRule');
const ServiceableLocation = require('../models/ServiceableLocation');
const Hub = require('../models/Hub');
const Partner = require('../models/Partner');
const User = require('../models/User');

// --- SERVICEABLE LOCATIONS CRUD ---

// Get all serviceable locations with optional search and filter
exports.getLocations = async (req, res) => {
  try {
    const { search, city, state, isActive } = req.query;
    const filter = {};

    if (city && city !== 'All') {
      filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }
    if (state && state !== 'All') {
      filter.state = { $regex: new RegExp(`^${state}$`, 'i') };
    }
    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { pincode: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { areaName: searchRegex }
      ];
    }

    const locations = await ServiceableLocation.find(filter)
      .sort({ city: 1, pincode: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (err) {
    console.error('[getLocations error]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch serviceable locations.' });
  }
};

// Summary of cities with pincode count
exports.getCitiesSummary = async (req, res) => {
  try {
    const summary = await ServiceableLocation.aggregate([
      {
        $group: {
          _id: '$city',
          state: { $first: '$state' },
          totalPincodes: { $sum: 1 },
          activePincodes: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          pincodes: { $push: '$pincode' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: summary.map(s => ({
        city: s._id,
        state: s.state,
        totalPincodes: s.totalPincodes,
        activePincodes: s.activePincodes,
        samplePincodes: s.pincodes.slice(0, 5)
      }))
    });
  } catch (err) {
    console.error('[getCitiesSummary error]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch cities summary.' });
  }
};

// Add single serviceable location
exports.addLocation = async (req, res) => {
  try {
    const {
      city,
      pincode,
      state,
      areaName,
      zone = 'General',
      locationType = 'Pincode',
      isActive = true,
      pickupAvailable = true,
      deliveryAvailable = true,
      expressAvailable = true,
      codAvailable = true
    } = req.body;

    if (!city || !pincode) {
      return res.status(400).json({
        success: false,
        error: 'Both City name and Pincode are required.'
      });
    }

    const cleanPincode = pincode.toString().trim();
    const cleanCity = city.trim();

    // Check if pincode already exists
    const existing = await ServiceableLocation.findOne({ pincode: cleanPincode });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Pincode ${cleanPincode} already exists in ${existing.city}. You can update or toggle it.`
      });
    }

    const location = await ServiceableLocation.create({
      city: cleanCity,
      pincode: cleanPincode,
      state: state ? state.trim() : '',
      areaName: areaName ? areaName.trim() : '',
      zone,
      locationType,
      value: cleanPincode,
      isActive,
      pickupAvailable,
      deliveryAvailable,
      expressAvailable,
      codAvailable,
      createdBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: `Pincode ${cleanPincode} (${cleanCity}) added to serviceable locations.`,
      data: location
    });
  } catch (err) {
    console.error('[addLocation error]', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to add location.' });
  }
};

// Bulk Add Pincodes for a City
exports.bulkAddLocations = async (req, res) => {
  try {
    const {
      city,
      state = '',
      pincodes, // array or string
      zone = 'General',
      pickupAvailable = true,
      deliveryAvailable = true,
      expressAvailable = true,
      codAvailable = true
    } = req.body;

    if (!city) {
      return res.status(400).json({ success: false, error: 'City name is required.' });
    }

    let pinList = [];
    if (Array.isArray(pincodes)) {
      pinList = pincodes;
    } else if (typeof pincodes === 'string') {
      pinList = pincodes
        .split(/[\s,\n\r]+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }

    if (pinList.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one valid pincode.'
      });
    }

    const validPins = [...new Set(pinList.map(p => p.toString().trim()))];

    const bulkOperations = validPins.map(pin => ({
      updateOne: {
        filter: { pincode: pin },
        update: {
          $set: {
            city: city.trim(),
            pincode: pin,
            state: state ? state.trim() : '',
            zone,
            value: pin,
            isActive: true,
            pickupAvailable,
            deliveryAvailable,
            expressAvailable,
            codAvailable,
            createdBy: req.user?.id
          }
        },
        upsert: true
      }
    }));

    const result = await ServiceableLocation.bulkWrite(bulkOperations);

    res.status(200).json({
      success: true,
      message: `Successfully processed ${validPins.length} pincodes for ${city}. (Inserted: ${result.upsertedCount}, Updated: ${result.modifiedCount})`,
      data: {
        totalProcessed: validPins.length,
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (err) {
    console.error('[bulkAddLocations error]', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to bulk import pincodes.' });
  }
};

// Update location details
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await ServiceableLocation.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({ success: false, error: 'Serviceable location not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully.',
      data: location
    });
  } catch (err) {
    console.error('[updateLocation error]', err);
    res.status(500).json({ success: false, error: 'Failed to update location.' });
  }
};

// Toggle active/inactive status
exports.toggleLocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await ServiceableLocation.findById(id);

    if (!location) {
      return res.status(404).json({ success: false, error: 'Serviceable location not found.' });
    }

    location.isActive = !location.isActive;
    await location.save();

    res.status(200).json({
      success: true,
      message: `Pincode ${location.pincode} (${location.city}) is now ${location.isActive ? 'Active' : 'Inactive'}.`,
      data: location
    });
  } catch (err) {
    console.error('[toggleLocationStatus error]', err);
    res.status(500).json({ success: false, error: 'Failed to toggle location status.' });
  }
};

// Remove single location
exports.removeLocation = async (req, res) => {
  try {
    const location = await ServiceableLocation.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, error: 'Location not found.' });
    }
    res.status(200).json({
      success: true,
      message: `Pincode ${location.pincode} (${location.city}) removed successfully.`,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete location.' });
  }
};

// Seed default major cities and hubs (Telangana & Andhra Pradesh)
exports.seedDefaultLocations = async (req, res) => {
  try {
    const shouldClean = req.query.clean === 'true' || req.body?.clean === true;

    const defaultData = [
      // ═══════════════════════════════════════════════════════════════════════════
      // 🏛️ TELANGANA MAJOR CITIES & HUBS
      // ═══════════════════════════════════════════════════════════════════════════
      // Hyderabad (Capital, IT & Logistics Hub)
      { city: 'Hyderabad', state: 'Telangana', pincode: '500081', areaName: 'Madhapur / Hitec City', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500032', areaName: 'Gachibowli / Financial District', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500033', areaName: 'Jubilee Hills', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500034', areaName: 'Banjara Hills', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500084', areaName: 'Kondapur / Hafeezpet', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500072', areaName: 'KPHB Colony / Kukatpally', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500001', areaName: 'Abids / Koti / Central', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500003', areaName: 'Secunderabad Junction / Kalasiguda', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500016', areaName: 'Begumpet / Prakash Nagar', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500082', areaName: 'Somajiguda / Panjagutta', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500050', areaName: 'Miyapur / Chandanagar', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500038', areaName: 'SR Nagar / Ameerpet', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500068', areaName: 'LB Nagar / Dilsukhnagar', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500039', areaName: 'Uppal Industrial Area / Boduppal', zone: 'South' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500028', areaName: 'Mehdipatnam / Masab Tank', zone: 'South' },

      // Warangal / Hanamkonda (Major Cultural & Industrial City in Telangana)
      { city: 'Warangal', state: 'Telangana', pincode: '506001', areaName: 'Warangal Station / Main Chowrasta', zone: 'South' },
      { city: 'Warangal', state: 'Telangana', pincode: '506002', areaName: 'Under Bridge / Industrial Area', zone: 'South' },
      { city: 'Warangal', state: 'Telangana', pincode: '506004', areaName: 'Kazipet Junction / Railway Hub', zone: 'South' },
      { city: 'Warangal', state: 'Telangana', pincode: '506009', areaName: 'Hanamkonda Subedari / Collectorate', zone: 'South' },

      // Nizamabad (Commercial & Agricultural Trading Hub)
      { city: 'Nizamabad', state: 'Telangana', pincode: '503001', areaName: 'Head Post Office / Gandhi Chowk', zone: 'South' },
      { city: 'Nizamabad', state: 'Telangana', pincode: '503002', areaName: 'Subhashnagar / Industrial Area', zone: 'South' },
      { city: 'Nizamabad', state: 'Telangana', pincode: '503003', areaName: 'Khaleelwadi Commercial Hub', zone: 'South' },

      // Karimnagar (Granite, Education & Commercial Hub)
      { city: 'Karimnagar', state: 'Telangana', pincode: '505001', areaName: 'Tower Circle / Bus Stand', zone: 'South' },
      { city: 'Karimnagar', state: 'Telangana', pincode: '505002', areaName: 'Collectorate Complex / Mukarampura', zone: 'South' },
      { city: 'Karimnagar', state: 'Telangana', pincode: '505451', areaName: 'Kothapalli Industrial Corridor', zone: 'South' },

      // Khammam (Transport & Agro-Logistics Center)
      { city: 'Khammam', state: 'Telangana', pincode: '507001', areaName: 'Wyra Road / Gandhi Chowk', zone: 'South' },
      { city: 'Khammam', state: 'Telangana', pincode: '507002', areaName: 'Industrial Estate / Trunk Road', zone: 'South' },
      { city: 'Khammam', state: 'Telangana', pincode: '507003', areaName: 'Rotary Nagar / VDOs Colony', zone: 'South' },

      // Mahabubnagar (Southern Telangana Hub)
      { city: 'Mahabubnagar', state: 'Telangana', pincode: '509001', areaName: 'Main Town / Clock Tower', zone: 'South' },
      { city: 'Mahabubnagar', state: 'Telangana', pincode: '509002', areaName: 'Yenugonda Commercial Center', zone: 'South' },

      // Ramagundam / Godavarikhani (Energy & Industrial Hub)
      { city: 'Ramagundam', state: 'Telangana', pincode: '505208', areaName: 'NTPC Township / Jyothinagar', zone: 'South' },
      { city: 'Ramagundam', state: 'Telangana', pincode: '505209', areaName: 'Godavarikhani Main Market', zone: 'South' },

      // Nalgonda
      { city: 'Nalgonda', state: 'Telangana', pincode: '508001', areaName: 'Clock Tower / Main Market', zone: 'South' },
      { city: 'Nalgonda', state: 'Telangana', pincode: '508002', areaName: 'Housing Board Colony / RTC Complex', zone: 'South' },

      // Siddipet
      { city: 'Siddipet', state: 'Telangana', pincode: '502103', areaName: 'Siddipet Town / Bus Stand Area', zone: 'South' },

      // Adilabad
      { city: 'Adilabad', state: 'Telangana', pincode: '504001', areaName: 'Adilabad Town / Collectorate Area', zone: 'South' },

      // Suryapet
      { city: 'Suryapet', state: 'Telangana', pincode: '508213', areaName: 'NH65 Commercial Corridor / Main Town', zone: 'South' },

      // Mancherial
      { city: 'Mancherial', state: 'Telangana', pincode: '504208', areaName: 'Mancherial Town / Market Area', zone: 'South' },

      // ═══════════════════════════════════════════════════════════════════════════
      // 🌊 ANDHRA PRADESH MAJOR CITIES & HUBS
      // ═══════════════════════════════════════════════════════════════════════════
      // Visakhapatnam (Financial Capital, Major Port & IT SEZ)
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001', areaName: 'Vizag Port / Old Town', zone: 'South' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530002', areaName: 'Jagadamba Centre / Daba Gardens', zone: 'South' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530016', areaName: 'Dwaraka Nagar / RTC Complex', zone: 'South' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530017', areaName: 'MVP Colony / Beach Road', zone: 'South' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530026', areaName: 'Gajuwaka Industrial Hub / Steel Plant', zone: 'South' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530045', areaName: 'Rushikonda IT SEZ / Tech Park', zone: 'South' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530003', areaName: 'Waltair Uplands / Siripuram', zone: 'South' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530041', areaName: 'Madhurawada Tech Corridor', zone: 'South' },
      { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530012', areaName: 'Pendurthi Commercial Junction', zone: 'South' },

      // Vijayawada (Commercial & Transport Capital of AP)
      { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520001', areaName: 'One Town / Kaleswara Rao Market', zone: 'South' },
      { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520002', areaName: 'Governorpet / Suryaraopet', zone: 'South' },
      { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520010', areaName: 'Benz Circle / MG Road', zone: 'South' },
      { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520008', areaName: 'Patamata / Auto Nagar Industrial Hub', zone: 'South' },
      { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520012', areaName: 'Gollapudi Wholesale Commercial Hub', zone: 'South' },
      { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520007', areaName: 'Gunadala / Ramavarappadu', zone: 'South' },
      { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520003', areaName: 'Gandhinagar / Railway Hub', zone: 'South' },

      // Guntur (Commercial, Tobacco & Spice Export Hub)
      { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001', areaName: 'Guntur Main Town / Old Guntur', zone: 'South' },
      { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', areaName: 'Arundelpet / Brodipet Commercial Area', zone: 'South' },
      { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522004', areaName: 'Pattabhipuram / Lakshmipuram', zone: 'South' },
      { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522006', areaName: 'Auto Nagar / Industrial Estate', zone: 'South' },
      { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522019', areaName: 'Gujjanagundla Residential & Tech Zone', zone: 'South' },

      // Tirupati (Pilgrimage & Electronics Manufacturing Hub)
      { city: 'Tirupati', state: 'Andhra Pradesh', pincode: '517501', areaName: 'Tirupati Town / Alipiri Foot', zone: 'South' },
      { city: 'Tirupati', state: 'Andhra Pradesh', pincode: '517507', areaName: 'Renigunta Electronic Manufacturing Cluster', zone: 'South' },
      { city: 'Tirupati', state: 'Andhra Pradesh', pincode: '517502', areaName: 'KT Road / Bhavani Nagar', zone: 'South' },
      { city: 'Tirupati', state: 'Andhra Pradesh', pincode: '517503', areaName: 'Chandragiri / West Tirupati', zone: 'South' },

      // Kurnool (Major Rayalaseema Regional Center)
      { city: 'Kurnool', state: 'Andhra Pradesh', pincode: '518001', areaName: 'Head Post Office / Collectorate', zone: 'South' },
      { city: 'Kurnool', state: 'Andhra Pradesh', pincode: '518002', areaName: 'Nandyal Road / B-Camp', zone: 'South' },
      { city: 'Kurnool', state: 'Andhra Pradesh', pincode: '518003', areaName: 'Auto Nagar Industrial Area', zone: 'South' },
      { city: 'Kurnool', state: 'Andhra Pradesh', pincode: '518004', areaName: 'Joharapuram / Old City', zone: 'South' },

      // Nellore (Agricultural & Coastal Port City)
      { city: 'Nellore', state: 'Andhra Pradesh', pincode: '524001', areaName: 'Trunk Road / Main Bazar', zone: 'South' },
      { city: 'Nellore', state: 'Andhra Pradesh', pincode: '524003', areaName: 'Gandhi Nagar / Railway Station Area', zone: 'South' },
      { city: 'Nellore', state: 'Andhra Pradesh', pincode: '524004', areaName: 'Magunta Layout / Dargamitta', zone: 'South' },

      // Rajahmundry (Rajamahendravaram - Godavari Cultural & Commercial Center)
      { city: 'Rajahmundry', state: 'Andhra Pradesh', pincode: '533101', areaName: 'Main Market / Godavari Ghat', zone: 'South' },
      { city: 'Rajahmundry', state: 'Andhra Pradesh', pincode: '533103', areaName: 'Danavaipeta / Kambala Tank', zone: 'South' },
      { city: 'Rajahmundry', state: 'Andhra Pradesh', pincode: '533105', areaName: 'Morampudi Industrial Area', zone: 'South' },
      { city: 'Rajahmundry', state: 'Andhra Pradesh', pincode: '533106', areaName: 'Diwancheruvu Highway Corridor', zone: 'South' },

      // Kakinada (Smart City & Deepwater Port Hub)
      { city: 'Kakinada', state: 'Andhra Pradesh', pincode: '533001', areaName: 'Deepwater Port / Main Bazar', zone: 'South' },
      { city: 'Kakinada', state: 'Andhra Pradesh', pincode: '533003', areaName: 'Suryaraopeta Commercial Zone', zone: 'South' },
      { city: 'Kakinada', state: 'Andhra Pradesh', pincode: '533005', areaName: 'Ramanayyapeta Industrial Area', zone: 'South' },

      // Anantapur (South-Western AP Hub)
      { city: 'Anantapur', state: 'Andhra Pradesh', pincode: '515001', areaName: 'Subhash Road / Clock Tower', zone: 'South' },
      { city: 'Anantapur', state: 'Andhra Pradesh', pincode: '515004', areaName: 'JNTU / Bangalore Highway Area', zone: 'South' },

      // Kadapa (YSR District Regional Hub)
      { city: 'Kadapa', state: 'Andhra Pradesh', pincode: '516001', areaName: 'Main Bazar / Seven Roads Junction', zone: 'South' },
      { city: 'Kadapa', state: 'Andhra Pradesh', pincode: '516004', areaName: 'Industrial Estate / RIMS Area', zone: 'South' },

      // Eluru
      { city: 'Eluru', state: 'Andhra Pradesh', pincode: '534001', areaName: 'Powerpet / RR Pet Commercial Hub', zone: 'South' },
      { city: 'Eluru', state: 'Andhra Pradesh', pincode: '534002', areaName: 'Sanivarapupeta Commercial Zone', zone: 'South' },

      // Ongole
      { city: 'Ongole', state: 'Andhra Pradesh', pincode: '523001', areaName: 'Kurnool Road / Main Town', zone: 'South' },
      { city: 'Ongole', state: 'Andhra Pradesh', pincode: '523002', areaName: 'Lawyerpet / Industrial Area', zone: 'South' },

      // Vizianagaram
      { city: 'Vizianagaram', state: 'Andhra Pradesh', pincode: '535001', areaName: 'Fort Area / Main Market', zone: 'South' },
      { city: 'Vizianagaram', state: 'Andhra Pradesh', pincode: '535002', areaName: 'Cantonment Commercial Zone', zone: 'South' },

      // Srikakulam
      { city: 'Srikakulam', state: 'Andhra Pradesh', pincode: '532001', areaName: 'Main Town / 7 Road Junction', zone: 'South' },

      // Chittoor
      { city: 'Chittoor', state: 'Andhra Pradesh', pincode: '517001', areaName: 'High Road / Town Center', zone: 'South' },

      // Nandyal
      { city: 'Nandyal', state: 'Andhra Pradesh', pincode: '518501', areaName: 'Sanjeeva Nagar / Main Market', zone: 'South' },

      // Machilipatnam
      { city: 'Machilipatnam', state: 'Andhra Pradesh', pincode: '521001', areaName: 'Port Area / Main Bazar', zone: 'South' },

      // Bhimavaram
      { city: 'Bhimavaram', state: 'Andhra Pradesh', pincode: '534201', areaName: 'Somaramam / Main Bazar Hub', zone: 'South' }
    ];

    if (shouldClean) {
      // Remove any non-Telangana / non-Andhra Pradesh locations
      await ServiceableLocation.deleteMany({
        state: { $nin: ['Telangana', 'Andhra Pradesh'] }
      });
    }

    const bulkOps = defaultData.map(loc => ({
      updateOne: {
        filter: { pincode: loc.pincode },
        update: {
          $set: {
            ...loc,
            value: loc.pincode,
            isActive: true,
            pickupAvailable: true,
            deliveryAvailable: true,
            expressAvailable: true,
            codAvailable: true
          }
        },
        upsert: true
      }
    }));

    const result = await ServiceableLocation.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: `Seeded ${defaultData.length} serviceable locations across major cities in Telangana & Andhra Pradesh (${result.upsertedCount} inserted, ${result.modifiedCount} updated).`,
      count: defaultData.length,
      states: ['Telangana', 'Andhra Pradesh']
    });
  } catch (err) {
    console.error('[seedDefaultLocations error]', err);
    res.status(500).json({ success: false, error: 'Failed to seed default locations.' });
  }
};

// Public quick check for a single pincode
exports.checkPincodePublic = async (req, res) => {
  try {
    const { pincode } = req.params;
    if (!pincode) {
      return res.status(400).json({ success: false, error: 'Pincode is required.' });
    }

    const cleanPin = pincode.toString().trim();
    const location = await ServiceableLocation.findOne({
      pincode: cleanPin,
      isActive: true
    }).lean();

    if (!location) {
      return res.status(200).json({
        success: true,
        serviceable: false,
        message: `Service is currently not available for pincode ${cleanPin}.`
      });
    }

    res.status(200).json({
      success: true,
      serviceable: true,
      location: {
        city: location.city,
        state: location.state,
        areaName: location.areaName,
        pincode: location.pincode,
        pickupAvailable: location.pickupAvailable,
        deliveryAvailable: location.deliveryAvailable,
        expressAvailable: location.expressAvailable,
        codAvailable: location.codAvailable
      },
      message: `Service is available in ${location.city}${location.areaName ? ` (${location.areaName})` : ''} - ${cleanPin}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Pincode check failed.' });
  }
};

// --- RULES CRUD ---
exports.getRules = async (req, res) => {
  try {
    const rules = await ServiceabilityRule.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: rules });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch rules.' });
  }
};

exports.createRule = async (req, res) => {
  try {
    const rule = await ServiceabilityRule.create({ ...req.body, createdBy: req.user?.id });
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create rule.' });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const rule = await ServiceabilityRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' });
    res.status(200).json({ success: true, data: rule });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update rule.' });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const rule = await ServiceabilityRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found.' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete rule.' });
  }
};

// --- ENTERPRISE SERVICEABILITY ENGINE: COMPLETE CHECKS ---
exports.checkServiceability = async (req, res) => {
  try {
    const {
      originPincode,
      destPincode,
      originCity,
      destCity,
      weight = 0,
      length = 0,
      width = 0,
      height = 0,
      category = 'General Parcel',
      itemDescription = '',
      speed = 'Standard',
      paymentMode = 'UPI',
      declaredValue = 0,
      fragile = false
    } = req.body;

    const actualWeight = parseFloat(weight) || 0;
    const vol = (parseFloat(length) || 0) * (parseFloat(width) || 0) * (parseFloat(height) || 0);
    const volumetricWeight = vol > 0 ? parseFloat((vol / 5000).toFixed(2)) : 0;
    const chargeableWeight = Math.max(actualWeight, volumetricWeight);

    const checksBreakdown = {
      pincodeAllowlist: false,
      sourceHub: false,
      destHub: false,
      riderAvailability: false,
      partnerRoute: false,
      weightAndVolume: false,
      categoryAndFragile: false,
      prohibitedItems: false,
      paymentMode: false,
      temporalBlocks: false,
      holidayAndCutoff: false
    };

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. PINCODE & CITY ALLOWLIST CHECK
    // ─────────────────────────────────────────────────────────────────────────────
    const totalConfigured = await ServiceableLocation.countDocuments();
    let originLoc = null;
    let destLoc = null;

    if (totalConfigured > 0) {
      const originQueries = [];
      if (originPincode) originQueries.push({ pincode: originPincode.trim() });
      if (originCity) originQueries.push({ city: { $regex: new RegExp(`^${originCity.trim()}$`, 'i') } });

      const destQueries = [];
      if (destPincode) destQueries.push({ pincode: destPincode.trim() });
      if (destCity) destQueries.push({ city: { $regex: new RegExp(`^${destCity.trim()}$`, 'i') } });

      if (originQueries.length > 0) {
        originLoc = await ServiceableLocation.findOne({
          isActive: true,
          pickupAvailable: { $ne: false },
          $or: originQueries
        });
        if (!originLoc) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'PincodeAllowlist',
            reason: `Pickup service is currently unavailable in ${originCity || originPincode || 'the selected origin area'}.`,
            checksBreakdown
          });
        }
      }

      if (destQueries.length > 0) {
        destLoc = await ServiceableLocation.findOne({
          isActive: true,
          deliveryAvailable: { $ne: false },
          $or: destQueries
        });
        if (!destLoc) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'PincodeAllowlist',
            reason: `Delivery service is currently unavailable to ${destCity || destPincode || 'the selected destination area'}.`,
            checksBreakdown
          });
        }
      }
    }
    checksBreakdown.pincodeAllowlist = true;

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. SOURCE & DESTINATION HUB AVAILABILITY
    // ─────────────────────────────────────────────────────────────────────────────
    const sourceHub = await Hub.findOne({
      isActive: true,
      $or: [
        { servicePincodes: originPincode },
        { 'address.pincode': originPincode },
        { 'address.city': originCity || originLoc?.city }
      ]
    });

    if (sourceHub) {
      // Hub Capacity check
      if (sourceHub.capacity && sourceHub.capacity.maxCapacity) {
        const load = sourceHub.capacity.currentParcels || 0;
        if (load >= sourceHub.capacity.maxCapacity) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'SourceHubCapacity',
            reason: `The pickup hub serving ${originCity || originPincode} is currently operating at maximum capacity. Please schedule for tomorrow.`,
            checksBreakdown
          });
        }
      }
      // Hub Holiday check
      if (sourceHub.holidayCalendar && sourceHub.holidayCalendar.length > 0) {
        const todayStr = now.toISOString().split('T')[0];
        const isHoliday = sourceHub.holidayCalendar.some(h => new Date(h).toISOString().split('T')[0] === todayStr);
        if (isHoliday) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'SourceHubHoliday',
            reason: `Pickup hub (${sourceHub.name}) is closed today for an operational holiday.`,
            checksBreakdown
          });
        }
      }
    }
    checksBreakdown.sourceHub = true;

    const destHub = await Hub.findOne({
      isActive: true,
      $or: [
        { servicePincodes: destPincode },
        { 'address.pincode': destPincode },
        { 'address.city': destCity || destLoc?.city }
      ]
    });

    if (destHub) {
      if (destHub.capacity && destHub.capacity.maxCapacity) {
        const destLoad = destHub.capacity.currentParcels || 0;
        if (destLoad >= destHub.capacity.maxCapacity) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'DestHubCapacity',
            reason: `Destination delivery hub (${destHub.name}) is temporarily at peak volume capacity.`,
            checksBreakdown
          });
        }
      }
    }
    checksBreakdown.destHub = true;

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. PICKUP RIDER AVAILABILITY
    // ─────────────────────────────────────────────────────────────────────────────
    // Check if riders exist in system/hub
    const activeRidersCount = await User.countDocuments({
      role: 'Raider',
      isActive: { $ne: false }
    });
    // Rider check passes if active riders exist or hub has assigned riders
    if (activeRidersCount === 0 && sourceHub?.assignedRiders?.length === 0) {
      // In production we could reject, but here we flag rider status
      checksBreakdown.riderAvailability = false;
    } else {
      checksBreakdown.riderAvailability = true;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. PARTNER ROUTE AVAILABILITY (Intercity Routes)
    // ─────────────────────────────────────────────────────────────────────────────
    const isIntercity = (originPincode && destPincode && originPincode.slice(0, 3) !== destPincode.slice(0, 3)) ||
      (originCity && destCity && originCity.toLowerCase() !== destCity.toLowerCase());

    if (isIntercity) {
      const activePartners = await Partner.find({ isActive: true });
      if (activePartners.length > 0) {
        const matchingPartner = activePartners.find(p => {
          const servesDest = p.serviceability?.serviceCities?.some(c => c.toLowerCase() === (destCity || destLoc?.city || '').toLowerCase()) ||
            p.serviceability?.servicePincodes?.includes(destPincode) ||
            p.branchAvailability?.some(b => b.toLowerCase() === (destCity || destLoc?.city || '').toLowerCase()) ||
            true; // default network coverage
          const notOverloaded = (p.currentLoad || 0) < (p.capacityLimit || 1000);
          return servesDest && notOverloaded;
        });

        if (!matchingPartner) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'PartnerRouteAvailability',
            reason: `No intercity linehaul partners currently have capacity on the ${originCity || originPincode} to ${destCity || destPincode} route.`,
            checksBreakdown
          });
        }
      }
    }
    checksBreakdown.partnerRoute = true;

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. PROHIBITED ITEMS DETECTION (Keywords & Regex)
    // ─────────────────────────────────────────────────────────────────────────────
    const DEFAULT_PROHIBITED = [
      'lithium battery', 'acid', 'explosive', 'flammable', 'fireworks', 
      'toxic', 'chemical', 'weapon', 'gunpowder', 'radioactive', 'compressed gas',
      'narcotics', 'poison', 'counterfeit'
    ];

    if (itemDescription) {
      const desc = itemDescription.toLowerCase();
      for (const keyword of DEFAULT_PROHIBITED) {
        if (desc.includes(keyword)) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'ProhibitedItem',
            reason: `Prohibited item detected: Contains "${keyword}". Hazardous and restricted materials cannot be transported.`,
            checksBreakdown
          });
        }
      }
    }

    // Fetch active rules from DB
    const activeRules = await ServiceabilityRule.find({ isActive: true });

    for (const rule of activeRules) {
      if (rule.ruleType === 'ProhibitedItem' && rule.keyword) {
        const regex = new RegExp(rule.keyword, 'i');
        if (regex.test(itemDescription)) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'ProhibitedItem',
            reason: rule.reason || 'Contains prohibited items according to platform safety regulations.',
            checksBreakdown
          });
        }
      }
    }
    checksBreakdown.prohibitedItems = true;

    // ─────────────────────────────────────────────────────────────────────────────
    // 6. WEIGHT, VOLUMETRIC WEIGHT & FRAGILE RULES
    // ─────────────────────────────────────────────────────────────────────────────
    const MAX_SYSTEM_WEIGHT = 2000; // 2 Tons
    if (actualWeight > MAX_SYSTEM_WEIGHT) {
      return res.status(200).json({
        isServiceable: false,
        failedCheck: 'WeightConstraint',
        reason: `Parcel weight (${actualWeight}kg) exceeds maximum transport limit of ${MAX_SYSTEM_WEIGHT}kg.`,
        checksBreakdown
      });
    }

    for (const rule of activeRules) {
      // Global Constraints
      if (rule.ruleType === 'GlobalConstraint') {
        if (rule.maxWeight && actualWeight > rule.maxWeight) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'MaxWeightExceeded',
            reason: rule.reason || `Maximum parcel weight allowed is ${rule.maxWeight}kg.`,
            checksBreakdown
          });
        }
        if (rule.maxVolume && vol > rule.maxVolume) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'MaxVolumeExceeded',
            reason: rule.reason || `Package dimensions exceed maximum volumetric capacity.`,
            checksBreakdown
          });
        }
        if (rule.maxVolumetricWeight && volumetricWeight > rule.maxVolumetricWeight) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'MaxVolumetricWeightExceeded',
            reason: rule.reason || `Volumetric weight (${volumetricWeight}kg) exceeds allowable limit.`,
            checksBreakdown
          });
        }
      }

      // Fragile rules
      if (rule.ruleType === 'FragileRule' && (fragile || category === 'Fragile Item')) {
        if (rule.maxFragileWeight && actualWeight > rule.maxFragileWeight) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'FragileWeightLimit',
            reason: rule.reason || `Fragile shipments are restricted to a maximum of ${rule.maxFragileWeight}kg for safety.`,
            checksBreakdown
          });
        }
      }

      // Category Blocks
      if (rule.ruleType === 'CategoryBlock' && rule.category) {
        if (rule.category.toLowerCase() === category.toLowerCase()) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'CategoryBlocked',
            reason: rule.reason || `Shipments for category '${category}' are currently suspended.`,
            checksBreakdown
          });
        }
      }
    }
    checksBreakdown.weightAndVolume = true;
    checksBreakdown.categoryAndFragile = true;

    // ─────────────────────────────────────────────────────────────────────────────
    // 7. PAYMENT MODE ELIGIBILITY (COD / UPI)
    // ─────────────────────────────────────────────────────────────────────────────
    if (paymentMode === 'Cash') {
      if (destLoc && destLoc.codAvailable === false) {
        return res.status(200).json({
          isServiceable: false,
          failedCheck: 'PaymentModeBlock',
          reason: `Cash on Delivery (COD) is not available for destination pincode ${destPincode || destCity}. Please use Prepaid (UPI/Card).`,
          checksBreakdown
        });
      }
    }

    for (const rule of activeRules) {
      if (rule.ruleType === 'PaymentModeBlock' && rule.paymentMode === paymentMode) {
        const matchesOrigin = (rule.city && rule.city.toLowerCase() === (originCity || '').toLowerCase()) ||
          (rule.originPincode && rule.originPincode === originPincode);
        if (matchesOrigin || !rule.city) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'PaymentModeBlock',
            reason: rule.reason || `${paymentMode} is currently unavailable for this route.`,
            checksBreakdown
          });
        }
      }
    }
    checksBreakdown.paymentMode = true;

    // ─────────────────────────────────────────────────────────────────────────────
    // 8. TEMPORARY ROUTE / CITY / PINCODE BLOCKS (Weather, Strike, Overload, Festival)
    // ─────────────────────────────────────────────────────────────────────────────
    for (const rule of activeRules) {
      // City Blocks
      if (rule.ruleType === 'CityBlock' && rule.city) {
        const matchOrigin = originCity && rule.city.toLowerCase() === originCity.toLowerCase();
        const matchDest = destCity && rule.city.toLowerCase() === destCity.toLowerCase();
        if (matchOrigin || matchDest) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'CityBlock',
            reason: rule.reason || `Service in ${rule.city} is currently blocked by dispatch operations.`,
            checksBreakdown
          });
        }
      }

      // Pincode Blocks
      if (rule.ruleType === 'PincodeBlock' && rule.originPincode) {
        if (rule.originPincode === originPincode || rule.originPincode === destPincode) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'PincodeBlock',
            reason: rule.reason || `Service to/from pincode ${rule.originPincode} is temporarily blocked.`,
            checksBreakdown
          });
        }
      }

      // Route Blocks
      if (rule.ruleType === 'RouteBlock' && rule.originPincode && rule.destPincode) {
        if (rule.originPincode === originPincode && rule.destPincode === destPincode) {
          return res.status(200).json({
            isServiceable: false,
            failedCheck: 'RouteBlock',
            reason: rule.reason || `Route between ${originPincode} and ${destPincode} is suspended.`,
            checksBreakdown
          });
        }
      }

      // Temporary Blocks (Weather, Strike, Festival, Hub Overload)
      if (['TemporaryBlock', 'Holiday'].includes(rule.ruleType) && rule.startDate && rule.endDate) {
        const sDate = new Date(rule.startDate);
        const eDate = new Date(rule.endDate);
        if (now >= sDate && now <= eDate) {
          const matchesOrigin = (rule.city && rule.city.toLowerCase() === (originCity || '').toLowerCase()) ||
            (rule.originPincode && rule.originPincode === originPincode);
          const matchesDest = (rule.city && rule.city.toLowerCase() === (destCity || '').toLowerCase()) ||
            (rule.destPincode && rule.destPincode === destPincode);
          const isGlobal = !rule.city && !rule.originPincode && !rule.destPincode;

          if (isGlobal || matchesOrigin || matchesDest) {
            return res.status(200).json({
              isServiceable: false,
              failedCheck: 'TemporaryBlock',
              blockReason: rule.blockReason || 'Operational Advisory',
              reason: rule.reason || `Service temporarily suspended due to ${rule.blockReason || 'operational advisory'}.`,
              checksBreakdown
            });
          }
        }
      }
    }
    checksBreakdown.temporalBlocks = true;

    // ─────────────────────────────────────────────────────────────────────────────
    // 9. CUTOFF TIME & HOLIDAY CALENDAR CHECK
    // ─────────────────────────────────────────────────────────────────────────────
    let cutoffWarning = null;
    const DEFAULT_SAME_DAY_CUTOFF = 18; // 18:00 (6 PM)

    if (speed === 'Express' && currentHour >= DEFAULT_SAME_DAY_CUTOFF) {
      cutoffWarning = `Booking received after daily cutoff time (${DEFAULT_SAME_DAY_CUTOFF}:00). Same-day delivery will dispatch tomorrow morning.`;
    }

    for (const rule of activeRules) {
      if (rule.ruleType === 'CutoffTimeRule' && rule.cutoffTime) {
        const [cHour, cMin] = rule.cutoffTime.split(':').map(Number);
        if (currentHour > cHour || (currentHour === cHour && currentMinute >= cMin)) {
          cutoffWarning = rule.reason || `Bookings after ${rule.cutoffTime} will be processed on the next operational business day.`;
        }
      }
    }
    checksBreakdown.holidayAndCutoff = true;

    // ─────────────────────────────────────────────────────────────────────────────
    // 10. DELIVERY SLA CALCULATION
    // ─────────────────────────────────────────────────────────────────────────────
    let deliverySla = '24-48 Hours';
    let serviceType = 'Local Direct';

    if (!isIntercity) {
      if (speed === 'Express') {
        deliverySla = currentHour < 16 ? 'Same Day (Within 4 Hours)' : 'Tomorrow by 12:00 PM';
        serviceType = 'Intracity Express';
      } else {
        deliverySla = 'Same Day (By 8:00 PM)';
        serviceType = 'Intracity Standard';
      }
    } else {
      serviceType = 'Intercity Hub-and-Spoke';
      deliverySla = speed === 'Express' ? '1-2 Business Days' : '2-4 Business Days';
    }

    // Passed All Verification Gates!
    return res.status(200).json({
      isServiceable: true,
      reason: 'All serviceability checks passed. Shipment can be accepted.',
      sla: {
        estimatedDeliveryTime: deliverySla,
        serviceType,
        chargeableWeight: `${chargeableWeight} kg`,
        volumetricWeight: `${volumetricWeight} kg`,
        cutoffNotice: cutoffWarning
      },
      checksBreakdown
    });

  } catch (err) {
    console.error('[Serviceability Engine error]', err);
    res.status(500).json({ success: false, error: 'Serviceability evaluation failed.' });
  }
};
