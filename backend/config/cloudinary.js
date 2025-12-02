import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY,
        timeout: 60000  // 60 second timeout
    });

    console.log("Cloudinary configured");
}

export default connectCloudinary;