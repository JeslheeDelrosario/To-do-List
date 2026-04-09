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

// Initialize the app
function init() {
    // Load tasks from storage
    const savedTasks = loadTasks();
    setTasks(savedTasks);
    
    // Set up render callback
    setRenderCallback(() => {
        renderTasks();
    });
    
    // Set up modal
    setupModal();
    
    // Set up filters
    setupFilters();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initial render
    renderTasks();
    
    console.log('App initialized! 🚀');
}

// Set up event listeners
function setupEventListeners() {
    const addButton = document.getElementById('addTaskButton');
    const taskInput = document.getElementById('taskInput');
    
    if (addButton) {
        addButton.addEventListener('click', () => {
            const input = document.getElementById('taskInput');
            addTask(input.value.trim());
            if (input) input.value = '';
        });
    }
    
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask(e.target.value.trim());
                e.target.value = '';
            }
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
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
        const newText = prompt('Edit task:', task.text);
        if (newText) editTask(id, newText);
    }
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