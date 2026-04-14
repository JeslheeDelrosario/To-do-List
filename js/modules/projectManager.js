// modules/projectManager.js
// OOP + Clean Project Management

import { getTasks, setTasks } from './taskManager.js';
import { saveTasks } from './storage.js';
import { showNotification } from './notifications.js';

let projects = [];
let currentProjectFilter = null; // null = all projects / Inbox

// Default Inbox project (for backward compatibility)
const DEFAULT_INBOX = {
    id: "inbox",
    name: "Inbox",
    color: "#64748b",
    icon: "fas fa-inbox",
    createdAt: new Date().toISOString()
};

// Load projects from storage
export function loadProjects() {
    try {
        const saved = localStorage.getItem('projects');
        if (saved) {
            projects = JSON.parse(saved);
        } else {
            projects = [DEFAULT_INBOX];
            saveProjects();
        }
        return projects;
    } catch (e) {
        console.warn("Failed to load projects", e);
        projects = [DEFAULT_INBOX];
        return projects;
    }
}

export function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects));
    return true;
}

export function getProjects() {
    return [...projects];
}

export function getProjectById(id) {
    return projects.find(p => p.id === id);
}

// Create new project (OOP style)
export function createProject(name, color, icon) {
    if (!name || name.trim() === '') {
        showNotification('Project name is required!', 'error');
        return null;
    }

    // Check duplicate name
    if (projects.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
        showNotification('Project with this name already exists!', 'error');
        return null;
    }

    const project = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        name: name.trim(),
        color: color || '#6366f1',
        icon: icon || 'fas fa-folder',
        createdAt: new Date().toISOString()
    };

    projects.push(project);
    saveProjects();
    showNotification(`Project "${project.name}" created!`, 'success');
    return project;
}

// Delete project
export function deleteProject(id) {
    if (id === "inbox") {
        showNotification("Cannot delete Inbox project!", 'error');
        return false;
    }

    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    const projectName = projects[index].name;
    projects.splice(index, 1);
    saveProjects();

    // Move tasks from deleted project back to Inbox
    const tasks = getTasks();
    let movedCount = 0;
    tasks.forEach(task => {
        if (task.projectId === id) {
            task.projectId = "inbox";
            movedCount++;
        }
    });
    setTasks(tasks);

    if (movedCount > 0) {
        showNotification(`${movedCount} tasks moved to Inbox`, 'info');
    }
    showNotification(`Project "${projectName}" deleted`, 'success');
    return true;
}

// Get tasks for a specific project
export function getTasksByProject(projectId) {
    const allTasks = getTasks();
    if (projectId === "inbox") {
        return allTasks.filter(t => !t.projectId || t.projectId === "inbox");
    }
    return allTasks.filter(t => t.projectId === projectId);
}

// Set current active project filter
export function setCurrentProjectFilter(projectId) {
    currentProjectFilter = projectId;
}

// Get current project filter
export function getCurrentProjectFilter() {
    return currentProjectFilter;
}