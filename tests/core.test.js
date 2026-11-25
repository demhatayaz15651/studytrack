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
