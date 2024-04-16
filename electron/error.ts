import { WyrmErrorDetails } from "../types/global";

/**
 * Error class for parsing additional details for error dialog.
 */
export default class WyrmError extends Error {
  details: string = "";

  constructor(error?: string | Error, details?: string | Error | Error[]) {
    super(typeof error === "string" ? error : error.message);
    if (typeof details === "string") {
      this.details = details;
    } else if (Array.isArray(details)) {
      this.details = details.map((d) => d.toString()).join("\n");
    } else if (details) {
      this.details = details.stack ?? details.toString();
    } else if (typeof error !== "string") {
      this.details = error.stack ?? error.toString();
    }
  }

  /**
   * Get message data for frontend. Do NOT rely on in catch blocks.
   *
   * @returns Error details to send to frontend dialog
   */
  public getData(): WyrmErrorDetails {
    return {
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Parse WyrmError (or Error) correctly
 *
 * @param e Error
 * @returns Error details to send to frontend dialog
 */
export function parseErr(e: WyrmError | Error): WyrmErrorDetails {
  if (e instanceof WyrmError) {
    return e.getData();
  }
  return {
    message: e.message,
    details: e.toString(),
  };
}
