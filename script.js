// script.js

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksContainer = document.getElementById('tasksContainer');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');

// State variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize the app
function init() {
    renderTasks();
    updateStats();
    
    // Event listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Set current filter and render tasks
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        showInputError();
        return;
    }
    
    // Create new task object
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add to tasks array
    tasks.unshift(newTask);
    
    // Update UI and storage
    updateStorage();
    renderTasks();
    updateStats();
    
    // Clear input and focus
    taskInput.value = '';
    taskInput.focus();
    
    // Show success animation
    showSuccessAnimation();
}

// Render tasks based on current filter
function renderTasks() {
    // Filter tasks based on current filter
    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Clear the container
    tasksContainer.innerHTML = '';
    
    // Show empty state if no tasks
    if (filteredTasks.length === 0) {
        tasksContainer.appendChild(emptyState);
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Render each task
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksContainer.appendChild(taskElement);
    });
}

// Create a task element
function createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskEl.setAttribute('data-id', task.id);
    
    taskEl.innerHTML = `
        <div class="task-checkbox">
            <i class="fas fa-check"></i>
        </div>
        <div class="task-text">${escapeHtml(task.text)}</div>
        <div class="task-actions">
            <button class="action-btn edit-btn" title="Edit task">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" title="Delete task">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    
    // Add event listeners to the task element
    const checkbox = taskEl.querySelector('.task-checkbox');
    const editBtn = taskEl.querySelector('.edit-btn');
    const deleteBtn = taskEl.querySelector('.delete-btn');
    
    // Toggle completion
    checkbox.addEventListener('click', () => toggleTaskCompletion(task.id));
    
    // Edit task
    editBtn.addEventListener('click', () => editTask(task.id));
    
    // Delete task
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    return taskEl;
}

// Toggle task completion status
function toggleTaskCompletion(id) {
    // Find task index
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
        // Toggle completion
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        
        // Update UI and storage
        updateStorage();
        renderTasks();
        updateStats();
        
        // Show completion animation
        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
        taskElement.classList.add('completed');
        
        // Move completed tasks to the end if viewing all tasks
        if (currentFilter === 'all' && tasks[taskIndex].completed) {
            const completedTask = tasks.splice(taskIndex, 1)[0];
            tasks.push(completedTask);
            updateStorage();
            renderTasks();
        }
    }
}

// Edit a task
function editTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
        const newText = prompt('Edit your task:', tasks[taskIndex].text);
        
        if (newText !== null && newText.trim() !== '') {
            tasks[taskIndex].text = newText.trim();
            
            // Update UI and storage
            updateStorage();
            renderTasks();
        }
    }
}

// Delete a task with animation
function deleteTask(id) {
    const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
    
    if (taskElement) {
        // Add removing animation
        taskElement.classList.add('removing');
        
        // Remove from DOM after animation
        setTimeout(() => {
            // Remove from tasks array
            tasks = tasks.filter(task => task.id !== id);
            
            // Update UI and storage
            updateStorage();
            renderTasks();
            updateStats();
        }, 300);
    }
}

// Update localStorage with current tasks
function updateStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

// Show input error animation
function showInputError() {
    taskInput.style.borderColor = 'var(--danger)';
    taskInput.style.boxShadow = '0 0 0 3px rgba(255, 82, 82, 0.2)';
    
    setTimeout(() => {
        taskInput.style.borderColor = 'var(--light-gray)';
        taskInput.style.boxShadow = 'none';
    }, 1000);
}

// Show success animation
function showSuccessAnimation() {
    addBtn.style.backgroundColor = 'var(--success)';
    addBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
    
    setTimeout(() => {
        addBtn.style.backgroundColor = '';
        addBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Task';
    }, 1500);
}

// Helper function to escape HTML (prevent XSS)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);