// Serialization and deserialization utilities for app state
import { Graph, TestCase, TestCases, Settings, Randomizer } from "../types";

// --- Graph ---
export function serializeGraph(graph: Graph) {
  return {
    ...graph,
    adj: Object.fromEntries(graph.adj),
    rev: Object.fromEntries(graph.rev),
    edgeLabels: Object.fromEntries(graph.edgeLabels),
    nodeLabels: Object.fromEntries(graph.nodeLabels),
  };
}

export function deserializeGraph(data: unknown): Graph {
  const d = data as Record<string, unknown>;
  return {
    ...(d as Omit<Graph, "adj" | "rev" | "edgeLabels" | "nodeLabels">),
    adj: new Map(Object.entries(d.adj as Record<string, string[]>)),
    rev: new Map(Object.entries(d.rev as Record<string, string[]>)),
    edgeLabels: new Map(Object.entries(d.edgeLabels as Record<string, string>)),
    nodeLabels: new Map(Object.entries(d.nodeLabels as Record<string, string>)),
  };
}

// --- TestCase ---
export function serializeTestCase(testCase: TestCase) {
  return {
    ...testCase,
    graphEdges: serializeGraph(testCase.graphEdges),
    graphParChild: serializeGraph(testCase.graphParChild),
  };
}

export function deserializeTestCase(data: unknown): TestCase {
  const d = data as Record<string, unknown>;
  return {
    ...(d as Omit<TestCase, "graphEdges" | "graphParChild">),
    graphEdges: deserializeGraph(d.graphEdges),
    graphParChild: deserializeGraph(d.graphParChild),
  };
}

// --- TestCases (Map<number, TestCase>) ---
export function serializeTestCases(testCases: TestCases) {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of testCases.entries()) {
    obj[k] = serializeTestCase(v);
  }
  return obj;
}

export function deserializeTestCases(data: unknown): TestCases {
  const d = data as Record<string, unknown>;
  const map = new Map<number, TestCase>();
  for (const k in d) {
    map.set(Number(k), deserializeTestCase(d[k]));
  }
  return map;
}

// --- App State ---
export function serializeAppState(
  testCases: TestCases,
  settings: Settings,
  randomizer?: Randomizer
) {
  return {
    testCases: serializeTestCases(testCases),
    settings,
    randomizer,
  };
}

export function deserializeAppState(data: unknown) {
  const d = data as Record<string, unknown>;
  return {
    testCases: deserializeTestCases(d.testCases),
    settings: d.settings as Settings,
    randomizer: d.randomizer as Randomizer,
  };
} 