import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PartnerMerchant from '../models/PartnerMerchant.js';

dotenv.config();

const defaultPartners = [
  // Food & Beverage
  {
    name: "Café Coffee Day",
    category: "food",
    logo: "https://example.com/ccd-logo.png",
    description: "India's favorite coffee chain",
    offerType: "discount",
    offerValue: "20% off on all beverages",
    offerDescription: "Get 20% discount on all hot and cold beverages at any CCD outlet",
    carbonCreditsCost: 50,
    minEcoScoreRequired: 60,
    minLevelRequired: 2,
    maxRedemptionsPerUser: 5,
    partnerWebsite: "https://www.cafecoffeeday.com",
    howToRedeem: "Show the coupon code at the counter before ordering",
    termsAndConditions: "Valid for 30 days. Not applicable with other offers. One coupon per transaction.",
    redeemOnline: false,
    redeemOffline: true,
    isFeatured: true,
    priority: 10
  },
  {
    name: "Domino's Pizza",
    category: "food",
    offerType: "discount",
    offerValue: "₹100 off on orders above ₹400",
    offerDescription: "Flat ₹100 discount on pizza orders above ₹400",
    carbonCreditsCost: 80,
    minEcoScoreRequired: 65,
    minLevelRequired: 3,
    maxRedemptionsPerUser: 3,
    partnerWebsite: "https://www.dominos.co.in",
    howToRedeem: "Apply coupon code during online checkout or show at store",
    termsAndConditions: "Valid for 30 days. Minimum order ₹400. Not valid on combos.",
    redeemOnline: true,
    redeemOffline: true,
    isFeatured: true,
    priority: 9
  },
  {
    name: "Subway",
    category: "food",
    offerType: "free_item",
    offerValue: "Free cookie with any sub",
    offerDescription: "Get a free cookie with purchase of any 6-inch or footlong sub",
    carbonCreditsCost: 30,
    minEcoScoreRequired: 50,
    minLevelRequired: 1,
    maxRedemptionsPerUser: 10,
    partnerWebsite: "https://www.subway.com",
    howToRedeem: "Show coupon code at counter",
    termsAndConditions: "Valid for 60 days. One per transaction.",
    redeemOnline: false,
    redeemOffline: true,
    priority: 7
  },
  
  // Transport
  {
    name: "Ola Cabs",
    category: "transport",
    offerType: "cashback",
    offerValue: "₹50 cashback on next ride",
    offerDescription: "Get ₹50 cashback on your next Ola ride",
    carbonCreditsCost: 40,
    minEcoScoreRequired: 70,
    minLevelRequired: 2,
    maxRedemptionsPerUser: 5,
    partnerWebsite: "https://www.olacabs.com",
    howToRedeem: "Apply coupon code in Ola app before booking",
    termsAndConditions: "Valid for 15 days. Minimum ride value ₹150. Cashback credited within 24 hours.",
    redeemOnline: true,
    redeemOffline: false,
    isFeatured: true,
    priority: 8
  },
  {
    name: "Delhi Metro",
    category: "transport",
    offerType: "voucher",
    offerValue: "₹100 Metro Card recharge",
    offerDescription: "Get ₹100 added to your Delhi Metro smart card",
    carbonCreditsCost: 100,
    minEcoScoreRequired: 80,
    minLevelRequired: 4,
    maxRedemptionsPerUser: 2,
    stockAvailable: 100,
    partnerWebsite: "https://www.delhimetrorail.com",
    howToRedeem: "Visit metro station customer care with coupon code and metro card",
    termsAndConditions: "Valid for 90 days. Requires existing metro card. Non-transferable.",
    redeemOnline: false,
    redeemOffline: true,
    isFeatured: true,
    priority: 10
  },
  
  // Fitness
  {
    name: "Cult.fit",
    category: "fitness",
    offerType: "discount",
    offerValue: "30% off on 1-month membership",
    offerDescription: "Get 30% discount on Cult.fit gym membership for 1 month",
    carbonCreditsCost: 150,
    minEcoScoreRequired: 75,
    minLevelRequired: 5,
    maxRedemptionsPerUser: 1,
    partnerWebsite: "https://www.cult.fit",
    howToRedeem: "Apply coupon code during online membership purchase",
    termsAndConditions: "Valid for new members only. 30 days validity. Auto-renewal at regular price.",
    redeemOnline: true,
    redeemOffline: false,
    priority: 6
  },
  {
    name: "Decathlon",
    category: "fitness",
    offerType: "voucher",
    offerValue: "₹500 gift voucher",
    offerDescription: "₹500 gift voucher for Decathlon sports equipment",
    carbonCreditsCost: 200,
    minEcoScoreRequired: 70,
    minLevelRequired: 4,
    maxRedemptionsPerUser: 2,
    partnerWebsite: "https://www.decathlon.in",
    howToRedeem: "Show coupon code at store or apply during online checkout",
    termsAndConditions: "Valid for 60 days. No minimum purchase. Cannot be combined with other offers.",
    redeemOnline: true,
    redeemOffline: true,
    priority: 7
  },
  
  // Retail
  {
    name: "Amazon",
    category: "retail",
    offerType: "voucher",
    offerValue: "₹250 Amazon voucher",
    offerDescription: "₹250 Amazon gift voucher for any purchase",
    carbonCreditsCost: 250,
    minEcoScoreRequired: 75,
    minLevelRequired: 5,
    maxRedemptionsPerUser: 3,
    partnerWebsite: "https://www.amazon.in",
    howToRedeem: "Coupon code will be sent via email. Apply during checkout on Amazon",
    termsAndConditions: "Valid for 1 year. Can be used for any product. Non-refundable.",
    redeemOnline: true,
    redeemOffline: false,
    isFeatured: true,
    priority: 9
  },
  {
    name: "Flipkart",
    category: "retail",
    offerType: "voucher",
    offerValue: "₹200 Flipkart voucher",
    offerDescription: "₹200 Flipkart gift voucher",
    carbonCreditsCost: 200,
    minEcoScoreRequired: 70,
    minLevelRequired: 4,
    maxRedemptionsPerUser: 3,
    partnerWebsite: "https://www.flipkart.com",
    howToRedeem: "Apply coupon code during checkout",
    termsAndConditions: "Valid for 1 year. Applicable on all products. Non-refundable.",
    redeemOnline: true,
    redeemOffline: false,
    priority: 8
  },
  
  // Green Products
  {
    name: "The Body Shop",
    category: "green_products",
    offerType: "discount",
    offerValue: "25% off on eco-friendly products",
    offerDescription: "Get 25% discount on all eco-friendly and vegan products",
    carbonCreditsCost: 120,
    minEcoScoreRequired: 80,
    minLevelRequired: 4,
    maxRedemptionsPerUser: 2,
    partnerWebsite: "https://www.thebodyshop.in",
    howToRedeem: "Show coupon code at store or apply online",
    termsAndConditions: "Valid for 45 days. Applicable on eco-friendly range only.",
    redeemOnline: true,
    redeemOffline: true,
    priority: 7
  },
  {
    name: "Bamboo India",
    category: "green_products",
    offerType: "discount",
    offerValue: "₹100 off on bamboo products",
    offerDescription: "Flat ₹100 discount on sustainable bamboo products",
    carbonCreditsCost: 80,
    minEcoScoreRequired: 75,
    minLevelRequired: 3,
    maxRedemptionsPerUser: 3,
    partnerWebsite: "https://www.bambooindia.com",
    howToRedeem: "Apply coupon code during online checkout",
    termsAndConditions: "Valid for 60 days. Minimum purchase ₹500.",
    redeemOnline: true,
    redeemOffline: false,
    priority: 6
  },
  
  // Entertainment
  {
    name: "BookMyShow",
    category: "entertainment",
    offerType: "cashback",
    offerValue: "₹75 cashback on movie tickets",
    offerDescription: "Get ₹75 cashback on booking 2 or more movie tickets",
    carbonCreditsCost: 60,
    minEcoScoreRequired: 65,
    minLevelRequired: 3,
    maxRedemptionsPerUser: 4,
    partnerWebsite: "https://www.bookmyshow.com",
    howToRedeem: "Apply coupon code during ticket booking",
    termsAndConditions: "Valid for 30 days. Minimum 2 tickets. Cashback within 48 hours.",
    redeemOnline: true,
    redeemOffline: false,
    priority: 7
  },
  
  // Services
  {
    name: "Urban Company",
    category: "services",
    offerType: "discount",
    offerValue: "₹150 off on first service",
    offerDescription: "Get ₹150 discount on your first Urban Company service booking",
    carbonCreditsCost: 100,
    minEcoScoreRequired: 60,
    minLevelRequired: 2,
    maxRedemptionsPerUser: 1,
    partnerWebsite: "https://www.urbancompany.com",
    howToRedeem: "Apply coupon code in Urban Company app",
    termsAndConditions: "Valid for 60 days. New users only. Minimum booking ₹500.",
    redeemOnline: true,
    redeemOffline: false,
    priority: 6
  }
];

async function initializePartners() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check if partners already exist
    const existingCount = await PartnerMerchant.countDocuments();
    if (existingCount > 0) {
      console.log(`${existingCount} partners already exist. Skipping initialization.`);
      process.exit(0);
    }
    
    // Insert default partners
    await PartnerMerchant.insertMany(defaultPartners);
    console.log(`✅ Successfully initialized ${defaultPartners.length} partner merchants`);
    
    // Display summary
    const categories = [...new Set(defaultPartners.map(p => p.category))];
    console.log('\nPartners by category:');
    for (const category of categories) {
      const count = defaultPartners.filter(p => p.category === category).length;
      console.log(`  ${category}: ${count}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing partners:', error);
    process.exit(1);
  }
}

initializePartners();
