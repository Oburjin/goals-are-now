const goalInput = document.getElementById("goal");
const generateBtn = document.getElementById("generate");
const goalsContainer = document.getElementById("goals-container");

generateBtn.addEventListener("click", function() {
    const goal = goalInput.value.trim();
    if (!goal) return;
    goalInput.value = "";

    const goalBtn = document.createElement("button");
    goalBtn.textContent = goal;
    goalBtn.style.display = "block";
    goalBtn.style.marginTop = "10px";

    const stepsList = document.createElement("ul");
    stepsList.style.display = "none";
    stepsList.style.marginLeft = "20px";

    // placeholder
    const steps = [
        'Break down "${goal}" into smaller tasks',
        'Set deadlines for each task',
        'Track progress daily',
        'Adjust steps as needed',
        'Celebrate completion!'
    ];

    steps.forEach(step => {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        li.appendChild(checkbox);
        li.appendChild(document.createTextNode(" " + step));
        stepsList.appendChild(li);
    });

    goalBtn.addEventListener("click", function() {
        if (stepsList.style.display === "none") {
            stepsList.style.display = "block";
        } else {
            stepsList.style.display = "none";
        }
    });

    goalsContainer.appendChild(goalBtn);
    goalsContainer.appendChild(stepsList);
});