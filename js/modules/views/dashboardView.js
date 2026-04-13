// dashboardView.js - Compact Dashboard UI (No Scroll Needed)
// js\modules\views\dashboardView.js

import { getTasks, toggleTask, deleteTask } from '../taskManager.js';
import { showEditModal } from '../editModal.js';
import { showNotification } from '../notifications.js';

// Main function to render the dashboard
export function renderDashboard(container) {
    console.log('renderDashboard called with container:', container);
    if (!container) {
        console.error('Dashboard container not found');
        return;
    }

    const allTasks = getTasks();
    const todayTasks = filterTodayTasks(allTasks);
    const upcomingTasks = filterUpcomingTasks(allTasks);
    const overdueTasks = filterOverdueTasks(allTasks);
    
    const stats = calculateStats(allTasks);

    const html = `
        <div class="dashboard-container">
            <!-- Compact Stats Cards -->
            <div class="stats-grid-compact">
                <div class="stat-card-compact total">
                    <div class="stat-icon-small">📋</div>
                    <div class="stat-number-compact">${stats.total}</div>
                    <div class="stat-label-compact">Total</div>
                </div>
                <div class="stat-card-compact pending">
                    <div class="stat-icon-small">⏳</div>
                    <div class="stat-number-compact">${stats.pending}</div>
                    <div class="stat-label-compact">Pending</div>
                </div>
                <div class="stat-card-compact completed">
                    <div class="stat-icon-small">✅</div>
                    <div class="stat-number-compact">${stats.completed}</div>
                    <div class="stat-label-compact">Done</div>
                </div>
                <div class="stat-card-compact overdue ${stats.overdue > 0 ? 'has-overdue' : ''}">
                    <div class="stat-icon-small">⚠️</div>
                    <div class="stat-number-compact">${stats.overdue}</div>
                    <div class="stat-label-compact">Overdue</div>
                </div>
            </div>

            <!-- Three Column Layout -->
            <div class="dashboard-grid-compact">
                <!-- Today's Tasks -->
                <div class="dashboard-section-compact today-section">
                    <div class="section-header-compact">
                        <h3 class="section-title-compact">
                            <i class="fas fa-calendar-day"></i>
                            Today
                            <span class="task-count-compact">${todayTasks.length}</span>
                        </h3>
                        ${todayTasks.length > 0 ? '<button class="section-toggle-compact" data-section="today"><i class="fas fa-chevron-down"></i></button>' : ''}
                    </div>
                    <div class="task-list-compact" id="today-tasks">
                        ${todayTasks.length > 0 
                            ? renderCompactTaskItems(todayTasks) 
                            : '<div class="empty-state-compact">✨ No tasks</div>'
                        }
                    </div>
                </div>

                <!-- Upcoming Tasks -->
                <div class="dashboard-section-compact upcoming-section">
                    <div class="section-header-compact">
                        <h3 class="section-title-compact">
                            <i class="fas fa-calendar-week"></i>
                            Upcoming
                            <span class="task-count-compact">${upcomingTasks.length}</span>
                        </h3>
                        ${upcomingTasks.length > 0 ? '<button class="section-toggle-compact" data-section="upcoming"><i class="fas fa-chevron-down"></i></button>' : ''}
                    </div>
                    <div class="task-list-compact" id="upcoming-tasks">
                        ${upcomingTasks.length > 0 
                            ? renderCompactTaskItems(upcomingTasks) 
                            : '<div class="empty-state-compact">📅 None in 7 days</div>'
                        }
                    </div>
                </div>

                <!-- Overdue Tasks -->
                <div class="dashboard-section-compact overdue-section ${overdueTasks.length === 0 ? 'empty-section' : ''}">
                    <div class="section-header-compact">
                        <h3 class="section-title-compact">
                            <i class="fas fa-exclamation-triangle"></i>
                            Overdue
                            <span class="task-count-compact overdue-count">${overdueTasks.length}</span>
                        </h3>
                        ${overdueTasks.length > 0 ? '<button class="section-toggle-compact" data-section="overdue"><i class="fas fa-chevron-down"></i></button>' : ''}
                    </div>
                    <div class="task-list-compact" id="overdue-tasks">
                        ${overdueTasks.length > 0 
                            ? renderCompactTaskItems(overdueTasks) 
                            : '<div class="empty-state-compact">🎉 No overdue tasks</div>'
                        }
                    </div>
                </div>
            </div>

            <!-- Compact Quick Actions -->
            <div class="dashboard-actions-compact">
                <button class="dashboard-btn-compact primary" id="addTaskBtn">
                    <i class="fas fa-plus"></i> Add
                </button>
                <button class="dashboard-btn-compact" id="viewCompletedBtn">
                    <i class="fas fa-tasks"></i> Completed
                </button>
                <button class="dashboard-btn-compact" id="exportTasksBtn">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>
    `;
    container.innerHTML = html;
    
    // Add event listeners after rendering
    setupCompactEventListeners();
    
    // Quick entrance animation
    animateCompactElements();
}

// Calculate statistics
function calculateStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length;
    
    return { total, completed, pending, overdue };
}

// Filter tasks due today
function filterTodayTasks(tasks) {
    const todayStr = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === todayStr && !t.completed);
}

