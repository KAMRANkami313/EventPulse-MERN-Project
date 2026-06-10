import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { Calendar, MapPin } from "lucide-react";
import { getImageUrl } from "../../utils/imageHelper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

/**
 * FeaturedCarousel — Hero Swiper carousel showing top 5 events
 *
 * PROPS:
 * - events: array — events to feature (first 5 used)
 * - t: translation function
 */
const FeaturedCarousel = ({ events, t }) => {
  const navigate = useNavigate();

  if (!events || events.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl overflow-hidden shadow-2xl relative mb-6 border-4 border-white dark:border-slate-800"
    >
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="w-full h-64 md:h-80"
      >
        {events.slice(0, 5).map((event) => (
          <SwiperSlide key={`slide-${event._id}`}>
            <div
              className="relative w-full h-full cursor-pointer group"
              onClick={() => navigate(`/ticket/${event._id}`)}
            >
              {event.picturePath ? (
                <img
                  src={getImageUrl(event.picturePath)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="featured"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-800 to-fuchsia-900"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 text-white w-full">
                <span className="bg-violet-600/90 backdrop-blur text-[10px] uppercase font-bold px-3 py-1 rounded-full mb-3 inline-block tracking-wider shadow-lg">
                  {t("featured_event")}
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold truncate drop-shadow-2xl">
                  {event.title}
                </h2>
                <p className="opacity-90 text-sm mt-2 flex items-center gap-4 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {new Date(event.date).toDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {event.location}
                  </span>
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export default FeaturedCarousel;