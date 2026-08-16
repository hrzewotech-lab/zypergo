require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const ServiceableLocation = require('../models/ServiceableLocation');

const tsAndApLocations = [
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

  // Warangal / Hanamkonda
  { city: 'Warangal', state: 'Telangana', pincode: '506001', areaName: 'Warangal Station / Main Chowrasta', zone: 'South' },
  { city: 'Warangal', state: 'Telangana', pincode: '506002', areaName: 'Under Bridge / Industrial Area', zone: 'South' },
  { city: 'Warangal', state: 'Telangana', pincode: '506004', areaName: 'Kazipet Junction / Railway Hub', zone: 'South' },
  { city: 'Warangal', state: 'Telangana', pincode: '506009', areaName: 'Hanamkonda Subedari / Collectorate', zone: 'South' },

  // Nizamabad
  { city: 'Nizamabad', state: 'Telangana', pincode: '503001', areaName: 'Head Post Office / Gandhi Chowk', zone: 'South' },
  { city: 'Nizamabad', state: 'Telangana', pincode: '503002', areaName: 'Subhashnagar / Industrial Area', zone: 'South' },
  { city: 'Nizamabad', state: 'Telangana', pincode: '503003', areaName: 'Khaleelwadi Commercial Hub', zone: 'South' },

  // Karimnagar
  { city: 'Karimnagar', state: 'Telangana', pincode: '505001', areaName: 'Tower Circle / Bus Stand', zone: 'South' },
  { city: 'Karimnagar', state: 'Telangana', pincode: '505002', areaName: 'Collectorate Complex / Mukarampura', zone: 'South' },
  { city: 'Karimnagar', state: 'Telangana', pincode: '505451', areaName: 'Kothapalli Industrial Corridor', zone: 'South' },

  // Khammam
  { city: 'Khammam', state: 'Telangana', pincode: '507001', areaName: 'Wyra Road / Gandhi Chowk', zone: 'South' },
  { city: 'Khammam', state: 'Telangana', pincode: '507002', areaName: 'Industrial Estate / Trunk Road', zone: 'South' },
  { city: 'Khammam', state: 'Telangana', pincode: '507003', areaName: 'Rotary Nagar / VDOs Colony', zone: 'South' },

  // Mahabubnagar
  { city: 'Mahabubnagar', state: 'Telangana', pincode: '509001', areaName: 'Main Town / Clock Tower', zone: 'South' },
  { city: 'Mahabubnagar', state: 'Telangana', pincode: '509002', areaName: 'Yenugonda Commercial Center', zone: 'South' },

  // Ramagundam / Godavarikhani
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
  // Visakhapatnam (Financial Capital & Major Port)
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001', areaName: 'Vizag Port / Old Town', zone: 'South' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530002', areaName: 'Jagadamba Centre / Daba Gardens', zone: 'South' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530016', areaName: 'Dwaraka Nagar / RTC Complex', zone: 'South' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530017', areaName: 'MVP Colony / Beach Road', zone: 'South' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530026', areaName: 'Gajuwaka Industrial Hub / Steel Plant', zone: 'South' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530045', areaName: 'Rushikonda IT SEZ / Tech Park', zone: 'South' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530003', areaName: 'Waltair Uplands / Siripuram', zone: 'South' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530041', areaName: 'Madhurawada Tech Corridor', zone: 'South' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530012', areaName: 'Pendurthi Commercial Junction', zone: 'South' },

  // Vijayawada (Commercial & Transport Hub)
  { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520001', areaName: 'One Town / Kaleswara Rao Market', zone: 'South' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520002', areaName: 'Governorpet / Suryaraopet', zone: 'South' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520010', areaName: 'Benz Circle / MG Road', zone: 'South' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520008', areaName: 'Patamata / Auto Nagar Industrial Hub', zone: 'South' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520012', areaName: 'Gollapudi Wholesale Commercial Hub', zone: 'South' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520007', areaName: 'Gunadala / Ramavarappadu', zone: 'South' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520003', areaName: 'Gandhinagar / Railway Hub', zone: 'South' },

  // Guntur
  { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001', areaName: 'Guntur Main Town / Old Guntur', zone: 'South' },
  { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', areaName: 'Arundelpet / Brodipet Commercial Area', zone: 'South' },
  { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522004', areaName: 'Pattabhipuram / Lakshmipuram', zone: 'South' },
  { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522006', areaName: 'Auto Nagar / Industrial Estate', zone: 'South' },
  { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522019', areaName: 'Gujjanagundla Residential & Tech Zone', zone: 'South' },

  // Tirupati
  { city: 'Tirupati', state: 'Andhra Pradesh', pincode: '517501', areaName: 'Tirupati Town / Alipiri Foot', zone: 'South' },
  { city: 'Tirupati', state: 'Andhra Pradesh', pincode: '517507', areaName: 'Renigunta Electronic Manufacturing Cluster', zone: 'South' },
  { city: 'Tirupati', state: 'Andhra Pradesh', pincode: '517502', areaName: 'KT Road / Bhavani Nagar', zone: 'South' },
  { city: 'Tirupati', state: 'Andhra Pradesh', pincode: '517503', areaName: 'Chandragiri / West Tirupati', zone: 'South' },

  // Kurnool
  { city: 'Kurnool', state: 'Andhra Pradesh', pincode: '518001', areaName: 'Head Post Office / Collectorate', zone: 'South' },
  { city: 'Kurnool', state: 'Andhra Pradesh', pincode: '518002', areaName: 'Nandyal Road / B-Camp', zone: 'South' },
  { city: 'Kurnool', state: 'Andhra Pradesh', pincode: '518003', areaName: 'Auto Nagar Industrial Area', zone: 'South' },
  { city: 'Kurnool', state: 'Andhra Pradesh', pincode: '518004', areaName: 'Joharapuram / Old City', zone: 'South' },

  // Nellore
  { city: 'Nellore', state: 'Andhra Pradesh', pincode: '524001', areaName: 'Trunk Road / Main Bazar', zone: 'South' },
  { city: 'Nellore', state: 'Andhra Pradesh', pincode: '524003', areaName: 'Gandhi Nagar / Railway Station Area', zone: 'South' },
  { city: 'Nellore', state: 'Andhra Pradesh', pincode: '524004', areaName: 'Magunta Layout / Dargamitta', zone: 'South' },

  // Rajahmundry (Rajamahendravaram)
  { city: 'Rajahmundry', state: 'Andhra Pradesh', pincode: '533101', areaName: 'Main Market / Godavari Ghat', zone: 'South' },
  { city: 'Rajahmundry', state: 'Andhra Pradesh', pincode: '533103', areaName: 'Danavaipeta / Kambala Tank', zone: 'South' },
  { city: 'Rajahmundry', state: 'Andhra Pradesh', pincode: '533105', areaName: 'Morampudi Industrial Area', zone: 'South' },
  { city: 'Rajahmundry', state: 'Andhra Pradesh', pincode: '533106', areaName: 'Diwancheruvu Highway Corridor', zone: 'South' },

  // Kakinada
  { city: 'Kakinada', state: 'Andhra Pradesh', pincode: '533001', areaName: 'Deepwater Port / Main Bazar', zone: 'South' },
  { city: 'Kakinada', state: 'Andhra Pradesh', pincode: '533003', areaName: 'Suryaraopeta Commercial Zone', zone: 'South' },
  { city: 'Kakinada', state: 'Andhra Pradesh', pincode: '533005', areaName: 'Ramanayyapeta Industrial Area', zone: 'South' },

  // Anantapur
  { city: 'Anantapur', state: 'Andhra Pradesh', pincode: '515001', areaName: 'Subhash Road / Clock Tower', zone: 'South' },
  { city: 'Anantapur', state: 'Andhra Pradesh', pincode: '515004', areaName: 'JNTU / Bangalore Highway Area', zone: 'South' },

  // Kadapa
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

const seedLocations = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zypergo';
    console.log('Connecting to MongoDB at:', mongoUri.replace(/:([^:@]{1,})@/, ':****@'));
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');

    // Clean up any non-Telangana / non-Andhra Pradesh records
    const deleteRes = await ServiceableLocation.deleteMany({
      state: { $nin: ['Telangana', 'Andhra Pradesh'] }
    });
    if (deleteRes.deletedCount > 0) {
      console.log(`Cleaned up ${deleteRes.deletedCount} non-TS/AP locations.`);
    }

    const bulkOps = tsAndApLocations.map(loc => ({
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
    console.log(`Successfully seeded ${tsAndApLocations.length} locations for Telangana and Andhra Pradesh:`);
    console.log(`- Upserted: ${result.upsertedCount}`);
    console.log(`- Modified: ${result.modifiedCount}`);
    console.log(`- Matched: ${result.matchedCount}`);

    const distinctCities = await ServiceableLocation.distinct('city');
    console.log(`Active Serviceable Cities (${distinctCities.length}):`, distinctCities.join(', '));

  } catch (error) {
    console.error('Error seeding serviceable locations:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedLocations();
