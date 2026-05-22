import { describe, it, expect } from "vitest";
import {
  formatMs,
  parseTimeToMs,
  extractTrackId,
  parsePlaylistInput,
} from "../app/types";

describe("formatMs", () => {
  it("formats zero", () => {
    expect(formatMs(0)).toBe("0:00");
  });

  it("formats seconds only", () => {
    expect(formatMs(5000)).toBe("0:05");
  });

  it("formats minutes and seconds", () => {
    expect(formatMs(65000)).toBe("1:05");
  });

  it("pads seconds to two digits", () => {
    expect(formatMs(60000)).toBe("1:00");
  });

  it("handles large values", () => {
    expect(formatMs(3661000)).toBe("61:01");
  });

  it("clamps negative values to zero", () => {
    expect(formatMs(-5000)).toBe("0:00");
  });
});

describe("parseTimeToMs", () => {
  it("parses m:ss format", () => {
    expect(parseTimeToMs("1:30")).toBe(90000);
  });

  it("parses 0:00", () => {
    expect(parseTimeToMs("0:00")).toBe(0);
  });

  it("parses plain seconds", () => {
    expect(parseTimeToMs("45")).toBe(45000);
  });

  it("returns 0 for invalid input", () => {
    expect(parseTimeToMs("abc")).toBe(0);
  });
});

describe("extractTrackId", () => {
  it("returns null for empty string", () => {
    expect(extractTrackId("")).toBeNull();
  });

  it("extracts ID from full URL", () => {
    expect(extractTrackId("https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8")).toBe(
      "4PTG3Z6ehGkBFwjybzWkR8",
    );
  });

  it("extracts ID from URL with query params", () => {
    expect(
      extractTrackId("https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8?si=abc123"),
    ).toBe("4PTG3Z6ehGkBFwjybzWkR8");
  });

  it("accepts raw 22-char ID", () => {
    expect(extractTrackId("4PTG3Z6ehGkBFwjybzWkR8")).toBe("4PTG3Z6ehGkBFwjybzWkR8");
  });

  it("returns null for invalid input", () => {
    expect(extractTrackId("not-a-track-id")).toBeNull();
  });
});

describe("parsePlaylistInput", () => {
  it("parses Spotify URL", () => {
    expect(parsePlaylistInput("https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn")).toBe(
      "spotify:playlist:37i9dQZF1DWWQRwui0ExPn",
    );
  });

  it("accepts Spotify URI as-is", () => {
    expect(parsePlaylistInput("spotify:playlist:37i9dQZF1DWWQRwui0ExPn")).toBe(
      "spotify:playlist:37i9dQZF1DWWQRwui0ExPn",
    );
  });

  it("returns null for invalid input", () => {
    expect(parsePlaylistInput("not-a-playlist")).toBeNull();
  });
});
