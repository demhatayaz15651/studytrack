const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../js/core.js");

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  };
}

// --- Görev 1: Temel Görev Yönetimi & Kalıcılık ---

test("validateTaskInput rejects missing required fields with clear Turkish messages", () => {
  const res = Core.validateTaskInput({
    title: "   ",
    course: "",
    type: "Ödev",
    dueDate: "",
    priority: "medium",
  });

  assert.equal(res.valid, false);
  assert.equal(res.errors.length, 3);
  assert.match(res.errors[0], /başlığı/i);
  assert.match(res.errors[1], /Ders adı/i);
  assert.match(res.errors[2], /Teslim tarihi/i);
});

test("addTask creates a normalized task and prepends it to the list", () => {
  const fixedNow = new Date("2026-11-25T10:00:00Z");
  const { task, tasks } = Core.addTask(
    [],
    {
      title: "  DevOps Vize Ödevi  ",
      course: "  Yazılım Geliştirme  ",
      type: "Proje",
      dueDate: "2026-11-26",
      priority: "high",
      notes: "  README güncellenecek ",
    },
    fixedNow
  );

  assert.equal(tasks.length, 1);
  assert.equal(task.title, "DevOps Vize Ödevi");
  assert.equal(task.course, "Yazılım Geliştirme");
  assert.equal(task.type, "Proje");
  assert.equal(task.priority, "high");
  assert.equal(task.notes, "README güncellenecek");
  assert.equal(task.completed, false);
  assert.equal(task.completedAt, null);
});

test("toggleTaskCompleted toggles completion status and timestamp", () => {
  const { task, tasks } = Core.addTask([], {
    title: "SQL Ödevi",
    course: "Veritabanı",
    type: "Ödev",
    dueDate: "2026-12-01",
    priority: "medium",
  });

  const completedList = Core.toggleTaskCompleted(tasks, task.id);
  assert.equal(completedList[0].completed, true);
  assert.ok(completedList[0].completedAt);

  const reopenedList = Core.toggleTaskCompleted(completedList, task.id);
  assert.equal(reopenedList[0].completed, false);
  assert.equal(reopenedList[0].completedAt, null);
});

test("deleteTask removes only the matching task", () => {
  let state = Core.addTask([], {
    title: "Görev 1",
    course: "Ders A",
    type: "Ödev",
    dueDate: "2026-12-01",
    priority: "low",
  });
  const firstId = state.task.id;

  state = Core.addTask(state.tasks, {
    title: "Görev 2",
    course: "Ders B",
    type: "Sınav",
    dueDate: "2026-12-05",
    priority: "high",
  });

  const remaining = Core.deleteTask(state.tasks, firstId);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].title, "Görev 2");
});

test("saveTasks and loadTasks persist and restore tasks via storage", () => {
  const storage = createMemoryStorage();
  const samples = Core.getSampleTasks(new Date("2026-11-25T12:00:00Z"));

  assert.equal(Core.saveTasks(samples, storage), true);
  const loaded = Core.loadTasks(storage);
  assert.equal(loaded.length, samples.length);
  assert.equal(loaded[0].title, samples[0].title);
});

// --- Görev 2: Filtreleme, Sıralama ve Yaklaşan Teslim Tarihi Uyarıları ---

test("getDeadlineStatus classifies overdue, today, urgent, upcoming, and completed tasks", () => {
  const ref = new Date(2026, 10, 25, 14, 0, 0); // 25 Kasım 2026

  const overdue = Core.getDeadlineStatus({ dueDate: "2026-11-23", completed: false }, ref);
  assert.equal(overdue.status, "overdue");
  assert.equal(overdue.daysRemaining, -2);
  assert.equal(overdue.label, "2 gün gecikti");

  const today = Core.getDeadlineStatus({ dueDate: "2026-11-25", completed: false }, ref);
  assert.equal(today.status, "urgent");
  assert.equal(today.daysRemaining, 0);
  assert.match(today.label, /Bugün/i);

  const urgent = Core.getDeadlineStatus({ dueDate: "2026-11-28", completed: false }, ref);
  assert.equal(urgent.status, "urgent");
  assert.equal(urgent.daysRemaining, 3);

  const upcoming = Core.getDeadlineStatus({ dueDate: "2026-12-02", completed: false }, ref);
  assert.equal(upcoming.status, "upcoming");
  assert.equal(upcoming.daysRemaining, 7);

  const done = Core.getDeadlineStatus({ dueDate: "2026-11-20", completed: true }, ref);
  assert.equal(done.status, "completed");
});

test("filterAndSortTasks filters by status, course, type, and Turkish case-insensitive search", () => {
  const ref = new Date(2026, 10, 25, 12, 0, 0);
  const samples = Core.getSampleTasks(ref);

  const overdueOnly = Core.filterAndSortTasks(samples, { status: "overdue" }, ref);
  assert.equal(overdueOnly.length, 1);
  assert.match(overdueOnly[0].title, /SQL/);

  const urgentOnly = Core.filterAndSortTasks(samples, { status: "urgent" }, ref);
  assert.equal(urgentOnly.length, 2);

  const byCourse = Core.filterAndSortTasks(
    samples,
    { course: "İşletim Sistemleri" },
    ref
  );
  assert.equal(byCourse.length, 1);
  assert.equal(byCourse[0].type, "Sınav");

  const bySearch = Core.filterAndSortTasks(samples, { search: "İŞLETİM" }, ref);
  assert.equal(bySearch.length, 1);
  assert.equal(bySearch[0].course, "İşletim Sistemleri");

  const byType = Core.filterAndSortTasks(samples, { type: "Proje" }, ref);
  assert.equal(byType.length, 1);
  assert.match(byType[0].title, /DevOps/);
});

test("filterAndSortTasks sorts active tasks by nearest due date and keeps completed tasks last", () => {
  const ref = new Date(2026, 10, 25, 12, 0, 0);
  const samples = Core.getSampleTasks(ref);

  const sorted = Core.filterAndSortTasks(samples, { sortBy: "dueDateAsc" }, ref);
  assert.equal(sorted[0].completed, false);
  assert.equal(sorted[sorted.length - 1].completed, true);
  // First pending task should be the overdue SQL task (-2 days)
  assert.match(sorted[0].title, /SQL/);
});

test("computeSummaryStats accurately summarizes counts and completion rate", () => {
  const ref = new Date(2026, 10, 25, 12, 0, 0);
  const samples = Core.getSampleTasks(ref);

  const stats = Core.computeSummaryStats(samples, ref);
  assert.deepEqual(stats, {
    total: 5,
    pending: 4,
    completed: 1,
    overdue: 1,
    urgent: 2,
    completionRate: 20,
  });
});

test("getUniqueCourses returns sorted distinct course list", () => {
  const ref = new Date(2026, 10, 25, 12, 0, 0);
  const samples = Core.getSampleTasks(ref);
  const courses = Core.getUniqueCourses(samples);

  assert.equal(courses.length, 5);
  assert.equal(courses[0], "Algoritma Analizi");
});
