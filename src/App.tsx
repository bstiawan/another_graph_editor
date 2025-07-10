import { InputTabs } from "./components/InputTabs";

import { GraphCanvas } from "./components/GraphCanvas";
import { GraphSettings } from "./components/GraphSettings";

import { InitScreen } from "./components/InitScreen";
import { RandomizerScreen } from "./components/RandomizerScreen";

import { Settings } from "./types";
import { TestCase, TestCases } from "./types";
import { Randomizer } from "./types";

import { getDefaultGraph } from "./components/utils";

import { useState } from "react";
import { useUrlState } from "./hooks/useUrlState";
import { useState as useReactState } from "react";

// Move these outside the App function
const defaultTestCases = new Map<number, TestCase>();
defaultTestCases.set(0, {
  graphEdges: getDefaultGraph(),
  graphParChild: getDefaultGraph(),
  inputFormat: "edges",
});
const defaultSettings: Settings = {
  language: "en",
  drawMode: "node",
  expandedCanvas: false,
  markBorder: "double",
  markColor: 1,
  labelOffset: 0,
  darkMode: false,
  nodeRadius: 16,
  fontSize: 10,
  nodeBorderWidthHalf: 1,
  edgeLength: 10,
  edgeLabelSeparation: 10,
  penThickness: 1,
  penTransparency: 0,
  eraserRadius: 10,
  testCaseBoundingBoxes: true,
  showComponents: false,
  showBridges: false,
  showMSTs: false,
  treeMode: false,
  bipartiteMode: false,
  lockMode: false,
  markedNodes: false,
  fixedMode: false,
  multiedgeMode: true,
  settingsFormat: "general",
  gridMode: false,
};
const defaultRandomizer: Randomizer = {
  indexing: 0,
  nodeCount: "",
  edgeCount: "",
  connected: false,
  tree: false,
  hasNodeLabel: false,
  nodeLabelMin: "",
  nodeLabelMax: "",
  hasEdgeLabel: false,
  edgeLabelMin: "",
  edgeLabelMax: "",
};

