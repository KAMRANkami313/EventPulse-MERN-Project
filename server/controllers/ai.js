import User from "../models/User.js";
import Event from "../models/Event.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; 
    
    // 1. FETCH CONTEXT (The Intelligence)
    const user = await User.findById(userId);
    const userEventCount = await Event.countDocuments({ userId: userId });
    
    const lowerMsg = message.toLowerCase();
    let reply = "";

    // --- SMART MATCHERS ---
    // has(['a', 'b']) -> True if message contains 'a' OR 'b'
    const has = (keywords) => keywords.some(k => lowerMsg.includes(k));
    // hasAll(['a', 'b']) -> True if message contains 'a' AND 'b'
    const hasAll = (keywords) => keywords.every(k => lowerMsg.includes(k));

    // --- 🧠 THE COMPLETE KNOWLEDGE BASE 🧠 ---

    // 1. GREETINGS & PERSONALITY
    if (has(["hi", "hello", "hey", "greetings", "sup", "good morning", "good evening"])) {
        reply = `Hello ${user.firstName}! 👋 PulseBot at your service. I see you are joining us from ${user.location || "Earth"}. How can I help?`;
    }
    else if (has(["who are you", "what is this", "your name", "bot"])) {
        reply = "I am **PulseBot** 🤖, the AI assistant for EventPulse. I live in the server and eat binary code for breakfast!";
    }
    else if (has(["ok", "okay", "kk", "alright", "fine", "cool", "nice", "done"])) {
        reply = "Awesome! Let me know if you need anything else. 🚀";
    }
    else if (has(["thank", "thx", "appreciate", "good job"])) {
        reply = `You're very welcome, ${user.firstName}! Happy to help. 🌟`;
    }
    else if (has(["bye", "goodbye", "cya", "leave"])) {
        reply = "Goodbye! Hope to see you at an event soon! 👋";
    }
    else if (has(["sorry", "my bad", "oops", "mistake"])) {
        reply = "No need to apologize! We all make mistakes. I'm here to help you fix them. 😊";
    }
    else if (has(["nothing", "nope", "nah", "no"])) {
        reply = "Alright! I'll be here hanging out in the corner if you need me. ✨";
    }
    else if (has(["how are you", "how r u"])) {
        reply = "I'm just a few lines of code, but I'm functioning perfectly! How are you doing? ⚡";
    }

    // 2. SEARCH & DISCOVERY (Navigation)
    else if (has(["search", "find event", "look for", "filter"])) {
        reply = "To search, use the **Search Bar** at the top of the dashboard. 🔍 You can also click the **Category Pills** (Music, Tech, etc.) to filter, or toggle between **List View** and **Map View**!";
    }
    else if (has(["map", "location view", "where are events"])) {
        reply = "Click the **'Map View'** button 🗺️ on the dashboard. We use Leaflet Maps to show you pins of all upcoming events around the world.";
    }
    else if (has(["recommend", "suggest", "for me"])) {
        reply = "Check the **'Recommended For You'** sidebar on the left! 🧠 It suggests events based on categories you've liked in the past.";
    }
    else if (has(["load more", "pagination", "bottom", "scroll"])) {
        reply = "We load 5 events at a time to keep the app fast! ⚡ Scroll to the bottom and click **'Load More Events'** to see older ones.";
    }

    // 3. SETTINGS & ACCOUNT
    else if (has(["setting", "config", "privacy", "danger zone"])) {
        reply = "You can access **Settings** by clicking the **Gear Icon ⚙️** in the top navigation bar. There you can manage privacy, security, or delete your account.";
    }
    else if (has(["change password", "update password"])) {
        reply = "To change your password while logged in, go to **Settings > Security**. Enter your current password and your new one. 🔐";
    }
    else if (hasAll(["forgot", "password"]) || hasAll(["reset", "password"]) || has(["password"])) {
        reply = "If you are locked out, go to the Login screen and click **'Forgot Password?'**. We will email you a secure reset link.";
    }
    else if (has(["delete account", "remove account"])) {
        reply = "You can permanently delete your account in **Settings > Danger Zone**. Warning: This cannot be undone! ⚠️";
    }
    else if (has(["profile image", "profile pic", "avatar", "photo", "upload image", "change picture"])) {
        reply = "To change your picture: Go to your **Profile**, click the **Edit** button, and look for the upload box at the bottom of the form! 📸";
    }
    else if (has(["google", "gmail", "sign in"])) {
        reply = "We support **Google Login**! 🏳️‍🌈 If you linked your account, you can sign in with one tap on the login screen.";
    }

    // 4. LANGUAGE & INTERNATIONALIZATION
    else if (has(["language", "translate", "english", "spanish", "urdu", "arabic", "french", "turkish"])) {
        reply = "EventPulse is global! 🌍 Click the **Flag Icons** (🇬🇧 🇪🇸 🇫🇷 🇵🇰 🇹🇷 🇸🇦) in the top navbar to instantly switch languages.";
    }

    // 5. EVENT CREATION & MANAGEMENT
    else if (has(["create", "host", "make event", "publish"])) {
        reply = `You have hosted **${userEventCount} events** so far! To create another, click the floating **(+) Plus Button** in the bottom-right corner.`;
    }
    else if (has(["edit event", "update event"])) {
        reply = "Currently, events cannot be edited to preserve ticket integrity. You can **Delete** it and create a new one if needed.";
    }
    else if (has(["delete event", "delte", "remove event"])) { 
        reply = "If you are the creator (or Admin), look for the **Trash Icon 🗑️** on the event card to delete it.";
    }
    else if (has(["guest", "attendee", "list", "csv", "export"])) {
        reply = "Organizers can download their attendee list! 📋 Look for the **'CSV' button** on your event card to download a spreadsheet.";
    }

    // 6. PAYMENTS & TICKETS
    else if (has(["pay", "cost", "price", "stripe", "money", "buy"])) {
        reply = "We use **Stripe** for secure payments 💳. If an event is paid, the 'Join' button changes to 'Buy Ticket'. You'll be redirected to a secure checkout.";
    }
    else if (has(["ticket", "qr", "pdf", "print", "download"])) {
        reply = "After joining, click **'View Ticket'**. On that page, you can see your QR Code or click **'Download PDF'** 📥 to save it.";
    }
    else if (has(["scan", "verify", "check in"])) {
        reply = "Organizers can verify tickets using the **Camera Icon 📷** in the navbar. It opens a QR Scanner to validate attendees instantly.";
    }
    else if (has(["refund", "money back"])) {
        reply = "Refunds are handled by the event organizer directly. Please use the event Group Chat to contact them.";
    }

    // 7. SOCIAL FEATURES
    else if (has(["follow", "unfollow", "friend"])) {
        reply = "Visit a user's profile and click **'Follow'**. You can then toggle your Dashboard to the **'Following'** tab to see only their events! 👥";
    }
    else if (has(["follower", "following", "who follows me"])) {
        reply = "Go to your Profile Page. Click on the number above **'Followers'** or **'Following'** to see the full list of people! 👥";
    }
    else if (has(["chat", "message", "group"])) {
        reply = "Every event has a **Real-Time Group Chat**! 💬 Join an event, then click the 'Chat' button on the card to talk to other attendees.";
    }
    else if (has(["bookmark", "save", "later"])) {
        reply = "Click the **Bookmark Ribbon 🔖** on the top-right of any event card to save it privately to your Profile (Saved Tab).";
    }
    else if (has(["rate", "review", "star"])) {
        reply = "You can rate an event (1-5 Stars) **only after** the event date has passed. A yellow review box will appear on the card! ⭐";
    }

    // 8. TECHNICAL & APP (PWA)
    else if (has(["app", "mobile", "install", "phone", "pwa"])) {
        reply = "Yes! EventPulse is a **Progressive Web App**. 📱 You can install it on your Android or iOS home screen and use it like a native app!";
    }
    else if (has(["tech", "stack", "mern", "code"])) {
        reply = "I am built on the **MERN Stack** (MongoDB, Express, React, Node). I use Socket.io for chat, Tailwind for UI, and Framer Motion for animations! 💻";
    }
    else if (has(["dark mode", "light mode", "theme"])) {
        reply = "Toggle **Dark Mode** 🌙 using the Sun/Moon icon in the navbar. It looks great at night!";
    }

    // 9. ADMIN
    else if (has(["admin", "ban", "broadcast"])) {
        reply = "Admins have a special **Command Center** 🛡️ to view analytics, ban users, and send global broadcasts.";
    }
    else if (has(["report", "spam", "scam", "flag"])) {
        reply = "See something bad? Click the **Flag Icon 🚩** on the event card to report it. Our Admins review all reports.";
    }
    else if (has(["contact", "issue", "bug", "help"])) {
        reply = "If you are facing a technical issue, please report it via the Flag icon, or contact the admin via the Broadcast system.";
    }

    // 10. FALLBACK
    else {
        reply = "I'm not sure about that. 🤖 Try asking about: **'Settings'**, **'How to Search'**, **'Language'**, **'Tickets'**, or **'Creating Events'**.";
    }

    // Simulate "Thinking" delay
    setTimeout(() => {
        res.status(200).json({ reply });
    }, 600); 

  } catch (err) {
    console.error("Bot Error:", err);
    res.status(500).json({ message: "My brain is tired. Try again later." });
  }
};