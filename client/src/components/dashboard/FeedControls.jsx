import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Map as MapIcon, List, Filter,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { CATEGORIES } from "../../constants";

/**
 * FeedControls — Search, filter, sort, map-toggle, feed-type controls bar
 *
 * PROPS:
 * - showMap, setShowMap: map toggle state
 * - searchTerm, setSearchTerm: search state
 * - selectedCategory, setSelectedCategory: category filter state
 * - sortOption, setSortOption: sort state
 * - feedType, setFeedType: feed type ("all" | "following") state
 * - showFilters, setShowFilters: mobile filter visibility state
 * - isDesktop: boolean — whether viewport is desktop
 * - t: translation function
 */
const FeedControls = ({
  showMap,
  setShowMap,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortOption,
  setSortOption,
  feedType,
  setFeedType,
  showFilters,
  setShowFilters,
  isDesktop,
  t,
}) => {
  return (
    <Card className="sticky top-24 z-20 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-0 md:mb-4 gap-4">
        {/* Top Row: Map | Filters(Mobile) | Feed Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Map Toggle */}
          <Button
            variant="secondary"
            onClick={() => setShowMap(!showMap)}
            className="shadow-sm text-sm whitespace-nowrap"
          >
            {showMap ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
            <span className="hidden md:inline">
              {showMap ? t("list_view") : t("map_view")}
            </span>
          </Button>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
          >
            <Filter className="w-5 h-5" />
          </button>

          {/* Feed Toggle (Desktop) */}
          <div className="hidden md:flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFeedType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                feedType === "all"
                  ? "bg-white dark:bg-slate-700 shadow text-violet-600 dark:text-white"
                  : "text-slate-500"
              }`}
            >
              {t("global_feed")}
            </button>
            <button
              onClick={() => setFeedType("following")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                feedType === "following"
                  ? "bg-white dark:bg-slate-700 shadow text-violet-600 dark:text-white"
                  : "text-slate-500"
              }`}
            >
              {t("following_feed")}
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:max-w-xs focus-within:ring-2 ring-violet-500 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("search_events")}
            className="bg-transparent outline-none text-sm w-full dark:text-white placeholder:text-slate-400"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* COLLAPSIBLE FILTERS */}
      <AnimatePresence>
        {(!showMap && (showFilters || isDesktop)) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col md:flex-row gap-2 md:gap-4 overflow-hidden pt-3 md:pt-0"
          >
            {/* Mobile Feed Toggle */}
            <div className="flex md:hidden bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700 mb-2">
              <button
                onClick={() => setFeedType("all")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  feedType === "all"
                    ? "bg-white dark:bg-slate-700 shadow text-violet-600 dark:text-white"
                    : "text-slate-500"
                }`}
              >
                {t("global_feed")}
              </button>
              <button
                onClick={() => setFeedType("following")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  feedType === "following"
                    ? "bg-white dark:bg-slate-700 shadow text-violet-600 dark:text-white"
                    : "text-slate-500"
                }`}
              >
                {t("following_feed")}
              </button>
            </div>

            <select
              className="w-full md:w-auto px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none cursor-pointer"
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? t("all_categories") : cat}
                </option>
              ))}
            </select>

            <select
              className="w-full md:w-auto px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none cursor-pointer"
              onChange={(e) => setSortOption(e.target.value)}
              value={sortOption}
            >
              <option value="Newest">{t("sort_newest")}</option>
              <option value="Oldest">{t("sort_oldest")}</option>
              <option value="Popular">{t("sort_popular")}</option>
            </select>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default FeedControls;