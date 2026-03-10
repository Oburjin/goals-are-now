# Goals Are Now – AI Powered Goal Planner

**Goals Are Now** is a small full‑stack application that takes a user’s high‑level goal and automatically builds a day‑by‑day learning plan. It uses a generative AI model for task decomposition, schedules the resulting tasks based on your available hours, and lets you track progress with a simple checkbox UI.

The current prototype integrates the **Google Gemini API** for content generation and stores state client‑side via `localStorage`. A lightweight Express server handles AI requests and scheduling logic.

GitHub pages link: https://oburjin.github.io/goals-are-now/
* Note that node server.js must be running for back end to function. See below in "Installation & Local Development" to run it locally.

---

## Key Features & Usage ✅

* Ask the system to plan any goal (e.g. “Learn React” or “Write a novel”).
* AI breaks the goal into 8‑12 bite‑sized tasks, returning JSON only.
* Tasks are automatically spread across days according to your hours‑per‑day setting.
* Collapsible goal tiles, checkboxes, and a progress bar help you stay organised.
* Plans persist between sessions using `localStorage`.
* Error handling, request timeouts, and friendly feedback messages.
* **Planned enhancement:** import your existing calendar (Google/Outlook) so AI can schedule around pre‑existing appointments.

---

## Architecture 🏗️

### Frontend (client/) – `/ai-planner/client/app.js`

* Vanilla JavaScript manipulating the DOM directly.
* Modular helpers (`createGoalContainer`, `createTaskItem`, `updateProgress`).
* Fetch calls to backend endpoints with abort‑controller timeouts.
* Responsive UI with animation while the AI thinks.
* Storage helpers: `saveGoals()` / `loadGoals()` with validation.

### Backend (server/) – `/ai-planner/server/server.js`

* Node.js with Express and CORS middleware.
* Environment configuration via `.env` (API key).
* `generateTasks()` encapsulates prompt handling and JSON cleaning.
* `scheduleTasks()` (in `scheduler.js`) divides hours across days.
* Robust input validation and uniform error responses.

### Shared Logic

* `scheduler.js` – simple greedy algorithm to fill daily hours.
* Prompt template with strict instructions to return valid JSON.

---

## Installation & Local Development 🛠️

1. **Clone the repo**

   ```bash
   git clone https://github.com/YOUR_USERNAME/goals-are-now.git
   cd goals-are-now/ai-planner/server
   ```

2. **Install server dependencies**

   ```bash
   npm init -y \
   npm install cors express dotenv @google/generative-ai
   ```

3. **Create `.env`** in the server folder:

   ```text
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Edit** the `package.json` file so that it uses ES modules. Change:

    ```json
    "type": "commonjs",
    ```

    to:

    ```json
    "type": "module",
    ```

5. **Run the server**

   ```bash
   node server.js
   ```

6. **Open the frontend** by loading `ai-planner/client/index.html` in a browser (e.g. using live server)

---

## Extending the App (Roadmap)

* **Calendar integration:** import events from Google/Outlook and adjust schedules around busy times.
* **AI‑aware scheduling:** feed the calendar to the model so it can intelligently place tasks.
* **User accounts / cloud sync** to enable cross‑device access.
* **Deadline support** – let users specify end dates and have the scheduler back‑calculate.
* **Editable plans & priorities** – move or reprioritise tasks manually.
* **Analytics dashboard** – show completion rates, streaks, time spent per goal.

---

## Author

Ernest Ng