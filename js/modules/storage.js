// storage.js - Handle all localStorage operations with due date support

let tasks = [];
let projects = [];

export function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            
            // Backward compatibility: Add projectId if missing
            tasks = tasks.map(task => ({
                ...task,
                projectId: task.projectId || "inbox",   // ← Important!
                dueDate: task.dueDate || null,
                createdAt: task.createdAt || new Date().toISOString(),
                createdDate: task.createdDate || new Date().toDateString()
            }));
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
        const validatedTasks = tasksData.map(task => ({
            id: task.id,
            text: task.text,
            completed: task.completed || false,
            dueDate: task.dueDate || null,
            projectId: task.projectId || "inbox",     // ← Always ensure projectId
            createdAt: task.createdAt || new Date().toISOString(),
            createdDate: task.createdDate || new Date().toDateString()
        }));
        
        localStorage.setItem('tasks', JSON.stringify(validatedTasks));
        tasks = validatedTasks;
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

// ==================== PROJECTS STORAGE ====================

export function loadProjects() {
    try {
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
            projects = JSON.parse(savedProjects);
            return projects;
        }
        return [];
    } catch (error) {
        console.warn('Failed to load projects:', error);
        return [];
    }
}

export function saveProjects(projectsData) {
    try {
        localStorage.setItem('projects', JSON.stringify(projectsData));
        projects = projectsData;
        return true;
    } catch (error) {
        console.warn('Failed to save projects:', error);
        return false;
    }
}

export function getProjects() {
    return projects;
}

export function setProjects(newProjects) {
    projects = newProjects;
    saveProjects(newProjects);
}

// NEW: Get tasks with due dates only
export function getTasksWithDueDates() {
    return tasks.filter(task => task.dueDate !== null);
}

// NEW: Get tasks without due dates
export function getTasksWithoutDueDates() {
    return tasks.filter(task => task.dueDate === null);
}

// NEW: Get tasks by specific date
export function getTasksByDate(date) {
    if (!date) return [];
    return tasks.filter(task => task.dueDate === date);
}

// NEW: Get overdue tasks (date is in the past and not completed)
export function getOverdueTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    });
}

// NEW: Get upcoming tasks (next 7 days)
export function getUpcomingTasks(days = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    return tasks.filter(task => {
        if (!task.dueDate || task.completed) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && dueDate <= futureDate;
    });
}

// NEW: Clear all tasks (with confirmation option)
export function clearAllTasks() {
    tasks = [];
    localStorage.removeItem('tasks');
    return true;
}

// NEW: Export tasks to JSON file (includes due dates)
export function exportTasks() {
    const exportData = {
        version: '2.0',           // updated version
        exportDate: new Date().toISOString(),
        tasks: tasks,
        projects: projects
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileName = `todo_tasks_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    return true;
}

// NEW: Import tasks from JSON file (with validation)
export function importTasks(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        let importedTasks = [];
        
        // Handle both old format (array) and new format (object with tasks property)
        if (Array.isArray(data)) {
            importedTasks = data;
        } else if (data.tasks && Array.isArray(data.tasks)) {
            importedTasks = data.tasks;
        } else {
            throw new Error('Invalid data format');
        }
        
        // Validate and sanitize imported tasks
        const sanitizedTasks = importedTasks.map(task => ({
            id: task.id || crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            text: task.text || 'Untitled Task',
            completed: Boolean(task.completed),
            dueDate: task.dueDate || null,
            createdAt: task.createdAt || new Date().toISOString(),
            createdDate: task.createdDate || new Date().toDateString()
        }));
        
        tasks = sanitizedTasks;
        saveTasks(tasks);
        return true;
    } catch (error) {
        console.warn('Failed to import tasks:', error);
        return false;
    }
}

// NEW: Get task statistics (with date info)
export function getStorageStats() {
    const tasksWithDueDates = tasks.filter(t => t.dueDate).length;
    const tasksWithoutDueDates = tasks.length - tasksWithDueDates;
    const overdue = getOverdueTasks().length;
    const upcoming = getUpcomingTasks(7).length;
    
    return {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        active: tasks.filter(t => !t.completed).length,
        withDueDates: tasksWithDueDates,
        withoutDueDates: tasksWithoutDueDates,
        overdue: overdue,
        upcoming7Days: upcoming,
        storageUsed: JSON.stringify(tasks).length,
        lastBackup: localStorage.getItem('lastBackup') || null
    };
}

// NEW: Backup current state to localStorage (with timestamp)
export function backupTasks() {
    const backupKey = `tasks_backup_${new Date().toISOString().split('T')[0]}`;
    const backup = {
        timestamp: new Date().toISOString(),
        tasks: tasks
    };
    
    try {
        localStorage.setItem(backupKey, JSON.stringify(backup));
        localStorage.setItem('lastBackup', new Date().toISOString());
        
        // Keep only last 7 backups
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tasks_backup_')) {
                backups.push(key);
            }
        }
        
        if (backups.length > 7) {
            backups.sort().reverse();
            const toDelete = backups.slice(7);
            toDelete.forEach(key => localStorage.removeItem(key));
        }
        
        return true;
    } catch (error) {
        console.warn('Failed to create backup:', error);
        return false;
    }
}

// NEW: Restore from latest backup
export function restoreLatestBackup() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tasks_backup_')) {
            backups.push(key);
        }
    }
    
    if (backups.length === 0) return false;
    
    backups.sort().reverse();
    const latestBackup = backups[0];
    
    try {
        const backupData = JSON.parse(localStorage.getItem(latestBackup));
        if (backupData && backupData.tasks) {
            tasks = backupData.tasks;
            saveTasks(tasks);
            return true;
        }
    } catch (error) {
        console.warn('Failed to restore backup:', error);
    }
    
    return false;
}