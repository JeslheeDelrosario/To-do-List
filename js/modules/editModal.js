// editModal.js - Handle edit modal functionality
import { getTasks, editTask, updateTaskDueDate } from './taskManager.js';
import { showNotification } from './notifications.js';
import { renderTasks } from './uiRenderer.js';

let currentEditTaskId = null;
let currentEditMode = 'modal'; // 'modal' or 'inline'

// Setup edit modal
export function setupEditModal() {
    const modal = document.getElementById('editModal');
    const closeBtn = document.getElementById('closeEditModal');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const confirmBtn = document.getElementById('confirmEditBtn');
    
    if (!modal) return;
    
    // Close modal events
    const closeModal = () => {
        modal.style.display = 'none';
        currentEditTaskId = null;
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Confirm edit
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            saveEditFromModal();
        });
    }
    
    // Preview as you type
    const editInput = document.getElementById('editTaskInput');
    const editPreview = document.getElementById('editPreview');
    
    if (editInput) {
        editInput.addEventListener('input', (e) => {
            if (editPreview && e.target.value) {
                editPreview.innerHTML = `Preview: ${e.target.value}`;
                editPreview.classList.add('show');
            } else if (editPreview) {
                editPreview.classList.remove('show');
            }
        });
    }
}

// Show edit modal
export function showEditModal(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id == taskId);
    
    if (!task) return;
    
    currentEditTaskId = taskId;
    const modal = document.getElementById('editModal');
    const editInput = document.getElementById('editTaskInput');
    const editDate = document.getElementById('editTaskDate');
    const editPreview = document.getElementById('editPreview');
    
    if (modal && editInput && editDate) {
        // Populate with current values
        editInput.value = task.text;
        editDate.value = task.dueDate || '';
        
        // Clear preview
        if (editPreview) {
            editPreview.classList.remove('show');
            editPreview.innerHTML = '';
        }
        
        // Show modal
        modal.style.display = 'block';
        
        // Focus on input
        setTimeout(() => editInput.focus(), 100);
    }
}

// Save edit from modal
function saveEditFromModal() {
    const editInput = document.getElementById('editTaskInput');
    const editDate = document.getElementById('editTaskDate');
    
    const newText = editInput?.value.trim();
    const newDueDate = editDate?.value || null;
    
    if (!newText) {
        showNotification('Task cannot be empty!', 'error');
        return;
    }
    
    if (currentEditTaskId) {
        // Update both text and due date
        const tasks = getTasks();
        const task = tasks.find(t => t.id == currentEditTaskId);
        
        if (task) {
            let updated = false;
            
            if (newText !== task.text) {
                editTask(currentEditTaskId, newText);
                updated = true;
            }
            
            if (newDueDate !== task.dueDate) {
                updateTaskDueDate(currentEditTaskId, newDueDate);
                updated = true;
            }
            
            if (updated) {
                showNotification('Task updated successfully!', 'success');
                renderTasks();
            } else {
                showNotification('No changes made', 'info');
            }
        }
        
        // Close modal
        const modal = document.getElementById('editModal');
        if (modal) modal.style.display = 'none';
        currentEditTaskId = null;
    }
}

// Inline edit functionality
export function setupInlineEdit() {
    // This will be called from uiRenderer for dynamic elements
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.removeEventListener('click', handleInlineEditClick);
        btn.addEventListener('click', handleInlineEditClick);
    });
    
    // Also handle double-click on task text
    document.querySelectorAll('.task-text').forEach(textEl => {
        textEl.removeEventListener('dblclick', handleDoubleClickEdit);
        textEl.addEventListener('dblclick', handleDoubleClickEdit);
    });
}

function handleInlineEditClick(e) {
    e.stopPropagation();
    const taskItem = e.target.closest('.task-item');
    if (taskItem) {
        const taskId = taskItem.dataset.taskId;
        startInlineEdit(taskId);
    }
}

function handleDoubleClickEdit(e) {
    const taskItem = e.target.closest('.task-item');
    if (taskItem) {
        const taskId = taskItem.dataset.taskId;
        startInlineEdit(taskId);
    }
}

function startInlineEdit(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;
    
    const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    const taskTextSpan = taskItem.querySelector('.task-text');
    const taskContent = taskItem.querySelector('.task-content');
    const taskActions = taskItem.querySelector('.task-actions');
    
    // Hide original text and actions
    taskTextSpan.style.display = 'none';
    if (taskActions) taskActions.style.display = 'none';
    
    // Create inline edit elements
    const inlineEditContainer = document.createElement('div');
    inlineEditContainer.className = 'inline-edit-container';
    inlineEditContainer.style.display = 'flex';
    inlineEditContainer.style.flex = '1';
    inlineEditContainer.style.gap = '8px';
    inlineEditContainer.style.alignItems = 'center';
    
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = task.text;
    editInput.className = 'inline-edit-input';
    
    // Optional: Add date picker for inline edit
    const editDate = document.createElement('input');
    editDate.type = 'date';
    editDate.value = task.dueDate || '';
    editDate.className = 'date-input';
    editDate.style.padding = '4px 8px';
    editDate.style.fontSize = '12px';
    
    const actionButtons = document.createElement('div');
    actionButtons.className = 'inline-edit-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '✓';
    saveBtn.className = 'inline-save-btn';
    saveBtn.title = 'Save';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✗';
    cancelBtn.className = 'inline-cancel-btn';
    cancelBtn.title = 'Cancel';
    
    actionButtons.appendChild(saveBtn);
    actionButtons.appendChild(cancelBtn);
    
    inlineEditContainer.appendChild(editInput);
    inlineEditContainer.appendChild(editDate);
    inlineEditContainer.appendChild(actionButtons);
    
    // Insert inline editor
    taskContent.insertBefore(inlineEditContainer, taskTextSpan.nextSibling);
    
    // Focus on input
    editInput.focus();
    editInput.select();
    
    // Save function
    const saveInlineEdit = () => {
        const newText = editInput.value.trim();
        const newDueDate = editDate.value || null;
        
        if (newText) {
            let updated = false;
            
            if (newText !== task.text) {
                editTask(taskId, newText);
                updated = true;
            }
            
            if (newDueDate !== task.dueDate) {
                updateTaskDueDate(taskId, newDueDate);
                updated = true;
            }
            
            if (updated) {
                showNotification('Task updated!', 'success');
                renderTasks();
            } else {
                // Just restore view
                taskTextSpan.style.display = '';
                if (taskActions) taskActions.style.display = '';
                inlineEditContainer.remove();
            }
        } else {
            showNotification('Task cannot be empty!', 'error');
        }
    };
    
    // Cancel function
    const cancelInlineEdit = () => {
        taskTextSpan.style.display = '';
        if (taskActions) taskActions.style.display = '';
        inlineEditContainer.remove();
    };
    
    // Event listeners
    saveBtn.addEventListener('click', saveInlineEdit);
    cancelBtn.addEventListener('click', cancelInlineEdit);
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveInlineEdit();
    });
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cancelInlineEdit();
    });
}