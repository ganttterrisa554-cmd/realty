// lib/mongoose.ts
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Extend the NodeJS global type to include mongoose cache
declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
    };
}

// Prevent reinitializing on hot reloads
const globalWithMongoose = globalThis as typeof globalThis & {
    mongooseCache: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
    };
};

if (!globalWithMongoose.mongooseCache) {
    globalWithMongoose.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<Mongoose> {
    if (globalWithMongoose.mongooseCache.conn) {
        return globalWithMongoose.mongooseCache.conn;
    }

    if (!globalWithMongoose.mongooseCache.promise) {
        globalWithMongoose.mongooseCache.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }

    globalWithMongoose.mongooseCache.conn = await globalWithMongoose.mongooseCache.promise;
    return globalWithMongoose.mongooseCache.conn;
}
