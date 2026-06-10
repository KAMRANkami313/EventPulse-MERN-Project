import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Button from "../ui/Button";

/**
 * EventComments — Collapsible comments section for an event card
 *
 * PROPS:
 * - event: object — the event with comments array
 * - isOpen: boolean — whether comments are expanded
 * - onToggle: function — toggle comments visibility
 * - onComment: function(eventId, text) — post a comment
 * - t: translation function
 */
const EventComments = ({ event, isOpen, onToggle, onComment, t }) => {
  return (
    <>
      {/* Comment Toggle Button */}
      <Button
        variant="ghost"
        onClick={() => onToggle(event._id)}
        className="px-3 py-1.5 text-xs gap-1"
      >
        <MessageCircle className="w-4 h-4" /> {event.comments.length}
      </Button>

      {/* Collapsible Comments */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-xs mb-3 dark:text-white uppercase tracking-wide opacity-50">
                {t("discussion_board")}
              </h4>

              <div className="max-h-40 overflow-y-auto mb-4 space-y-3 scrollbar-hide">
                {event.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    {t("no_comments_yet")}
                  </p>
                ) : (
                  event.comments.map((comment, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm text-sm dark:text-white border border-slate-100 dark:border-slate-700"
                    >
                      <span className="font-bold text-violet-600 dark:text-violet-400 mr-2">
                        {comment.firstName}:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {comment.text}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const text = e.target.comment.value;
                  if (!text) return;
                  onComment(event._id, text);
                  e.target.comment.value = "";
                }}
                className="flex gap-2"
              >
                <input
                  name="comment"
                  type="text"
                  placeholder={t("write_a_comment")}
                  className="w-full p-2.5 rounded-xl text-sm border-none bg-white dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition shadow-sm"
                />
                <Button type="submit" variant="secondary" className="px-4 py-2 text-xs">
                  {t("post")}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EventComments;