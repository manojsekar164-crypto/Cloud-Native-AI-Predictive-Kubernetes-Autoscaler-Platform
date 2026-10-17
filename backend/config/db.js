const mongoose = require('mongoose');

let isMongoDBConnected = false;

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL;
    if (!uri) {
        console.warn('⚠️  MONGODB_URI / MONGO_URL environment variable not set - Running in simulation mode without persistence');
        isMongoDBConnected = false;
        return;
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB Connected Successfully');
        isMongoDBConnected = true;
    } catch (error) {
        console.warn('⚠️  MongoDB Connection Failed:', error.message);
        console.warn('   Running with in-memory fallback for current session');
        isMongoDBConnected = false;
    }
};

const isConnected = () => isMongoDBConnected;

module.exports = connectDB;
module.exports.isConnected = isConnected;
