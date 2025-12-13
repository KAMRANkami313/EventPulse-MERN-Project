import { Star } from "lucide-react";

const StarRating = ({ rating, setRating, isEditable = false }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((index) => {
        // Check if this star should be lit up
        const isActive = index <= Math.round(rating);

        return (
          <button
            key={index}
            type="button"
            disabled={!isEditable}
            onClick={() => isEditable && setRating(index)}
            className={`
                transition-transform duration-200 
                ${isEditable ? "cursor-pointer hover:scale-125 focus:outline-none" : "cursor-default"}
            `}
          >
            <Star
              className={`
                w-4 h-4 md:w-5 md:h-5 
                ${isActive 
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm" 
                    : "fill-slate-200 dark:fill-slate-800 text-slate-300 dark:text-slate-600"}
              `}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;