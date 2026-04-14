// modal.js - Handle delete confirmation modal

let pendingDeleteId = null;
let onConfirmCallback = null;

export function setupModal() {
    const deleteModal = document.getElementById('deleteTaskModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteTaskBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteTaskBtn');
    const modalCloseBtn = document.getElementById('closeDeleteTaskModal');
    
    // Show delete confirmation
    window.showDeleteConfirmation = (id, taskText, onConfirm) => {
        const taskPreview = document.getElementById('deleteTaskPreview');
        if (taskPreview) {
            taskPreview.textContent = `"${taskText}"`;
        }
        
        pendingDeleteId = id;
        onConfirmCallback = onConfirm;
        
        if (deleteModal) {
            deleteModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Close modal
    const closeDeleteModal = () => {
        if (deleteModal) {
            deleteModal.style.display = 'none';
            pendingDeleteId = null;
            onConfirmCallback = null;
            document.body.style.overflow = '';
        }
    };
    
    // Execute delete
    const executeDelete = () => {
        if (pendingDeleteId !== null && onConfirmCallback) {
            onConfirmCallback(pendingDeleteId);
            closeModal();
        }
    };
    
    // Event listeners
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', executeDelete);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeDeleteModal);
    
    // Close on outside click
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeDeleteModal();
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && deleteModal && deleteModal.style.display === 'block') {
            closeDeleteModal();
        }
    });
}