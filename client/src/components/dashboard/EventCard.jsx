import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Heart, Share2, Flag, Bookmark, Download, Trash2, MapPin, User,
} from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import StarRating from "../StarRating";
import EventComments from "./EventComments";
import EventReview from "./EventReview";
import { getImageUrl } from "../../utils/imageHelper";
import { getCategoryIcon } from "../../constants";

/**
 * EventCard — Single event card in the feed
 *
 * This was the largest inline piece in Dashboard (~230 lines per card).
 * Extracting it makes the feed loop readable and the card testable.
 *
 * PROPS:
 * - event: object — the event data
 * - user: object — current logged-in user
 * - bookmarks: array — user's bookmarked event IDs
 * - isCommentsOpen: boolean — whether comments section is expanded
 * - tempRating: number — current star rating for review form
 * - onLike, onShare, onReport, onDelete, onBookmark: action handlers
 * - onJoin, onPayment: event participation handlers
 * - onComment: function(eventId, text) — post comment
 * - onRate: function(eventId, rating, text) — submit review
 * - onToggleComments: function(eventId) — toggle comments section
 * - onDownloadGuestList: function(eventId, eventTitle)
 * - onOpenChat: function({ id, title }) — open chat box
 * - setTempRating: function — update rating selection
 * - t: translation function
 */
const EventCard = ({
  event,
  user,
  bookmarks,
  isCommentsOpen,
  tempRating,
  setTempRating,
  onLike,
  onShare,
  onReport,
  onDelete,
  onBookmark,
  onJoin,
  onPayment,
  onComment,
  onRate,
  onToggleComments,
  onDownloadGuestList,
  onOpenChat,
  t,
}) => {
  const navigate = useNavigate();

  const isJoined = event.participants.includes(user._id);
  const isLiked = Boolean(event.likes && event.likes[user._id]);
  const likeCount = event.likes ? Object.keys(event.likes).length : 0;
  const userReview = event.reviews?.find((r) => r.userId === user._id);
  const isBookmarked = bookmarks.includes(event._id);
  const isOwner = event.userId === user._id;

  return (
    <Card
      id={event._id}
      className="group hover:border-violet-500/30 transition-all duration-300 mb-6"
    >
      {/* Bookmark Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBookmark(event._id);
        }}
        className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-black/50 p-2 rounded-full shadow-lg hover:scale-110 transition backdrop-blur-md"
        title={t("save_event")}
      >
        <Bookmark
          className={`w-5 h-5 ${
            isBookmarked
              ? "fill-violet-500 text-violet-500"
              : "text-slate-600 dark:text-white"
          }`}
        />
      </button>

      {/* Event Image */}
      {event.picturePath && (
        <div className="overflow-hidden rounded-2xl mb-5 h-64 -mx-6 -mt-6 relative shadow-md">
          <img
            src={getImageUrl(event.picturePath)}
            alt="event"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 dark:bg-black/70 backdrop-blur text-slate-800 dark:text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-bold shadow-sm border border-white/20">
              {getCategoryIcon(event.category)} {event.category}
            </span>
          </div>
        </div>
      )}

      {/* Title, Rating, Creator, Price, Date */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">
            {event.title}
          </h4>

          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={event.averageRating || 0} />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              ({event.reviews?.length || 0} {t("reviews")})
            </span>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
            {t("by")}{" "}
            <Link
              to={`/profile/${event.userId}`}
              className="hover:text-violet-600 font-bold underline decoration-transparent hover:decoration-violet-600 transition flex items-center gap-1"
            >
              <User className="w-3 h-3" /> {event.creatorName}
            </Link>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          {event.price > 0 ? (
            <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg text-sm font-extrabold border border-emerald-100 dark:border-emerald-900">
              ${event.price}
            </span>
          ) : (
            <span className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm font-bold">
              {t("free")}
            </span>
          )}
          <span className="text-xs text-slate-400 font-medium">
            {new Date(event.date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-4">
        {event.description}
      </p>

      {/* Review Section (past events only) */}
      <EventReview
        event={event}
        userReview={userReview}
        tempRating={tempRating}
        setTempRating={setTempRating}
        onRate={onRate}
        t={t}
      />

      {/* Action Bar */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 gap-4">
        {/* Left: Like, Share, Report, Location, Participants */}
        <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm gap-2 font-medium w-full sm:w-auto justify-between sm:justify-start">
          <Button
            variant="ghost"
            onClick={() => onLike(event._id)}
            className={`px-2 gap-1 ${
              isLiked
                ? "text-rose-500 bg-rose-50 dark:bg-rose-900/20"
                : "hover:text-rose-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-rose-500" : ""}`} />{" "}
            {likeCount}
          </Button>

          <Button
            variant="ghost"
            onClick={() => onShare(event._id)}
            className="px-2"
            title={t("share")}
          >
            <Share2 className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => onReport(event)}
            className="px-2 hover:text-red-500"
            title={t("report")}
          >
            <Flag className="w-5 h-5" />
          </Button>

          <span className="flex items-center gap-1 ml-2 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            <MapPin className="w-3 h-3" /> {event.location}
          </span>
          <span className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            <User className="w-3 h-3" /> {event.participants.length}
          </span>
        </div>

        {/* Right: Owner Actions + Join/Buy/View */}
        <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
          {/* Owner: Download CSV */}
          {isOwner && (
            <Button
              variant="secondary"
              onClick={() => onDownloadGuestList(event._id, event.title)}
              className="px-3 py-1.5 text-xs"
              title={t("guest_list")}
            >
              <Download className="w-4 h-4" /> CSV
            </Button>
          )}

          {/* Comments Toggle */}
          <EventComments
            event={event}
            isOpen={isCommentsOpen}
            onToggle={onToggleComments}
            onComment={onComment}
            t={t}
          />

          {/* Chat (joined users only) */}
          {isJoined && (
            <Button
              variant="success"
              onClick={() =>
                onOpenChat({ id: event._id, title: event.title })
              }
              className="px-3 py-1.5 text-xs gap-1"
            >
              {t("chat")}
            </Button>
          )}

          {/* Owner/Admin: Delete */}
          {(isOwner || user.role === "admin") && (
            <Button
              variant="danger"
              onClick={() => onDelete(event._id)}
              className="px-3 py-1.5 text-xs"
              title={t("delete_event")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          {/* Join / Buy / View Ticket */}
          {isJoined ? (
            <Button
              variant="primary"
              onClick={() => navigate(`/ticket/${event._id}`)}
              className="px-5 py-2 text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 border-none shadow-lg shadow-violet-500/20"
            >
              {t("view_ticket")}
            </Button>
          ) : event.price > 0 ? (
            <Button
              variant="primary"
              onClick={() => onPayment(event)}
              className="px-5 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 border-none shadow-lg shadow-emerald-500/20"
            >
              {t("buy_ticket")} ${event.price}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => onJoin(event._id)}
              className="px-5 py-2 text-sm shadow-lg shadow-blue-500/20"
            >
              {t("join_free")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventCard;