import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { scheduleTasks } from "./scheduler.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
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
        Break the following goal into tasks.

        Estimate the hours for each task.

        Return ONLY JSON.

        Goal: ${goal}

        Format:
        {
        "tasks":[
        {"task":"task name","hours":number}
        ]
        }
        `;

    const result = await model.generateContent(prompt);

    let text = result.response.text(); 
    text = text.replace(/```json/g, "").replace(/```/g, "");
    const plan = JSON.parse(text);
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