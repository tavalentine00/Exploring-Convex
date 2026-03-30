import { internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("desc").take(50);
    return messages.reverse();
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

    if (args.body.startsWith("/wiki")) {
      const topic = args.body.slice(args.body.indexOf(" ") + 1);
      await ctx.scheduler.runAfter(0, internal.chat.getWikipediaSummary, { topic });
    }  
  },  
});

export const getWikipediaSummary = internalAction({
  args: { topic: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=extracts&exintro&explaintext&titles=${args.topic}`
    );

    const summary = getSummaryFromJSON(await response.json());

    await ctx.scheduler.runAfter(0, api.chat.sendMessage, {

      user: "Wikipedia",
      body: summary,
      poop: "wikipedia",
    });
  },
});

function getSummaryFromJSON(data: any) {
  const firstPageId = Object.keys(data.query.pages)[0];
  return data.query.pages[firstPageId].extract;
}