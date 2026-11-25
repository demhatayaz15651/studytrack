(function () {
  "use strict";

  const Core = window.StudyTrackCore;
  let tasks = [];
  let toastTimer = null;

  const elements = {};

  function cacheElements() {
    elements.todayDateLabel = document.getElementById("todayDateLabel");
    elements.loadSampleBtn = document.getElementById("loadSampleBtn");
    elements.clearCompletedBtn = document.getElementById("clearCompletedBtn");
    elements.taskForm = document.getElementById("taskForm");
    elements.formErrors = document.getElementById("formErrors");
    elements.taskTitle = document.getElementById("taskTitle");
    elements.taskCourse = document.getElementById("taskCourse");
    elements.courseSuggestions = document.getElementById("courseSuggestions");
    elements.taskType = document.getElementById("taskType");
    elements.taskPriority = document.getElementById("taskPriority");
    elements.taskDueDate = document.getElementById("taskDueDate");
    elements.taskNotes = document.getElementById("taskNotes");
    elements.taskList = document.getElementById("taskList");
    elements.taskCountBadge = document.getElementById("taskCountBadge");
    elements.emptyState = document.getElementById("emptyState");
    elements.toast = document.getElementById("toast");
  }

  function initHeaderDate() {
    if (!elements.todayDateLabel) return;
    const now = new Date();
    elements.todayDateLabel.textContent = now.toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      elements.toast.hidden = true;
    }, 2800);
  }

  function renderFormErrors(errors) {
    if (!errors || errors.length === 0) {
      elements.formErrors.hidden = true;
      elements.formErrors.innerHTML = "";
      return;
    }
    const ul = document.createElement("ul");
    errors.forEach(function (err) {
      const li = document.createElement("li");
      li.textContent = err;
      ul.appendChild(li);
    });
    elements.formErrors.innerHTML = "";
    elements.formErrors.appendChild(ul);
    elements.formErrors.hidden = false;
  }

  function updateCourseSuggestions() {
    if (!elements.courseSuggestions) return;
    const uniqueCourses = Array.from(
      new Set(tasks.map(function (t) { return t.course; }).filter(Boolean))
    ).sort(function (a, b) {
      return a.localeCompare(b, "tr");
    });

    elements.courseSuggestions.innerHTML = "";
    uniqueCourses.forEach(function (course) {
      const option = document.createElement("option");
      option.value = course;
      elements.courseSuggestions.appendChild(option);
    });
  }

  function createBadge(text, className) {
    const span = document.createElement("span");
    span.className = "badge " + className;
    span.textContent = text;
    return span;
  }

  function buildTaskCard(task) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " is-completed" : "");
    li.dataset.taskId = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = Boolean(task.completed);
    checkbox.setAttribute(
      "aria-label",
      task.title + (task.completed ? " görevini bekliyor olarak işaretle" : " görevini tamamlandı olarak işaretle")
    );
    checkbox.addEventListener("change", function () {
      handleToggleTask(task.id);
    });

    const content = document.createElement("div");
    content.className = "task-content";

    const topRow = document.createElement("div");
    topRow.className = "task-top-row";

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-danger-ghost";
    deleteBtn.textContent = "Sil";
    deleteBtn.setAttribute("aria-label", task.title + " görevini sil");
    deleteBtn.addEventListener("click", function () {
      handleDeleteTask(task.id);
    });

    topRow.appendChild(title);
    topRow.appendChild(deleteBtn);

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.appendChild(createBadge(task.course, "badge-course"));
    meta.appendChild(createBadge(task.type, "badge-type"));

    const priorityMeta = Core.getPriorityMeta(task.priority);
    meta.appendChild(
      createBadge("Öncelik: " + priorityMeta.label, "badge-priority-" + priorityMeta.value)
    );
    meta.appendChild(
      createBadge("Teslim: " + Core.formatTurkishDate(task.dueDate), "badge-date")
    );

    if (task.completed) {
      meta.appendChild(createBadge("Tamamlandı", "badge-status-done"));
    }

    content.appendChild(topRow);
    content.appendChild(meta);

    if (task.notes) {
      const notes = document.createElement("p");
      notes.className = "task-notes";
      notes.textContent = task.notes;
      content.appendChild(notes);
    }

    li.appendChild(checkbox);
    li.appendChild(content);
    return li;
  }

  function render() {
    elements.taskList.innerHTML = "";
    elements.taskCountBadge.textContent = tasks.length + " görev";

    const hasCompleted = tasks.some(function (t) { return t.completed; });
    elements.clearCompletedBtn.hidden = !hasCompleted;

    if (tasks.length === 0) {
      elements.emptyState.hidden = false;
    } else {
      elements.emptyState.hidden = true;
      tasks.forEach(function (task) {
        elements.taskList.appendChild(buildTaskCard(task));
      });
    }

    updateCourseSuggestions();
  }

  function persistAndRender() {
    Core.saveTasks(tasks);
    render();
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const input = {
      title: elements.taskTitle.value,
      course: elements.taskCourse.value,
      type: elements.taskType.value,
      priority: elements.taskPriority.value,
      dueDate: elements.taskDueDate.value,
      notes: elements.taskNotes.value,
    };

    const validation = Core.validateTaskInput(input);
    if (!validation.valid) {
      renderFormErrors(validation.errors);
      return;
    }

    renderFormErrors([]);
    const result = Core.addTask(tasks, input);
    tasks = result.tasks;
    persistAndRender();

    elements.taskForm.reset();
    elements.taskDueDate.value = Core.addDaysToDate(new Date(), 3);
    elements.taskTitle.focus();
    showToast("Yeni görev eklendi.");
  }

  function handleToggleTask(taskId) {
    const target = tasks.find(function (t) { return t.id === taskId; });
    tasks = Core.toggleTaskCompleted(tasks, taskId);
    persistAndRender();
    if (target) {
      showToast(target.completed ? "Görev tekrar bekliyor durumuna alındı." : "Görev tamamlandı olarak işaretlendi.");
    }
  }

  function handleDeleteTask(taskId) {
    tasks = Core.deleteTask(tasks, taskId);
    persistAndRender();
    showToast("Görev silindi.");
  }

  function handleClearCompleted() {
    tasks = Core.clearCompletedTasks(tasks);
    persistAndRender();
    showToast("Tamamlanan görevler temizlendi.");
  }

  function handleLoadSamples() {
    const samples = Core.getSampleTasks(new Date());
    tasks = samples;
    persistAndRender();
    renderFormErrors([]);
    showToast("5 örnek ders görevi yüklendi.");
  }

  document.addEventListener("DOMContentLoaded", function () {
    cacheElements();
    initHeaderDate();

    tasks = Core.loadTasks();
    elements.taskDueDate.value = Core.addDaysToDate(new Date(), 3);

    elements.taskForm.addEventListener("submit", handleFormSubmit);
    elements.clearCompletedBtn.addEventListener("click", handleClearCompleted);
    elements.loadSampleBtn.addEventListener("click", handleLoadSamples);

    render();
  });
})();
