import mongoose from 'mongoose';

let pending;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGO_URI) throw new Error('Database is not configured');
  if (!pending) {
    pending = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 5,
    }).catch(error => { pending = undefined; throw error; });
  }
  return pending;
};

export default connectDB;
