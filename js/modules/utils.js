// utils.js - Helper functions

// Escape HTML to prevent XSS attacks
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show validation error
export function showValidationError(input, message) {
    const existingError = document.querySelector('.validation-error');
    if (existingError) existingError.remove();
    
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

// Debounce function to prevent multiple clicks
export function debounce(func, delay) {
    let timer;
    return function(...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}