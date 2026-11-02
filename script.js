const skillsList = document.getElementById("skills-list");
const skillCount = document.getElementById("skill-count");
const emptyMessage = document.getElementById("empty-message");
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const filterButtons = document.querySelectorAll(".filter-button");
const skillForm = document.getElementById("skill-form");
const formMessage = document.getElementById("form-message");

let skills = [];
let selectedCategory = "All";

function getInitials(title) {
    return title
        .split(" ")
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function renderSkills(category = selectedCategory) {
    selectedCategory = category;

    const filtered = window.SkillSwapFunctions.filterSkillsByCategory(
        skills,
        category
    );

    skillsList.replaceChildren();

    filtered.forEach(skill => {
        const card = document.createElement("article");
        card.className = "skill-card";

        const icon = document.createElement("div");
        icon.className = "skill-icon";
        icon.textContent = getInitials(skill.title);

        const categoryLabel = document.createElement("p");
        categoryLabel.className = "skill-category";
        categoryLabel.textContent = skill.category;

        const title = document.createElement("h3");
        title.textContent = skill.title;

        const description = document.createElement("p");
        description.className = "skill-description";
        description.textContent = skill.description;

        const provider = document.createElement("p");
        provider.className = "provider";
        provider.textContent = `Provided by: ${skill.provider || "Anonymous"}`;

        const footer = document.createElement("div");
        footer.className = "skill-card-footer";

        const price = document.createElement("span");
        price.className = "skill-price";
        price.textContent = Number(skill.price) === 0
            ? "Free"
            : `$${Number(skill.price).toFixed(2)}/hr`;

        footer.append(price);
        card.append(icon, categoryLabel, title, description, provider, footer);
        skillsList.appendChild(card);
    });

    skillCount.textContent =
        `${filtered.length} ${filtered.length === 1 ? "skill" : "skills"}`;

    emptyMessage.hidden = filtered.length > 0;
}

async function loadSkills() {
    loadingMessage.hidden = false;
    errorMessage.hidden = true;

    try {
        skills = await window.apiService.fetchSkills();
        renderSkills();
    } catch (error) {
        errorMessage.textContent =
            "Unable to load skills. Make sure the backend server is running.";
        errorMessage.hidden = false;
        console.error(error);
    } finally {
        loadingMessage.hidden = true;
    }
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(item => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        renderSkills(button.dataset.category);
    });
});

skillForm.addEventListener("submit", async event => {
    event.preventDefault();

    const formData = new FormData(skillForm);

    const skillData = {
        title: formData.get("title").trim(),
        category: formData.get("category"),
        price: Number(formData.get("price")),
        description: formData.get("description").trim(),
        provider: formData.get("provider").trim() || "Anonymous"
    };

    try {
        formMessage.textContent = "Adding your skill...";

        await window.apiService.createSkill(skillData);

        formMessage.textContent = "Skill added successfully!";
        skillForm.reset();

        selectedCategory = "All";
        filterButtons.forEach(button => {
            const active = button.dataset.category === "All";
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        await loadSkills();
    } catch (error) {
        formMessage.textContent = error.message;
        console.error(error);
    }
});

loadSkills();
