// modules/projectModal.js - Project creation modal functionality

import { createProject, getProjects, loadProjects, getProjectById, deleteProject, getTasksByProject } from './projectManager.js';
import { showNotification } from './notifications.js';
import { getTasks, addTask } from './taskManager.js';
import { renderTasks } from './uiRenderer.js';

let selectedIcon = 'fas fa-folder';
let selectedColor = '#6366f1';
let isProjectModalOpen = false;

// Available icons for projects
const PROJECT_ICONS = [
    'fas fa-code', 'fas fa-laptop', 'fas fa-mobile-alt', 'fas fa-globe',
    'fas fa-paint-brush', 'fas fa-palette', 'fas fa-music', 'fas fa-camera',
    'fas fa-book', 'fas fa-graduation-cap', 'fas fa-school', 'fas fa-chalkboard',
    'fas fa-briefcase', 'fas fa-chart-line', 'fas fa-coins', 'fas fa-shopping-cart',
    'fas fa-heart', 'fas fa-star', 'fas fa-gem', 'fas fa-crown',
    'fas fa-home', 'fas fa-car', 'fas fa-plane', 'fas fa-map',
    'fas fa-gamepad', 'fas fa-dumbbell', 'fas fa-utensils', 'fas fa-coffee',
    'fas fa-leaf', 'fas fa-tree', 'fas fa-sun', 'fas fa-moon',
    'fas fa-folder', 'fas fa-folder-open', 'fas fa-archive', 'fas fa-box'
];

// Available colors for projects
const PROJECT_COLORS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#c084fc',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'
];

export function setupProjectModal() {
    const newProjectBtn = document.getElementById('newProjectBtn');
    const projectModal = document.getElementById('createProjectModal');
    const closeBtn = document.getElementById('closeCreateProjectModal');
    const cancelBtn = document.getElementById('cancelCreateProjectBtn');
    const createBtn = document.getElementById('createProjectBtn');
    const projectNameInput = document.getElementById('createProjectNameInput');

    if (!newProjectBtn || !projectModal) {
        console.error('Project modal elements not found');
        return;
    }

    // Event listeners
    newProjectBtn.addEventListener('click', openProjectModal);
    closeBtn.addEventListener('click', closeProjectModal);
    cancelBtn.addEventListener('click', closeProjectModal);
    createBtn.addEventListener('click', handleCreateProject);
    projectNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCreateProject();
        }
    });

    // Close modal on outside click
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeProjectModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isProjectModalOpen) {
            closeProjectModal();
        }
    });

    // Initialize icon and color pickers
    setupIconPicker();
    setupColorPicker();
}

function openProjectModal() {
    const projectModal = document.getElementById('createProjectModal');
    const projectNameInput = document.getElementById('createProjectNameInput');
    
    if (projectModal) {
        projectModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
        isProjectModalOpen = true;
        
        // Reset form
        projectNameInput.value = '';
        selectedIcon = 'fas fa-folder';
        selectedColor = '#6366f1';
        updateIconPicker();
        updateColorPicker();
        
        // Focus name input
        setTimeout(() => projectNameInput.focus(), 100);
    }
}

function closeProjectModal() {
    const projectModal = document.getElementById('createProjectModal');
    
    if (projectModal) {
        projectModal.style.display = 'none';
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
        isProjectModalOpen = false;
    }
}

function setupIconPicker() {
    const iconPicker = document.getElementById('createProjectIconPicker');
    if (!iconPicker) return;

    iconPicker.innerHTML = '';
    PROJECT_ICONS.forEach(icon => {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-option';
        iconElement.innerHTML = `<i class="${icon}"></i>`;
        iconElement.addEventListener('click', () => {
            selectedIcon = icon;
            updateIconPicker();
        });
        iconPicker.appendChild(iconElement);
    });
}

function setupColorPicker() {
    const colorPicker = document.getElementById('createProjectColorPicker');
    if (!colorPicker) return;

    colorPicker.innerHTML = '';
    PROJECT_COLORS.forEach(color => {
        const colorElement = document.createElement('div');
        colorElement.className = 'color-option';
        colorElement.style.backgroundColor = color;
        colorElement.addEventListener('click', () => {
            selectedColor = color;
            updateColorPicker();
        });
        colorPicker.appendChild(colorElement);
    });
}

