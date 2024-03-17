import mongoose from 'mongoose';

// make env variable for mongodb_uri
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cardAiDB');

export default mongoose.connection;