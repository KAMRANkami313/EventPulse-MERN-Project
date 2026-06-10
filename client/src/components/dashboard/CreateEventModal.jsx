import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Button from "../ui/Button";
import { CITIES, EVENT_CATEGORIES } from "../../constants";

/**
 * CreateEventModal — Extracted from Dashboard.jsx for maintainability
 *
 * The Dashboard was a 1000+ line monolith. Extracting this modal
 * into its own file makes it easier to test, maintain, and reuse.
 *
 * PROPS:
 * - isOpen: boolean — whether the modal is visible
 * - onClose: function — called when the modal should close
 * - newEvent: object — the current form state
 * - handleChange: function — input change handler
 * - handleCityChange: function — city dropdown change handler
 * - handleImageChange: function — file input change handler
 * - handleSubmit: function — form submission handler
 * - t: function — i18next translation function
 */
const CreateEventModal = ({
  isOpen,
  onClose,
  newEvent,
  handleChange,
  handleCityChange,
  handleImageChange,
  handleSubmit,
  t,
}) => {
  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const success = await handleSubmit(e);
    if (success) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          ></div>

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg mx-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 p-8 overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title={t("close")}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-3xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
              {t("create_new_event")}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {t("fill_event_details")}
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                name="title"
                value={newEvent.title}
                onChange={handleChange}
                placeholder={t("event_title")}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-transparent focus:border-violet-500 outline-none transition dark:text-white shadow-sm"
                required
              />

              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleChange}
                placeholder={t("description")}
                minLength={10}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-transparent focus:border-violet-500 outline-none transition dark:text-white resize-none h-24 shadow-sm"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    {t("location")}
                  </label>
                  <select
                    name="location"
                    value={newEvent.location}
                    onChange={handleCityChange}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 outline-none text-sm font-medium dark:text-white cursor-pointer border focus:border-violet-500 transition shadow-sm"
                  >
                    {CITIES.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    {t("date")}
                  </label>
                  <input
                    name="date"
                    type="date"
                    value={newEvent.date}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 outline-none text-sm font-medium dark:text-white border focus:border-violet-500 transition shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newEvent.price}
                  onChange={handleChange}
                  placeholder={t("price_usd")}
                  className="w-1/3 p-3 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white transition shadow-sm"
                />
                <select
                  name="category"
                  value={newEvent.category}
                  onChange={handleChange}
                  className="w-2/3 p-3 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white transition shadow-sm cursor-pointer"
                  required
                >
                  <option value="">{t("category_placeholder")}</option>
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2">
                  {t("upload_image")}
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-lg font-bold shadow-lg shadow-violet-500/30 mt-6"
              >
                {t("submit_event")}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateEventModal;