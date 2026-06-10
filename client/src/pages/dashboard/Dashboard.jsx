import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";

// --- Custom Hook (all state + logic extracted) ---
import useDashboardData from "../../hooks/useDashboardData";

// --- Extracted Components ---
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import NotificationDropdown from "../../components/dashboard/NotificationDropdown";
import FeaturedCarousel from "../../components/dashboard/FeaturedCarousel";
import FeedControls from "../../components/dashboard/FeedControls";
import EventsMapView from "../../components/dashboard/EventsMapView";
import EventCard from "../../components/dashboard/EventCard";
import CreateEventModal from "../../components/dashboard/CreateEventModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ChatBox from "../../components/ChatBox";
import SkeletonEvent from "../../components/SkeletonEvent";
import Recommendations from "../../components/Recommendations";

/**
 * Dashboard — Main feed page (refactored from 1107-line god component)
 *
 * This file is now a slim orchestrator that:
 * 1. Delegates ALL state & logic to useDashboardData hook
 * 2. Composes extracted sub-components
 * 3. Stays under ~200 lines
 */
const Dashboard = () => {
  const { t, i18n } = useTranslation();

  const data = useDashboardData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans selection:bg-violet-200 dark:selection:bg-violet-900">

      {/* NAVBAR */}
      <DashboardNavbar
        i18n={i18n}
        t={t}
        unreadCount={data.unreadCount}
        onMarkRead={data.handleMarkRead}
        onLogout={data.handleLogout}
        mobileMenuOpen={data.mobileMenuOpen}
        setMobileMenuOpen={data.setMobileMenuOpen}
      />

      {/* NOTIFICATION DROPDOWN */}
      <NotificationDropdown
        show={data.showNotifications}
        notifications={data.notifications}
        t={t}
      />

      {/* FLOATING CREATE EVENT BUTTON */}
      {!data.activeChat && (
        <motion.button
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[900] p-4 rounded-full shadow-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:scale-105 transition-all"
          onClick={() => data.setIsCreateModalOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          title={t("create_new_event")}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* MAIN LAYOUT */}
      <div className="container mx-auto p-4 pt-32 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT: RECOMMENDATIONS */}
          <div className="hidden lg:block lg:col-span-3 sticky top-28">
            <Recommendations userId={data.user._id} token={data.token} />
            <div className="h-6"></div>
          </div>

          {/* CENTER: FEED */}
          <div className="col-span-1 lg:col-span-8 lg:col-start-4 xl:col-span-6 xl:col-start-4 space-y-6 w-full">

            {/* FEATURED CAROUSEL */}
            {!data.showMap && !data.loading && data.events.length > 0 && data.feedType === "all" && (
              <FeaturedCarousel events={data.events} t={t} />
            )}

            {/* CONTROLS BAR */}
            <FeedControls
              showMap={data.showMap}
              setShowMap={data.setShowMap}
              searchTerm={data.searchTerm}
              setSearchTerm={data.setSearchTerm}
              selectedCategory={data.selectedCategory}
              setSelectedCategory={data.setSelectedCategory}
              sortOption={data.sortOption}
              setSortOption={data.setSortOption}
              feedType={data.feedType}
              setFeedType={data.setFeedType}
              showFilters={data.showFilters}
              setShowFilters={data.setShowFilters}
              isDesktop={data.isDesktop}
              t={t}
            />

            {/* MAP VIEW */}
            {data.showMap && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EventsMapView events={data.events} t={t} />
              </motion.div>
            )}

            {/* LIST VIEW */}
            {!data.showMap && (
              <>
                {data.loading ? (
                  <div className="space-y-4">
                    <SkeletonEvent />
                    <SkeletonEvent />
                    <SkeletonEvent />
                  </div>
                ) : data.events.length > 0 ? (
                  data.events.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      user={data.user}
                      bookmarks={data.bookmarks}
                      isCommentsOpen={data.openComments[event._id]}
                      tempRating={data.tempRating}
                      setTempRating={data.setTempRating}
                      onLike={data.handleLike}
                      onShare={data.handleShare}
                      onReport={data.handleReport}
                      onDelete={data.handleDelete}
                      onBookmark={data.handleBookmark}
                      onJoin={data.handleJoin}
                      onPayment={data.handlePayment}
                      onComment={data.handleComment}
                      onRate={data.handleRateEvent}
                      onToggleComments={data.toggleComments}
                      onDownloadGuestList={data.downloadGuestList}
                      onOpenChat={data.setActiveChat}
                      t={t}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 bg-white/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <Search className="w-16 h-16 text-slate-300 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">
                      {t("no_events_found")}
                    </h3>
                    <p className="text-slate-400 mt-2">{t("try_adjusting_filters")}</p>
                  </div>
                )}

                {/* PAGINATION */}
                {!data.loading && data.hasMore && data.events.length > 0 && data.feedType === "all" && (
                  <div className="flex justify-center mt-8 mb-12">
                    <button
                      onClick={() => data.fetchEvents(data.page + 1, false)}
                      disabled={data.isFetchingMore}
                      className="px-8 py-3 rounded-full font-bold shadow-lg bg-white dark:bg-slate-800 hover:scale-105 transition-all text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {data.isFetchingMore ? t("loading") : t("load_more_events")}
                    </button>
                  </div>
                )}

                {!data.loading && !data.hasMore && data.events.length > 0 && (
                  <p className="text-center text-slate-400 text-sm mt-8 mb-12 flex justify-center items-center gap-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full"></span>{" "}
                    {t("reached_end")}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      <CreateEventModal
        isOpen={data.isCreateModalOpen}
        onClose={() => data.setIsCreateModalOpen(false)}
        newEvent={data.newEvent}
        handleChange={data.handleChange}
        handleCityChange={data.handleCityChange}
        handleImageChange={data.handleImageChange}
        handleSubmit={data.handleSubmit}
        CITIES={undefined} // no longer needed — modal imports CITIES directly
        t={t}
      />

      {/* CHAT BOX */}
      {data.activeChat && (
        <ChatBox
          eventId={data.activeChat.id}
          eventTitle={data.activeChat.title}
          user={data.user}
          onClose={() => data.setActiveChat(null)}
        />
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={data.confirmModal.isOpen}
        onClose={() => data.setConfirmModal({ ...data.confirmModal, isOpen: false })}
        onConfirm={data.confirmModal.onConfirm}
        title={data.confirmModal.title}
        message={data.confirmModal.message}
        confirmText={data.confirmModal.confirmText}
        variant={data.confirmModal.variant}
      />
    </div>
  );
};

export default Dashboard;