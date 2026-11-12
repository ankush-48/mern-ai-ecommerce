import { Type } from '@google/genai';
import ai, { GEMINI_MODEL } from '../config/gemini.js';
import Product from '../models/Product.js';

export const chatWithShoppingAssistant = async (message, history = []) => {
  const filterExtractionPrompt = `
    You are an e-commerce search intent parser. Extract search parameters from the user's message.
    User message: "${message}"
    Conversation history: ${JSON.stringify(history.slice(-4))}
  `;

  const filterResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: filterExtractionPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Relevant product keywords, synonyms, or use-case terms',
          },
          category: {
            type: Type.STRING,
            description: 'Broad category if implied, else empty string',
          },
          maxPrice: {
            type: Type.NUMBER,
            description: 'Maximum budget in INR if mentioned, else 0',
          },
          minPrice: {
            type: Type.NUMBER,
            description: 'Minimum budget in INR if mentioned, else 0',
          },
        },
        required: ['keywords', 'category', 'maxPrice', 'minPrice'],
      },
    },
  });

  const extracted = JSON.parse(filterResponse.text);

  const mongoQuery = {};
  if (extracted.maxPrice > 0 || extracted.minPrice > 0) {
    mongoQuery.price = {};
    if (extracted.minPrice > 0) mongoQuery.price.$gte = extracted.minPrice;
    if (extracted.maxPrice > 0) mongoQuery.price.$lte = extracted.maxPrice;
  }

  if (extracted.keywords && extracted.keywords.length > 0) {
    const regexList = extracted.keywords.map((kw) => new RegExp(kw, 'i'));
    mongoQuery.$or = [
      { name: { $in: regexList } },
      { description: { $in: regexList } },
      { tags: { $in: regexList } },
      { category: { $in: regexList } },
    ];
  }

  let matchedProducts = await Product.find(mongoQuery)
    .sort({ rating: -1, numReviews: -1 })
    .limit(6)
    .select('name price category rating numReviews images stock description');

  if (matchedProducts.length === 0) {
    matchedProducts = await Product.find({})
      .sort({ rating: -1 })
      .limit(4)
      .select('name price category rating numReviews images stock description');
  }

  const catalogContext = matchedProducts.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    category: p.category,
    rating: p.rating,
    inStock: p.stock > 0,
    summary: p.description.slice(0, 140),
  }));

  const assistantPrompt = `
    You are Nova, a friendly, concise AI Shopping Assistant for an Indian online store (prices in ₹ INR).
    Answer the shopper's query using ONLY the matching catalog products provided below.
    If exact matches weren't found, politely mention what's closest in our catalog.
    Keep your reply under 90 words, warm, and actionable.

    Shopper query: "${message}"
    Catalog matches: ${JSON.stringify(catalogContext)}
  `;

  const chatResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: assistantPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: {
            type: Type.STRING,
            description: 'Conversational recommendation response to the shopper',
          },
          recommendedProductIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'IDs of up to 3 best matching products from Catalog matches',
          },
        },
        required: ['reply', 'recommendedProductIds'],
      },
    },
  });

  const finalPayload = JSON.parse(chatResponse.text);
  const recommendedProducts = matchedProducts.filter((p) =>
    finalPayload.recommendedProductIds.includes(p._id.toString())
  );

  return {
    reply: finalPayload.reply,
    products: recommendedProducts.length > 0 ? recommendedProducts : matchedProducts.slice(0, 3),
  };
};

export const parseSemanticSearchQuery = async (naturalQuery) => {
  const prompt = `
    Convert this natural-language shopping search query into structured e-commerce search parameters.
    Include synonyms, related item types, and use-case keywords so a MongoDB regex/text query finds all relevant items.
    Query: "${naturalQuery}"
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          expandedTerms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '5 to 8 related product keywords and synonyms',
          },
          suggestedCategory: {
            type: Type.STRING,
            description: 'Matching product category if obvious, otherwise empty string',
          },
          maxPrice: {
            type: Type.NUMBER,
            description: 'Upper price limit in INR if stated, otherwise 0',
          },
          intentSummary: {
            type: Type.STRING,
            description: 'Short 1-line explanation of what the AI understood',
          },
        },
        required: ['expandedTerms', 'suggestedCategory', 'maxPrice', 'intentSummary'],
      },
    },
  });

  return JSON.parse(response.text);
};

export const generateProductListing = async ({ productName, roughNotes, category, imageFile }) => {
  const promptText = `
    You are an expert e-commerce copywriter and SEO specialist.
    Generate a high-converting product listing based on the provided details${imageFile ? ' and product image' : ''}.
    - Product Name / Draft Title: ${productName || 'Infer from image'}
    - Category: ${category || 'Infer from context'}
    - Rough Bullet Points / Notes: ${roughNotes || 'None provided — infer key visual features from image'}

    Return clean, persuasive copy tailored for modern online shoppers.
  `;

  const contents = [promptText];

  if (imageFile) {
    contents.push({
      inlineData: {
        data: imageFile.buffer.toString('base64'),
        mimeType: imageFile.mimetype,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          seoTitle: { type: Type.STRING },
          description: { type: Type.STRING },
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedCategory: { type: Type.STRING },
        },
        required: ['seoTitle', 'description', 'features', 'tags', 'suggestedCategory'],
      },
    },
  });

  return JSON.parse(response.text);
};

export const summarizeProductReviews = async (product) => {
  if (!product.reviews || product.reviews.length < 3) {
    throw new Error('At least 3 customer reviews are required to generate an AI summary.');
  }

  if (
    product.aiReviewSummary &&
    product.aiReviewSummary.reviewCountAtGeneration === product.reviews.length &&
    product.aiReviewSummary.pros?.length > 0
  ) {
    return product.aiReviewSummary;
  }

  const formattedReviews = product.reviews
    .map((r, idx) => `Review ${idx + 1} (${r.rating}/5 stars): "${r.comment}"`)
    .join('\n');

  const prompt = `
    Analyze all customer reviews below for "${product.name}" and synthesize an unbiased Pros & Cons summary.
    Reviews:
    ${formattedReviews}
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          verdict: { type: Type.STRING },
        },
        required: ['pros', 'cons', 'verdict'],
      },
    },
  });

  const summary = JSON.parse(response.text);

  product.aiReviewSummary = {
    pros: summary.pros,
    cons: summary.cons,
    verdict: summary.verdict,
    reviewCountAtGeneration: product.reviews.length,
  };
  await product.save();

  return product.aiReviewSummary;
};
