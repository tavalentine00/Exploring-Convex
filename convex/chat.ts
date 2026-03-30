import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Parses Wikipedia `action=query&prop=extracts` JSON into plain-text extract, or null if missing. */
export function getSummaryFromJSON(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const query = (data as { query?: { pages?: Record<string, { extract?: string }> } }).query;
  const pages = query?.pages;
  if (!pages || typeof pages !== "object") return null;
  const ids = Object.keys(pages);
  if (ids.length === 0) return null;
  const extract = pages[ids[0]]?.extract;
  return typeof extract === "string" && extract.length > 0 ? extract : null;
}

export const getWikiSummary = action({
  args: { topic: v.string() },
  handler: async (_ctx, args) => {
    const trimmed = args.topic.trim();
    if (!trimmed) return null;
    const url =
      "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&titles=" +
      encodeURIComponent(trimmed);
    const response = await fetch(url);
    if (!response.ok) return null;
    const json: unknown = await response.json();
    return getSummaryFromJSON(json);
  },
});

export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("desc").take(50);
    return messages.reverse();
    // return await ctx.db.query("messages").order("asc").collect();
  },
});

export const sendMessage = mutation({
  args: {
    user: v.string(),
    body: v.string(),
    poop: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("This TypeScript function is running on the server");
    await ctx.db.insert("messages", {
      user: args.user,
      body: args.body,
      poop: args.poop,
    });
  },
});