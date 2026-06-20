import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 4,
    fileSize: 5 * 1024 * 1024
  },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image files are allowed"));
    }

    return callback(null, true);
  }
});

export function uploadImageToCloudinary(buffer) {
  const credentials = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
  };
  const missingCredentials = Object.entries(credentials)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingCredentials.length > 0) {
    throw new Error(`Missing Cloudinary configuration: ${missingCredentials.join(", ")}`);
  }

  cloudinary.config(credentials);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "college-marketplace",
        resource_type: "image",
        transformation: [{ width: 1200, height: 900, crop: "limit" }]
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export default upload;
