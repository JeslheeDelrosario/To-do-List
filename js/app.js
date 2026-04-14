//js\app.js
import { loadTasks, getTasks, setTasks } from './modules/storage.js';
import { 
    addTask, 
    toggleTask, 
    deleteTask, 
    editTask, 
    setCurrentFilter, 
    setRenderCallback,
    deleteAllCompletedTasks
} from './modules/taskManager.js';
import { renderTasks, setupFilters, updateStats } from './modules/uiRenderer.js';
import { setupModal } from './modules/modal.js';
import { showNotification } from './modules/notifications.js';
import { debounce } from './modules/utils.js';
import { setupEditModal, showEditModal, setupInlineEdit } from './modules/editModal.js';
import { setupSidebar, updateSidebarStats } from './modules/sidebar.js';
import { setupProjectModal, renderProjectsList } from './modules/projectModal.js';
import { getProjects } from './modules/projectManager.js';

// Initialize the app
function init() {
    // Load tasks from storage
    const savedTasks = loadTasks();
    setTasks(savedTasks);
    
    // Set up render callback
    setRenderCallback(() => {
        renderTasks();
        updateSidebarStats();
    });
    
    // Set up modal
    setupModal();
    setupEditModal();
    
    // Set up filters
    setupFilters();
    
    // Set up sidebar navigation
    setupSidebar();
    
    // Set up project modal
    setupProjectModal();
    renderProjectsList();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Set today's date as minimum for date picker
    setDatePickerMin();

    window.showEditModal = showEditModal;
    
    // Initial render
    renderTasks();
    
    console.log('App initialized! 🚀');
}

// NEW: Update project dropdown
function updateProjectDropdown() {
    const projectSelect = document.getElementById('projectSelect');
    if (!projectSelect) return;
    
    // Clear existing options except the first one
    projectSelect.innerHTML = '<option value="">Select Project</option>';
    
    // Add projects from project manager
    const projects = getProjects();
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        option.style.color = project.color;
        projectSelect.appendChild(option);
    });
}

// Set minimum date to today for date picker
function setDatePickerMin() {
    const taskDate = document.getElementById('taskDate');
    if (taskDate) {
        const today = new Date().toISOString().split('T')[0];
        taskDate.min = today;
    }
}

// UPDATED: Set up event listeners with project and date support
function setupEventListeners() {
    const addButton = document.getElementById('addTaskButton');
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const projectSelect = document.getElementById('projectSelect');
    
    if (addButton) {
        addButton.addEventListener('click', () => {
            const input = document.getElementById('taskInput');
            const dateInput = document.getElementById('taskDate');
            const projectSelect = document.getElementById('projectSelect');
            const taskText = input.value.trim();
            const dueDate = dateInput ? dateInput.value : null;
            const projectId = projectSelect ? projectSelect.value : null;
            
            if (taskText) {
                // Pass task text, due date, and project ID
                addTask(taskText, dueDate, projectId);
                if (input) input.value = '';
                if (dateInput) dateInput.value = ''; // Clear date picker
                if (projectSelect) projectSelect.value = ''; // Clear project selection
                input.focus();
            }
        });
    }
    
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const dateInput = document.getElementById('taskDate');
                const projectSelect = document.getElementById('projectSelect');
                const taskText = e.target.value.trim();
                const dueDate = dateInput ? dateInput.value : null;
                const projectId = projectSelect ? projectSelect.value : null;
                
                if (taskText) {
                    addTask(taskText, dueDate, projectId);
                    e.target.value = '';
                    if (dateInput) dateInput.value = '';
                    if (projectSelect) projectSelect.value = '';
                }
            }
        });
    }
    
    // Update project dropdown when projects change
    updateProjectDropdown();

    // Handle header "New Task" button - Smart behavior with Dashboard
    const headerAddBtn = document.getElementById('addTaskBtn');
    if (headerAddBtn) {
        headerAddBtn.addEventListener('click', () => {
            const currentView = window.getCurrentView ? window.getCurrentView() : 'dashboard';
            
            if (currentView === 'dashboard') {
                // Switch to All Tasks view first
                const allNavBtn = document.querySelector('.nav-item[data-view="all"]');
                if (allNavBtn) {
                    allNavBtn.click();   // This triggers switchView('all')
                }
            }
            
            // Focus the input after a tiny delay (so view has time to switch)
            setTimeout(() => {
                const taskInput = document.getElementById('taskInput');
                if (taskInput) {
                    taskInput.focus();
                }
            }, 80);
        });
    }
}

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + A to focus input
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            if (document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('taskInput')?.focus();
            }
        }
        
        // Delete key to clear completed tasks
        if (e.key === 'Delete' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            if (confirm('Delete all completed tasks?')) {
                deleteAllCompletedTasks();
            }
        }
        
        // Escape to reset filter
        if (e.key === 'Escape') {
            setCurrentFilter('all');
            const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
            if (allBtn) {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                allBtn.classList.add('active');
                renderTasks();
            }
        }
    });
}

// Make functions available globally for inline event handlers
window.toggleTaskHandler = (id) => toggleTask(id);
window.editTaskHandler = (id) => {
    showEditModal(id);  // Opens the modal instead of prompt
};
window.deleteTaskHandler = (id, taskText) => {
    window.showDeleteConfirmation(id, taskText, (confirmedId) => {
        deleteTask(confirmedId);
    });
};
window.setFilterHandler = (filter) => {
    setCurrentFilter(filter);
    renderTasks();
};

// Start the app
init();