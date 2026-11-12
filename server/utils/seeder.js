import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();

const seedData = async () => {
  try {
    if (process.env.NODE_ENV === 'production') throw new Error('Demo seeding is disabled in production');
    if (process.env.ALLOW_DESTRUCTIVE_SEED !== 'true') throw new Error('Set ALLOW_DESTRUCTIVE_SEED=true only for an empty development database');
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const adminUser = await User.create({
      name: 'Nova Admin',
      email: 'admin@novacart.ai',
      password: 'Admin@123',
      role: 'admin',
      shippingAddress: {
        address: '100 Tech Park, Indiranagar',
        city: 'Bengaluru',
        postalCode: '560038',
        country: 'India',
        phone: '9876543210',
      },
    });

    const customer1 = await User.create({
      name: 'Aarav Sharma',
      email: 'customer@novacart.ai',
      password: 'Customer@123',
      role: 'customer',
      shippingAddress: {
        address: '42 MG Road',
        city: 'Bengaluru',
        postalCode: '560001',
        country: 'India',
        phone: '9123456780',
      },
    });

    const customer2 = await User.create({
      name: 'Priya Nair',
      email: 'priya@example.com',
      password: 'Customer@123',
      role: 'customer',
    });

    const customer3 = await User.create({
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      password: 'Customer@123',
      role: 'customer',
    });

    const products = [
      {
        name: 'AeroPack Minimalist Waterproof Commuter Backpack (22L)',
        description:
          'Engineered for urban commuters and digital nomads, the AeroPack 22L combines weatherproof 900D recycled ballistic nylon with a suspended 16-inch padded laptop vault. Sleek, lightweight, and built to withstand monsoon downpours without sacrificing minimalist style.',
        features: [
          'IPX5 water-resistant recycled ballistic nylon exterior with sealed YKK AquaGuard zippers',
          'Dedicated suspended fleece-lined sleeve fits up to 16-inch MacBook Pro / laptops',
          'Hidden anti-theft passport pocket and luggage pass-through strap',
          'Breathable ergonomic EVA foam back panel for all-day comfort',
          '22-liter capacity weighing just 780 grams',
        ],
        tags: ['backpack', 'minimalist', 'waterproof', 'laptop bag', 'commute', 'travel', 'office'],
        price: 2499,
        category: 'Accessories',
        brand: 'AeroGear',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
            public_id: 'seed_backpack_1',
          },
        ],
        stock: 25,
        rating: 4.7,
        numReviews: 3,
        reviews: [
          {
            user: customer1._id,
            name: customer1.name,
            rating: 5,
            comment: 'Survived heavy Bengaluru rain on my bike commute—laptop stayed completely dry! Super clean minimalist look.',
          },
          {
            user: customer2._id,
            name: customer2.name,
            rating: 5,
            comment: 'Very lightweight and the back padding is super comfortable. Fits my 16-inch laptop, charger, and lunch box easily.',
          },
          {
            user: customer3._id,
            name: customer3.name,
            rating: 4,
            comment: 'Great build quality and zippers feel premium. Wish the side water bottle pocket was slightly wider for 1L flasks.',
          },
        ],
      },
      {
        name: 'SoundCore Pro ANC Wireless Over-Ear Headphones',
        description:
          'Immerse yourself in studio-grade audio with hybrid active noise cancellation that blocks up to 95% of ambient office and flight noise. Featuring custom 40mm bio-cellulose drivers and 50-hour battery life.',
        features: [
          'Hybrid Active Noise Cancellation with Transparency Mode',
          '50-hour battery life with 5-minute USB-C fast charge (4 hours playback)',
          'Multipoint Bluetooth 5.4 pairing for seamless laptop-to-phone switching',
          'Plush memory-foam protein leather earcups for fatigue-free listening',
          'Built-in 4-mic AI beamforming array for crystal-clear calls',
        ],
        tags: ['headphones', 'wireless', 'anc', 'noise cancelling', 'audio', 'work from home', 'music'],
        price: 4999,
        category: 'Electronics',
        brand: 'SoundCore',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
            public_id: 'seed_headphones_1',
          },
        ],
        stock: 18,
        rating: 4.3,
        numReviews: 3,
        reviews: [
          {
            user: customer1._id,
            name: customer1.name,
            rating: 5,
            comment: 'Battery life is unreal—charged once in two weeks. ANC drowns out AC and traffic hum effortlessly.',
          },
          {
            user: customer2._id,
            name: customer2.name,
            rating: 4,
            comment: 'Sound clarity and bass are punchy, and multipoint switching between MacBook and Android works smoothly.',
          },
          {
            user: customer3._id,
            name: customer3.name,
            rating: 4,
            comment: 'Comfortable cushions even with glasses, though the carrying pouch could be a hard-shell case.',
          },
        ],
      },
      {
        name: 'KeyCraft K2 Wireless Mechanical Keyboard (75% Layout)',
        description:
          'Compact 75% aluminum-frame wireless mechanical keyboard with hot-swappable tactile brown switches, per-key white backlighting, and dual Mac/Windows keycaps for effortless productivity.',
        features: [
          'Hot-swappable PCB compatible with 3-pin and 5-pin mechanical switches',
          'Connect up to 3 devices via Bluetooth 5.1 or wired USB-C',
          'CNC-machined aircraft-grade aluminum frame with acoustic dampening foam',
          '4000mAh rechargeable battery lasting up to 3 weeks per charge',
          'Includes dedicated keycaps for both macOS and Windows layouts',
        ],
        tags: ['keyboard', 'mechanical keyboard', 'wireless', 'coding', 'desk setup', 'ergonomic', 'office'],
        price: 5499,
        category: 'Electronics',
        brand: 'KeyCraft',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
            public_id: 'seed_keyboard_1',
          },
        ],
        stock: 12,
        rating: 4.8,
        numReviews: 2,
        reviews: [
          {
            user: customer1._id,
            name: customer1.name,
            rating: 5,
            comment: 'Thocky typing feel right out of the box. Best upgrade for my home coding desk.',
          },
          {
            user: customer3._id,
            name: customer3.name,
            rating: 5,
            comment: 'Solid aluminum heft and instant switching between work laptop and personal PC.',
          },
        ],
      },
      {
        name: 'BrewMaster Precision Pour-Over Coffee Kettle (800ml)',
        description:
          'Craft barista-level pour-over coffee at home with a surgical-grade 304 stainless steel gooseneck kettle. Engineered for slow, steady, pinpoint water flow control and compatible with induction and gas stovetops.',
        features: [
          'Precision 8mm gooseneck spout for controlled, turbulence-free pouring',
          'Food-grade 304 brushed stainless steel body with built-in lid thermometer',
          'Ergonomic counter-balanced heat-resistant handle',
          'Works on induction, ceramic, electric, and gas cooktops',
          '800ml capacity ideal for 2 to 4 cups of specialty coffee',
        ],
        tags: ['coffee', 'kettle', 'pour over', 'kitchen', 'barista', 'gift', 'home'],
        price: 1899,
        category: 'Home & Living',
        brand: 'BrewMaster',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
            public_id: 'seed_kettle_1',
          },
        ],
        stock: 30,
        rating: 4.6,
        numReviews: 1,
        reviews: [
          {
            user: customer2._id,
            name: customer2.name,
            rating: 5,
            comment: 'Bought this as a gift for a coffee enthusiast friend—the built-in thermometer makes V60 brewing foolproof!',
          },
        ],
      },
      {
        name: 'ErgoLift Aluminum Laptop Stand (Foldable)',
        description:
          'Elevate your laptop screen to eye level and improve posture during long workdays. Precision-milled anodized aluminum dissipates heat naturally while folding flat into a travel sleeve.',
        features: [
          '6 adjustable height angles for ergonomic eye-level alignment',
          'Open-frame ventilated anodized aluminum boosts laptop cooling',
          'Non-slip silicone pads protect laptop chassis from scratches',
          'Supports laptops from 11 inches up to 17.3 inches (up to 10kg load)',
          'Folds completely flat with included felt carrying sleeve',
        ],
        tags: ['laptop stand', 'ergonomic', 'desk setup', 'work from home', 'accessories', 'aluminum'],
        price: 1299,
        category: 'Accessories',
        brand: 'ErgoLift',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
            public_id: 'seed_stand_1',
          },
        ],
        stock: 40,
        rating: 4.5,
        numReviews: 0,
        reviews: [],
      },
      {
        name: 'StrideFlow Lightweight Running & Gym Sneakers',
        description:
          'Responsive nitrogen-infused midsole cushioning paired with an engineered breathable knit upper for daily 5K runs, gym sessions, and all-day walking comfort.',
        features: [
          'High-rebound EVA foam midsole absorbs impact on concrete roads',
          'Ultra-breathable engineered mesh upper keeps feet cool',
          'High-abrasion rubber outsole for wet and dry grip',
          'Featherlight 235g single-shoe weight',
        ],
        tags: ['shoes', 'running', 'sneakers', 'fitness', 'gym', 'apparel', 'footwear'],
        price: 2799,
        category: 'Apparel',
        brand: 'StrideFlow',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
            public_id: 'seed_shoes_1',
          },
        ],
        stock: 4,
        rating: 4.4,
        numReviews: 0,
        reviews: [],
      },
    ];

    await Product.insertMany(products);

    console.log('Database seeded successfully!');
    console.log('Admin Login: admin@novacart.ai / Admin@123');
    console.log('Customer Login: customer@novacart.ai / Customer@123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
