/**
 * Parses a combined category name string (e.g. "🍎 Produce" or "Meat")
 * and returns the emoji and pure name parts separately.
 */
export function splitCategoryName(fullName: string | undefined | null) {
  if (!fullName) return { emoji: "", color: "baedaOrange", name: "" };

  const trimmed = fullName.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        emoji: parsed.emoji || "",
        color: parsed.color || "baedaOrange",
        name: parsed.name || "",
      };
    } catch (e) {
      // Fallback to legacy parsing if JSON parse fails
    }
  }

  // Match a leading emoji followed by optional spaces and the rest of the string
  // Uses Unicode properties to match emoji presentations and modifier sequences
  const match = trimmed.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base})?\s*(.*)$/u);

  if (match && match[1]) {
    return {
      emoji: match[1],
      color: "baedaOrange",
      name: match[2].trim(),
    };
  }

  return {
    emoji: "",
    color: "baedaOrange",
    name: trimmed,
  };
}

/**
 * Formats an emoji, color, and category name text into a single combined string to store in the database.
 */
export function formatCategoryName(emoji: string, color: string, name: string) {
  return JSON.stringify({
    emoji: emoji.trim(),
    color: color.trim() || "baedaOrange",
    name: name.trim(),
  });
}
