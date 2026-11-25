(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.StudyTrackCore = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STORAGE_KEY = "studytrack_tasks_v1";

  const TASK_TYPES = ["Ödev", "Sınav", "Proje"];

  const PRIORITIES = [
    { value: "high", label: "Yüksek", weight: 3 },
    { value: "medium", label: "Orta", weight: 2 },
    { value: "low", label: "Düşük", weight: 1 },
  ];

  const PRIORITY_MAP = PRIORITIES.reduce(function (acc, item) {
    acc[item.value] = item;
    return acc;
  }, {});

  function toISODateString(date) {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDaysToDate(referenceDate, offsetDays) {
    const base = referenceDate instanceof Date ? new Date(referenceDate.getTime()) : new Date();
    base.setHours(12, 0, 0, 0);
    base.setDate(base.getDate() + offsetDays);
    return toISODateString(base);
  }

  function isValidISODate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  function formatTurkishDate(isoDate) {
    if (!isValidISODate(isoDate)) {
      return "-";
    }
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function getPriorityMeta(priority) {
    return PRIORITY_MAP[priority] || PRIORITY_MAP.medium;
  }

  function generateTaskId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "task_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function validateTaskInput(input) {
    const errors = [];
    const safe = input && typeof input === "object" ? input : {};
    const title = String(safe.title || "").trim();
    const course = String(safe.course || "").trim();
    const type = String(safe.type || "Ödev").trim();
    const dueDate = String(safe.dueDate || "").trim();
    const priority = String(safe.priority || "medium").trim();

    if (!title) {
      errors.push("Görev başlığı boş bırakılamaz.");
    } else if (title.length > 120) {
      errors.push("Görev başlığı en fazla 120 karakter olabilir.");
    }

    if (!course) {
      errors.push("Ders adı boş bırakılamaz.");
    } else if (course.length > 80) {
      errors.push("Ders adı en fazla 80 karakter olabilir.");
    }

    if (!TASK_TYPES.includes(type)) {
      errors.push("Geçerli bir görev türü seçin (Ödev, Sınav veya Proje).");
    }

    if (!dueDate) {
      errors.push("Teslim tarihi seçilmelidir.");
    } else if (!isValidISODate(dueDate)) {
      errors.push("Geçerli bir teslim tarihi girin (YYYY-AA-GG).");
    }

    if (!PRIORITY_MAP[priority]) {
      errors.push("Geçerli bir öncelik seviyesi seçin.");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  function createTask(input, now) {
    const validation = validateTaskInput(input);
    if (!validation.valid) {
      const error = new Error(validation.errors.join(" "));
      error.validationErrors = validation.errors;
      throw error;
    }

    const timestamp = (now instanceof Date ? now : new Date()).toISOString();
    return {
      id: generateTaskId(),
      title: String(input.title).trim(),
      course: String(input.course).trim(),
      type: String(input.type || "Ödev").trim(),
      dueDate: String(input.dueDate).trim(),
      priority: String(input.priority || "medium").trim(),
      notes: String(input.notes || "").trim().slice(0, 300),
      completed: Boolean(input.completed),
      createdAt: timestamp,
      completedAt: input.completed ? timestamp : null,
    };
  }

  function addTask(tasks, input, now) {
    const current = Array.isArray(tasks) ? tasks : [];
    const newTask = createTask(input, now);
    return {
      task: newTask,
      tasks: [newTask, ...current],
    };
  }

  function toggleTaskCompleted(tasks, taskId, now) {
    const current = Array.isArray(tasks) ? tasks : [];
    const timestamp = (now instanceof Date ? now : new Date()).toISOString();
    return current.map(function (task) {
      if (task.id !== taskId) {
        return task;
      }
      const nextCompleted = !task.completed;
      return Object.assign({}, task, {
        completed: nextCompleted,
        completedAt: nextCompleted ? timestamp : null,
      });
    });
  }

  function deleteTask(tasks, taskId) {
    const current = Array.isArray(tasks) ? tasks : [];
    return current.filter(function (task) {
      return task.id !== taskId;
    });
  }

  function clearCompletedTasks(tasks) {
    const current = Array.isArray(tasks) ? tasks : [];
    return current.filter(function (task) {
      return !task.completed;
    });
  }

  function loadTasks(storage) {
    const store = storage || (typeof localStorage !== "undefined" ? localStorage : null);
    if (!store) return [];
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function saveTasks(tasks, storage) {
    const store = storage || (typeof localStorage !== "undefined" ? localStorage : null);
    if (!store) return false;
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(tasks) ? tasks : []));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function getSampleTasks(referenceDate) {
    const ref = referenceDate instanceof Date ? referenceDate : new Date();
    const samples = [
      {
        title: "DevOps Bireysel Proje ve Pano Teslimi",
        course: "Yazılım Geliştirme ve DevOps",
        type: "Proje",
        dueDate: addDaysToDate(ref, 1),
        priority: "high",
        notes: "GitHub Projects panosu, 2 çalışan özellik ve README bağlantıları kontrol edilecek.",
        completed: false,
      },
      {
        title: "SQL Normalizasyon ve Sorgu Optimizasyonu",
        course: "Veritabanı Yönetim Sistemleri",
        type: "Ödev",
        dueDate: addDaysToDate(ref, -2),
        priority: "high",
        notes: "3NF şema diyagramı ve örnek sorgular PDF olarak yüklenecek.",
        completed: false,
      },
      {
        title: "Ara Sınav (Konular: Süreç Yönetimi ve Bellek)",
        course: "İşletim Sistemleri",
        type: "Sınav",
        dueDate: addDaysToDate(ref, 3),
        priority: "high",
        notes: "Deadlock ve sayfalama algoritmaları tekrar edilecek.",
        completed: false,
      },
      {
        title: "REST API Tasarımı Lab Raporu",
        course: "Web Programlama",
        type: "Ödev",
        dueDate: addDaysToDate(ref, 7),
        priority: "medium",
        notes: "Postman koleksiyonu ve durum kodları dokümanı eklenecek.",
        completed: false,
      },
      {
        title: "Zaman Karmaşıklığı Çalışma Kağıdı",
        course: "Algoritma Analizi",
        type: "Ödev",
        dueDate: addDaysToDate(ref, -1),
        priority: "low",
        notes: "Big-O örnek soruları tamamlandı ve sisteme yüklendi.",
        completed: true,
      },
    ];

    return samples.map(function (item) {
      return createTask(item, ref);
    });
  }

  return {
    STORAGE_KEY,
    TASK_TYPES,
    PRIORITIES,
    toISODateString,
    addDaysToDate,
    isValidISODate,
    formatTurkishDate,
    getPriorityMeta,
    validateTaskInput,
    createTask,
    addTask,
    toggleTaskCompleted,
    deleteTask,
    clearCompletedTasks,
    loadTasks,
    saveTasks,
    getSampleTasks,
  };
});
