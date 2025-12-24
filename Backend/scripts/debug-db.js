import mongoose from 'mongoose';

const MONGO_URI = "mongodb://localhost:27017/drivesutrago";

async function checkDB() {
    try {
        console.log(`Connecting to: ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI);
        console.log("✅ LIVE Connection Success!");

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections found:", collections.map(c => c.name));

        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count} docs`);
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Connection Failed:", err.message);
        process.exit(1);
    }
}

checkDB();
