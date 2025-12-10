// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL;

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it starts with "http", it's a Cloudinary URL or Google Image
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  
  // 🟢 DEPLOYMENT CHANGE: Using VITE_API_URL variable
  // Otherwise, it's an old local image
  return `${API_URL}/assets/${imagePath}`;
};