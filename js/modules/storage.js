// storage.js - Handle all localStorage operations

let tasks = [];

export function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            return tasks;
        }
        return [];
    } catch (error) {
        console.warn('Failed to load tasks:', error);
        return [];
    }
}

export function saveTasks(tasksData) {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasksData));
        tasks = tasksData;
        return true;
    } catch (error) {
        console.warn('Failed to save tasks:', error);
        return false;
    }
}

export function getTasks() {
    return tasks;
}

export function setTasks(newTasks) {
    tasks = newTasks;
    saveTasks(tasks);
}