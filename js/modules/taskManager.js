// taskManager.js - Handle task CRUD operations with due dates
import { getTasks as getTasksFromStorage, setTasks as setTasksInStorage, saveTasks } from './storage.js';
import { showNotification } from './notifications.js';
import { getProjectById } from './projectManager.js';

const MAX_TASK_LENGTH = 200;
let debounceTimer = null;
let currentFilter = 'all';
let renderCallback = null;

// Re-export getTasks and setTasks for other modules
export function getTasks() {
    return getTasksFromStorage();
}

export function setTasks(newTasks) {
    setTasksInStorage(newTasks);
}

export function setRenderCallback(callback) {
    renderCallback = callback;
}

export function getCurrentFilter() {
    return currentFilter;
}

export function setCurrentFilter(filter) {
    currentFilter = filter;
    if (renderCallback) renderCallback();
}

export function getFilteredTasks() {
    const tasks = getTasks();
    switch(currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// UPDATED: Add task with due date and project assignment
export function addTask(taskText, dueDate = null, projectId = null) {
    if (debounceTimer) return false;
    
    // Validation
    if (!taskText || taskText.trim() === '') {
        showNotification('Please enter a task!', 'error');
        return false;
    }
    
    if (taskText.length > MAX_TASK_LENGTH) {
        showNotification(`Task must be ${MAX_TASK_LENGTH} characters or less`, 'error');
        return false;
    }
    
    const tasks = getTasks();
    if (tasks.some(task => task.text.toLowerCase() === taskText.toLowerCase())) {
        showNotification('This task already exists!', 'error');
        return false;
    }
    
    // Create task with due date and project assignment
    const task = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        text: taskText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDate || null,  // Add due date in YYYY-MM-DD format
        createdDate: new Date().toDateString(),
        projectId: projectId || null  // Add project assignment
    };
    
    tasks.push(task);
    setTasks(tasks);
    
    if (renderCallback) renderCallback();
    
    // Show notification with project and date info
    let notificationMessage = 'Task added successfully!';
    if (projectId) {
        const project = getProjectById(projectId);
        if (project) {
            notificationMessage += ` Added to "${project.name}"`;
        }
    }
    if (dueDate) {
        const formattedDate = new Date(dueDate).toLocaleDateString();
        notificationMessage += ` Due: ${formattedDate}`;
    }
    showNotification(notificationMessage, 'success');
    
    // Debounce
    debounceTimer = setTimeout(() => {
        debounceTimer = null;
    }, 500);
    
    return true;
}

// NEW: Update task due date
export function updateTaskDueDate(id, newDueDate) {
    const tasks = getTasks();
    const task = tasks.find(task => task.id === id);
    
    if (task) {
        task.dueDate = newDueDate || null;
        setTasks(tasks);
        
        if (renderCallback) renderCallback();
        
        if (newDueDate) {
            const formattedDate = new Date(newDueDate).toLocaleDateString();
            showNotification(`Due date updated to ${formattedDate}`, 'success');
        } else {
            showNotification('Due date removed', 'info');
        }
        return true;
    }
    return false;
}

// NEW: Get tasks sorted by due date
export function getTasksSortedByDueDate() {
    const tasks = getTasks();
    return [...tasks].sort((a, b) => {
        // Tasks without due date go to bottom
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
}

// NEW: Get tasks sorted by creation date
export function getTasksSortedByCreated() {
    const tasks = getTasks();
    return [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// NEW: Get overdue tasks
export function getOverdueTasks() {
    const tasks = getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    });
}

// NEW: Get tasks due today
export function getTasksDueToday() {
    const tasks = getTasks();
    const today = new Date().toISOString().split('T')[0];
    
    return tasks.filter(task => task.dueDate === today && !task.completed);
}

// UPDATED: Delete task
export function deleteTask(id) {
    const tasks = getTasks();
    const taskToDelete = tasks.find(task => task.id === id);
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    
    if (renderCallback) renderCallback();
    
    if (taskToDelete && taskToDelete.dueDate) {
        showNotification(`Task "${taskToDelete.text}" deleted!`, 'success');
    } else {
        showNotification('Task deleted successfully!', 'success');
    }
}

// UPDATED: Toggle task completion
export function toggleTask(id) {
    const tasks = getTasks();
    const task = tasks.find(task => task.id === id);
    
    if (task) {
        task.completed = !task.completed;
        setTasks(tasks);
        
        if (renderCallback) renderCallback();
        const status = task.completed ? 'completed ✅' : 'uncompleted 🔄';
        
        // Add special message for overdue tasks being completed
        if (task.completed && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            
            if (dueDate < today) {
                showNotification(`Great job completing an overdue task! 🎉`, 'success');
                return;
            }
        }
        
        showNotification(`Task marked as ${status}`, 'success');
    }
}

// UPDATED: Edit task
export function editTask(id, newText, newDueDate = null) {
    if (!newText || newText.trim() === '') {
        showNotification('Task cannot be empty!', 'error');
        return false;
    }
    
    const tasks = getTasks();
    const task = tasks.find(task => task.id === id);
    
    if (task && (newText !== task.text || newDueDate !== task.dueDate)) {
        // Check for duplicate text
        if (tasks.some(t => t.text.toLowerCase() === newText.toLowerCase() && t.id !== id)) {
            showNotification('This task already exists!', 'error');
            return false;
        }
        
        task.text = newText.trim();
        if (newDueDate !== undefined) {
            task.dueDate = newDueDate || null;
        }
        setTasks(tasks);
        
        if (renderCallback) renderCallback();
        showNotification('Task updated!', 'success');
        return true;
    }
    return false;
}

// UPDATED: Delete all completed tasks
export function deleteAllCompletedTasks() {
    const tasks = getTasks();
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) {
        showNotification('No completed tasks to delete!', 'info');
        return false;
    }
    
    const updatedTasks = tasks.filter(task => !task.completed);
    setTasks(updatedTasks);
    
    if (renderCallback) renderCallback();
    showNotification(`Deleted ${completedCount} completed tasks!`, 'success');
    return true;
}

// NEW: Get task statistics with dates
export function getTaskStatistics() {
    const tasks = getTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const overdue = getOverdueTasks().length;
    const dueToday = getTasksDueToday().length;
    const withDueDates = tasks.filter(t => t.dueDate).length;
    
    return {
        total,
        completed,
        active,
        overdue,
        dueToday,
        withDueDates,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
    };
}