const cloudinary = require("cloudinary").v2


// Connect to MongoDB
require('dotenv').config();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function uploadToCloudinary(buffer, fileName) {
    try {
      // Determine resource_type based on file extension
      const extension = fileName.match(/\.([a-zA-Z0-9]+)$/i)?.[1]?.toLowerCase();
      const resourceType = extension === "pdf" ? "raw" : "auto"; // Use "raw" for PDFs, "auto" for others
  
      // Upload buffer to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: `tasks/${Date.now()}-${fileName}`,
            resource_type: resourceType,
            folder: "task-documents",
            use_filename: true,
            unique_filename: false,
            format: extension, // Explicitly set the format (e.g., 'pdf', 'html')
            access_mode: "public",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
  
      // Return the secure URL
      return result.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error("Failed to upload file to Cloudinary");
    }
  }
  
  module.exports = { uploadToCloudinary };
