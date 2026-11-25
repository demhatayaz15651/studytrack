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

  function toISODateString(date) {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatTurkishDate(isoDate) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
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

  return {
    STORAGE_KEY,
    TASK_TYPES,
    PRIORITIES,
    toISODateString,
    formatTurkishDate,
  };
});
