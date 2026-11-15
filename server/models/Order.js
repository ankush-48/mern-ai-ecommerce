import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, min: 1 },
        selectedColor: { type: String, default: '' },
        selectedSize: { type: String, default: '' },
      },
    ],
    shippingAddress: {
      fullName: { type: String, default: '' },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'Stripe', 'GatewaySandbox', 'COD'],
      default: 'GatewaySandbox',
    },
    paymentResult: {
      transactionId: String,
      gatewayOrderId: String,
      signature: String,
      methodDetail: String,
      status: String,
    },
    couponCode: { type: String, default: '' },
    discountAmount: { type: Number, default: 0 },
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    orderStatus: {
      type: String,
      enum: ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    trackingId: { type: String, default: '' },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `NV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  }
  if (!this.trackingId) {
    this.trackingId = `AWB${Math.floor(100000000 + Math.random() * 900000000)}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
