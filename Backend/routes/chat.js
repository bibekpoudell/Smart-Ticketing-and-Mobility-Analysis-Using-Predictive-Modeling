const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Event = require("../models/Event");

// Use process.env for security - add GEMINI_API_KEY to your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;

    // 1. Fetch live events from your database
    const liveEvents = await Event.find({});

    // 2. Format the data for the AI context
    const eventContext = liveEvents.length > 0 
      ? liveEvents.map(e => `- ${e.title} at ${e.venue}. Price: Rs.${e.currentPrice}. Date: ${e.date || 'TBA'}`).join("\n")
      : "No live events currently scheduled.";

    // 3. Setup the Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 4. Combine instructions and user prompt into one clear message
    const systemInstruction = `You are "Beat-Bot", the witty AI assistant for Beat-Tix Kathmandu.
Use this LIVE database info to answer:
${eventContext}

Rules:
- Only discuss events listed above. If an artist/venue isn't listed, say: "That's not on our playlist yet, but stay tuned!"
- Keep answers short, helpful, and "musical".
- If asked for directions, remind them to use the "Start Navigation" button on the event card.`;

    // We send this as a structured prompt
    const finalPrompt = `${systemInstruction}\n\nUser Question: ${prompt}`;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ text });

  } catch (error) {
    console.error("Chat Error:", error);
    // Return a friendly error to the user
    res.status(500).json({ text: "My brain is a bit fuzzy. Try asking again in a second! 🎸" });
  }
});

module.exports = router;