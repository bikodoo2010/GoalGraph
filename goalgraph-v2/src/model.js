export const NODE_TYPES = ["goal", "skill", "topic", "project", "task", "habit", "milestone"];
export const STATUSES = ["not_started", "in_progress", "completed", "blocked", "archived"];
export const PRIORITIES = ["low", "medium", "high"];
export const RECURRING = ["none", "daily", "weekly", "monthly"];

export function makeId(prefix = "n") {
  const token = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}_${token}`;
}

export function createNode(title, parentId = null, type = "goal") {
  const now = new Date().toISOString();
  return {
    id: makeId(), parentId, title: String(title).slice(0, 240), type,
    description: "", notes: "", status: "not_started", priority: "medium",
    deadline: "", progress: 0, tags: [], tasks: [], createdAt: now, updatedAt: now,
  };
}

export function createTask(title) {
  return { id: makeId("t"), title: String(title).slice(0, 240), done: false, recurring: "none", deadline: "", priority: "medium" };
}

export function emptyData() {
  return { schemaVersion: 2, nodes: [] };
}

export function getChildren(nodes, parentId = null) {
  return nodes.filter((node) => node.parentId === parentId);
}

export function buildChildrenIndex(nodes) {
  const index = new Map();
  for (const node of nodes) {
    const key = node.parentId ?? null;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(node);
  }
  return index;
}

export function getNodeProgress(node, childrenIndex, cache = new Map()) {
  if (cache.has(node.id)) return cache.get(node.id);
  let result;
  if (node.tasks.length) {
    const oneOff = node.tasks.filter((task) => task.recurring === "none");
    if (oneOff.length) result = Math.round((oneOff.filter((task) => task.done).length / oneOff.length) * 100);
  }
  if (result === undefined) {
    const children = (childrenIndex.get(node.id) ?? []).filter((child) => child.status !== "archived");
    result = children.length
      ? Math.round(children.reduce((sum, child) => sum + getNodeProgress(child, childrenIndex, cache), 0) / children.length)
      : Math.max(0, Math.min(100, Number(node.progress) || 0));
  }
  cache.set(node.id, result);
  return result;
}

export function removeNodeBranch(nodes, rootId) {
  const removed = new Set([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) {
      if (node.parentId && removed.has(node.parentId) && !removed.has(node.id)) {
        removed.add(node.id);
        changed = true;
      }
    }
  }
  return nodes.filter((node) => !removed.has(node.id));
}

export function flattenVisible(nodes, expanded, parentId = null, depth = 0) {
  if (depth > 32) return [];
  const result = [];
  for (const node of getChildren(nodes, parentId)) {
    result.push({ node, depth });
    if (expanded.has(node.id)) result.push(...flattenVisible(nodes, expanded, node.id, depth + 1));
  }
  return result;
}
