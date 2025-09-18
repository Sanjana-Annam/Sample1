const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // but in v4 this export is different
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// v4 style storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "Wanderlust",
      format: "png", // or file.mimetype.split("/")[1]
      public_id: file.fieldname + "-" + Date.now(),
    };
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, storage, upload };
