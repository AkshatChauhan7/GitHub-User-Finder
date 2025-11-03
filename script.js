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

const showReceiptBtn = document.getElementById("show-receipt-btn");
const showCardsBtn = document.getElementById("show-cards-btn");
const downloadReceiptBtn = document.getElementById("download-receipt-btn");

let currentRepos = []; 

if (searchBtn) searchBtn.addEventListener("click", searchUser);

if (searchInput) searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchUser();
});

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

if (showReceiptBtn) showReceiptBtn.addEventListener('click', () => {
  displayReposAsReceipt(currentRepos);
  showCardsBtn.classList.remove('hidden');
  downloadReceiptBtn.classList.remove('hidden');
  showReceiptBtn.classList.add('hidden');
});

if (showCardsBtn) showCardsBtn.addEventListener('click', () => {
  displayReposAsCards(currentRepos);
  showCardsBtn.classList.add('hidden');
  downloadReceiptBtn.classList.add('hidden');
  showReceiptBtn.classList.remove('hidden');
});

if (downloadReceiptBtn) downloadReceiptBtn.addEventListener('click', downloadReceipt);


function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("theme-dark");
  } else {
    root.classList.remove("theme-dark");
  }

  if (themeToggle) {
    const icon = themeToggle.querySelector("i");
    themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    if (icon) {
      icon.classList.remove("fa-moon", "fa-sun");
      icon.classList.add(theme === "dark" ? "fa-sun" : "fa-moon");
    }
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('theme-dark');
  const next = isDark ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('theme', next); } catch (e) {}
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  let theme = saved;
  if (!theme) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }
  applyTheme(theme);
}

async function searchUser() {
  const username = searchInput.value.trim();

  if (errorContainer) errorContainer.classList.add("hidden");
  if (profileContainer) profileContainer.classList.add("hidden");

  currentRepos = [];
  showReceiptBtn.classList.add('hidden');
  showCardsBtn.classList.add('hidden');
  downloadReceiptBtn.classList.add('hidden');

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error("User not found");

    const userdata = await response.json();
    displayUserData(userdata);
  } catch (error) {
    console.error(error);
    showerror();
  }
}

function downloadReceipt() {
  const receiptElement = document.getElementById("repos-container");
  
  const originalText = downloadReceiptBtn.innerHTML;
  downloadReceiptBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Downloading...`;
  downloadReceiptBtn.disabled = true;

  html2canvas(receiptElement, {
      scale: 2, 
      useCORS: true, 
      onclone: (document) => {
        document.getElementById("repos-container").style.background = "#f4f4f4";
      }
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `github-receipt-${usernameElement.textContent.replace('@', '')}.png`;
    link.href = canvas.toDataURL("image/png");
    
    link.click();

    downloadReceiptBtn.innerHTML = originalText;
    downloadReceiptBtn.disabled = false;
  }).catch(err => {
    console.error("Failed to download image:", err);
    downloadReceiptBtn.innerHTML = "Download Failed";
  });
}

function displayReposAsCards(reposList) {
  if (!reposContainer) return;
  reposContainer.classList.remove("receipt-style"); 
  reposContainer.innerHTML = ""; 

  if (!Array.isArray(reposList) || reposList.length === 0) {
    reposContainer.innerHTML = '<div class="no-repos">No repositories found</div>';
    return;
  }

  reposList.forEach((repo) => {
    const repoCard = document.createElement("div");
    repoCard.className = "repo-card";
    const updatedAt = formatDate(repo.updated_at);
    
    const icon = `<i class="fas fa-star" style="color: #f59e0b;" aria-label="Latest Repo"></i>`;

    repoCard.innerHTML = `
      <a href="${repo.html_url}" target="_blank" class="repo-name">
        ${icon} ${repo.name}
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

function displayReposAsReceipt(reposList) {
  if (!reposContainer) return;
  reposContainer.classList.add("receipt-style"); 
  reposContainer.innerHTML = ""; 

  if (!Array.isArray(reposList) || reposList.length === 0) {
    reposContainer.innerHTML = '<div class="no-repos">No repositories found</div>';
    return;
  }

  let receiptHTML = `
    <div class="receipt-header">
      <h4>GitHub Receipt</h4>
      <p>For: <strong>${nameElement.textContent}</strong> (${usernameElement.textContent})</p>
      <p>Latest 10 Repositories (by Stars)</p>
    </div>
  `;

  reposList.forEach((repo) => {
    receiptHTML += `
      <div class="receipt-line">
        <a href="${repo.html_url}" target="_blank" class="repo-name">
          ${repo.name}
        </a>
        <span class="repo-stats">
          ${repo.stargazers_count} ★
        </span>
      </div>
    `;
  });

  receiptHTML += `
    <div class="receipt-footer">
      <p>THANK YOU FOR YOUR CONTRIBUTIONS</p>
    </div>
  `;

  reposContainer.innerHTML = receiptHTML;
}

async function fetchRepositories(reposUrl) {
  if (!reposContainer) return;
  
  reposContainer.classList.remove("receipt-style");
  reposContainer.innerHTML = `
    <div class="loading-repos" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <span class="loading-text">Loading repositories...</span>
    </div>
  `;

  try {
    const response = await fetch(reposUrl + "?per_page=10&sort=stargazers_count&direction=desc");
    if (!response.ok) throw new Error('Failed to fetch repositories');
    
    currentRepos = await response.json(); 
    
    displayReposAsCards(currentRepos);
    
    if (currentRepos.length > 0) {
      showReceiptBtn.classList.remove('hidden');
      showCardsBtn.classList.add('hidden');
      downloadReceiptBtn.classList.add('hidden');
    }
    
  } catch (error) {
    currentRepos = [];
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

  if (user.blog && user.blog !== "") {
    blogElement.textContent = user.blog;
    blogElement.href = user.blog.startsWith("http") ? user.blog : `https://${user.blog}`;
    if (blogContainer) blogContainer.style.display = "flex";
  } else if (blogElement) {
    blogElement.textContent = "No website";
    blogElement.href = "#";
    if (blogContainer) blogContainer.style.display = "flex";
  }

  if (user.twitter_username) {
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

if (searchInput) {
  searchInput.value = "";
  initTheme();
}