// modal.js - Handle delete confirmation modal

let pendingDeleteId = null;
let onConfirmCallback = null;

export function setupModal() {
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const modalCloseBtn = document.querySelector('.modal-close');
    
    // Show delete confirmation
    window.showDeleteConfirmation = (id, taskText, onConfirm) => {
        const taskPreview = document.getElementById('taskToDeletePreview');
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
    const closeModal = () => {
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
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    
    // Close on outside click
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeModal();
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && deleteModal && deleteModal.style.display === 'block') {
            closeModal();
        }
    });
}