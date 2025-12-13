import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Download,
  Clock,
  Ticket
} from "lucide-react";

// 🎯 IMPORT THE ENV VARIABLE FOR API URL
const API_URL = import.meta.env.VITE_API_URL;

const TicketPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const ticketRef = useRef();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/events/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEvent(response.data);
      } catch (err) {
        console.error("Error fetching ticket", err);
      }
    };
    fetchEvent();
  }, [eventId]);

  // ICS Calendar Export
  const handleAddToCalendar = () => {
    if (!event) return;

    const formatDate = (date) =>
      date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.href}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `${event.title.replace(/\s+/g, "_")}.ics`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Download
  const handleDownloadPDF = async () => {
    const element = ticketRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      (pdfHeight - imgHeight) / 2,
      pdfWidth,
      imgHeight
    );

    pdf.save(`Ticket-${event.title}.pdf`);
  };

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse flex flex-col items-center">
            <Ticket className="w-12 h-12 text-violet-500 mb-4" />
            <p className="text-xl font-bold">Generating Ticket...</p>
        </div>
      </div>
    );

  const ticketData = JSON.stringify({
    eventId: event._id,
    userId: user._id,
    timestamp: new Date().toISOString(),
    valid: true,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col items-center justify-center p-4 md:p-6">
      
      {/* Header Buttons (Responsive) */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <button
          onClick={handleDownloadPDF}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-500/20 transition font-bold"
        >
          <Download size={18} /> Download PDF
        </button>
      </div>

      {/* Ticket Card */}
      <motion.div
        ref={ticketRef}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800"
      >
        {/* LEFT: Info Section */}
        <div className="md:w-2/3 p-8 md:p-10 relative bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
          
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/10">
                {event.category} Event
            </span>

            <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight drop-shadow-lg">
                {event.title}
            </h1>

            <div className="space-y-6">
                {/* Date */}
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                        <Calendar className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Date</p>
                        <p className="text-lg font-bold">{new Date(event.date).toDateString()}</p>
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                        <MapPin className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Location</p>
                        <p className="text-lg font-bold">{event.location}</p>
                    </div>
                </div>

                {/* Attendee */}
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                        <User className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Attendee</p>
                        <p className="text-lg font-bold">{user.firstName} {user.lastName}</p>
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/20 flex flex-wrap gap-4 justify-between items-center">
                <button
                onClick={handleAddToCalendar}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-xs font-bold uppercase tracking-wide border border-white/20"
                >
                <Clock size={16} /> Add to Calendar
                </button>
                <p className="text-[10px] opacity-60 font-mono">ID: {event._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* Perforation Circles (Desktop) */}
          <div className="hidden md:block absolute right-0 top-1/2 -mt-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full translate-x-1/2"></div>
        </div>

        {/* RIGHT: QR Code Section */}
        <div className="md:w-1/3 bg-white dark:bg-slate-800 p-8 flex flex-col items-center justify-center relative border-l-2 border-dashed border-slate-200 dark:border-slate-700">
          
          {/* Perforation Circles (Mobile) */}
          <div className="md:hidden absolute top-0 left-1/2 -ml-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full -translate-y-1/2"></div>
          <div className="md:hidden absolute bottom-0 left-1/2 -ml-4 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full translate-y-1/2"></div>

          <h3 className="text-slate-400 font-bold uppercase tracking-[0.2em] mb-8 text-xs">
            Scan for Entry
          </h3>

          <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100">
            <QRCode
              size={160}
              value={ticketData}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>

          <div className="mt-8 text-center space-y-1">
            <p className="text-xs font-bold text-slate-800 dark:text-white uppercase">Valid Ticket</p>
            <p className="text-[10px] text-slate-400">Please show this at the entrance</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TicketPage;