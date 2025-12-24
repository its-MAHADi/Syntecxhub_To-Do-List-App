// app.js

// Application State
const state = {
    tasks: JSON.parse(localStorage.getItem('premiumTasks')) || [],
    currentView: 'dashboard',
    currentFilter: 'all',
    currentSort: 'date',
    theme: localStorage.getItem('theme') || 'light',
    searchQuery: '',
    notifications: [],
    settings: {
        confirmDelete: true,
        showCompleted: true,
        defaultDueDate: 'tomorrow',
        animationSpeed: 'normal'
    }
};

// DOM Elements
const DOM = {
    // Navigation
    sidebar: document.querySelector('.sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    navItems: document.querySelectorAll('.nav-item'),
    
    // Header
    pageTitle: document.getElementById('pageTitle'),
    pageSubtitle: document.getElementById('pageSubtitle'),
    taskSearch: document.getElementById('taskSearch'),
    
    // Buttons
    addBtn: document.getElementById('addBtn'),
    fab: document.getElementById('fab'),
    
    // Inputs
    taskInput: document.getElementById('taskInput'),
    importantCheckbox: document.getElementById('importantCheckbox'),
    todayCheckbox: document.getElementById('todayCheckbox'),
    taskDueDate: document.getElementById('taskDueDate'),
    
    // Views
    viewSections: document.querySelectorAll('.view-section'),
    
    // Containers
    recentTasksContainer: document.getElementById('recentTasksContainer'),
    allTasksContainer: document.getElementById('allTasksContainer'),
    todayTasksContainer: document.getElementById('todayTasksContainer'),
    importantTasksContainer: document.getElementById('importantTasksContainer'),
    completedTasksContainer: document.getElementById('completedTasksContainer'),
    
    // Stats
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    pendingTasks: document.getElementById('pendingTasks'),
    overdueTasks: document.getElementById('overdueTasks'),
    
    // Badges
    totalTasksBadge: document.getElementById('totalTasksBadge'),
    todayTasksBadge: document.getElementById('todayTasksBadge'),
    importantTasksBadge: document.getElementById('importantTasksBadge'),
    completedTasksBadge: document.getElementById('completedTasksBadge'),
    
    // Filter & Sort
    filterDropdown: document.querySelector('.filter-dropdown .dropdown-toggle'),
    filterMenu: document.querySelector('.filter-dropdown .dropdown-menu'),
    filterItems: document.querySelectorAll('.filter-dropdown .dropdown-item'),
    sortDropdown: document.querySelector('.sort-dropdown .dropdown-toggle'),
    sortMenu: document.querySelector('.sort-dropdown .dropdown-menu'),
    sortItems: document.querySelectorAll('.sort-dropdown .dropdown-item'),
    
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    themeOptions: document.querySelectorAll('.theme-option'),
    
    // Panels
    notificationBtn: document.getElementById('notificationBtn'),
    notificationPanel: document.getElementById('notificationPanel'),
    notificationClose: document.getElementById('notificationClose'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsPanel: document.getElementById('settingsPanel'),
    settingsClose: document.getElementById('settingsClose'),
    
    // Progress
    progressFill: document.querySelector('.progress-fill'),
    progressPercent: document.querySelector('.progress-percent'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastTitle: document.querySelector('.toast-title'),
    toastMessage: document.querySelector('.toast-message'),
    toastIcon: document.querySelector('.toast-icon i'),
    toastClose: document.querySelector('.toast-close'),
    
    // Chart
    productivityChart: null
};

// Initialize the application
function init() {
    // Load saved state
    loadState();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI
    initUI();
    
    // Load initial data
    loadData();
    
    // Set today's date
    setTodayDate();
    
    // Initialize chart
    initChart();
}

// Load saved state from localStorage
function loadState() {
    const savedSettings = localStorage.getItem('premiumTasksSettings');
    if (savedSettings) {
        state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
    }
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeToggle();
}

// Set up all event listeners
function setupEventListeners() {
    // Navigation
    DOM.navItems.forEach(item => {
        item.addEventListener('click', () => switchView(item.dataset.view));
    });
    
    DOM.sidebarToggle.addEventListener('click', toggleSidebar);
    
    // Task Management
    DOM.addBtn.addEventListener('click', addTask);
    DOM.fab.addEventListener('click', addTask);
    DOM.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Search
    DOM.taskSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase();
        filterTasks();
    });
    
    // Filter & Sort
    DOM.filterDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        DOM.filterMenu.classList.toggle('show');
    });
    
    DOM.filterItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            state.currentFilter = item.dataset.filter;
            updateActiveFilter(item);
            filterTasks();
            DOM.filterMenu.classList.remove('show');
        });
    });
    
    DOM.sortDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        DOM.sortMenu.classList.toggle('show');
    });
    
    DOM.sortItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            state.currentSort = item.dataset.sort;
            updateActiveSort(item);
            sortTasks();
            DOM.sortMenu.classList.remove('show');
        });
    });
    
    // Theme
    DOM.themeToggle.addEventListener('click', toggleTheme);
    DOM.themeOptions.forEach(option => {
        option.addEventListener('click', () => switchTheme(option.dataset.theme));
    });
    
    // Panels
    DOM.notificationBtn.addEventListener('click', toggleNotificationPanel);
    DOM.notificationClose.addEventListener('click', () => DOM.notificationPanel.classList.remove('show'));
    DOM.settingsBtn.addEventListener('click', toggleSettingsPanel);
    DOM.settingsClose.addEventListener('click', () => DOM.settingsPanel.classList.remove('show'));
    
    // Toast
    DOM.toastClose.addEventListener('click', hideToast);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-toggle')) {
            DOM.filterMenu.classList.remove('show');
            DOM.sortMenu.classList.remove('show');
        }
        
        if (!e.target.closest('.notification-panel') && !e.target.closest('#notificationBtn')) {
            DOM.notificationPanel.classList.remove('show');
        }
        
        if (!e.target.closest('.settings-panel') && !e.target.closest('#settingsBtn')) {
            DOM.settingsPanel.classList.remove('show');
        }
    });
    
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    DOM.taskDueDate.valueAsDate = tomorrow;
    DOM.taskDueDate.min = new Date().toISOString().split('T')[0];
}

