import StarRating from "../StarRating";
import Button from "../ui/Button";

/**
 * EventReview — Review/rating section for past events
 *
 * PROPS:
 * - event: object — the event with reviews array
 * - userReview: object | undefined — current user's review (if any)
 * - tempRating: number — current star rating selection
 * - setTempRating: function — set rating selection
 * - onRate: function(eventId, rating, text) — submit review
 * - t: translation function
 */
const EventReview = ({
  event,
  userReview,
  tempRating,
  setTempRating,
  onRate,
  t,
}) => {
  // Only show for past events
  if (new Date(event.date) >= new Date()) return null;

  return (
    <div className="mt-4 mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
      {!userReview ? (
        <div>
          <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-2">
            {t("event_finished_review")}
          </p>
          <div className="flex gap-2 mb-2">
            <StarRating
              rating={tempRating}
              setRating={setTempRating}
              isEditable={true}
            />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onRate(event._id, tempRating, e.target.reviewText.value);
              e.target.reviewText.value = "";
            }}
            className="flex gap-2"
          >
            <input
              name="reviewText"
              placeholder={t("write_a_review")}
              className="w-full p-2 text-sm border-none rounded-lg bg-white dark:bg-black/20 dark:text-white outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
            <Button
              type="submit"
              variant="secondary"
              className="px-4 py-2 text-xs h-auto"
            >
              {t("submit")}
            </Button>
          </form>
        </div>
      ) : (
        <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <span className="text-lg">&#x2705;</span>
          <p>
            {t("you_rated_this")}:{" "}
            <b className="ml-1 text-amber-500">
              {userReview.rating} {t("stars")}
            </b>
            {userReview.text && (
              <span className="italic ml-2 opacity-75">
                &ldquo;{userReview.text}&rdquo;
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventReview;