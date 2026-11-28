import { translate, normalizeLocale } from "./i18n.js";
import {
  createNode, createTask, emptyData, buildChildrenIndex, getNodeProgress,
  removeNodeBranch, NODE_TYPES, STATUSES, PRIORITIES,
} from "./model.js";
import {
  makeCsv, readAndValidateJsonFile, MAX_TASKS_PER_NODE, MAX_TOTAL_TASKS, MAX_NODES, MAX_DEPTH,
} from "./security.js";
import { loadData, saveData, loadLocale, saveLocale, clearData } from "./storage.js";

const root = document.querySelector("#app");
const loaded = loadData();
const state = {
  data: loaded.data,
  selectedId: loaded.data.nodes[0]?.id ?? null,
  expanded: new Set(loaded.data.nodes.filter((node) => node.parentId === null).map((node) => node.id)),
  query: "", statusFilter: "all", locale: normalizeLocale(loadLocale()),
  saveState: loaded.error ? "failed" : "saved", toast: loaded.migrated ? "migration" : "",
};
let saveTimer = null;
let childrenIndex = buildChildrenIndex(state.data.nodes);
let progressCache = new Map();

const t = (key) => translate(state.locale, key);
const byId = (id) => state.data.nodes.find((node) => node.id === id) ?? null;
const childrenOf = (id) => childrenIndex.get(id ?? null) ?? [];
const progressOf = (node) => getNodeProgress(node, childrenIndex, progressCache);
function rebuildIndexes() {
  childrenIndex = buildChildrenIndex(state.data.nodes);
  progressCache = new Map();
}

function element(tag, className = "", text = undefined) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}

function button(label, className, handler, title = "") {
  const node = element("button", className, label);
  node.type = "button";
  if (title) node.title = title;
  node.addEventListener("click", handler);
  return node;
}

function optionSelect(options, value, onChange, className = "field") {
  const select = element("select", className);
  for (const [optionValue, label] of options) {
    const option = element("option", "", label);
    option.value = optionValue;
    option.selected = optionValue === value;
    select.append(option);
  }
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

function labelField(caption, control) {
  const wrap = element("label", "field-wrap");
  wrap.append(element("span", "field-label", caption), control);
  return wrap;
}

function markDirty() {
  state.saveState = "saving";
  renderSaveStatus();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const result = saveData(state.data);
    state.saveState = result.ok ? "saved" : "failed";
    renderSaveStatus();
    if (!result.ok) showToast(t("saveFailed"));
  }, 350);
}

function renderSaveStatus() {
  const node = document.querySelector("#save-status");
  if (!node) return;
  node.textContent = state.saveState === "saved" ? t("saveSaved") : state.saveState === "saving" ? t("saveSaving") : t("saveFailed");
  node.dataset.state = state.saveState;
}

function showToast(message) {
  state.toast = message;
  const area = document.querySelector("#toast");
  if (area) area.textContent = message;
}

function addRoot() {
  if (state.data.nodes.length >= MAX_NODES) { showToast(t("nodeLimit")); return; }
  const title = window.prompt(t("promptGoal"));
  if (!title?.trim()) return;
  const node = createNode(title.trim());
  state.data.nodes.push(node);
  state.selectedId = node.id;
  state.expanded.add(node.id);
  markDirty();
  render();
}

function addChild(parentId) {
  if (state.data.nodes.length >= MAX_NODES) { showToast(t("nodeLimit")); return; }
  let depth = 0;
  let cursor = byId(parentId);
  while (cursor?.parentId) { depth += 1; cursor = byId(cursor.parentId); }
  if (depth >= MAX_DEPTH) { showToast(t("depthLimit")); return; }
  const title = window.prompt(t("promptSubgoal"));
  if (!title?.trim()) return;
  const node = createNode(title.trim(), parentId, "task");
  state.data.nodes.push(node);
  state.expanded.add(parentId);
  state.selectedId = node.id;
  markDirty();
  render();
}

function updateNode(id, patch) {
  const node = byId(id);
  if (!node) return;
  Object.assign(node, patch, { updatedAt: new Date().toISOString() });
  markDirty();
  render();
}

function deleteBranch(id) {
  if (!window.confirm(t("deleteConfirm"))) return;
  state.data.nodes = removeNodeBranch(state.data.nodes, id);
  if (state.selectedId && !byId(state.selectedId)) state.selectedId = null;
  state.expanded.delete(id);
  markDirty();
  render();
}

function addTask(nodeId, input) {
  const title = input.value.trim();
  if (!title) return;
  const node = byId(nodeId);
  if (!node) return;
  const totalTasks = state.data.nodes.reduce((sum, entry) => sum + entry.tasks.length, 0);
  if (node.tasks.length >= MAX_TASKS_PER_NODE || totalTasks >= MAX_TOTAL_TASKS) {
    showToast(t("taskLimit"));
    return;
  }
  node.tasks.push(createTask(title));
  input.value = "";
  markDirty();
  render();
}

function downloadFile(filename, contents, mime) {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = element("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(t("exportDone"));
}

function exportJson() {
  const payload = {
    app: "goalgraph", version: 2, exportedAt: new Date().toISOString(),
    nodes: state.data.nodes,
  };
  downloadFile("goalgraph-backup.json", JSON.stringify(payload, null, 2), "application/json");
}

function exportCsv() {
  downloadFile("goalgraph-summary.csv", makeCsv(state.data), "text/csv");
}

async function importJson(file) {
  try {
    const imported = await readAndValidateJsonFile(file);
    if (!window.confirm(t("importConfirm"))) return;
    state.data = imported;
    state.selectedId = imported.nodes[0]?.id ?? null;
    state.expanded = new Set(imported.nodes.filter((node) => node.parentId === null).map((node) => node.id));
    markDirty();
    render();
    showToast(t("importSuccess"));
  } catch (error) {
    const message = error?.message === "file-too-large" ? t("fileTooLarge") : error?.message === "invalid-json" ? t("invalidJson") : t("importError");
    showToast(message);
  }
}

function getStats() {
  const nodes = state.data.nodes.filter((node) => node.status !== "archived");
  const tasks = nodes.flatMap((node) => node.tasks);
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: nodes.length,
    done: nodes.filter((node) => node.status === "completed").length,
    open: tasks.filter((task) => !task.done).length,
    overdue: nodes.filter((node) => node.deadline && node.deadline < today && node.status !== "completed").length,
  };
}

function renderHeader() {
  const header = element("header", "topbar");
  const brand = element("div", "brand");
  brand.append(element("div", "brand-mark", "G"));
  const brandText = element("div", "brand-copy");
  brandText.append(element("div", "brand-name", t("appName")), element("div", "brand-tagline", t("tagline")));
  brand.append(brandText);

  const actions = element("div", "top-actions");
  const lang = optionSelect([["kk", "Қазақша"], ["en", "English"], ["ru", "Русский"]], state.locale, (value) => {
    state.locale = normalizeLocale(value);
    saveLocale(state.locale);
    document.documentElement.lang = state.locale;
    render();
  }, "language-select");
  lang.setAttribute("aria-label", t("language"));
  const importInput = element("input", "visually-hidden");
  importInput.type = "file";
  importInput.accept = ".json,application/json";
  importInput.addEventListener("change", () => {
    const file = importInput.files?.[0];
    if (file) void importJson(file);
    importInput.value = "";
  });
  actions.append(
    lang,
    button(t("importJson"), "button button-secondary", () => importInput.click()),
    button(t("exportCsv"), "button button-secondary button-optional", exportCsv),
    button(t("exportJson"), "button button-secondary", exportJson),
    button(t("newGoal"), "button button-primary", addRoot),
    importInput,
  );
  header.append(brand, actions);
  return header;
}

function renderStats() {
  const stats = getStats();
  const section = element("section", "stats-section");
  section.append(element("div", "section-kicker", t("overview")));
  const grid = element("div", "stats-grid");
  const cards = [
    ["total", t("totalGoals"), stats.total],
    ["complete", t("completed"), stats.done],
    ["tasks", t("openTasks"), stats.open],
    ["overdue", t("overdue"), stats.overdue],
  ];
  for (const [kind, label, value] of cards) {
    const card = element("div", `stat-card stat-${kind}`);
    card.append(element("div", "stat-value", value), element("div", "stat-label", label));
    grid.append(card);
  }
  section.append(grid);
  return section;
}

function nodeMatches(node, query, statusFilter) {
  const statusMatch = statusFilter === "all" || node.status === statusFilter;
  if (!query) return statusMatch;
  const haystack = [node.title, node.description, node.notes, ...node.tasks.map((task) => task.title)].join(" ").toLocaleLowerCase();
  return statusMatch && haystack.includes(query.toLocaleLowerCase());
}

function hasMatchingDescendant(node, query, statusFilter) {
  return childrenOf(node.id).some((child) => nodeMatches(child, query, statusFilter) || hasMatchingDescendant(child, query, statusFilter));
}

function renderTreeNode(node, depth = 0) {
  const row = element("div", "tree-row");
  row.setAttribute("data-depth", String(Math.min(depth, 12)));
  const hasChildren = childrenOf(node.id).length > 0;
  const isExpanded = state.expanded.has(node.id) || Boolean(state.query) || state.statusFilter !== "all";
  const card = element("article", `node-card${state.selectedId === node.id ? " is-selected" : ""}`);
  const head = element("div", "node-head");
  const expand = button(hasChildren ? (isExpanded ? "−" : "+") : "·", "expand-button", () => {
    if (isExpanded) state.expanded.delete(node.id); else state.expanded.add(node.id);
    render();
  }, hasChildren ? (isExpanded ? "Collapse" : "Expand") : "No subgoals");
  expand.disabled = !hasChildren;
  const titleButton = button(node.title, "node-title-button", () => { state.selectedId = node.id; render(); });
  const meta = element("div", "node-meta");
  meta.append(
    element("span", `type-pill type-${node.type}`, t(node.type)),
    element("span", `status-pill status-${node.status}`, statusLabel(node.status)),
  );
  const progress = element("progress", "node-progress");
  progress.max = 100;
  progress.value = progressOf(node);
  progress.setAttribute("aria-label", `${t("progress")}: ${progress.value}%`);
  head.append(expand, titleButton, meta, progress);
  const actions = element("div", "node-actions");
  actions.append(
    button("+", "icon-button", () => addChild(node.id), t("addChild")),
    button("×", "icon-button icon-danger", () => deleteBranch(node.id), t("delete")),
  );
  card.append(head, actions);
  card.addEventListener("dblclick", () => { state.selectedId = node.id; render(); });
  row.append(card);

  const wrapper = element("div", "tree-item");
  wrapper.append(row);
  if (hasChildren && isExpanded) {
    const children = element("div", "tree-children");
    for (const child of childrenOf(node.id)) {
      if (state.query || state.statusFilter !== "all") {
        if (!nodeMatches(child, state.query, state.statusFilter) && !hasMatchingDescendant(child, state.query, state.statusFilter)) continue;
      }
      children.append(renderTreeNode(child, depth + 1));
    }
    wrapper.append(children);
  }
  return wrapper;
}

function statusLabel(status) {
  return status === "completed" ? t("completedStatus") : t(status);
}

