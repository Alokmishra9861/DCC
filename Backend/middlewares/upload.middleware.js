const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Use memory storage — we'll stream to Cloudinary manually
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/quicktime",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "File type not allowed. Use JPEG, PNG, WEBP, GIF, MP4, or MOV.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `dcc/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
};

module.exports = { upload, uploadToCloudinary };