// Filter upcoming tasks (next 7 days, excluding today)
function filterUpcomingTasks(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due > today && due <= nextWeek;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

// Filter overdue tasks
function filterOverdueTasks(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

// Render compact task items
function renderCompactTaskItems(tasks, containerId) {
    const container = document.getElementById(containerId);

    // Default fallback
    let maxItems = 5;

    if (container) {
        const containerHeight = container.clientHeight;

        // Approx height per task item (adjust if needed)
        const itemHeight = 48;

        maxItems = Math.floor(containerHeight / itemHeight);
    }

    return tasks.slice(0, maxItems).map(task => {
        const dateStatus = getCompactDateStatus(task.dueDate, task.completed);

        return `
            <div class="task-item-compact ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input type="checkbox" 
                       class="task-checkbox-compact" 
                       ${task.completed ? 'checked' : ''} 
                       onchange="toggleDashboardTask('${task.id}')">
                <div class="task-content-compact">
                    <div class="task-text-compact">${escapeHtml(task.text)}</div>
                    ${task.dueDate ? `<div class="task-date-compact ${dateStatus.class}">${dateStatus.icon} ${dateStatus.text}</div>` : ''}
                </div>
                <div class="task-actions-compact">
                    <button class="task-action-compact" onclick="editDashboardTask('${task.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-compact delete" onclick="deleteDashboardTask('${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Get compact date status
function getCompactDateStatus(dueDate, isCompleted) {
    if (!dueDate || isCompleted) return { class: '', text: '', icon: '📅' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);
    
    if (dueDateObj < today) {
        return { class: 'overdue', text: 'Overdue', icon: '⚠️' };
    } else if (dueDateObj.getTime() === today.getTime()) {
        return { class: 'today', text: 'Today', icon: '🔔' };
    } else {
        const daysDiff = Math.ceil((dueDateObj - today) / (1000 * 60 * 60 * 24));
        return { class: 'upcoming', text: `${daysDiff}d`, icon: '📅' };
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Set up compact event listeners
function setupCompactEventListeners() {
    // Section toggle buttons
    document.querySelectorAll('.section-toggle-compact').forEach(button => {
        button.addEventListener('click', (e) => {
            const section = e.currentTarget.getAttribute('data-section');
            toggleCompactSection(section);
        });
    });
    
    // Action buttons
    const addBtn = document.getElementById('addTaskBtn');
    if (addBtn) addBtn.addEventListener('click', () => window.addTaskFromDashboard());
    
    const completedBtn = document.getElementById('viewCompletedBtn');
    if (completedBtn) completedBtn.addEventListener('click', () => window.showCompletedTasks());
    
    const exportBtn = document.getElementById('exportTasksBtn');
    if (exportBtn) exportBtn.addEventListener('click', () => window.exportTasks());
}

// Toggle compact section
function toggleCompactSection(sectionName) {
    const section = document.querySelector(`.${sectionName}-section`);
    const toggle = section.querySelector('.section-toggle-compact i');
    const taskList = section.querySelector('.task-list-compact');
    
    if (taskList.style.display === 'none') {
        taskList.style.display = 'block';
        toggle.classList.remove('fa-chevron-right');
        toggle.classList.add('fa-chevron-down');
    } else {
        taskList.style.display = 'none';
        toggle.classList.remove('fa-chevron-down');
        toggle.classList.add('fa-chevron-right');
    }
}

// Animate compact elements
function animateCompactElements() {
    const elements = document.querySelectorAll('.stat-card-compact, .dashboard-section-compact');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Dashboard task actions (global)
window.toggleDashboardTask = function(taskId) {
    toggleTask(taskId);
    setTimeout(() => {
        const container = document.querySelector('.main-content');
        if (container) renderDashboard(container);
    }, 100);
};

window.editDashboardTask = function(taskId) {
    showEditModal(taskId);
};

window.deleteDashboardTask = function(taskId) {
    if (confirm('Delete this task?')) {
        deleteTask(taskId);
        showNotification('Task deleted', 'success');
        setTimeout(() => {
            const container = document.querySelector('.main-content');
            if (container) renderDashboard(container);
        }, 100);
    }
};

window.showCompletedTasks = function() {
    const allBtn = document.querySelector('.nav-item[data-view="all"]');
    if (allBtn) {
        allBtn.click();
        setTimeout(() => {
            const completedBtn = document.querySelector('.filter-btn[data-filter="completed"]');
            if (completedBtn) completedBtn.click();
        }, 100);
    }
};

window.exportTasks = function() {
    const tasks = getTasks();
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Tasks exported!', 'success');
};

window.addTaskFromDashboard = function() {
    const allBtn = document.querySelector('.nav-item[data-view="all"]');
    if (allBtn) {
        allBtn.click();
    }
    
    setTimeout(() => {
        const input = document.getElementById('taskInput');
        if (input) {
            input.focus();
            input.style.transition = 'box-shadow 0.4s ease';
            input.style.boxShadow = '0 0 0 4px rgba(165, 180, 252, 0.6)';
            setTimeout(() => {
                input.style.boxShadow = '';
            }, 1500);
        }
    }, 180);
};

export { calculateStats, filterTodayTasks, filterUpcomingTasks, filterOverdueTasks };