// modules/projectModal.js - Project creation modal functionality

import { createProject, getProjects, loadProjects, getProjectById, deleteProject } from './projectManager.js';
import { showNotification } from './notifications.js';
import { getTasks } from './taskManager.js';
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

    // Filter tasks and render
    const tasks = getTasks();
    let filteredTasks;
    
    if (projectId === 'inbox') {
        filteredTasks = tasks.filter(t => !t.projectId || t.projectId === 'inbox');
    } else {
        filteredTasks = tasks.filter(t => t.projectId === projectId);
    }

    renderTasks(filteredTasks);
}

// Global function for project deletion
window.deleteProjectHandler = function(projectId) {
    const project = getProjectById(projectId);
    if (!project) return;

    if (confirm(`Are you sure you want to delete "${project.name}"? All tasks will be moved to Inbox.`)) {
        if (deleteProject(projectId)) {
            renderProjectsList();
            showNotification(`Project "${project.name}" deleted`, 'success');
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupProjectModal();
    renderProjectsList();
});