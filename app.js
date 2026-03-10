const addGoalBtn = document.getElementById("addGoalBtn");
const goalInput = document.getElementById("goalInput");
const hoursInput = document.getElementById("hoursPerDay");
const scheduleContainer = document.getElementById("scheduleContainer");
const goalButtons = {};
let currentOpenGoal = null;
let goalsData = loadGoals();

function animateThinking(element) {

  let dots = 1;

  const interval = setInterval(() => {

    dots = (dots % 3) + 1;

    element.textContent = "Generating" + ".".repeat(dots);

  }, 500);

  return interval;
}

function saveGoals(goals) {
    localStorage.setItem("goals", JSON.stringify(goals));
}

function loadGoals() {
    const goals = JSON.parse(localStorage.getItem("goals") || "[]");
    return goals;
}

addGoalBtn.addEventListener("click", async () => {
    const goal = goalInput.value.trim();
    const hoursPerDay = parseInt(hoursInput.value);
    if (!goal) return;
    goalInput.value = "";

    // Remove old goal if exists
    if (goalButtons[goal]) {
        goalButtons[goal].remove();
    }

    // Collapse previous open goal
    if (currentOpenGoal) {
        const prevList = currentOpenGoal.querySelector(".task-list");
        if (prevList) prevList.style.display = "none";
    }

    // Create a new container for this goal
    const goalDiv = document.createElement("div");
    goalDiv.classList.add("goal-container");

    // Create collapsible button
    const button = document.createElement("button");
    button.textContent = goal;
    button.classList.add("goal-button");
    goalDiv.appendChild(button);

    // Create "generating" text as visual feedback for awaiting tasks from AI
    const feedbackSpan = document.createElement("span");
    feedbackSpan.style.marginLeft = "10px";
    const thinkingAnimation = animateThinking(feedbackSpan);
    goalDiv.insertBefore(feedbackSpan, button.nextSibling);

    // Create the list for tasks
    const listDiv = document.createElement("div");
    listDiv.classList.add("task-list");
    goalDiv.appendChild(listDiv);

    // Append to schedule container
    scheduleContainer.appendChild(goalDiv);
    //Auto scroll to new goal
    goalDiv.scrollIntoView({ behavior: "smooth" });

    // Save reference
    goalButtons[goal] = goalDiv;

    // Mark this goal as currently open
    currentOpenGoal = goalDiv;

    // Clicking button now toggles this list
    button.addEventListener("click", () => {
    if (currentOpenGoal && currentOpenGoal !== goalDiv) {
        // Collapse previous goal
        const prevList = currentOpenGoal.querySelector(".task-list");
        if (prevList) prevList.style.display = "none";
        currentOpenGoal = goalDiv;
    }
    listDiv.style.display = listDiv.style.display === "none" ? "block" : "none";
    });

    try {
        const res = await fetch ("http://localhost:3000/plan-goal", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ goal, hoursPerDay })
        });

        const data = await res.json();
        clearInterval(thinkingAnimation);

        const newGoal = {
            goal: goal,
            tasks: data.schedule.map(task => ({
                ...task,
                done: false
            }))
        };
        goalsData.push(newGoal);
        saveGoals(goalsData);

        feedbackSpan.textContent = "";

        // Populate tasks inside listDiv with checkboxes
        data.schedule.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("task-item");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";

            checkbox.addEventListener("change", () => {
                const goalObj = goalsData.find(g => g.goal === goal);
                if (goalObj) {
                    const taskObj = goalObj.tasks.find(t => t.task === item.task && t.hours === item.hours);
                    if (taskObj) {
                        taskObj.done = checkbox.checked;
                        saveGoals(goalsData);
                    }
                }   
            });

            const label = document.createElement("label");
            label.textContent = `Day ${item.day}: ${item.task} (${item.hours}h)`;
            label.style.marginLeft = "8px";

            div.appendChild(checkbox);
            div.appendChild(label);

            listDiv.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        clearInterval(thinkingAnimation);
        feedbackSpan.textContent = "Error generating tasks.";
    }
});

function renderSavedGoals() {

  goalsData.forEach(goalObj => {

    const goal = goalObj.goal;

    const goalDiv = document.createElement("div");
    goalDiv.classList.add("goal-container");

    const button = document.createElement("button");
    button.textContent = goal;
    button.classList.add("goal-button");

    goalDiv.appendChild(button);

    const listDiv = document.createElement("div");
    listDiv.classList.add("task-list");
    listDiv.style.display = "none";

    // Clicking button now toggles this list
    button.addEventListener("click", () => {
    if (currentOpenGoal && currentOpenGoal !== goalDiv) {
        // Collapse previous goal
        const prevList = currentOpenGoal.querySelector(".task-list");
        if (prevList) prevList.style.display = "none";
        currentOpenGoal = goalDiv;
    }
    listDiv.style.display = listDiv.style.display === "none" ? "block" : "none";
    });

    goalObj.tasks.forEach(item => {

        const div = document.createElement("div");
        div.classList.add("task-item");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.done;

        checkbox.addEventListener("change", () => {

        const goalObj = goalsData.find(g => g.goal === goal);
            const taskObj = goalObj.tasks.find(t =>
                t.day === item.day && t.task === item.task
            );

            taskObj.done = checkbox.checked;

            saveGoals(goalsData);
        });

        const label = document.createElement("label");
        label.textContent =
            `Day ${item.day}: ${item.task} (${item.hours}h)`;

        label.style.marginLeft = "8px";

        div.appendChild(checkbox);
        div.appendChild(label);

        listDiv.appendChild(div);

    });

    goalDiv.appendChild(listDiv);
    scheduleContainer.appendChild(goalDiv);

  });

}

renderSavedGoals();