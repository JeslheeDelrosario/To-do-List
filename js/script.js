let tasks = [];
let currentFilter = 'all';
let debounceTimer = null;
const MAX_TASK_LENGTH = 200;

// Load tasks from localStorage with error handling
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        }
    } catch (error) {
        console.warn('Failed to load tasks from localStorage:', error);
        tasks = [];
    }
}

// Save tasks to localStorage with error handling
function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.warn('Failed to save tasks to localStorage:', error);
        showNotification('Could not save tasks - storage might be full', 'error');
    }
}

// Show notification instead of alert
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add new task with validation and debouncing
function addTask() {
    if (debounceTimer) return; // Prevent double clicks
    
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    const validationMessage = document.getElementById('validationMessage');
    
    // Clear previous validation
    if (validationMessage) {
        validationMessage.remove();
    }
    
    // Validation
    if (taskText === '') {
        showValidationError(input, 'Please enter a task!');
        return;
    }
    
    if (taskText.length > MAX_TASK_LENGTH) {
        showValidationError(input, `Task must be ${MAX_TASK_LENGTH} characters or less`);
        return;
    }
    
    if (tasks.some(task => task.text.toLowerCase() === taskText.toLowerCase())) {
        showValidationError(input, 'This task already exists!');
        return;
    }
    
    // Create task with proper ID generation
    const task = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        text: taskText,
        completed: false,
        createdAt: new Date().toDateString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    input.value = '';
    input.focus();
    
    // Set debounce timer
    debounceTimer = setTimeout(() => {
        debounceTimer = null;
    }, 500);
}

// Show validation error
function showValidationError(input, message) {
    const error = document.createElement('div');
    error.id = 'validationMessage';
    error.className = 'validation-error';
    error.textContent = message;
    input.parentNode.appendChild(error);
    input.classList.add('error');
    
    setTimeout(() => {
        error.remove();
        input.classList.remove('error');
    }, 3000);
}

// Delete task with confirmation
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

// Edit task inline
function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;
    
    const taskElement = document.querySelector(`[data-task-id="${id}"] .task-text`);
    if (!taskElement) return;
    
    const currentText = task.text;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = currentText;
    input.maxLength = MAX_TASK_LENGTH;
    
    taskElement.replaceWith(input);
    input.focus();
    input.select();
    
    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText && newText !== currentText) {
            if (tasks.some(t => t.text.toLowerCase() === newText.toLowerCase() && t.id !== id)) {
                showNotification('This task already exists!', 'error');
                cancelEdit();
                return;
            }
            if (newText.length > MAX_TASK_LENGTH) {
                showNotification(`Task must be ${MAX_TASK_LENGTH} characters or less`, 'error');
                cancelEdit();
                return;
            }
            task.text = newText;
            saveTasks();
        }
        renderTasks();
    };
    
    const cancelEdit = () => {
        renderTasks();
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
        if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
    });
}


// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Add event listeners to task elements
function addTaskEventListeners() {
    // Checkbox listeners
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.dataset.taskId;
            toggleTask(taskId);
        });
    });
    
    // Task text double-click listeners
    document.querySelectorAll('.task-text').forEach(textElement => {
        textElement.addEventListener('dblclick', (e) => {
            const taskId = e.target.dataset.taskId;
            editTask(taskId);
        });
    });
    
    // Edit button listeners
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.target.dataset.taskId;
            editTask(taskId);
        });
    });
    
    // Delete button listeners
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.target.dataset.taskId;
            deleteTask(taskId);
        });
    });
}

// Filter tasks based on current filter
function getFilteredTasks() {
    switch(currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Update task statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    document.getElementById('taskCount').textContent = `${total} task${total !== 1 ? 's' : ''}`;
    document.getElementById('completedCount').textContent = `${completed} completed`;
}

// Render tasks with compact design
function renderTasks() {
    const taskList = document.getElementById('taskList');
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 32px;">📝</div>
                <p>${tasks.length === 0 ? 'Add your first task!' : 'No tasks here'}</p>
            </div>
        `;
    } else {
        taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-task-id="${task.id}">
                <span class="task-text ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">${escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="edit-btn" data-task-id="${task.id}" title="Edit task">✏️</button>
                    <button class="delete-btn" data-task-id="${task.id}" title="Delete task">🗑️</button>
                </div>
            </li>
        `).join('');
    }
    
    // Add event listeners after rendering
    addTaskEventListeners();
    updateStats();
}

// Simple HTML escaping to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Set up filter buttons
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + E to edit last task
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        const lastTask = tasks[tasks.length - 1];
        if (lastTask) editTask(lastTask.id);
    }
    
    // Delete key to delete selected task (if any)
    if (e.key === 'Delete' && document.activeElement.tagName !== 'INPUT') {
        const completedTasks = tasks.filter(task => task.completed);
        if (completedTasks.length > 0) {
            if (confirm(`Delete ${completedTasks.length} completed task${completedTasks.length > 1 ? 's' : ''}?`)) {
                tasks = tasks.filter(task => !task.completed);
                saveTasks();
                renderTasks();
            }
        }
    }
    
    // Ctrl/Cmd + A to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('taskInput').focus();
    }
});

// Event listeners
document.getElementById('addTaskButton').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initialize the app
loadTasks();
setupFilters();