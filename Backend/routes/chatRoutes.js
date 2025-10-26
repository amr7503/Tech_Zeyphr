const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;
        console.log(message)

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return res.status(400).json({ error: "Message is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "GEMINI_API_KEY not configured on server" });
        }

        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `
            You are an AI assistant for the following web platform:

            Build a full-stack web platform that enables users to create profiles, list skills or learning needs, and connect with others in their locality for skill exchange, micro consulting, or collaborative projects.

            Core Platform Features:
            1. User Authentication & Verification:
            - Secure sign-up/login.
            - Optional identity verification.
            - Skill validation through peer reviews or digital badges.
            2. Geo-Location Matching:
            - Users can discover and filter skill offerings or requests.
            - Search within a customizable radius.
            3. Booking & Scheduling:
            - Built-in calendar for scheduling sessions.
            - Automated reminders and conflict detection.
            4. Reputation System:
            - Ratings, testimonials, and skill endorsements to foster trust and reliability.
            5. Community Projects:
            - Users can propose or join collaborative projects (e.g., building a community garden, coding a local website, organizing a workshop).
            6. Incentive Mechanism:
            - Optional token or credit system to encourage participation.
            - Credits can be redeemed for services or donated to community causes.
            7. Accessibility & Inclusivity:
            - Features for differently-abled users (voice navigation, high-contrast modes, language localization).

            Instructions (MUST FOLLOW):
            - ONLY answer questions directly about this platform (architecture, features, data models, API design, UI/UX, implementation, etc.) or something related about introduction of the website.
            - If the user's input is outside the scope or cannot be resolved, reply exactly:
            "For further questions or clarifications not directly about this platform, please contact: osiruss004@gmail.com"
            - Keep answers concise, actionable, and relevant.
            - Do not provide marketing text or unrelated tutorials.
            `;

        const userPrompt = `
                    ${message} 

            (Note: Only respond within the context of the web platform described in the system prompt.)
            `;

        const fullPrompt = `
            ${systemPrompt}

            ${message}
            `;


        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { role: "user", parts: [{ text: fullPrompt }] }
            ],
            config: {
                temperature: 0.1,
            },
        });

        const reply =
            response.output_text ||
            response.text ||
            "No response text found";

        return res.json({ reply });
    } catch (err) {
        console.error("[chatRoutes] Error calling Gemini API:", err.message || err);
        const errorDetails = err.message || "Unknown error";
        return res.status(500).json({
            error: "Failed to generate reply",
            details: errorDetails,
        });
    }
});

module.exports = router;
