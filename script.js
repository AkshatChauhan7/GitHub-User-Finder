const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const profileContainer = document.getElementById("profile-container");
const errorContainer = document.getElementById("error-container");
const avatar = document.getElementById("avatar");
const nameElement = document.getElementById("name");
const usernameElement = document.getElementById("username");
const bioElement = document.getElementById("bio");
const locationElement = document.getElementById("location");
const joinedDateElement = document.getElementById("joined-date");
const profileLink = document.getElementById("profile-link");
const followers = document.getElementById("followers");
const following = document.getElementById("following");
const repos = document.getElementById("repos");
const companyElement = document.getElementById("company");
const blogElement = document.getElementById("blog");
const twitterElement = document.getElementById("twitter");
const companyContainer = document.getElementById("company-container");
const blogContainer = document.getElementById("blog-container");
const twitterContainer = document.getElementById("twitter-container");
const reposContainer = document.getElementById("repos-container");
const themeToggle = document.getElementById("theme-toggle");

// Click on button
if (searchBtn) searchBtn.addEventListener("click", searchUser);

// Enter on input
if (searchInput) searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchUser();
});

// Theme toggle (light / dark)
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("theme-dark");
  } else {
    root.classList.remove("theme-dark");
  }

  // update toggle state/icon
  if (themeToggle) {
    const icon = themeToggle.querySelector("i");
    themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    if (icon) {
      icon.classList.remove("fa-moon", "fa-sun");
      icon.classList.add(theme === "dark" ? "fa-sun" : "fa-moon");
    }
  }
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  let theme = saved;
  if (!theme) {
    // fallback to system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }
  applyTheme(theme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('theme-dark');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
  });
}

async function searchUser() {
  const username = searchInput.value.trim();

  // reset UI
  if (errorContainer) errorContainer.classList.add("hidden");
  if (profileContainer) profileContainer.classList.add("hidden");

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error("User not found");

    const userdata = await response.json();
    console.log("userdata", userdata);
    displayUserData(userdata);
  } catch (error) {
    console.error(error);
    showerror();
  }
}

function displayRepos(reposList) {
  if (!reposContainer) return;

  if (!Array.isArray(reposList) || reposList.length === 0) {
    reposContainer.innerHTML = '<div class="no-repos">No repositories found</div>';
    return;
  }

  reposContainer.innerHTML = "";

  reposList.forEach((repo) => {
    const repoCard = document.createElement("div");
    repoCard.className = "repo-card";

    const updatedAt = formatDate(repo.updated_at);

    repoCard.innerHTML = `
      <a href="${repo.html_url}" target="_blank" class="repo-name">
        <i class="fas fa-code-branch"></i> ${repo.name}
      </a>
      <p class="repo-description">${repo.description || "No description available"}</p>
      <div class="repo-meta">
        ${repo.language ? `<div class="repo-meta-item"><i class="fas fa-circle"></i> ${repo.language}</div>` : ""}
        <div class="repo-meta-item"><i class="fas fa-star"></i> ${repo.stargazers_count}</div>
        <div class="repo-meta-item"><i class="fas fa-code-fork"></i> ${repo.forks_count}</div>
        <div class="repo-meta-item"><i class="fas fa-history"></i> ${updatedAt}</div>
      </div>
    `;

    reposContainer.appendChild(repoCard);
  });
}

async function fetchRepositories(reposUrl) {
  if (!reposContainer) return;
  // show spinner + text while loading
  reposContainer.innerHTML = `
    <div class="loading-repos" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <span class="loading-text">Loading repositories...</span>
    </div>
  `;

  try {
    const response = await fetch(reposUrl + "?per_page=6&sort=updated");
    if (!response.ok) throw new Error('Failed to fetch repositories');
    const repos = await response.json();
    displayRepos(repos);
  } catch (error) {
    reposContainer.innerHTML = `<div class="no-repos">${error.message}</div>`;
  }
}

function displayUserData(user) {
  if (!user) return;
  if (avatar) avatar.src = user.avatar_url;
  if (nameElement) nameElement.textContent = user.name || user.login;
  if (usernameElement) usernameElement.textContent = `@${user.login}`;
  if (bioElement) bioElement.textContent = user.bio || "No bio available";

  if (locationElement) locationElement.textContent = user.location || "Not specified";
  if (joinedDateElement) joinedDateElement.textContent = formatDate(user.created_at);

  if (profileLink) {
    profileLink.href = user.html_url;
    profileLink.target = "_blank";
  }

  if (followers) followers.textContent = user.followers;
  if (following) following.textContent = user.following;
  if (repos) repos.textContent = user.public_repos;

  if (companyElement) companyElement.textContent = user.company || "Not specified";

  if (user.blog && blogElement) {
    blogElement.textContent = user.blog;
    blogElement.href = user.blog.startsWith("http") ? user.blog : `https://${user.blog}`;
    if (blogContainer) blogContainer.style.display = "flex";
  } else if (blogElement) {
    blogElement.textContent = "No website";
    blogElement.href = "#";
    if (blogContainer) blogContainer.style.display = "flex";
  }

  if (user.twitter_username && twitterElement) {
    twitterElement.textContent = `@${user.twitter_username}`;
    twitterElement.href = `https://twitter.com/${user.twitter_username}`;
    if (twitterContainer) twitterContainer.style.display = "flex";
  } else if (twitterElement) {
    twitterElement.textContent = "No Twitter";
    twitterElement.href = "#";
    if (twitterContainer) twitterContainer.style.display = "flex";
  }

  if (profileContainer) profileContainer.classList.remove("hidden");
  if (errorContainer) errorContainer.classList.add("hidden");

  // fetch and show repositories
  if (user.repos_url) fetchRepositories(user.repos_url);
}

function showerror() {
  if (errorContainer) errorContainer.classList.remove("hidden");
  if (profileContainer) profileContainer.classList.add("hidden");
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Example default search (remove or change to test other users)
if (searchInput) {
  searchInput.value = "";
  // run initial theme setup
  initTheme();
  // do not auto-search by default; uncomment to run initial lookup
  // searchUser();
}
