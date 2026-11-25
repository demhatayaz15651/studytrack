(function () {
  "use strict";

  const Core = window.StudyTrackCore;
  let tasks = [];
  let toastTimer = null;

  const filters = {
    search: "",
    status: "all",
    course: "all",
    type: "all",
    sortBy: "dueDateAsc",
  };

  const elements = {};

  function cacheElements() {
    elements.todayDateLabel = document.getElementById("todayDateLabel");
    elements.loadSampleBtn = document.getElementById("loadSampleBtn");
    elements.clearCompletedBtn = document.getElementById("clearCompletedBtn");
    elements.resetFiltersBtn = document.getElementById("resetFiltersBtn");

    elements.statTotal = document.getElementById("statTotal");
    elements.statPending = document.getElementById("statPending");
    elements.statUrgent = document.getElementById("statUrgent");
    elements.statOverdue = document.getElementById("statOverdue");
    elements.statCompleted = document.getElementById("statCompleted");
    elements.statCards = Array.from(document.querySelectorAll("[data-stat-filter]"));
    elements.completionRateText = document.getElementById("completionRateText");
    elements.completionProgressBar = document.getElementById("completionProgressBar");

    elements.deadlineAlertBanner = document.getElementById("deadlineAlertBanner");
    elements.alertBadgeIcon = document.getElementById("alertBadgeIcon");
    elements.alertTitle = document.getElementById("alertTitle");
    elements.alertMessage = document.getElementById("alertMessage");
    elements.alertQuickActions = document.getElementById("alertQuickActions");

    elements.taskForm = document.getElementById("taskForm");
    elements.formErrors = document.getElementById("formErrors");
    elements.taskTitle = document.getElementById("taskTitle");
    elements.taskCourse = document.getElementById("taskCourse");
    elements.courseSuggestions = document.getElementById("courseSuggestions");
    elements.taskType = document.getElementById("taskType");
    elements.taskPriority = document.getElementById("taskPriority");
    elements.taskDueDate = document.getElementById("taskDueDate");
    elements.taskNotes = document.getElementById("taskNotes");

    elements.filterSearch = document.getElementById("filterSearch");
    elements.filterStatus = document.getElementById("filterStatus");
    elements.filterCourse = document.getElementById("filterCourse");
    elements.filterType = document.getElementById("filterType");
    elements.sortBy = document.getElementById("sortBy");

    elements.taskList = document.getElementById("taskList");
    elements.taskCountBadge = document.getElementById("taskCountBadge");
    elements.emptyState = document.getElementById("emptyState");
    elements.emptyTitle = document.getElementById("emptyTitle");
    elements.emptyDesc = document.getElementById("emptyDesc");
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

  function hasActiveFilters() {
    return (
      filters.search.trim() !== "" ||
      filters.status !== "all" ||
      filters.course !== "all" ||
      filters.type !== "all" ||
      filters.sortBy !== "dueDateAsc"
    );
  }

  function syncCourseControls() {
    const uniqueCourses = Core.getUniqueCourses(tasks);

    // Update form datalist
    elements.courseSuggestions.innerHTML = "";
    uniqueCourses.forEach(function (course) {
      const option = document.createElement("option");
      option.value = course;
      elements.courseSuggestions.appendChild(option);
    });

    // Update filter course dropdown while preserving active selection
    if (filters.course !== "all" && !uniqueCourses.includes(filters.course)) {
      filters.course = "all";
    }
    elements.filterCourse.innerHTML = "";
    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = "Tüm Dersler";
    elements.filterCourse.appendChild(allOpt);

    uniqueCourses.forEach(function (course) {
      const opt = document.createElement("option");
      opt.value = course;
      opt.textContent = course;
      elements.filterCourse.appendChild(opt);
    });
    elements.filterCourse.value = filters.course;
  }

  function renderSummaryAndAlerts(now) {
    const stats = Core.computeSummaryStats(tasks, now);

    elements.statTotal.textContent = String(stats.total);
    elements.statPending.textContent = String(stats.pending);
    elements.statUrgent.textContent = String(stats.urgent);
    elements.statOverdue.textContent = String(stats.overdue);
    elements.statCompleted.textContent = String(stats.completed);

    elements.completionRateText.textContent = "%" + stats.completionRate;
    elements.completionProgressBar.style.width = stats.completionRate + "%";

    elements.statCards.forEach(function (card) {
      const isMatch = card.dataset.statFilter === filters.status;
      card.classList.toggle("is-active", isMatch);
    });

    // Deadline alert banner
    const banner = elements.deadlineAlertBanner;
    elements.alertQuickActions.innerHTML = "";

    if (stats.total === 0) {
      banner.hidden = true;
      return;
    }

    banner.hidden = false;
    banner.classList.remove("alert-danger", "alert-warning", "alert-success");

    if (stats.overdue > 0 || stats.urgent > 0) {
      const parts = [];
      if (stats.overdue > 0) {
        parts.push(stats.overdue + " geciken");
      }
      if (stats.urgent > 0) {
        parts.push(stats.urgent + " yaklaşan (≤3 gün)");
      }

      banner.classList.add(stats.overdue > 0 ? "alert-danger" : "alert-warning");
      elements.alertBadgeIcon.textContent = "!";
      elements.alertTitle.textContent = "Yaklaşan Teslim Tarihi Uyarısı";
      elements.alertMessage.textContent =
        "Dikkat: " + parts.join(" ve ") + " göreviniz bulunuyor. Öncelikli görevleri kontrol edin.";

      if (stats.overdue > 0) {
        const overdueBtn = document.createElement("button");
        overdueBtn.type = "button";
        overdueBtn.className = "btn btn-ghost btn-sm";
        overdueBtn.textContent = "Gecikenleri Gör (" + stats.overdue + ")";
        overdueBtn.addEventListener("click", function () {
          setStatusFilter("overdue");
        });
        elements.alertQuickActions.appendChild(overdueBtn);
      }

      if (stats.urgent > 0) {
        const urgentBtn = document.createElement("button");
        urgentBtn.type = "button";
        urgentBtn.className = "btn btn-ghost btn-sm";
        urgentBtn.textContent = "Yaklaşanları Gör (" + stats.urgent + ")";
        urgentBtn.addEventListener("click", function () {
          setStatusFilter("urgent");
        });
        elements.alertQuickActions.appendChild(urgentBtn);
      }
    } else {
      banner.classList.add("alert-success");
      elements.alertBadgeIcon.textContent = "✓";
      elements.alertTitle.textContent = "Takviminiz Kontrol Altında";
      elements.alertMessage.textContent =
        stats.pending === 0
          ? "Tüm görevlerinizi tamamladınız!"
          : "Geciken veya önümüzdeki 3 gün içinde teslim edilmesi gereken acil bir göreviniz yok.";
    }
  }

  function createBadge(text, className) {
    const span = document.createElement("span");
    span.className = "badge " + className;
    span.textContent = text;
    return span;
  }

  function buildTaskCard(task, now) {
    const deadline = Core.getDeadlineStatus(task, now);
    const li = document.createElement("li");
    li.className = "task-item";
    if (task.completed) {
      li.classList.add("is-completed");
    } else if (deadline.status === "overdue") {
      li.classList.add("is-overdue");
    } else if (deadline.status === "urgent") {
      li.classList.add("is-urgent");
    }
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
    meta.appendChild(
      createBadge(deadline.label, "badge-deadline-" + deadline.status)
    );

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
    const now = new Date();
    syncCourseControls();
    renderSummaryAndAlerts(now);

    const visibleTasks = Core.filterAndSortTasks(tasks, filters, now);
    const activeFilter = hasActiveFilters();

    elements.resetFiltersBtn.hidden = !activeFilter;
    elements.clearCompletedBtn.hidden = !tasks.some(function (t) { return t.completed; });

    elements.taskCountBadge.textContent = activeFilter
      ? visibleTasks.length + " / " + tasks.length + " görev"
      : tasks.length + " görev";

    elements.taskList.innerHTML = "";

    if (visibleTasks.length === 0) {
      elements.emptyState.hidden = false;
      if (tasks.length === 0) {
        elements.emptyTitle.textContent = "Henüz kayıtlı ödev veya sınav yok.";
        elements.emptyDesc.textContent =
          "Soldaki formu kullanarak ilk görevinizi ekleyebilir veya üstteki Örnek Veri Yükle butonuyla uygulamayı hemen deneyebilirsiniz.";
      } else {
        elements.emptyTitle.textContent = "Seçili filtrelere uygun görev bulunamadı.";
        elements.emptyDesc.textContent =
          "Arama terimini değiştirin veya Filtreleri Sıfırla butonuna tıklayarak tüm görevleri görüntüleyin.";
      }
      return;
    }

    elements.emptyState.hidden = true;
    visibleTasks.forEach(function (task) {
      elements.taskList.appendChild(buildTaskCard(task, now));
    });
  }

  function persistAndRender() {
    Core.saveTasks(tasks);
    render();
  }

  function setStatusFilter(nextStatus) {
    filters.status = nextStatus;
    elements.filterStatus.value = nextStatus;
    render();
  }

  function resetAllFilters() {
    filters.search = "";
    filters.status = "all";
    filters.course = "all";
    filters.type = "all";
    filters.sortBy = "dueDateAsc";
    elements.filterSearch.value = "";
    elements.filterStatus.value = "all";
    elements.filterCourse.value = "all";
    elements.filterType.value = "all";
    elements.sortBy.value = "dueDateAsc";
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
    tasks = Core.getSampleTasks(new Date());
    resetAllFilters();
    Core.saveTasks(tasks);
    render();
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
    elements.resetFiltersBtn.addEventListener("click", resetAllFilters);

    elements.filterSearch.addEventListener("input", function (event) {
      filters.search = event.target.value;
      render();
    });

    elements.filterStatus.addEventListener("change", function (event) {
      filters.status = event.target.value;
      render();
    });

    elements.filterCourse.addEventListener("change", function (event) {
      filters.course = event.target.value;
      render();
    });

    elements.filterType.addEventListener("change", function (event) {
      filters.type = event.target.value;
      render();
    });

    elements.sortBy.addEventListener("change", function (event) {
      filters.sortBy = event.target.value;
      render();
    });

    elements.statCards.forEach(function (card) {
      card.addEventListener("click", function () {
        setStatusFilter(card.dataset.statFilter || "all");
      });
    });

    render();
  });
})();
