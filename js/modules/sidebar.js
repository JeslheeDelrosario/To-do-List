// js\modules\sidebar.js
// sidebar.js - Handle sidebar navigation and view switching
import { getTasks, setCurrentFilter, getCurrentFilter } from './taskManager.js';
import { renderTasks, updateStats } from './uiRenderer.js';
import { renderDashboard } from './views/dashboardView.js';

let currentView = 'dashboard';

// View configurations
const viewConfigs = {
    dashboard: {
        title: 'Dashboard',
        filter: 'all',
        description: 'All your tasks at a glance'
    },
    today: {
        title: 'Today',
        filter: 'today',
        description: 'Tasks due today'
    },
    upcoming: {
        title: 'Upcoming',
        filter: 'upcoming',
        description: 'Tasks due in the next 7 days'
    },
    all: {
        title: 'All Tasks',
        filter: 'all',
        description: 'Complete task list'
    }
};

// Initialize sidebar functionality
export function setupSidebar() {
    console.log('Setting up sidebar...');
    setupNavigationButtons();
    setupSearchFunctionality();
    updateSidebarStats();
    
    // Set initial view
    console.log('Switching to dashboard view...');
    switchView('dashboard');
}

// Set up navigation button click handlers
function setupNavigationButtons() {
    const navButtons = document.querySelectorAll('.nav-item[data-view]');
    
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const view = e.currentTarget.getAttribute('data-view');
            switchView(view);
        });
    });
}

// Switch between different views
export function switchView(viewName) {
    if (!viewConfigs[viewName]) return;

    currentView = viewName;
    const config = viewConfigs[viewName];

    // Update active state in sidebar
    updateActiveNavItem(viewName);

    // Update main header title
    updateViewTitle(config.title);

    // Get DOM elements once
    const inputArea = document.querySelector('.input-area');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    let dashboardContainer = document.getElementById('dashboardContainer');

    if (viewName === 'dashboard') {
        console.log('Rendering beautiful dashboard view...');

        // Hide normal task UI
        if (inputArea) inputArea.style.display = 'none';
        if (taskList) taskList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';

        console.log('Looking for dashboard container...');
        // Create dashboard container ONLY if it doesn't exist
        if (!dashboardContainer) {
            console.log('Creating new dashboard container...');
            dashboardContainer = document.createElement('div');
            dashboardContainer.id = 'dashboardContainer';
            dashboardContainer.className = 'dashboard-container glass';
            const mainContent = document.querySelector('.main-content');
            console.log('Main content found:', mainContent);
            if (mainContent) {
                mainContent.insertBefore(dashboardContainer, taskList);
                console.log('Dashboard container created');
            } else {
                console.error('Main content not found!');
            }
        }

        // Make sure container is visible and render
        if (dashboardContainer) {
            console.log('Dashboard container exists, rendering...');
            dashboardContainer.style.display = 'block';
            renderDashboard(dashboardContainer);
        } else {
            console.error('Dashboard container is null!');
        }

    } else {
        // Normal task views
        console.log(`Switching to ${viewName} task list view...`);

        // Hide dashboard
        if (dashboardContainer) dashboardContainer.style.display = 'none';

        // Show normal task UI
        if (inputArea) inputArea.style.display = 'flex';
        if (taskList) taskList.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        // Apply filter
        applyViewFilter(config.filter);
    } 
    updateViewDescription(config.description);
    console.log(`Switched to ${viewName} view`);
}

// Update active navigation item
function updateActiveNavItem(activeView) {
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    navItems.forEach(item => {
        if (item.getAttribute('data-view') === activeView) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Update main view title
function updateViewTitle(title) {
    const titleElement = document.getElementById('viewTitle');
    if (titleElement) {
        titleElement.textContent = title;
    }
}

// Update view description (if such element exists)
function updateViewDescription(description) {
    // This can be extended if you add a description element to your UI
    console.log(`View description: ${description}`);
}

// Apply filter based on view
function applyViewFilter(filterType) {
    const tasks = getTasks();
    let filteredTasks = [];
    
    switch(filterType) {
        case 'today':
            filteredTasks = filterTasksForToday(tasks);
            break;
        case 'upcoming':
            filteredTasks = filterTasksForUpcoming(tasks);
            break;
        case 'all':
        default:
            filteredTasks = tasks;
            break;
    }
    
    // Render with the filtered tasks (pass custom tasks to renderTasks)
    renderTasks(filteredTasks);
}

// Filter tasks due today
function filterTasksForToday(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
    });
}

// Filter tasks due in the next 7 days
function filterTasksForUpcoming(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= today && taskDate <= nextWeek;
    });
}

// Set up search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(e);
            }
        });
    }
}

// Handle search input
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const tasks = getTasks();
    
    if (searchTerm === '') {
        // If search is empty, show current view
        applyViewFilter(viewConfigs[currentView].filter);
    } else {
        // Filter tasks based on search term
        const filteredTasks = tasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm)
        );
        renderTasks(filteredTasks);
    }
}

// Update sidebar statistics
export function updateSidebarStats() {
    const tasks = getTasks();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    const statsElement = document.getElementById('sidebarStats');
    if (statsElement) {
        statsElement.innerHTML = `
            <span>${pendingTasks} pending</span>
            <span>•</span>
            <span>${completedTasks} completed</span>
        `;
    }
}

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get current view
export function getCurrentView() {
    return currentView;
}

// Handle project creation (placeholder for future functionality)
export function setupProjectFunctionality() {
    const newProjectBtn = document.getElementById('newProjectBtn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', () => {
            // Placeholder for project creation functionality
            console.log('New project button clicked - functionality to be implemented');
        });
    }
}

// Make current view accessible from app.js and other modules
window.getCurrentView = getCurrentView;