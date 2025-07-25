import { TestCases } from "../types";
import { getDefaultGraph } from "./utils";

export interface EdgesParams {
  roots: string;
  edges: string;
  nodeLabels: string;
}

export interface ParChildParams {
  roots: string;
  parent: string;
  child: string;
  edgeLabels: string;
  nodeLabels: string;
}

export function createTestCase(
  testCaseNumber: number,
  setTestCaseNumber: React.Dispatch<React.SetStateAction<number>>,
  setTestCases: React.Dispatch<React.SetStateAction<TestCases>>,
  setTabs: React.Dispatch<React.SetStateAction<number[]>>,
  setCurrentId: React.Dispatch<React.SetStateAction<number>>,
  edges: EdgesParams | undefined,
  parChild: ParChildParams | undefined,
) {
  const newTabId = testCaseNumber + 1;
  setTestCaseNumber((testCaseNumber) => testCaseNumber + 1);

  setTestCases((testCases) => {
    const newTestCases = new Map(testCases);
    newTestCases.set(newTabId, {
      graphEdges: getDefaultGraph(),
      graphParChild: getDefaultGraph(),
      inputFormat: edges ? "edges" : "parentChild",
    });
    return newTestCases;
  });

  setTabs((tabs) => [...tabs, newTabId]);
  setCurrentId(newTabId);

  if (edges) {
    construct("graphInputRootsEdges", edges.roots, newTabId);
    construct("graphInputEdges", edges.edges, newTabId);
  }

  if (parChild) {
    construct("graphInputRootsParChild", parChild.roots, newTabId);
    construct("graphInputParent", parChild.parent, newTabId);
    construct("graphInputChild", parChild.child, newTabId);
    construct("graphInputEdgeLabels", parChild.edgeLabels, newTabId);
  }
}

function construct(htmlId: string, value: string, newTabId: number) {
  setTimeout(() => {
    const target = document.getElementById(
      htmlId + newTabId,
    ) as HTMLTextAreaElement;
    if (target === null) return;
    target.value = value;
  }, 50);
}
