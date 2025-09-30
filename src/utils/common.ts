export function getDomainFromEmail(email: string): string | null {
  if (!email || !email.includes("@")) return null;

  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : null;
}

export function getCompanyNameFromDomain(domain: string): string | null {
  if (!domain) return null;

  // strip common prefixes
  let clean = domain
    .toLowerCase()
    .replace(/^www\./, "") // remove "www."
    .replace(/\.[^.]+$/, ""); // remove last extension (.com, .org, .net etc.)

  // If there are multiple dots left (e.g. co.in), strip again
  if (clean.includes(".")) {
    const parts = clean.split(".");
    clean = parts[parts.length - 1]; // take last meaningful part
  }

  // Replace hyphens/numbers with spaces, capitalize
  return clean
    .replace(/[-_]/g, " ") // turn "-" or "_" into spaces
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize words
}

export const getScoreColor = (score: number): string => {
  if (score >= 87.5) return "#10b981"; // emerald-500 - World Class (green)
  if (score >= 62.5) return "#3b82f6"; // blue-500 - Established (blue)
  if (score >= 37.5) return "#f59e0b"; // amber-500 - Emerging (orange)
  return "#ef4444"; // red-500 - Basic (red)
};

export const getMaturityLevel = (score: number): string => {
  if (score >= 87.5) return "World Class";
  if (score >= 62.5) return "Established";
  if (score >= 37.5) return "Emerging";
  return "Basic";
};

/**
 * Converts strings like "VALUE_SCALING" or "SOME_TEXT" to "Value Scaling" or "Some Text" format
 * @param str - The string to format (e.g., "VALUE_SCALING", "HELLO_WORLD")
 * @returns Formatted string (e.g., "Value Scaling", "Hello World")
 */
export const formatStringToTitle = (str: string): string => {
  if (!str) return '';
  
  return str
    .toLowerCase()                    // Convert to lowercase: "value_scaling"
    .split('_')                       // Split by underscores: ["value", "scaling"]
    .map(word => 
      word.charAt(0).toUpperCase() +  // Capitalize first letter
      word.slice(1)                   // Keep rest lowercase
    )
    .join(' ');                       // Join with spaces: "Value Scaling"
};