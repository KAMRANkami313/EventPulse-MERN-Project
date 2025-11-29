import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "react-qr-code";

const TicketPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

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

  if (!event) return <div className="p-10 text-center">Loading Ticket...</div>;

  // Unique Ticket Data for the QR Code
  const ticketData = JSON.stringify({
    eventId: event._id,
    userId: user._id,
    timestamp: new Date().toISOString(),
    valid: true
  });

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* TICKET CONTAINER */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        {/* LEFT SIDE: EVENT INFO */}
        <div className="md:w-2/3 p-8 flex flex-col justify-between bg-gradient-to-br from-blue-600 to-purple-600 text-white relative">
            {/* Decorative Circles */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>

            <div>
                <button onClick={() => navigate("/dashboard")} className="text-xs uppercase tracking-widest bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition">
                    ← Back to Dashboard
                </button>
                <h1 className="text-4xl font-bold mt-6 mb-2">{event.title}</h1>
                <p className="text-blue-100 text-lg">{event.category} Event</p>
            </div>

            <div className="mt-8 space-y-4">
                <div>
                    <p className="text-xs uppercase tracking-wider opacity-70">Date & Time</p>
                    <p className="text-xl font-semibold">{new Date(event.date).toDateString()}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider opacity-70">Location</p>
                    <p className="text-xl font-semibold">{event.location}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider opacity-70">Attendee</p>
                    <p className="text-xl font-semibold">{user.firstName} {user.lastName}</p>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: QR CODE */}
        <div className="md:w-1/3 bg-gray-100 p-8 flex flex-col items-center justify-center border-l-4 border-dashed border-gray-300 relative">
            {/* Cutout Notches */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-gray-900 rounded-full"></div>
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gray-900 rounded-full"></div>

            <h3 className="text-gray-500 font-bold uppercase tracking-widest mb-6 text-sm">Admit One</h3>
            
            <div className="bg-white p-4 rounded-xl shadow-inner">
                <QRCode
                    size={150}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={ticketData}
                    viewBox={`0 0 256 256`}
                />
            </div>
            
            <p className="text-xs text-gray-400 mt-6 text-center">
                Scan this at the entrance.<br/>Ticket ID: {event._id.slice(-6).toUpperCase()}-{user._id.slice(-4).toUpperCase()}
            </p>
        </div>

      </div>
    </div>
  );
};

export default TicketPage;