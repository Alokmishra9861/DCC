const mongoose = require("mongoose");
require("dotenv").config();

async function clear() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  console.log("Connecting to MongoDB to clear collections...");
  await mongoose.connect(process.env.DATABASE_URL);
  console.log("✅ Connected. Fetching raw database collections...");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  if (collections.length === 0) {
    console.log("No collections found in database.");
  }

  for (const col of collections) {
    console.log(`🧹 Clearing collection: ${col.name}`);
    try {
      await db.collection(col.name).deleteMany({});
      console.log(`✓ Cleared collection: ${col.name}`);
    } catch (err) {
      console.error(`❌ Failed to clear ${col.name}:`, err.message);
    }
  }

  console.log("🎉 Database cleared successfully!");
  await mongoose.disconnect();
}

clear().catch((err) => {
  console.error("❌ Fatal error during clear:", err);
  process.exit(1);
});
