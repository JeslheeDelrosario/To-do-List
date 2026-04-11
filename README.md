# 📝 Modern ToDo List Application

A beautiful, feature-rich todo list application with a modern glassmorphism design, built with vanilla JavaScript and ES6 modules.

![ToDo App Screenshot](screenshot.png)

## ✨ Features

### 🎯 Core Functionality
- **Add Tasks**: Quickly add new tasks with Enter key or button click
- **Complete Tasks**: Check/uncheck tasks with smooth animations
- **Edit Tasks**: Double-click or use edit button for inline editing
- **Delete Tasks**: Safe deletion with confirmation modal
- **Filter Tasks**: View All, Active, or Completed tasks
- **Persistent Storage**: Tasks saved in browser's localStorage

### 🎨 Modern Design
- **Glassmorphism UI**: Beautiful frosted glass effect with backdrop blur
- **Gradient Backgrounds**: Stunning purple-blue gradient theme
- **Smooth Animations**: Subtle transitions and hover effects
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with carefully chosen colors

### ⌨️ Keyboard Shortcuts
- `Ctrl/Cmd + A` - Focus input field
- `Delete` - Clear all completed tasks (with confirmation)
- `Escape` - Reset filter to "All"
- `Enter` - Add task (when input is focused)
- `Double-click` - Edit task inline

### 🛡️ Advanced Features
- **XSS Protection**: All user input is properly escaped
- **Input Validation**: Maximum task length of 200 characters
- **Duplicate Prevention**: Cannot add identical tasks
- **Error Handling**: Graceful handling of localStorage issues
- **Debouncing**: Prevents accidental double-clicks
- **Modal Confirmation**: Safe delete with preview

## 🚀 Quick Start

1. **Clone or Download** the project files
2. **Open** `index.html` in your web browser
3. **Start Adding Tasks** - no setup required!

## 📁 Project Structure

```
todo-list/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # All styling with glassmorphism design
├── js/
│   ├── app.js             # Main application entry point
│   └── modules/
│       ├── storage.js     # localStorage operations
│       ├── taskManager.js # Task CRUD operations
│       ├── uiRenderer.js  # UI rendering functions
│       ├── notifications.js # Toast notifications
│       ├── modal.js       # Delete confirmation modal
│       └── utils.js       # Helper functions
└── README.md
```

## 🎨 Design System

### Colors
- **Primary**: `#6366f1` (Indigo) to `#8b5cf6` (Purple) gradient
- **Background**: Dark purple-blue gradient (`#0f0c29` to `#24243e`)
- **Glass Effect**: `rgba(255, 255, 255, 0.08)` with `backdrop-filter: blur(20px)`
- **Text**: Light gray (`#e0e0e0`) for optimal readability

### Typography
- **Font**: Inter (system-ui stack) for modern, clean text
- **Sizes**: Responsive scaling from 0.8rem to 1.8rem
- **Weights**: 400 (normal), 600 (semibold), 700 (bold)

### Animations
- **Task Entry**: Slide-in with scale animation
- **Hover Effects**: Subtle lift and shadow
- **Notifications**: Slide from right with fade
- **Modal**: Smooth fade-in overlay

## 💻 Technical Details

### Architecture
- **ES6 Modules**: Clean separation of concerns
- **Event Delegation**: Efficient event handling
- **State Management**: Centralized task state
- **No Dependencies**: Pure vanilla JavaScript

### Browser Support
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

### Performance
- **Lazy Loading**: Modules loaded on demand
- **Debouncing**: Prevents excessive function calls
- **Efficient DOM Updates**: Minimal re-renders
- **Local Storage**: Fast client-side persistence

## 🔧 Customization

### Changing Colors
Edit the CSS variables in [`style.css`](css/style.css):

```css
:root {
  --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --bg-gradient: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}
```

### Modifying Task Limits
Change the maximum task length in [`taskManager.js`](js/modules/taskManager.js):

```javascript
const MAX_TASK_LENGTH = 200; // Change as needed
```

### Customizing Animations
Adjust animation timings in [`style.css`](css/style.css):

```css
.task-item {
  animation: slideIn 0.4s ease forwards;
}
```

## 🐛 Troubleshooting

### Tasks Not Saving
- Check if localStorage is enabled in your browser
- Ensure you're not in private/incognito mode
- Try clearing browser data and reloading

### Buttons Not Working
- Refresh the page (F5)
- Check browser console for errors
- Ensure JavaScript is enabled

### Mobile Issues
- Try rotating your device
- Clear browser cache
- Update to latest browser version

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share your customizations

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Design inspired by modern glassmorphism trends
- Color palette from Tailwind CSS
- Icons from emoji set
- Built with love and vanilla JavaScript

---

**Made with ❤️ for productivity enthusiasts**