// Initialize UI elements
function initUI() {
    // Update theme icon
    updateThemeToggle();
    
    // Set active nav item
    updateActiveNav();
    
    // Close panels on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            DOM.notificationPanel.classList.remove('show');
            DOM.settingsPanel.classList.remove('show');
            hideToast();
        }
    });
}

// Load and display data
function loadData() {
    updateStats();
    updateBadges();
    updateProgress();
    renderRecentTasks();
    renderAllTasks();
    renderTodayTasks();
    renderImportantTasks();
    renderCompletedTasks();
}

// Switch between views
function switchView(view) {
    state.currentView = view;
    
    // Update active nav item
    updateActiveNav();
    
    // Hide all views
    DOM.viewSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected view
    const targetView = document.getElementById(`${view}View`);
    if (targetView) {
        targetView.classList.add('active');
        
        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            tasks: 'All Tasks',
            today: 'Today\'s Tasks',
            important: 'Important Tasks',
            completed: 'Completed Tasks'
        };
        
        const subtitles = {
            dashboard: 'Your productivity overview',
            tasks: 'Manage all your tasks',
            today: 'Tasks due today',
            important: 'High priority tasks',
            completed: 'Tasks you\'ve completed'
        };
        
        DOM.pageTitle.textContent = titles[view];
        DOM.pageSubtitle.textContent = subtitles[view];
    }
    
    // Close sidebar on mobile
    if (window.innerWidth <= 992) {
        DOM.sidebar.classList.remove('show');
    }
}

// Update active navigation item
function updateActiveNav() {
    DOM.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === state.currentView) {
            item.classList.add('active');
        }
    });
}

// Toggle sidebar on mobile
function toggleSidebar() {
    DOM.sidebar.classList.toggle('show');
}

// Add a new task
function addTask() {
    const text = DOM.taskInput.value.trim();
    if (!text) {
        showToast('Please enter a task', 'warning');
        shakeElement(DOM.taskInput);
        return;
    }
    
    const dueDate = DOM.taskDueDate.value;
    const isImportant = DOM.importantCheckbox.checked;
    const isToday = DOM.todayCheckbox.checked;
    
    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        important: isImportant,
        dueDate: dueDate,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    // If marked as today, set due date to today
    if (isToday) {
        const today = new Date().toISOString().split('T')[0];
        task.dueDate = today;
    }
    
    state.tasks.unshift(task);
    saveTasks();
    loadData();
    
    // Clear input
    DOM.taskInput.value = '';
    DOM.importantCheckbox.checked = false;
    DOM.todayCheckbox.checked = false;
    
    // Reset due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    DOM.taskDueDate.valueAsDate = tomorrow;
    
    // Show success message
    showToast('Task added successfully!', 'success');
    
    // Switch to tasks view
    switchView('tasks');
}

// Toggle task completion
function toggleTaskCompletion(taskId) {
    const taskIndex = state.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    state.tasks[taskIndex].completed = !state.tasks[taskIndex].completed;
    state.tasks[taskIndex].completedAt = state.tasks[taskIndex].completed ? new Date().toISOString() : null;
    
    saveTasks();
    loadData();
    
    // Show notification
    const task = state.tasks[taskIndex];
    const message = task.completed 
        ? `"${task.text}" marked as completed!`
        : `"${task.text}" marked as pending`;
    
    showToast(message, task.completed ? 'success' : 'info');
}

