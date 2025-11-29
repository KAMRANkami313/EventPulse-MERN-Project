export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it starts with "http", it's a Cloudinary URL or Google Image
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  
  // Otherwise, it's an old local image
  return `http://localhost:5000/assets/${imagePath}`;
};