function renderPlan() {
  const section = element("section", "panel plan-panel");
  const heading = element("div", "panel-heading");
  const title = element("div", "panel-title");
  title.append(element("div", "section-kicker", t("yourPlan")), element("h1", "", t("yourPlan")));
  const controls = element("div", "plan-controls");
  const search = element("input", "field search-field");
  search.type = "search";
  search.placeholder = t("searchPlaceholder");
  search.value = state.query;
  search.addEventListener("input", () => {
    const cursor = search.selectionStart;
    state.query = search.value;
    const tree = document.querySelector("#tree");
    if (tree) {
      const content = buildTreeContent();
      if (!content.childNodes.length) content.append(element("p", "empty-results", t("noResults")));
      tree.replaceChildren(...content.childNodes);
      // Keep search focus while the tree results update.
      const current = document.querySelector(".search-field");
      current?.focus();
      current?.setSelectionRange(cursor, cursor);
    }
  });
  const statuses = [["all", t("allStatuses")], ...STATUSES.map((status) => [status, statusLabel(status)])];
  const filter = optionSelect(statuses, state.statusFilter, (value) => { state.statusFilter = value; render(); }, "field filter-field");
  controls.append(search, filter);
  heading.append(title, controls);
  section.append(heading);

  const tree = element("div", "tree", undefined);
  tree.id = "tree";
  if (!state.data.nodes.length) {
    const empty = element("div", "empty-state");
    empty.append(element("div", "empty-icon", "◎"), element("h2", "", t("emptyTitle")), element("p", "", t("emptyText")), button(t("newGoal"), "button button-primary", addRoot));
    tree.append(empty);
  } else {
    const content = buildTreeContent();
    tree.append(...content.childNodes);
    if (!tree.childNodes.length) tree.append(element("p", "empty-results", t("noResults")));
  }
  section.append(tree);
  return section;
}

function buildTreeContent() {
  const fragment = document.createDocumentFragment();
  const roots = childrenOf(null);
  for (const node of roots) {
    if (state.query || state.statusFilter !== "all") {
      if (!nodeMatches(node, state.query, state.statusFilter) && !hasMatchingDescendant(node, state.query, state.statusFilter)) continue;
    }
    fragment.append(renderTreeNode(node));
  }
  return fragment;
}

function makeInput(value, onChange, className = "field", type = "text") {
  const input = element("input", className);
  input.type = type;
  if (type === "text") input.maxLength = 240;
  input.value = value ?? "";
  input.addEventListener("change", () => onChange(input.value));
  return input;
}

