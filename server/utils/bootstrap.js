import 'dotenv/config';
import fs from 'node:fs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Never removes data or resets passwords.
try {
  await connectDB();
  if (process.argv.includes('--catalog') && await Product.countDocuments() === 0) {
    await Product.insertMany(JSON.parse(fs.readFileSync(new URL('./catalog.json', import.meta.url), 'utf8')));
    console.log('Starter catalog added without sample reviews or user accounts.');
  }
  if (process.env.ADMIN_EMAIL) {
    const result = await User.updateOne({ email: process.env.ADMIN_EMAIL.trim().toLowerCase() }, { $set: { role: 'admin' } });
    console.log(result.matchedCount ? 'Existing account granted administrator role.' : 'Register the administrator account first, then rerun bootstrap.');
  }
} finally { await mongoose.disconnect(); }
