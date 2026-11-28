import { emptyData, NODE_TYPES, PRIORITIES, RECURRING, STATUSES } from "./model.js";

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const MAX_NODES = 5000;
export const MAX_DEPTH = 32;
export const MAX_TASKS_PER_NODE = 200;
export const MAX_TOTAL_TASKS = 20000;
const MAX_TITLE = 240;
const MAX_TEXT = 5000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value, max = MAX_TEXT) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max);
}

function validDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return "";
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? "" : value;
}

function newSafeId(value, used) {
  const candidate = typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : "";
  const randomId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
  let id = candidate && !used.has(candidate) ? candidate : `import_${randomId()}`;
  while (used.has(id)) id = `import_${randomId()}`;
  used.add(id);
  return id;
}

function normalizeTask(task, usedTaskIds) {
  if (!isRecord(task)) return null;
  const title = cleanText(task.title, MAX_TITLE).trim();
  if (!title) return null;
  const possibleId = typeof task.id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(task.id) ? task.id : "";
  const randomId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
  let id = possibleId && !usedTaskIds.has(possibleId) ? possibleId : `task_${randomId()}`;
  while (usedTaskIds.has(id)) id = `task_${randomId()}`;
  usedTaskIds.add(id);
  return {
    id, title, done: task.done === true,
    recurring: RECURRING.includes(task.recurring) ? task.recurring : "none",
    deadline: validDate(task.deadline),
    priority: PRIORITIES.includes(task.priority) ? task.priority : "medium",
  };
}

export function normalizeImportedData(raw) {
  if (!isRecord(raw)) throw new Error("invalid-json");
  const incoming = Array.isArray(raw.nodes) ? raw.nodes : isRecord(raw.nodes) ? Object.values(raw.nodes) : null;
  if (!incoming || incoming.length > MAX_NODES) throw new Error("invalid-json");
  if (incoming.length === 0) return emptyData();

  const usedNodeIds = new Set();
  const usedTaskIds = new Set();
  const sourceNodes = [];
  for (const item of incoming) {
    if (!isRecord(item)) continue;
    const title = cleanText(item.title, MAX_TITLE).trim();
    if (!title) continue;
    const id = newSafeId(item.id, usedNodeIds);
    const tags = Array.isArray(item.tags)
      ? item.tags.slice(0, 30).map((tag) => cleanText(tag, 48).trim()).filter(Boolean)
      : [];
    const tasks = Array.isArray(item.tasks)
      ? item.tasks.slice(0, MAX_TASKS_PER_NODE).map((task) => normalizeTask(task, usedTaskIds)).filter(Boolean)
      : [];
    if (usedTaskIds.size > MAX_TOTAL_TASKS) throw new Error("invalid-json");
    sourceNodes.push({
      id, originalParentId: typeof item.parentId === "string" ? item.parentId : null,
      title,
      type: NODE_TYPES.includes(item.type) ? item.type : "goal",
      description: cleanText(item.description), notes: cleanText(item.notes),
      status: STATUSES.includes(item.status) ? item.status : "not_started",
      priority: PRIORITIES.includes(item.priority) ? item.priority : "medium",
      deadline: validDate(item.deadline),
      progress: Number.isFinite(item.progress) ? Math.max(0, Math.min(100, Math.round(item.progress))) : 0,
      tags, tasks,
      createdAt: typeof item.createdAt === "string" ? item.createdAt.slice(0, 40) : new Date().toISOString(),
      updatedAt: typeof item.updatedAt === "string" ? item.updatedAt.slice(0, 40) : new Date().toISOString(),
    });
  }
  if (!sourceNodes.length) throw new Error("invalid-json");

  const idMap = new Map(sourceNodes.map((node) => [node.id, node]));
  for (const node of sourceNodes) {
    node.parentId = node.originalParentId && idMap.has(node.originalParentId) && node.originalParentId !== node.id
      ? node.originalParentId : null;
    delete node.originalParentId;
  }

  // Break parent cycles and enforce a safe maximum hierarchy depth.
  const parentById = new Map(sourceNodes.map((node) => [node.id, node.parentId]));
  for (const node of sourceNodes) {
    const visited = new Set([node.id]);
    let parentId = node.parentId;
    let depth = 0;
    let cycle = false;
    while (parentId && depth <= MAX_DEPTH) {
      if (visited.has(parentId)) { cycle = true; break; }
      visited.add(parentId);
      parentId = parentById.get(parentId) ?? null;
      depth += 1;
    }
    if (cycle || depth > MAX_DEPTH) node.parentId = null;
  }

  return { ...emptyData(), nodes: sourceNodes };
}

export async function readAndValidateJsonFile(file) {
  if (!file || typeof file.size !== "number") throw new Error("invalid-json");
  if (file.size > MAX_IMPORT_BYTES) throw new Error("file-too-large");
  const text = await file.text();
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) throw new Error("file-too-large");
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new Error("invalid-json"); }
  return normalizeImportedData(parsed);
}

export function safeCsvCell(value) {
  let text = String(value ?? "");
  // Prefix formula-like values with an apostrophe before CSV quoting.
  // This prevents common spreadsheet applications from treating user text as a formula.
  if (/^[\s\u0000-\u001F]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function makeCsv(data) {
  const rows = [["id", "parent_id", "title", "type", "status", "priority", "deadline", "description", "tasks"]];
  for (const node of data.nodes) {
    rows.push([
      node.id, node.parentId ?? "", node.title, node.type, node.status, node.priority,
      node.deadline, node.description,
      node.tasks.map((task) => `${task.done ? "[x]" : "[ ]"} ${task.title}`).join(" | "),
    ]);
  }
  return `\uFEFF${rows.map((row) => row.map(safeCsvCell).join(",")).join("\r\n")}\r\n`;
}
