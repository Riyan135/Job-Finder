// Theme Toggle Logic
const themeToggleBtn = document.getElementById('themeToggleBtn');
const body = document.documentElement;
const icon = themeToggleBtn.querySelector('i');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);
} else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        body.setAttribute('data-theme', 'dark');
        updateIcon('dark');
    }
}

themeToggleBtn.addEventListener('click', () => {
    let currentTheme = body.getAttribute('data-theme');
    let targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
    updateIcon(targetTheme);
});

function updateIcon(theme) {
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}
