import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { scheduleTasks } from "./scheduler.js";

dotenv.config();

// Constants
const PORT = 3000;
const DEFAULT_HOURS_PER_DAY = 4;
const AI_MODEL = "gemma-3-1b-it"; // Change as needed
const TASK_PROMPT = `
Break the following goal into 8-12 small learning tasks.

Return ONLY valid JSON.

Do not include explanations.
Do not include markdown.
Do not include backticks.

The JSON must follow this format exactly:

{
"tasks":[
{"task":"task name","hours":number}
]
}

Goal: {goal}
`;

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: AI_MODEL });

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Generates tasks using AI for a given goal.
 * @param {string} goal - The goal to break into tasks.
 * @returns {Object} Parsed plan with tasks.
 */
async function generateTasks(goal) {
    const prompt = TASK_PROMPT.replace("{goal}", goal);
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    console.log("AI Response:", text);

    let cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/[\u0000-\u001F]+/g, "")
        .trim();

    try {
        const plan = JSON.parse(cleanText);
        if (!plan.tasks || plan.tasks.length === 0) {
            throw new Error("AI returned no tasks");
        }
        return plan;
    } catch (error) {
        console.error("Error parsing JSON:", cleanText);
        throw new Error("Invalid JSON response from AI");
    }
}

app.post("/plan-goal", async (req, res) => {
    try {
        const { goal, hoursPerDay = DEFAULT_HOURS_PER_DAY } = req.body;

        if (!goal || typeof goal !== "string" || goal.trim().length === 0) {
            return res.status(400).json({ error: "Valid goal is required" });
        }

        const plan = await generateTasks(goal.trim());
        const schedule = scheduleTasks(plan.tasks, hoursPerDay);

        res.json({ tasks: plan.tasks, schedule });
    } catch (error) {
        console.error("Plan goal error:", error);
        res.status(500).json({ error: error.message || "Failed to generate plan" });
    }
});

app.post("/test-goal", (req, res) => {
    const { goal } = req.body;
    if (!goal) {
        return res.status(400).json({ error: "Goal is required" });
    }
    res.json({ message: "Goal received", goal });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});