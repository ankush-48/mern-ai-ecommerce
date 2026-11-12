export const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

export function normalizeItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw badRequest('Provide 1 to 100 cart items');
  const quantities = new Map();
  for (const item of items) {
    if (!item || !/^[a-f\d]{24}$/i.test(item.product) || !Number.isSafeInteger(item.qty) || item.qty < 1 || item.qty > 100) {
      throw badRequest('Invalid product or quantity');
    }
    const qty = (quantities.get(item.product) || 0) + item.qty;
    if (qty > 100) throw badRequest('Maximum quantity is 100 per product');
    quantities.set(item.product, qty);
  }
  return [...quantities].map(([product, qty]) => ({ product, qty }));
}

export function priceCart(items, products) {
  const orderItems = normalizeItems(items).map(({ product: id, qty }) => {
    const product = products.find(p => String(p._id) === id);
    if (!product || product.stock < qty) throw badRequest('One or more products are unavailable or out of stock');
    return { product: product._id, qty, name: product.name, price: product.price, image: product.images?.[0]?.url || 'https://placehold.co/200x200' };
  });
  const itemsPrice = Math.round(orderItems.reduce((sum, p) => sum + p.price * p.qty, 0) * 100) / 100;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const shippingPrice = itemsPrice > 999 ? 0 : 99;
  const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;
  return { orderItems, itemsPrice, taxPrice, shippingPrice, totalPrice };
}