function updateIconPicker() {
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach(option => {
        const icon = option.querySelector('i').className;
        if (icon === selectedIcon) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function updateColorPicker() {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        if (option.style.backgroundColor === selectedColor) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function handleCreateProject() {
    const projectNameInput = document.getElementById('createProjectNameInput');
    const projectName = projectNameInput.value.trim();

    if (!projectName) {
        showNotification('Please enter a project name!', 'error');
        projectNameInput.focus();
        return;
    }

    const newProject = createProject(projectName, selectedColor, selectedIcon);
    
    if (newProject) {
        closeProjectModal();
        renderProjectsList();
        
        // Show success notification
        showNotification(`Project "${projectName}" created successfully!`, 'success');
    }
}

export function renderProjectsList() {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;

    const projects = getProjects();
    projectsList.innerHTML = '';

    projects.forEach(project => {
        const projectElement = createProjectElement(project);
        projectsList.appendChild(projectElement);
    });
}

function createProjectElement(project) {
    const projectDiv = document.createElement('div');
    projectDiv.className = 'project-item';
    projectDiv.setAttribute('data-project-id', project.id);
    
    const taskCount = getProjectTaskCount(project.id);
    
    projectDiv.innerHTML = `
        <div class="project-icon" style="background-color: ${project.color}">
            <i class="${project.icon}"></i>
        </div>
        <div class="project-info">
            <span class="project-name">${project.name}</span>
            <span class="project-count">${taskCount} tasks</span>
        </div>
        <button class="project-delete-btn" onclick="deleteProjectHandler('${project.id}')" title="Delete project">
            <i class="fas fa-trash"></i>
        </button>
    `;

    // Add click event to filter tasks by project
    projectDiv.addEventListener('click', (e) => {
        if (!e.target.closest('.project-delete-btn')) {
            filterTasksByProject(project.id);
        }
    });

    return projectDiv;
}

function getProjectTaskCount(projectId) {
    const tasks = getTasks();
    if (projectId === 'inbox') {
        return tasks.filter(t => !t.projectId || t.projectId === 'inbox').length;
    }
    return tasks.filter(t => t.projectId === projectId).length;
}

function filterTasksByProject(projectId) {
    const project = getProjectById(projectId);
    if (!project) return;

    // Update active state
    document.querySelectorAll('.project-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-project-id="${projectId}"]`)?.classList.add('active');

    // Update view title
    const viewTitle = document.getElementById('viewTitle');
    if (viewTitle) {
        viewTitle.innerHTML = `
            <div class="project-view-header">
                <div class="project-icon-small" style="background-color: ${project.color}">
                    <i class="${project.icon}"></i>
                </div>
                ${project.name}
            </div>
        `;
    }

    // Show project page with dedicated task input
    showProjectPage(project);
}

function showProjectPage(project) {
    // Hide global task input and show project-specific input
    const globalInputArea = document.querySelector('.input-area');
    const mainContent = document.querySelector('.main-content');
    
    if (globalInputArea) {
        globalInputArea.style.display = 'none';
    }
    
    // Remove any existing project input area
    const existingProjectInput = document.querySelector('.project-input-area');
    if (existingProjectInput) {
        existingProjectInput.remove();
    }
    
    // Create project-specific input area
    const projectInputArea = document.createElement('div');
    projectInputArea.className = 'input-area glass project-input-area';
    projectInputArea.innerHTML = `
        <div class="project-input-header">
            <div class="project-input-icon" style="background-color: ${project.color}">
                <i class="${project.icon}"></i>
            </div>
            <span class="project-input-title">Add task to ${project.name}</span>
        </div>
        <div class="project-input-form">
            <input type="text" id="projectTaskInput" class="project-task-input" placeholder="What needs to be done in ${project.name}?">
            <input type="date" id="projectTaskDate" class="project-date-input">
            <button id="addProjectTaskBtn" class="project-add-btn">Add Task</button>
        </div>
    `;
    
    // Insert after the main header
    const mainHeader = document.querySelector('.main-header');
    if (mainHeader && mainContent) {
        mainContent.insertBefore(projectInputArea, mainHeader.nextSibling);
    }

    // Hide global dashboard and normal task UI
    const dashboardContainer = document.getElementById('dashboardContainer');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    if (dashboardContainer) dashboardContainer.style.display = 'none';
    if (taskList) taskList.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    // Filter and render project tasks
    const projectTasks = getTasksByProject(project.id);
    renderTasks(projectTasks);
    
    // Set up event listeners for project-specific task input
    setupProjectTaskInput(project.id);
    
    // Store current project for navigation
    window.currentProject = project;
}

function setupProjectTaskInput(projectId) {
    const taskInput = document.getElementById('projectTaskInput');
    const taskDate = document.getElementById('projectTaskDate');
    const addButton = document.getElementById('addProjectTaskBtn');
    
    if (!taskInput || !addButton) return;
    
    const addTaskHandler = () => {
        const taskText = taskInput.value.trim();
        const dueDate = taskDate ? taskDate.value : null;
        
        if (taskText) {
            addTask(taskText, dueDate, projectId);
            taskInput.value = '';
            if (taskDate) taskDate.value = '';
            
            // Refresh project tasks and project counts
            const projectTasks = getTasksByProject(projectId);
            renderTasks(projectTasks);
            renderProjectsList();
        }
    };
    
    addButton.addEventListener('click', addTaskHandler);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskHandler();
        }
    });
    
    // Focus the input
    taskInput.focus();
}

// Function to show global input (when not viewing a project)
function showGlobalInput() {
    const globalInputArea = document.querySelector('.input-area');
    const projectInputArea = document.querySelector('.project-input-area');
    
    if (globalInputArea) {
        globalInputArea.style.display = 'flex';
    }
    
    if (projectInputArea) {
        projectInputArea.remove();
    }
    
    // Clear current project
    window.currentProject = null;
}

// Function to return to dashboard from project view
function returnToDashboard() {
    // Clear active project state
    document.querySelectorAll('.project-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Reset view title to Dashboard
    const viewTitle = document.getElementById('viewTitle');
    if (viewTitle) {
        viewTitle.textContent = 'Dashboard';
    }
    
    // Show global input and hide project input
    showGlobalInput();
    
    // Switch to dashboard view using the existing navigation system
    // Import switchView from sidebar module
    import('./sidebar.js').then(module => {
        module.switchView('dashboard');
    }).catch(error => {
        console.error('Error loading sidebar module:', error);
        // Fallback: just render all tasks
        const tasks = getTasks();
        renderTasks(tasks);
    });
}

// Global function for project deletion
window.deleteProjectHandler = function(projectId) {
    const project = getProjectById(projectId);
    if (!project) return;

    if (confirm(`Are you sure you want to delete "${project.name}"? All tasks will be moved to Inbox.`)) {
        if (deleteProject(projectId)) {
            renderProjectsList();
            showNotification(`Project "${project.name}" deleted`, 'success');
            
            // If we're currently viewing this project, go back to dashboard
            if (window.currentProject && window.currentProject.id === projectId) {
                showDashboard();
            }
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupProjectModal();
    renderProjectsList();
});