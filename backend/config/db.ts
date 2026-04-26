import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";
import fs from "fs";

let mongodInstance: MongoMemoryServer | null = null;

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI;

    if (!mongoURI || mongoURI.includes("localhost")) {
      // Use a persistent local data directory so data survives restarts
      const dbPath = path.join(__dirname, "../../.mongo-data");
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: "wiredTiger",
        },
      });

      mongoURI = mongodInstance.getUri();
      console.log(`📁 Persistent local DB at: ${dbPath}`);
    }

    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ DB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;