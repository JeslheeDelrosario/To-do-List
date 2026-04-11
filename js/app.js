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
    setupEditModal();
    
    // Set up filters
    setupFilters();
    
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

// Set minimum date to today for date picker
function setDatePickerMin() {
    const taskDate = document.getElementById('taskDate');
    if (taskDate) {
        const today = new Date().toISOString().split('T')[0];
        taskDate.min = today;
    }
}

// UPDATED: Set up event listeners with date support
function setupEventListeners() {
    const addButton = document.getElementById('addTaskButton');
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    
    if (addButton) {
        addButton.addEventListener('click', () => {
            const input = document.getElementById('taskInput');
            const dateInput = document.getElementById('taskDate');
            const taskText = input.value.trim();
            const dueDate = dateInput ? dateInput.value : null;
            
            if (taskText) {
                // Pass both task text and due date
                addTask(taskText, dueDate);
                if (input) input.value = '';
                if (dateInput) dateInput.value = ''; // Clear date picker
                input.focus();
            }
        });
    }
    
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const dateInput = document.getElementById('taskDate');
                const taskText = e.target.value.trim();
                const dueDate = dateInput ? dateInput.value : null;
                
                if (taskText) {
                    addTask(taskText, dueDate);
                    e.target.value = '';
                    if (dateInput) dateInput.value = '';
                }
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