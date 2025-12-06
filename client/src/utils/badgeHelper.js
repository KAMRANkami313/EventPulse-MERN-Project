export const getUserBadges = (user, hostedCount) => {
    const badges = [];

    // 1. "Early Adopter" (Joined in 2024 or earlier)
    if (new Date(user.createdAt).getFullYear() <= 2024) {
        badges.push({ icon: "🔥", label: "Early Adopter", color: "bg-orange-100 text-orange-600" });
    }

    // 2. "Top Host" (Hosted more than 5 events)
    if (hostedCount >= 5) {
        badges.push({ icon: "👑", label: "Top Host", color: "bg-yellow-100 text-yellow-700" });
    }

    // 3. "Verified" (If they have a profile pic & location)
    if (user.picturePath && user.location) {
        badges.push({ icon: "✅", label: "Verified", color: "bg-blue-100 text-blue-600" });
    }

    // 4. "Networker" (More than 10 friends)
    if (user.friends && user.friends.length >= 10) {
        badges.push({ icon: "🤝", label: "Networker", color: "bg-purple-100 text-purple-600" });
    }

    return badges;
};