function renderDetails() {
  const panel = element("aside", "panel details-panel");
  const node = byId(state.selectedId);
  if (!node) {
    panel.append(element("div", "section-kicker", t("details")), element("p", "details-empty", t("selectNode")));
    return panel;
  }
  const heading = element("div", "panel-heading details-heading");
  const titleWrap = element("div", "panel-title");
  titleWrap.append(element("div", "section-kicker", t("details")), element("h2", "", node.title));
  heading.append(titleWrap, button("×", "icon-button close-details", () => { state.selectedId = null; render(); }, "Close"));
  panel.append(heading);

  const form = element("div", "details-form");
  const title = makeInput(node.title, (value) => updateNode(node.id, { title: value.trim() || node.title }));
  form.append(labelField(t("title"), title));
  const description = element("textarea", "field textarea");
  description.rows = 3;
  description.maxLength = 5000;
  description.placeholder = t("descriptionPlaceholder");
  description.value = node.description;
  description.addEventListener("change", () => updateNode(node.id, { description: description.value }));
  form.append(labelField(t("description"), description));

  const types = NODE_TYPES.map((type) => [type, t(type)]);
  form.append(labelField(t("type"), optionSelect(types, node.type, (value) => updateNode(node.id, { type: value }))));
  form.append(labelField(t("status"), optionSelect(STATUSES.map((status) => [status, statusLabel(status)]), node.status, (value) => updateNode(node.id, { status: value }))));
  form.append(labelField(t("priority"), optionSelect(PRIORITIES.map((priority) => [priority, t(priority)]), node.priority, (value) => updateNode(node.id, { priority: value }))));
  form.append(labelField(t("deadline"), makeInput(node.deadline, (value) => updateNode(node.id, { deadline: value }), "field", "date")));

  const progressWrap = element("div", "progress-wrap");
  progressWrap.append(element("span", "field-label", `${t("progress")}: ${progressOf(node)}%`));
  const progress = element("progress", "detail-progress");
  progress.max = 100;
  progress.value = progressOf(node);
  progressWrap.append(progress);
  form.append(progressWrap);
  const notes = element("textarea", "field textarea");
  notes.rows = 3;
  notes.maxLength = 5000;
  notes.placeholder = t("notesPlaceholder");
  notes.value = node.notes;
  notes.addEventListener("change", () => updateNode(node.id, { notes: notes.value }));
  form.append(labelField(t("notes"), notes));
  panel.append(form);

  const taskSection = element("section", "task-section");
  const taskHeading = element("div", "task-heading");
  taskHeading.append(element("h3", "", t("tasks")), element("span", "task-count", `${node.tasks.filter((task) => task.done).length}/${node.tasks.length}`));
  taskSection.append(taskHeading);
  if (!node.tasks.length) taskSection.append(element("p", "muted-text", t("noTasks")));
  for (const task of node.tasks) {
    const item = element("div", "task-item");
    const checkbox = element("input", "task-checkbox");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", task.done ? t("taskDone") : t("taskOpen"));
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      node.updatedAt = new Date().toISOString();
      markDirty();
      render();
    });
    const taskTitle = element("span", task.done ? "task-title is-done" : "task-title", task.title);
    item.append(checkbox, taskTitle, button("×", "icon-button task-remove", () => {
      node.tasks = node.tasks.filter((entry) => entry.id !== task.id);
      markDirty();
      render();
    }, t("delete")));
    taskSection.append(item);
  }
  const taskInput = element("input", "field task-input");
  taskInput.placeholder = t("addTaskPlaceholder");
  taskInput.maxLength = 240;
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); addTask(node.id, taskInput); }
  });
  taskSection.append(taskInput);
  panel.append(taskSection);

  const dangerZone = element("div", "danger-zone");
  dangerZone.append(button(t("delete"), "button button-danger", () => deleteBranch(node.id)));
  panel.append(dangerZone);
  return panel;
}

function renderFooter() {
  const footer = element("footer", "footer");
  const left = element("div", "footer-copy");
  left.append(element("div", "footer-label", t("dataSafety")), element("p", "", t("localOnly")), element("p", "footer-note", t("footerLocal")));
  const right = element("div", "footer-actions");
  const saveStatus = element("span", "save-status", t(state.saveState === "saved" ? "saveSaved" : state.saveState === "saving" ? "saveSaving" : "saveFailed"));
  saveStatus.id = "save-status";
  saveStatus.dataset.state = state.saveState;
  right.append(saveStatus, button(t("reset"), "text-button", () => {
    if (!window.confirm(t("confirmReset"))) return;
    state.data = emptyData();
    state.selectedId = null;
    state.expanded.clear();
    const result = clearData();
    state.saveState = result.ok ? "saved" : "failed";
    render();
  }));
  footer.append(left, right);
  return footer;
}

function render() {
  rebuildIndexes();
  document.documentElement.lang = state.locale;
  document.title = `${t("appName")} — ${t("tagline")}`;
  root.replaceChildren(renderHeader(), renderStats());
  const workspace = element("main", "workspace");
  workspace.append(renderPlan(), renderDetails());
  root.append(workspace, renderFooter());
  const toast = element("div", "toast");
  toast.id = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = state.toast === "migration" ? t("migrationDone") : state.toast;
  root.append(toast);
  renderSaveStatus();
}

window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    clearTimeout(saveTimer);
    const result = saveData(state.data);
    state.saveState = result.ok ? "saved" : "failed";
    renderSaveStatus();
    if (!result.ok) showToast(t("saveFailed"));
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector(".search-field")?.focus();
  }
});

window.addEventListener("beforeunload", (event) => {
  if (state.saveState === "saving" || state.saveState === "failed") {
    const result = saveData(state.data);
    if (!result.ok) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
});

render();