// Toggle task importance
function toggleTaskImportance(taskId) {
    const taskIndex = state.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    state.tasks[taskIndex].important = !state.tasks[taskIndex].important;
    saveTasks();
    loadData();
    
    const task = state.tasks[taskIndex];
    const message = task.important 
        ? `"${task.text}" marked as important`
        : `"${task.text}" removed from important`;
    
    showToast(message, 'info');
}

// Edit a task
function editTask(taskId) {
    const taskIndex = state.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    const task = state.tasks[taskIndex];
    const newText = prompt('Edit task:', task.text);
    
    if (newText !== null && newText.trim() !== '') {
        state.tasks[taskIndex].text = newText.trim();
        saveTasks();
        loadData();
        showToast('Task updated successfully!', 'success');
    }
}

// Delete a task
function deleteTask(taskId) {
    if (state.settings.confirmDelete) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
    }
    
    const taskIndex = state.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    const taskText = state.tasks[taskIndex].text;
    state.tasks.splice(taskIndex, 1);
    saveTasks();
    loadData();
    
    showToast(`"${taskText}" deleted`, 'warning');
}

// Filter tasks based on current filter and search
function filterTasks() {
    renderAllTasks();
    renderRecentTasks();
    renderTodayTasks();
    renderImportantTasks();
    renderCompletedTasks();
}

// Sort tasks
function sortTasks() {
    const sortFunctions = {
        date: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
        priority: (a, b) => {
            if (a.important === b.important) return 0;
            return a.important ? -1 : 1;
        },
        name: (a, b) => a.text.localeCompare(b.text),
        created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    };
    
    if (sortFunctions[state.currentSort]) {
        state.tasks.sort(sortFunctions[state.currentSort]);
        saveTasks();
        filterTasks();
    }
}

// Update active filter button
function updateActiveFilter(activeItem) {
    DOM.filterItems.forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
    DOM.filterDropdown.innerHTML = `<i class="fas fa-filter"></i> ${activeItem.textContent} <i class="fas fa-chevron-down"></i>`;
}

// Update active sort button
function updateActiveSort(activeItem) {
    DOM.sortItems.forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
    DOM.sortDropdown.innerHTML = `<i class="fas fa-sort-amount-down"></i> ${activeItem.textContent} <i class="fas fa-chevron-down"></i>`;
}

// Render recent tasks (5 most recent)
function renderRecentTasks() {
    const recentTasks = state.tasks.slice(0, 5);
    renderTaskList(DOM.recentTasksContainer, recentTasks, true);
}

// Render all tasks with current filter
function renderAllTasks() {
    let filteredTasks = [...state.tasks];
    
    // Apply current filter
    if (state.currentFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filteredTasks = filteredTasks.filter(task => task.dueDate === today);
    } else if (state.currentFilter === 'important') {
        filteredTasks = filteredTasks.filter(task => task.important);
    } else if (state.currentFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (state.currentFilter === 'pending') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    }
    
    // Apply search
    if (state.searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(state.searchQuery)
        );
    }
    
    renderTaskList(DOM.allTasksContainer, filteredTasks);
}

// Render today's tasks
function renderTodayTasks() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = state.tasks.filter(task => task.dueDate === today);
    renderTaskList(DOM.todayTasksContainer, todayTasks);
}

// Render important tasks
function renderImportantTasks() {
    const importantTasks = state.tasks.filter(task => task.important);
    renderTaskList(DOM.importantTasksContainer, importantTasks);
}

// Render completed tasks
function renderCompletedTasks() {
    const completedTasks = state.tasks.filter(task => task.completed);
    renderTaskList(DOM.completedTasksContainer, completedTasks);
}

// Render a list of tasks to a container
function renderTaskList(container, tasks, isCompact = false) {
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No tasks found</h3>
                <p>${getEmptyStateMessage()}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tasks.map(task => createTaskElement(task, isCompact)).join('');
    
    // Add event listeners to new task elements
    container.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(checkbox.closest('.task-item').dataset.id);
            toggleTaskCompletion(taskId);
        });
    });
    
    container.querySelectorAll('.action-btn.star').forEach(starBtn => {
        starBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(starBtn.closest('.task-item').dataset.id);
            toggleTaskImportance(taskId);
        });
    });
    
    container.querySelectorAll('.action-btn.edit').forEach(editBtn => {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(editBtn.closest('.task-item').dataset.id);
            editTask(taskId);
        });
    });
    
    container.querySelectorAll('.action-btn.delete').forEach(deleteBtn => {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = parseInt(deleteBtn.closest('.task-item').dataset.id);
            deleteTask(taskId);
        });
    });
}

