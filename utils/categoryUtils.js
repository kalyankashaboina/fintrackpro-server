const categoryEmojiMap = {
  "Food & Dining": "🍽️",
  "Transportation": "🚗",
  "Shopping": "🛍️",
  "Entertainment": "🎬",
  "Bills & Utilities": "💡",
  "Healthcare": "🏥",
  "Education": "📚",
  "Travel": "✈️",
  "Groceries": "🛒",
  "Salary": "💰",
  "Investment": "📈",
  "Gift": "🎁"
};

function getCategoryEmoji(category) {
  return categoryEmojiMap[category] || "❓";
}

module.exports = { getCategoryEmoji };
