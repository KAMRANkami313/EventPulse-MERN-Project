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
      <div className="p-10 text-center text-white">Loading Ticket...</div>
    );

  const ticketData = JSON.stringify({
    eventId: event._id,
    userId: user._id,
    timestamp: new Date().toISOString(),
    valid: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center p-6">
      {/* Header Buttons */}
      <div className="w-full max-w-4xl flex justify-between mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/90 hover:bg-green-600 text-white rounded-xl shadow-lg transition"
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
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row"
      >
        {/* LEFT: Info */}
        <div className="md:w-2/3 p-10 text-white relative bg-gradient-to-br from-blue-700/60 to-purple-700/60 backdrop-blur-xl">

          {/* Decorative circles */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>

          {/* FIXED HERE → Removed duplicate bg-white/10 */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>

          <h1 className="text-4xl font-bold mb-2 drop-shadow-xl">
            {event.title}
          </h1>
          <p className="uppercase text-sm tracking-wider opacity-80 mb-8">
            {event.category} Event
          </p>

          <div className="space-y-7">
            {/* Date */}
            <div className="flex items-center gap-4">
              <Calendar className="text-white" size={28} />
              <div>
                <p className="text-xs uppercase opacity-60">Date</p>
                <p className="text-xl font-semibold">
                  {new Date(event.date).toDateString()}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4">
              <MapPin className="text-white" size={28} />
              <div>
                <p className="text-xs uppercase opacity-60">Location</p>
                <p className="text-xl font-semibold">{event.location}</p>
              </div>
            </div>

            {/* Attendee */}
            <div className="flex items-center gap-4">
              <User className="text-white" size={28} />
              <div>
                <p className="text-xs uppercase opacity-60">Attendee</p>
                <p className="text-xl font-semibold">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>

            {/* Add to Calendar */}
            <button
              onClick={handleAddToCalendar}
              className="mt-3 flex items-center gap-2 px-4 py-2 border border-white/30 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              <Calendar size={18} /> Add to Calendar
            </button>
          </div>

          <p className="mt-8 text-xs opacity-50">
            EventPulse ID: {event._id}
          </p>
        </div>

        {/* RIGHT: QR Code */}
        <div className="md:w-1/3 bg-white p-10 flex flex-col items-center justify-center relative">
          <h3 className="text-gray-500 font-bold uppercase tracking-widest mb-6 text-sm">
            Admit One
          </h3>

          <div className="bg-white p-2 border-4 border-black rounded-xl shadow-xl">
            <QRCode
              size={150}
              value={ticketData}
              style={{ width: "150px", height: "150px" }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-6">Scan at entrance</p>
        </div>
      </motion.div>
    </div>
  );
};

export default TicketPage;
