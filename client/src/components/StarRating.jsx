import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating, setRating, isEditable = false }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (isEditable) {
        // Interactive Stars (Buttons)
        stars.push(
            <span 
                key={i} 
                onClick={() => setRating(i)}
                className={`cursor-pointer text-xl transition ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
            >
                ★
            </span>
        );
    } else {
        // Read-Only Stars (Display)
        if (i <= rating) {
            stars.push(<span key={i} className="text-yellow-400">★</span>);
        } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
            // Optional: Handle half stars logic if you want complex math, 
            // for now, we stick to simple full/empty for simplicity
            stars.push(<span key={i} className="text-gray-300">★</span>); 
        } else {
            stars.push(<span key={i} className="text-gray-300">★</span>);
        }
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default StarRating;