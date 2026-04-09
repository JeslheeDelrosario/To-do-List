// uiRenderer.js - Handle all UI rendering
import { getTasks, getFilteredTasks, getCurrentFilter } from './taskManager.js';
import { escapeHtml } from './utils.js';

export function renderTasks() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    
    const tasks = getTasks();
    const filteredTasks = getFilteredTasks();
    const currentFilter = getCurrentFilter();
    
    if (filteredTasks.length === 0) {
        let emptyMessage = '';
        if (currentFilter === 'active') {
            emptyMessage = 'No active tasks! 🎉';
        } else if (currentFilter === 'completed') {
            emptyMessage = 'No completed tasks yet. Complete some tasks! ✅';
        } else {
            emptyMessage = 'No tasks yet. Add your first task above! 📝';
        }
        
        taskList.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 48px;">📭</div>
                <p>${emptyMessage}</p>
            </div>
        `;
    } else {
        taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item" data-task-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="window.toggleTaskHandler('${task.id}')"
                >
                <span class="task-text ${task.completed ? 'completed' : ''}" ondblclick="window.editTaskHandler('${task.id}')">
                    ${escapeHtml(task.text)}
                </span>
                <div class="task-actions">
                    <button class="edit-btn" onclick="window.editTaskHandler('${task.id}')" title="Edit task">✏️</button>
                    <button class="delete-btn" onclick="window.deleteTaskHandler('${task.id}', '${escapeHtml(task.text)}')" title="Delete task">🗑️</button>
                </div>
            </li>
        `).join('');
    }
    
    updateStats();
}

export function updateStats() {
    const tasks = getTasks();
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;
    
    const taskCountEl = document.getElementById('taskCount');
    const completedCountEl = document.getElementById('completedCount');
    
    if (taskCountEl) taskCountEl.textContent = `${total} task${total !== 1 ? 's' : ''}`;
    if (completedCountEl) completedCountEl.textContent = `${completed} completed, ${active} active`;
}

export function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            window.setFilterHandler(filter);
        });
    });
}