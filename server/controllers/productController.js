import Product from '../models/Product.js';

export const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(60, Number(req.query.limit) || 16);
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword.trim(), 'i');
      query.$or = [
        { name: regex },
        { brand: regex },
        { description: regex },
        { tags: regex },
        { category: regex },
      ];
    }

    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    if (req.query.brand && req.query.brand !== 'All') {
      query.brand = req.query.brand;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.minRating) {
      query.rating = { $gte: Number(req.query.minRating) };
    }

    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    let sortOption = { createdAt: -1 };
    switch (req.query.sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1, numReviews: -1 };
        break;
      case 'bestselling':
        sortOption = { soldCount: -1 };
        break;
      case 'discount':
        sortOption = { discountPercent: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
    }

    const [total, products, categoryAgg, brands] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Product.distinct('brand'),
    ]);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
      categories: categoryAgg.map((c) => ({ name: c._id, count: c.count })),
      brands: brands.slice(0, 30),
    });
  } catch (error) {
    next(error);
  }
};

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');
    const suggestions = await Product.find({
      $or: [{ name: regex }, { category: regex }, { brand: regex }, { tags: regex }],
    })
      .limit(6)
      .select('name price category brand images rating')
      .lean();

    res.json(suggestions);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .sort({ rating: -1 })
      .limit(4)
      .lean();

    res.json({ product, related });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, features, tags, price, originalPrice, category, brand, images, stock } = req.body;
    const numericPrice = Number(price);
    const numericOrig = Number(originalPrice) || Math.round(numericPrice * 1.2);
    const discountPercent =
      numericOrig > numericPrice ? Math.round(((numericOrig - numericPrice) / numericOrig) * 100) : 0;

    const product = await Product.create({
      sku: `NV-${Date.now().toString().slice(-7)}`,
      name,
      description,
      features: features || [],
      tags: tags || [],
      price: numericPrice,
      originalPrice: numericOrig,
      discountPercent,
      category,
      brand: brand || 'NovaSelect',
      images: images?.length
        ? images
        : [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', public_id: '' }],
      stock: stock ?? 15,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const fields = ['name', 'description', 'features', 'tags', 'price', 'originalPrice', 'category', 'brand', 'images', 'stock', 'isFeatured'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (product.originalPrice > product.price) {
      product.discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      title: title || 'Verified Purchase',
      comment,
    });

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added', product });
  } catch (error) {
    next(error);
  }
};

// Sync live online products from DummyJSON API into MongoDB
export const syncOnlineCatalog = async (req, res, next) => {
  try {
    const response = await fetch('https://dummyjson.com/products?limit=194');
    if (!response.ok) {
      throw new Error('Failed to reach online DummyJSON catalog API');
    }
    const data = await response.json();

    const categoryMap = {
      smartphones: 'Smartphones & Laptops',
      laptops: 'Smartphones & Laptops',
      tablets: 'Smartphones & Laptops',
      'mobile-accessories': 'Electronics',
      fragrances: 'Beauty & Personal Care',
      skincare: 'Beauty & Personal Care',
      beauty: 'Beauty & Personal Care',
      groceries: 'Home & Kitchen',
      'home-decoration': 'Home & Kitchen',
      furniture: 'Home & Kitchen',
      'kitchen-accessories': 'Home & Kitchen',
      tops: 'Fashion & Apparel',
      'womens-dresses': 'Fashion & Apparel',
      'mens-shirts': 'Fashion & Apparel',
      'mens-shoes': 'Footwear',
      'womens-shoes': 'Footwear',
      'mens-watches': 'Audio & Wearables',
      'womens-watches': 'Audio & Wearables',
      'womens-bags': 'Fashion & Apparel',
      'womens-jewellery': 'Fashion & Apparel',
      sunglasses: 'Fashion & Apparel',
      'sports-accessories': 'Fitness & Sports',
      automotive: 'Electronics',
      motorcycle: 'Electronics',
    };

    const ops = data.products.map((item) => {
      const inrPrice = Math.max(299, Math.round(item.price * 84));
      const discount = Math.round(item.discountPercentage || 12);
      const origPrice = Math.round(inrPrice / (1 - discount / 100));
      const mappedCat = categoryMap[item.category] || 'Electronics';

      return {
        updateOne: {
          filter: { sku: `ONLINE-DJ-${item.id}` },
          update: {
            $set: {
              sku: `ONLINE-DJ-${item.id}`,
              name: item.title,
              description: item.description,
              brand: item.brand || 'NovaGlobal',
              category: mappedCat,
              subCategory: item.category,
              price: inrPrice,
              originalPrice: origPrice,
              discountPercent: discount,
              stock: item.stock || 20,
              rating: Number(item.rating?.toFixed(1)) || 4.3,
              numReviews: item.reviews?.length || 0,
              tags: item.tags || [item.category],
              features: [
                item.warrantyInformation || '1 Year Official Manufacturer Warranty',
                item.shippingInformation || 'Ships within 24-48 hours',
                item.returnPolicy || '7-Day Hassle-Free Replacement',
                `Authentic ${item.brand || 'Global'} Certified Product`,
              ],
              images: (item.images?.length ? item.images : [item.thumbnail]).map((url) => ({
                url,
                public_id: `dj_${item.id}`,
              })),
            },
          },
          upsert: true,
        },
      };
    });

    const result = await Product.bulkWrite(ops);
    const totalCount = await Product.countDocuments();

    res.json({
      message: `Synced ${data.products.length} live online products into MongoDB!`,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      totalCatalogCount: totalCount,
    });
  } catch (error) {
    next(error);
  }
};
