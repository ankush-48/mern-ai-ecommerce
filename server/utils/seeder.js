import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();

const CATALOG_BLUEPRINTS = [
  {
    category: 'Smartphones & Laptops',
    brands: ['Apple', 'Samsung', 'ASUS', 'Lenovo', 'Dell', 'OnePlus', 'HP', 'Acer'],
    adjectives: ['Pro', 'Ultra', 'Air', 'Studio', 'Max', 'Elite', 'Zen', 'Titanium'],
    nouns: ['Ultrabook 14"', 'Creator Laptop 16"', '5G Flagship Smartphone', 'OLED Workstation', 'Foldable Tablet Pro', 'AI Gaming Laptop'],
    priceRange: [24999, 149999],
    colors: ['Space Black', 'Titanium Silver', 'Midnight Blue', 'Starlight'],
    sizes: ['128GB / 8GB', '256GB / 16GB', '512GB / 16GB', '1TB / 32GB'],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['laptop', 'smartphone', 'work', 'coding', 'oled', '5g', 'flagship', 'productivity'],
  },
  {
    category: 'Audio & Wearables',
    brands: ['Sony', 'Bose', 'Sennheiser', 'SoundCore', 'Garmin', 'Apple', 'Nothing', 'JBL'],
    adjectives: ['Studio', 'ANC Pro', 'Acoustic', 'Pulse', 'Apex', 'Sonic', 'QuietComfort', 'Chrono'],
    nouns: ['Wireless ANC Headphones', 'True Wireless Earbuds', 'AMOLED GPS Smartwatch', 'Hi-Res Studio Monitor', 'Portable Bluetooth Speaker', 'Fitness Smart Ring'],
    priceRange: [1999, 34999],
    colors: ['Obsidian Black', 'Platinum Silver', 'Sage Green', 'Sandstone'],
    sizes: ['Standard'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['headphones', 'anc', 'wireless', 'smartwatch', 'earbuds', 'audio', 'fitness tracker', 'music'],
  },
  {
    category: 'Electronics',
    brands: ['KeyCraft', 'Logitech', 'Anker', 'Belkin', 'BenQ', 'Elgato', 'DJI', 'Fujifilm'],
    adjectives: ['Mechanical', 'Thunderbolt', '4K HDR', 'GaN 140W', 'Wireless', 'Creator', 'Ergonomic', 'Compact'],
    nouns: ['75% Mechanical Keyboard', 'Ergonomic Vertical Mouse', 'GaN Fast Charger Hub', '27" 4K IPS Monitor', 'Mirrorless Camera Kit', '4K Webcam Pro'],
    priceRange: [1299, 64999],
    colors: ['Graphite', 'Arctic White', 'Space Gray'],
    sizes: ['Standard'],
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['keyboard', 'desk setup', 'work from home', 'monitor', 'camera', 'charger', 'ergonomic'],
  },
  {
    category: 'Accessories',
    brands: ['AeroGear', 'Peak Design', 'Bellroy', 'Nomad', 'Tumi', 'Spigen', 'Samsonite'],
    adjectives: ['Minimalist', 'Waterproof', 'Ballistic', 'Everyday', 'RFID-Safe', 'Modular', 'Commuter', 'Alpine'],
    nouns: ['22L Laptop Backpack', 'Tech Organizer Pouch', 'Full-Grain Leather Wallet', '35L Weekender Duffel', 'Aluminum Laptop Stand', 'Crossbody Sling Bag'],
    priceRange: [899, 12999],
    colors: ['Matte Black', 'Charcoal', 'Olive', 'Cognac Tan'],
    sizes: ['16L', '22L', '30L'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['backpack', 'minimalist', 'waterproof', 'laptop bag', 'travel', 'office', 'commute', 'wallet'],
  },
  {
    category: 'Fashion & Apparel',
    brands: ['Uniqlo', 'Zara Studio', 'Levi’s', 'Muji', 'FabIndia', 'Massimo', 'Allen Solly', 'H&M'],
    adjectives: ['Organic Cotton', 'Selvedge', 'Linen Blend', 'Merino Wool', 'Relaxed Fit', 'Tailored', 'All-Weather', 'Supima'],
    nouns: ['Essential Crewneck Tee', 'Slim Tapered Denim', 'Breathable Linen Shirt', 'Lightweight Bomber Jacket', 'Tech Chino Trousers', 'Merino Knit Sweater'],
    priceRange: [799, 7999],
    colors: ['Navy', 'Charcoal', 'Off-White', 'Olive Green', 'Sand'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['apparel', 'shirt', 'jacket', 'denim', 'cotton', 'casual', 'office wear', 'fashion'],
  },
  {
    category: 'Footwear',
    brands: ['Nike', 'Adidas', 'New Balance', 'Asics', 'Puma', 'StrideFlow', 'Woodland', 'Clarks'],
    adjectives: ['Nitro', 'CloudFoam', 'Gel-Pulse', 'Court', 'Heritage', 'Trail', 'Featherlight', 'Knit'],
    nouns: ['Marathon Running Shoes', 'Classic Leather Sneakers', 'Cross-Training Gym Shoes', 'Waterproof Hiking Boots', 'Suede Penny Loafers'],
    priceRange: [1799, 16999],
    colors: ['Triple White', 'Core Black', 'Cobalt Blue', 'Slate Grey'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['shoes', 'sneakers', 'running', 'gym', 'footwear', 'walking', 'sports'],
  },
  {
    category: 'Home & Kitchen',
    brands: ['BrewMaster', 'Philips', 'Dyson', 'IKEA Home', 'Prestige', 'Nespresso', 'Borosil'],
    adjectives: ['Barista', 'Smart HEPA', 'Stainless 304', 'Nordic', 'Digital', 'Ceramic', 'Induction'],
    nouns: ['Gooseneck Pour-Over Kettle', 'Burr Coffee Grinder', 'HEPA Air Purifier', 'Digital Air Fryer 5L', 'Minimalist Desk Lamp', 'Cast Iron Dutch Oven'],
    priceRange: [999, 39999],
    colors: ['Brushed Steel', 'Matte Black', 'Warm White'],
    sizes: ['Standard'],
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['coffee', 'kettle', 'kitchen', 'home', 'air purifier', 'lamp', 'gift', 'barista'],
  },
  {
    category: 'Fitness & Sports',
    brands: ['Decathlon', 'CultSport', 'Yonex', 'SG Cricket', 'Boldfit', 'Manduka', 'Bowflex'],
    adjectives: ['Pro-Grip', 'Carbon', 'Adjustable', 'High-Density', 'English Willow', 'Olympic'],
    nouns: ['Natural Rubber Yoga Mat', 'Adjustable Dumbbell Set', 'Graphite Badminton Racket', 'Grade-1 Cricket Bat', 'Insulated Steel Flask 1L', 'Resistance Band Kit'],
    priceRange: [499, 18999],
    colors: ['Jet Black', 'Electric Blue', 'Crimson', 'Emerald'],
    sizes: ['Standard'],
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['fitness', 'gym', 'yoga', 'cricket', 'sports', 'workout', 'dumbbell', 'bottle'],
  },
  {
    category: 'Gaming & Accessories',
    brands: ['Razer', 'Logitech G', 'HyperX', 'PlayStation', 'SteelSeries', 'Corsair', 'ASUS ROG'],
    adjectives: ['Hyperspeed', 'RGB Chroma', '7.1 Surround', 'Pro Wireless', 'Low-Latency', 'DualSense'],
    nouns: ['Ultra-Light Gaming Mouse', '7.1 Surround Gaming Headset', 'Wireless Pro Controller', 'XXL Speed Mousepad', 'USB Condenser Streaming Mic'],
    priceRange: [1199, 24999],
    colors: ['Phantom Black', 'White Edition', 'Neon'],
    sizes: ['Standard'],
    images: [
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['gaming', 'mouse', 'headset', 'controller', 'streaming', 'esports', 'rgb'],
  },
  {
    category: 'Beauty & Personal Care',
    brands: ['Minimalist', 'Forest Essentials', 'Philips Grooming', 'The Ordinary', 'Dyson', 'Kama Ayurveda'],
    adjectives: ['Botanical', 'Niacinamide 10%', 'Precision', 'Hydrating', 'Ionic', 'Sulfate-Free'],
    nouns: ['Daily Sunscreen SPF 50', 'Multi-Grooming Trimmer Kit', 'Hyaluronic Hydration Serum', 'Ionic Fast Hair Dryer', 'Sandalwood Gift Box'],
    priceRange: [399, 29999],
    colors: ['Standard'],
    sizes: ['50ml', '100ml', 'Standard'],
    images: [
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['skincare', 'grooming', 'serum', 'trimmer', 'gift', 'personal care'],
  },
];

const SAMPLE_REVIEW_COMMENTS = [
  { rating: 5, title: 'Exceeded expectations!', comment: 'Build quality feels genuinely flagship. Arrived in Bengaluru within 24 hours and works flawlessly right out of the box.' },
  { rating: 5, title: 'Best value in this price bracket', comment: 'Compared three competing brands before picking this one. Ergonomics, finish, and reliability are top-notch.' },
  { rating: 4, title: 'Great daily driver', comment: 'Very solid performance and clean minimalist design. Packaging was eco-friendly and secure. Minor learning curve on setup.' },
  { rating: 4, title: 'Impressive durability', comment: 'Been using it every day for two months now with zero issues. Definitely recommend if you want something built to last.' },
  { rating: 3, title: 'Good, with one minor caveat', comment: 'Core functionality is awesome for the price, though I wish the included cable/accessory was slightly longer.' },
];

const seedEnterpriseCatalog = async () => {
  try {
    await connectDB();
    console.log('Clearing existing collections...');

    await Promise.all([Order.deleteMany(), Product.deleteMany(), User.deleteMany()]);

    const [adminUser, c1, c2, c3] = await User.create([
      {
        name: 'Nova Enterprise Admin',
        email: 'admin@novacart.ai',
        password: 'Admin@123',
        role: 'admin',
        shippingAddress: {
          label: 'HQ',
          fullName: 'Nova Enterprise Admin',
          address: '100 Embassy TechVillage, Outer Ring Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          country: 'India',
          phone: '9876543210',
        },
      },
      {
        name: 'Aarav Sharma',
        email: 'customer@novacart.ai',
        password: 'Customer@123',
        role: 'customer',
        shippingAddress: {
          label: 'Home',
          fullName: 'Aarav Sharma',
          address: '42 Indiranagar 100ft Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          phone: '9123456780',
        },
      },
      {
        name: 'Priya Nair',
        email: 'priya@novacart.ai',
        password: 'Customer@123',
        role: 'customer',
      },
      {
        name: 'Rohan Verma',
        email: 'rohan@novacart.ai',
        password: 'Customer@123',
        role: 'customer',
      },
    ]);

    const reviewers = [c1, c2, c3];
    const TOTAL_PRODUCTS = 2500;
    const bulkProducts = [];

    console.log(`Generating ${TOTAL_PRODUCTS} enterprise products...`);

    for (let i = 1; i <= TOTAL_PRODUCTS; i++) {
      const bp = CATALOG_BLUEPRINTS[i % CATALOG_BLUEPRINTS.length];
      const brand = bp.brands[i % bp.brands.length];
      const adj = bp.adjectives[(i * 3) % bp.adjectives.length];
      const noun = bp.nouns[(i * 7) % bp.nouns.length];
      const series = `Gen-${(i % 9) + 1}`;
      const name = `${brand} ${adj} ${noun} (${series})`;

      const [minP, maxP] = bp.priceRange;
      const rawPrice = minP + ((i * 7919) % (maxP - minP));
      const price = Math.round(rawPrice / 50) * 50 - 1; // e.g., 2499, 4999
      const discountPercent = 10 + (i % 35);
      const originalPrice = Math.round(price / (1 - discountPercent / 100));

      const imageUrl = bp.images[i % bp.images.length];
      const hasRichReviews = i <= 120; // First 120 flagship products get 3-4 verified reviews for instant AI summaries
      const reviews = [];

      if (hasRichReviews) {
        const numRev = 3 + (i % 2);
        for (let r = 0; r < numRev; r++) {
          const revUser = reviewers[r % reviewers.length];
          const sample = SAMPLE_REVIEW_COMMENTS[(i + r) % SAMPLE_REVIEW_COMMENTS.length];
          reviews.push({
            user: revUser._id,
            name: revUser.name,
            rating: sample.rating,
            title: sample.title,
            comment: sample.comment,
            verifiedBuyer: true,
          });
        }
      }

      const rating = reviews.length
        ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
        : Number((4.0 + ((i % 10) * 0.1)).toFixed(1));

      bulkProducts.push({
        sku: `NV-${bp.category.slice(0, 3).toUpperCase()}-${10000 + i}`,
        name,
        description: `Engineered by ${brand}, the ${adj} ${noun} (${series}) delivers precision craftsmanship, everyday reliability, and modern minimalist aesthetics. Designed for high-demand daily workflows with certified materials and comprehensive warranty coverage.`,
        features: [
          `Authentic ${brand} ${series} precision-engineered architecture`,
          `Premium ${adj.toLowerCase()} finish built for long-term daily durability`,
          'Ergonomic, lightweight form factor tested for Indian conditions',
          'Includes 1-Year Manufacturer Warranty & 7-Day Easy Replacement',
        ],
        specifications: {
          Brand: brand,
          Series: series,
          Category: bp.category,
          Warranty: '12 Months Official Warranty',
          CountryOfOrigin: 'India',
        },
        tags: [...bp.tags, brand.toLowerCase(), adj.toLowerCase()],
        price,
        originalPrice,
        discountPercent,
        category: bp.category,
        subCategory: noun,
        brand,
        images: [{ url: imageUrl, public_id: `seed_${i}` }],
        variants: {
          colors: bp.colors,
          sizes: bp.sizes,
        },
        stock: i % 37 === 0 ? 0 : i % 19 === 0 ? 3 : 15 + (i % 60),
        soldCount: 20 + ((i * 13) % 850),
        isFeatured: i <= 24,
        reviews,
        rating,
        numReviews: reviews.length,
      });
    }

    // Insert in batches of 500 for optimal MongoDB throughput
    for (let idx = 0; idx < bulkProducts.length; idx += 500) {
      await Product.insertMany(bulkProducts.slice(idx, idx + 500));
      console.log(`Inserted ${Math.min(idx + 500, bulkProducts.length)} / ${TOTAL_PRODUCTS} products...`);
    }

    console.log('Enterprise seeding complete! 2,500 products ready.');
    console.log('Admin: admin@novacart.ai / Admin@123');
    console.log('Customer: customer@novacart.ai / Customer@123');
    process.exit(0);
  } catch (error) {
    console.error('Seeder Error:', error);
    process.exit(1);
  }
};

seedEnterpriseCatalog();