// Create a task element
function createTaskElement(task, isCompact = false) {
    const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const dueDateFormatted = dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';
    
    let taskClass = 'task-item';
    if (task.completed) taskClass += ' completed';
    if (task.important) taskClass += ' important';
    if (isOverdue) taskClass += ' overdue';
    
    return `
        <div class="${taskClass}" data-id="${task.id}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="task-content">
                <h4>${escapeHtml(task.text)}</h4>
                ${!isCompact ? `
                    <p>
                        <i class="fas fa-calendar-alt"></i>
                        ${dueDateFormatted}
                        ${isOverdue ? '<span class="badge overdue-badge">Overdue</span>' : ''}
                        ${task.important ? '<i class="fas fa-star"></i>' : ''}
                    </p>
                ` : ''}
            </div>
            <div class="task-actions">
                <button class="action-btn star ${task.important ? 'active' : ''}" title="${task.important ? 'Remove from important' : 'Mark as important'}">
                    <i class="fas fa-star"></i>
                </button>
                <button class="action-btn edit" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" title="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `;
}

// Get appropriate empty state message
function getEmptyStateMessage() {
    if (state.searchQuery) return 'No tasks match your search';
    
    switch (state.currentFilter) {
        case 'today': return 'No tasks due today';
        case 'important': return 'No important tasks';
        case 'completed': return 'No completed tasks yet';
        case 'pending': return 'No pending tasks';
        default: return 'Add a task to get started!';
    }
}

// Update statistics
function updateStats() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    const today = new Date().toISOString().split('T')[0];
    const overdue = state.tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        new Date(task.dueDate) < new Date(today)
    ).length;
    
    DOM.totalTasks.textContent = total;
    DOM.completedTasks.textContent = completed;
    DOM.pendingTasks.textContent = pending;
    DOM.overdueTasks.textContent = overdue;
}

// Update navigation badges
function updateBadges() {
    const total = state.tasks.length;
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = state.tasks.filter(task => task.dueDate === today).length;
    const importantTasks = state.tasks.filter(task => task.important).length;
    const completedTasks = state.tasks.filter(task => task.completed).length;
    
    DOM.totalTasksBadge.textContent = total;
    DOM.todayTasksBadge.textContent = todayTasks;
    DOM.importantTasksBadge.textContent = importantTasks;
    DOM.completedTasksBadge.textContent = completedTasks;
}

// Update progress bar
function updateProgress() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(task => task.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    DOM.progressFill.style.width = `${percent}%`;
    DOM.progressPercent.textContent = `${percent}%`;
}

// Toggle theme
function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    switchTheme(newTheme);
}

// Switch to specific theme
function switchTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    updateThemeToggle();
    updateThemeOptions(theme);
    
    showToast(`Switched to ${theme} theme`, 'info');
}

// Update theme toggle button
function updateThemeToggle() {
    const icon = DOM.themeToggle.querySelector('i');
    const text = DOM.themeToggle.querySelector('span');
    
    if (state.theme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    }
}

// Update theme options
function updateThemeOptions(activeTheme) {
    DOM.themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === activeTheme) {
            option.classList.add('active');
        }
    });
}

// Toggle notification panel
function toggleNotificationPanel() {
    DOM.notificationPanel.classList.toggle('show');
}

// Toggle settings panel
function toggleSettingsPanel() {
    DOM.settingsPanel.classList.toggle('show');
}

// Show toast notification
function showToast(message, type = 'info') {
    const icons = {
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
    };
    
    const colors = {
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3'
    };
    
    DOM.toastTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    DOM.toastMessage.textContent = message;
    DOM.toastIcon.className = icons[type] || icons.info;
    DOM.toast.style.borderLeftColor = colors[type] || colors.info;
    
    DOM.toast.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideToast();
    }, 5000);
}

// Hide toast notification
function hideToast() {
    DOM.toast.classList.remove('show');
}

// Shake an element (for validation errors)
function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

// Set today's date in the UI
function setTodayDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    DOM.todayDate.textContent = today.toLocaleDateString('en-US', options);
}

// Initialize productivity chart
function initChart() {
    const ctx = document.getElementById('productivityChart').getContext('2d');
    
    // Sample data for the chart
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Tasks Completed',
            data: [3, 5, 2, 8, 6, 4, 7],
            backgroundColor: 'rgba(108, 99, 255, 0.2)',
            borderColor: 'rgba(108, 99, 255, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };
    
    DOM.productivityChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        stepSize: 2
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('premiumTasks', JSON.stringify(state.tasks));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-left: 8px;
    }
    
    .overdue-badge {
        background-color: rgba(244, 67, 54, 0.1);
        color: #F44336;
    }
`;
document.head.appendChild(style);