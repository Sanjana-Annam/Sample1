const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing");
const mongoose_url = "mongodb://127.0.0.1:27017/wanderrest";

main()
    .then(() => {
        console.log("✅ Database connected");
        initDB();
    })
    .catch((err) => {
        console.log("❌ Database connection error:", err);
    });

async function main() {
    await mongoose.connect(mongoose_url);
}

const initDB = async () => {
    try {
        await listing.deleteMany({});
        initData.data = initData.data.map((obj) => ({...obj, owner:'68baa4acdcf07430ed0272ef',}));
        const inserted = await listing.insertMany(initData.data);
        console.log(`✅ ${inserted.length} listings inserted successfully.`);
    } catch (err) {
        console.error("❌ Error inserting data:", err.message);
    }
};
