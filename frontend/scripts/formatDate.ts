import { get } from "svelte/store";
import { settings } from "@stores/settings";

export function formatDate(datetime?: string | number | Date, format?: string): string {
  if (!datetime) return "";

  if (typeof datetime === "string") {
    datetime = datetime.trim();
    // Negative years are BCE.
    if (datetime.match(/^-\d+$/)) {
      return `${datetime.slice(1)} BCE`;
    }
    // Don't format if just year or year and month.
    if (datetime.match(/^\d+$/) || datetime.match(/^-?\d+[\/\- ]-?\d+$/) || datetime.match(/^\w+[\/\- ]\d+$/)) {
      return datetime;
    }
  }

  const date = new Date(datetime);
  if (!format) format = get(settings).dateFormat;
  switch (format) {
    case "yyyy-mm-dd":
      return (
        date.getUTCFullYear() +
        "-" +
        date.getUTCMonth().toString().padStart(2, "0") +
        "-" +
        date.getUTCDate().toString().padStart(2, "0")
      );
    case "local-short":
      return date.toLocaleDateString(undefined, {
        timeZone: "UTC",
      });
    case "local-medium":
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    case "local-long":
    default:
      return date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
  }
}