function App() {
  // Remove old useState for testCases, settings, randomizer
  // const [testCases, setTestCases] = useState<TestCases>(...);
  // const [settings, setSettings] = useState<Settings>(...);
  // const [randomizerConfig, setRandomizerConfig] = useState<Randomizer>(...);

  // Default initial state for useUrlState
  const [appState, setAppState, loading, error] = useUrlState({
    testCases: defaultTestCases,
    settings: defaultSettings,
    randomizer: defaultRandomizer,
  });

  // Wrapper for setTestCases
  const setTestCases: React.Dispatch<React.SetStateAction<TestCases>> = (value) => {
    setAppState((prev) => ({
      ...prev,
      testCases: typeof value === "function" ? (value as (prev: TestCases) => TestCases)(prev.testCases) : value,
    }));
  };
  // Wrapper for setSettings
  const setSettings: React.Dispatch<React.SetStateAction<Settings>> = (value) => {
    setAppState((prev) => ({
      ...prev,
      settings: typeof value === "function" ? (value as (prev: Settings) => Settings)(prev.settings) : value,
    }));
  };
  // Wrapper for setRandomizerConfig
  const setRandomizerConfig: React.Dispatch<React.SetStateAction<Randomizer>> = (value) => {
    setAppState((prev) => ({
      ...prev,
      randomizer: typeof value === "function"
        ? (value as (prev: Randomizer) => Randomizer)(prev.randomizer ?? defaultRandomizer)
        : value,
    }));
  };

  // Keep other state as is
  const [testCaseNumber, setTestCaseNumber] = useState<number>(0);
  const [currentId, setCurrentId] = useState<number>(0);
  const [directed, setDirected] = useState<boolean>(false);
  const [tabs, setTabs] = useState<number[]>([0]);
  const [inputs, setInputs] = useState<number[]>([0]);
  const [init, setInit] = useState<boolean>(false);
  const [randomizer, setRandomizer] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useReactState<string | null>(null);

  // Copy URL handler
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess("URL copied!");
      setTimeout(() => setCopySuccess(null), 1500);
    } catch {
      setCopySuccess("Failed to copy");
      setTimeout(() => setCopySuccess(null), 1500);
    }
  };

  // Loading and error UI
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Use appState.testCases, appState.settings, appState.randomizer in the rest of the component
  // Pass setTestCases, setSettings, setRandomizerConfig to children instead of setAppState
  // ... existing code ...

  return (
    <>
      <div
        className={
          appState.settings.darkMode
            ? `dark bg-ovr text-text absolute w-full overflow-scroll
              no-scrollbar`
            : `light bg-ovr text-text absolute w-full overflow-scroll
              no-scrollbar`
        }
      >
        <div
          className="font-jetbrains text-base sm:top-2 lg:top-2 sm:left-2
            lg:left-2 absolute space-x-2 flex border-2 border-border rounded-lg
            px-2 py-1 justify-between items-center hover:border-border-hover
            z-20 bg-block group h-9"
        >
          {appState.settings.language == "en" ? "Changelog" : "更新记录"}
          {/* Copy URL button */}
          <button
            className="ml-2 px-2 py-1 border rounded bg-format-ok text-white hover:bg-format-ok-hover"
            onClick={handleCopyUrl}
            title="Copy current URL to clipboard"
          >
            {appState.settings.language == "en" ? "Copy URL" : "复制链接"}
          </button>
          {copySuccess && (
            <span className="ml-2 text-green-500">{copySuccess}</span>
          )}
          <div
            className="absolute border-2 text-sm px-2 py-1 border-border-hover
              rounded-lg bg-block left-0 top-8 w-100 invisible
              group-hover:visible max-h-28 no-scrollbar overflow-scroll"
          >
            <p>5 June 2025</p>
            <ul className="list-disc list-inside">
              <li>Improve annotation experience</li>
              <li>Add randomizer config</li>
              <li>Add "Init" system</li>
            </ul>
            <hr className="border-dashed border-border" />
            <p>24 Feb 2025</p>
            <ul className="list-disc list-inside">
              <li>Use SVG icons instead</li>
              <li>Adjust layout positioning</li>
            </ul>
            <hr className="border-dashed border-border" />
            <p>8 Feb 2025</p>
            <ul className="list-disc list-inside">
              <li>Add Chinese translations</li>
            </ul>
            <hr className="border-dashed border-border" />
            <p>4 Feb 2025</p>
            <ul className="list-disc list-inside">
              <li>
                Make node background <b>transparent</b> by default
              </li>
              <li>
                Add <b>draw</b> and <b>erase</b> modes
              </li>
            </ul>
            <hr className="border-dashed border-border" />
            <p>9 Dec 2024</p>
            <ul className="list-disc list-inside">
              <li>Add toggle button to expand/shrink canvas</li>
            </ul>
            <hr className="border-dashed border-border" />
            <p>7 Dec 2024</p>
            <ul className="list-disc list-inside">
              <li>
                Add <b>palette</b> to color nodes on click
              </li>
              <li>Allow user to disable marking behavior</li>
            </ul>
            <hr className="border-dashed border-border" />
            <p>6 Dec 2024</p>
            <ul className="list-disc list-inside">
              <li>Add minimum spanning tree(s)</li>
            </ul>
            <hr className="border-dashed border-border" />
            <p>5 Dec 2024</p>
            <ul className="list-disc list-inside">
              <li>Support multiple graphs (aka testcases)</li>
              <li>
                Split settings into <b>general</b> and <b>appearance</b>
              </li>
              <li>
                Add <b>bipartite mode</b>
              </li>
            </ul>
            <hr className="border-dashed border-border" />
            <p>11 Nov 2024</p>
            <ul className="list-disc list-inside">
              <li>
                Add <b>multiedge mode</b> (enabled by default)
              </li>
              <li>
                Add <b>fixed mode</b> (fix/unfix marked nodes)
              </li>
            </ul>
            <hr className="border-dashed border-border" />
            <p>10 Nov 2024</p>
            <ul className="list-disc list-inside">
              <li>Mark/Unmark nodes on click</li>
            </ul>
          </div>
        </div>

        <div
          className="sm:top-2 lg:top-2 sm:right-2 lg:right-2 absolute flex
            space-x-3 font-jetbrains text-base"
        >
          <div
            className="flex space-x-2 border-2 border-border rounded-lg
              justify-between items-center z-20 px-2 h-9"
          >
            <button
              className={
                appState.settings.language == "en" ? "text-selected" : "text-text"
              }
              onClick={() => {
                setSettings((prev) => ({ ...prev, language: "en" }));
              }}
            >
              EN
            </button>
            <div>|</div>
            <button
              className={
                appState.settings.language == "cn" ? "text-selected" : "text-text"
              }
              onClick={() => {
                setSettings((prev) => ({ ...prev, language: "cn" }));
              }}
            >
              中文
            </button>
          </div>
          <a
            className="space-x-2 flex border-2 border-border rounded-lg px-2
              py-1 justify-between items-center hover:border-border-hover z-20
              bg-block h-9"
            href="https://github.com/anAcc22/another_graph_editor"
          >
            {appState.settings.darkMode ? (
              <img
                width={18}
                src="github-mark/github-mark-white.svg"
                alt="Github Logo"
              />
            ) : (
              <img
                width={18}
                src="github-mark/github-mark.svg"
                alt="Github Logo"
              />
            )}
            <div className="ml-2">Github</div>
          </a>
        </div>

        {init ? (
          <InitScreen
            settings={appState.settings}
            setInit={setInit}
            testCaseNumber={testCaseNumber}
            setTestCaseNumber={setTestCaseNumber}
            setTestCases={setTestCases}
            setTabs={setTabs}
            setCurrentId={setCurrentId}
          />
        ) : (
          <></>
        )}

        {randomizer ? (
          <RandomizerScreen
            settings={appState.settings}
            setRandomizer={setRandomizer}
            randomizerConfig={appState.randomizer ?? defaultRandomizer}
            setRandomizerConfig={setRandomizerConfig}
          />
        ) : (
          <></>
        )}

        <InputTabs
          settings={appState.settings}
          tabs={tabs}
          setTabs={setTabs}
          inputs={inputs}
          setInputs={setInputs}
          testCases={appState.testCases}
          setTestCases={setTestCases}
          testCaseNumber={testCaseNumber}
          setTestCaseNumber={setTestCaseNumber}
          currentId={currentId}
          setCurrentId={setCurrentId}
          directed={directed}
          setDirected={setDirected}
          setInit={setInit}
          setRandomizer={setRandomizer}
          randomizerConfig={appState.randomizer ?? defaultRandomizer}
        />

        <div className="relative z-0">
          <GraphCanvas
            testCases={appState.testCases}
            directed={directed}
            settings={appState.settings}
            setSettings={setSettings}
          />
        </div>

        {appState.settings.expandedCanvas ? (
          <></>
        ) : (
          <GraphSettings
            directed={directed}
            settings={appState.settings}
            setSettings={setSettings}
          />
        )}
      </div>
    </>
  );
}

export default App;
