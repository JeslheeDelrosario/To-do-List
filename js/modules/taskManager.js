// taskManager.js - Handle task CRUD operations
import { getTasks as getTasksFromStorage, setTasks as setTasksInStorage, saveTasks } from './storage.js';
import { showNotification } from './notifications.js';

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

export function addTask(taskText) {
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
    
    // Create task
    const task = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        text: taskText.trim(),
        completed: false,
        createdAt: new Date().toDateString()
    };
    
    tasks.push(task);
    setTasks(tasks);
    
    if (renderCallback) renderCallback();
    showNotification('Task added successfully!', 'success');
    
    // Debounce
    debounceTimer = setTimeout(() => {
        debounceTimer = null;
    }, 500);
    
    return true;
}

export function deleteTask(id) {
    const tasks = getTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    
    if (renderCallback) renderCallback();
    showNotification('Task deleted successfully!', 'success');
}

export function toggleTask(id) {
    const tasks = getTasks();
    const task = tasks.find(task => task.id === id);
    
    if (task) {
        task.completed = !task.completed;
        setTasks(tasks);
        
        if (renderCallback) renderCallback();
        const status = task.completed ? 'completed ✅' : 'uncompleted 🔄';
        showNotification(`Task marked as ${status}`, 'success');
    }
}

export function editTask(id, newText) {
    if (!newText || newText.trim() === '') {
        showNotification('Task cannot be empty!', 'error');
        return false;
    }
    
    const tasks = getTasks();
    const task = tasks.find(task => task.id === id);
    
    if (task && newText !== task.text) {
        // Check for duplicate
        if (tasks.some(t => t.text.toLowerCase() === newText.toLowerCase() && t.id !== id)) {
            showNotification('This task already exists!', 'error');
            return false;
        }
        
        task.text = newText.trim();
        setTasks(tasks);
        
        if (renderCallback) renderCallback();
        showNotification('Task updated!', 'success');
        return true;
    }
    return false;
}

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