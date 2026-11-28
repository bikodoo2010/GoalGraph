import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeImportedData, safeCsvCell, makeCsv, readAndValidateJsonFile, MAX_IMPORT_BYTES, MAX_TOTAL_TASKS,
} from "../src/security.js";
import { buildChildrenIndex, getNodeProgress, removeNodeBranch } from "../src/model.js";
import { translate } from "../src/i18n.js";

const oldBackup = {
  app: "goalgraph", version: 1,
  nodes: {
    root: { id: "root", title: "Study", type: "goal", status: "in_progress", tasks: [{ id: "t1", title: "=1+1", done: false }] },
    child: { id: "child", title: "Algorithms", type: "topic", parentId: "root" },
  },
  edges: [],
};

test("imports previous GoalGraph JSON structure", () => {
  const data = normalizeImportedData(oldBackup);
  assert.equal(data.nodes.length, 2);
  assert.equal(data.nodes.find((node) => node.id === "child").parentId, "root");
});

test("accepts an empty V2 backup", () => {
  assert.deepEqual(normalizeImportedData({ app: "goalgraph", version: 2, nodes: [] }).nodes, []);
});

test("breaks imported hierarchy cycles", () => {
  const data = normalizeImportedData({ nodes: [
    { id: "a", title: "A", parentId: "b" },
    { id: "b", title: "B", parentId: "a" },
  ] });
  assert.ok(data.nodes.every((node) => node.parentId === null));
});

test("normalizes dangerous or invalid fields", () => {
  const data = normalizeImportedData({ nodes: [{
    id: "node-1", title: " <script>alert(1)</script> ", type: "made-up", status: "admin", priority: "urgent", deadline: "2026-02-31",
  }] });
  assert.equal(data.nodes[0].title, "<script>alert(1)</script>");
  assert.equal(data.nodes[0].type, "goal");
  assert.equal(data.nodes[0].status, "not_started");
  assert.equal(data.nodes[0].priority, "medium");
  assert.equal(data.nodes[0].deadline, "");
});

test("neutralizes spreadsheet formula-leading CSV values", () => {
  for (const value of ["=1+1", "+SUM(A1:A2)", "-cmd", "@SUM(1)", "  =HYPERLINK(\"https://example.com\")"]) {
    assert.ok(safeCsvCell(value).startsWith("\"'"));
  }
  const csv = makeCsv(normalizeImportedData({ nodes: [{ id: "x", title: "=1+1" }] }));
  assert.ok(!csv.includes('"=1+1"'));
});

test("rejects oversized files before reading contents", async () => {
  const file = { size: MAX_IMPORT_BYTES + 1, text: async () => { throw new Error("must not read"); } };
  await assert.rejects(readAndValidateJsonFile(file), /file-too-large/);
});

test("calculates progress and removes a whole subtree", () => {
  const data = normalizeImportedData({ nodes: [
    { id: "root", title: "Root" },
    { id: "child", title: "Child", parentId: "root", tasks: [{ id: "t", title: "Read", done: true }] },
  ] });
  const index = buildChildrenIndex(data.nodes);
  assert.equal(getNodeProgress(data.nodes[0], index), 100);
  assert.deepEqual(removeNodeBranch(data.nodes, "root"), []);
});

test("contains all three interface translations", () => {
  assert.equal(translate("kk", "newGoal"), "Жаңа мақсат");
  assert.equal(translate("ru", "newGoal"), "Новая цель");
  assert.equal(translate("en", "newGoal"), "New goal");
});

test("enforces the total imported task limit", () => {
  const nodes = Array.from({ length: Math.ceil((MAX_TOTAL_TASKS + 1) / 200) }, (_, nodeIndex) => ({
    id: `node${nodeIndex}`, title: `Node ${nodeIndex}`,
    tasks: Array.from({ length: 200 }, (_, taskIndex) => ({ id: `t${nodeIndex}_${taskIndex}`, title: "Task" })),
  }));
  assert.throws(() => normalizeImportedData({ nodes }), /invalid-json/);
});
