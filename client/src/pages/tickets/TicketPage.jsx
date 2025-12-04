import { useEffect, useState, useRef } from "react"; // Added useRef
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas"; // New Import
import jsPDF from "jspdf"; // New Import

const TicketPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  
  const ticketRef = useRef(); // Step 2: Create a reference

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvent(response.data);
      } catch (err) {
        console.error("Error fetching ticket", err);
      }
    };
    fetchEvent();
  }, [eventId]);

  // --- EXISTING: CALENDAR EXPORT LOGIC ---
  const handleAddToCalendar = () => {
    if (!event) return;

    // Format dates for ICS file (YYYYMMDDTHHMMSSZ)
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default duration 2 hours

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
    link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- NEW: PDF DOWNLOAD FUNCTION ---
  const handleDownloadPDF = async () => {
    const element = ticketRef.current;
    if (!element) return;

    // 1. Capture the element as a canvas
    const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true, // Allow loading cross-origin images (like Cloudinary)
        backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");

    // 2. Create PDF
    const pdf = new jsPDF("l", "mm", "a4"); // Landscape, Millimeters, A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // 3. Center the image inside PDF
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Add image to PDF (x, y, width, height)
    pdf.addImage(imgData, "PNG", 0, (pdfHeight - imgHeight) / 2, pdfWidth, imgHeight);
    
    // 4. Download
    pdf.save(`Ticket-${event.title}.pdf`);
  };

  if (!event) return <div className="p-10 text-center text-white">Loading Ticket...</div>;

  // Unique Ticket Data for the QR Code
  const ticketData = JSON.stringify({
    eventId: event._id,
    userId: user._id,
    timestamp: new Date().toISOString(),
    valid: true
  });

  // Step 3: Update Return Statement (Attach Ref & Button)
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      
      {/* HEADER ACTIONS */}
      <div className="w-full max-w-4xl flex justify-between mb-4">
          <button onClick={() => navigate("/dashboard")} className="text-white hover:text-gray-300">
              ← Back to Dashboard
          </button>
          
          {/* DOWNLOAD BUTTON */}
          <button 
            onClick={handleDownloadPDF}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition"
          >
            📥 Download PDF
          </button>
      </div>

      {/* TICKET CONTAINER (Tagged with ref) */}
      <div ref={ticketRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        {/* LEFT SIDE: EVENT INFO */}
        <div className="md:w-2/3 p-8 flex flex-col justify-between bg-gradient-to-br from-blue-600 to-purple-600 text-white relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>

            <div>
                <h1 className="text-4xl font-bold mt-2 mb-2">{event.title}</h1>
                <p className="text-blue-100 text-lg uppercase tracking-wide">{event.category} Event</p>
            </div>

            <div className="mt-8 space-y-4">
                {/* Date */}
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <div>
                        <p className="text-xs uppercase tracking-wider opacity-70">Date</p>
                        <p className="text-xl font-semibold">{new Date(event.date).toDateString()}</p>
                    </div>
                </div>
                {/* Location */}
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                        <p className="text-xs uppercase tracking-wider opacity-70">Location</p>
                        <p className="text-xl font-semibold">{event.location}</p>
                    </div>
                </div>
                {/* Attendee */}
                <div className="flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                        <p className="text-xs uppercase tracking-wider opacity-70">Attendee</p>
                        <p className="text-xl font-semibold">{user.firstName} {user.lastName}</p>
                    </div>
                </div>
                
                {/* Calendar Button (Re-inserted) */}
                <button 
                    onClick={handleAddToCalendar}
                    className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition shadow-sm w-fit"
                >
                    📅 Add to Calendar
                </button>
            </div>
            
            <p className="mt-6 text-xs opacity-50">EventPulse ID: {event._id}</p>
        </div>

        {/* RIGHT SIDE: QR CODE */}
        <div className="md:w-1/3 bg-white p-8 flex flex-col items-center justify-center border-l-2 border-dashed border-gray-300 relative">
            {/* Cutout Notches visual trick */}
            <div className="absolute -top-6 -left-4 w-8 h-8 bg-gray-900 rounded-full"></div>
            <div className="absolute -bottom-6 -left-4 w-8 h-8 bg-gray-900 rounded-full"></div>

            <h3 className="text-gray-500 font-bold uppercase tracking-widest mb-6 text-sm">Admit One</h3>
            
            <div className="bg-white p-2 border-4 border-black rounded-lg">
                <QRCode
                    size={150}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={ticketData}
                    viewBox={`0 0 256 256`}
                />
            </div>
            
            <p className="text-xs text-gray-400 mt-6 text-center">
                Scan at entrance
            </p>
        </div>

      </div>
    </div>
  );
};

export default TicketPage;