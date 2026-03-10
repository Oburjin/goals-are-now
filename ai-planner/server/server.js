import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { scheduleTasks } from "./scheduler.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    // model: "gemini-2.5-flash"
    model: "gemma-3-1b-it"
    // model: "gemma-3-12b-it"
});

const app = express();
app.use(cors(
    // {origin: "http://oburjin.github.io"}
));

app.use(express.json());

app.get("/test-ai", async (req, res) => {
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    res.send(response.text());
});

app.post("/plan-goal", async function (req, res) {
    const goal = req.body.goal;

    const prompt = `
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

        Goal: ${goal}
        `;

    const result = await model.generateContent(prompt);

    let text = result.response.text();

    console.log(text);

    let cleanText = text
    .replace(/```json/g, "")   // remove markdown opening
    .replace(/```/g, "")       // remove markdown closing
    .replace(/\r/g, "")        // remove carriage returns
    .replace(/\t/g, " ")       // replace tabs with spaces
    .replace(/[\u0000-\u001F]+/g, "") // remove control chars
    .trim();

    let plan;
    try {
        plan = JSON.parse(cleanText);
    } catch (error) {
        console.error("Error parsing JSON:", cleanText);
        return res.status(400).json({ error: "Invalid JSON response from AI" });
    }

    if (!plan.tasks || plan.tasks.length === 0) {
        throw new Error("AI returned no tasks");
    }
    const hoursPerDay = req.body.hoursPerDay || 4;  // Default 4h/day
    const schedule = scheduleTasks(plan.tasks, hoursPerDay);
    res.json({
        tasks: plan.tasks,
        schedule
    });
});

app.post("/test-goal", function(req, res) {
    const goal = req.body.goal;

    res.json({
        message: "Goal received",
        goal: goal
    });
});

// app.get("/", function(req, res) {
//     res.send("Server working!");
// });

app.listen(3000);