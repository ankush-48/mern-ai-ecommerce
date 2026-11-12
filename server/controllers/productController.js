import Product from '../models/Product.js';

export const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
    const limit = Math.max(1, Math.min(100, Math.floor(Number(req.query.limit) || 12)));
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.keyword) {
      const regex = new RegExp(String(req.query.keyword).trim().slice(0, 200).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { tags: regex },
        { category: regex },
      ];
    }

    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.minRating) {
      query.rating = { $gte: Number(req.query.minRating) };
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
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const categories = await Product.distinct('category');

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
      categories,
    });
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
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, features, tags, price, category, brand, images, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      features: features || [],
      tags: tags || [],
      price,
      category,
      brand: brand || 'Generic',
      images: images?.length
        ? images
        : [{ url: 'https://placehold.co/600x600?text=No+Image', public_id: '' }],
      stock: stock ?? 0,
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

    const fields = ['name', 'description', 'features', 'tags', 'price', 'category', 'brand', 'images', 'stock'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

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
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
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
      comment,
    });

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added successfully', product });
  } catch (error) {
    next(error);
  }
};
