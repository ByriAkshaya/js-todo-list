// 1. Get references
const taskInput = document.getElementById('taskInput');
const taskTime = document.getElementById('taskTime');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const emptyMessage = document.getElementById('emptyMessage');
const notifyPermissionBtn = document.getElementById('notifyPermissionBtn');

// Array to store all tasks
let tasks = [];

// 2. Load tasks from localStorage on page load
function loadTasks() {
  const saved = localStorage.getItem('myTodoTasks');
  if (saved) {
    tasks = JSON.parse(saved);
    renderTasks();
  }
}

// 3. Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('myTodoTasks', JSON.stringify(tasks));
}

// 4. Render all tasks to the list
function renderTasks() {
  taskList.innerHTML = ''; // clear list

  tasks.forEach(function (task) {
    const li = document.createElement('li');
    li.dataset.taskId = task.id;

    // Check overdue (if time passed and not done)
    if (task.time && !task.done) {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      if (task.time < currentTime) {
        li.classList.add('overdue');
      }
    }

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', function () {
      if (checkbox.checked) {
        li.classList.add('done');
        task.done = true;
        task.reminded = false;
      } else {
        li.classList.remove('done');
        task.done = false;
      }
      saveTasks();
      updateTaskCount();
    });

    // Text span
    const span = document.createElement('span');
    let labelText = task.text;
    if (task.time) {
      const [hours, minutes] = task.time.split(':');
      let h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      labelText = `${task.text} – ${h}:${minutes} ${ampm}`;
    }
    span.textContent = labelText;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', function () {
      li.remove();
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      updateTaskCount();
    });

    // Add to li
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  // Show/hide empty message
  if (tasks.length === 0) {
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';
  }

  updateTaskCount();
}

// 5. Update task counter
function updateTaskCount() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  taskCount.textContent = `${total} tasks • ${done} done`;
}

// 6. Add new task
function addTask() {
  const text = taskInput.value.trim();
  const timeValue = taskTime.value;

  if (text === '') {
    return;
  }

  const task = {
    id: Date.now(),
    text: text,
    time: timeValue || '',
    done: false,
    reminded: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();

  taskInput.value = '';
  taskTime.value = '';
}

// 7. Reminder checker: every second
setInterval(function () {
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  tasks.forEach(function (task) {
    if (task.time && task.time === currentTime && !task.done && !task.reminded) {
      // Send browser notification
      if (Notification.permission === 'granted') {
        new Notification(`Reminder: You have '${task.text}' to do`, {
          body: 'Please get on to that task.',
          icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png'
        });
      } else {
        alert(`Reminder: You have '${task.text}' to do, please get on to that task.`);
      }
      task.reminded = true;
      saveTasks();
    }
  });
}, 1000);

// 8. Button click
addTaskBtn.addEventListener('click', addTask);

// 9. Press Enter
taskInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    addTask();
  }
});

// 10. Request notification permission
notifyPermissionBtn.addEventListener('click', function () {
  if (!Notification) {
    alert('Your browser does not support notifications.');
    return;
  }
  Notification.requestPermission().then(function (permission) {
    if (permission === 'granted') {
      notifyPermissionBtn.textContent = 'Notifications Enabled';
      notifyPermissionBtn.disabled = true;
      new Notification('Notifications Enabled!', {
        body: 'You will now get reminders even on other tabs.'
      });
    }
  });
});

// 11. Check notification permission on load
if (Notification) {
  if (Notification.permission === 'granted') {
    notifyPermissionBtn.textContent = 'Notifications Enabled';
    notifyPermissionBtn.disabled = true;
  }
}

// 12. Load tasks on page load
loadTasks();