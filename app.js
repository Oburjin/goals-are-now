const addGoalBtn = document.getElementById("addGoalBtn");
const goalInput = document.getElementById("goalInput");
const hoursInput = document.getElementById("hoursPerDay");
const scheduleContainer = document.getElementById("scheduleContainer");
const goalButtons = {};

addGoalBtn.addEventListener("click", async () => {
    const goal = goalInput.value.trim();
    const hoursPerDay = parseInt(hoursInput.value);
    if (!goal) return;
    goalInput.value = "";

    // Remove old goal if exists
    if (goalButtons[goal]) {
        goalButtons[goal].remove();
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
    feedbackSpan.textContent = "Generating...";
    feedbackSpan.style.marginLeft = "10px";
    goalDiv.insertBefore(feedbackSpan, button.nextSibling);

    // Create the list for tasks
    const listDiv = document.createElement("div");
    listDiv.classList.add("task-list");
    listDiv.style.display = "none"; // collapsed by default
    goalDiv.appendChild(listDiv);

    // Append to schedule container
    scheduleContainer.appendChild(goalDiv);

    // Save reference
    goalButtons[goal] = goalDiv;

    // Toggle collapse on click
    button.addEventListener("click", () => {
    listDiv.style.display = listDiv.style.display === "none" ? "block" : "none";
    });

    try {
        const res = await fetch ("http://localhost:3000/plan-goal", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ goal, hoursPerDay })
        });

        const data = await res.json();

        // Populate tasks inside listDiv with checkboxes
        data.schedule.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("task-item");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";

            const label = document.createElement("label");
            label.textContent = `Day ${item.day}: ${item.task} (${item.hours}h)`;
            label.style.marginLeft = "8px";

            div.appendChild(checkbox);
            div.appendChild(label);

            listDiv.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        feedbackSpan.textContent = "Error generating tasks.";
    }
});