import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

    if(args.body.startsWith("/wiki")) {
      const topic = args.body.slice(args.body.indexOf("") + 1);
      const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=extracts&exintro&explaintext&titles=${topic}`);
      const data = await response.json();
      const firstPageId = Object.keys(data.query.pages)[0];
      const summary = data.query.pages[firstPageId].extract;
      await ctx.db.insert("messages", {
        user: "Wikipedia",
        body: summary,
        poop: "wikipedia",
      });
    }
  },
});