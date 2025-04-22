import { AnalyticsBrowser } from "@segment/analytics-next";

const writeKey = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY;

if (!writeKey) {
  throw new Error("NEXT_PUBLIC_SEGMENT_WRITE_KEY is not defined in the environment variables.");
}

export const analytics = AnalyticsBrowser.load({
  writeKey,
});
