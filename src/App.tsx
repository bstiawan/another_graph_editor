import { InputTabs } from "./components/InputTabs";

import { GraphCanvas } from "./components/GraphCanvas";
import { GraphSettings } from "./components/GraphSettings";

import { InitScreen } from "./components/InitScreen";
import { ImportExportScreen } from "./components/ImportExportScreen";

import { Settings } from "./types";
import { SettingsFormat } from "./types";
import { TestCase, TestCases } from "./types";

import { getDefaultGraph } from "./components/utils";
import { parseGraphInputEdges } from "./components/parseGraphInput";

import { useState } from "react";

function App() {
  const [testCaseNumber, setTestCaseNumber] = useState<number>(0);
  const [currentId, setCurrentId] = useState<number>(0);
  const [testCases, setTestCases] = useState<TestCases>(() => {
    const init = new Map<number, TestCase>();
    init.set(0, {
      graphEdges: getDefaultGraph(),
      graphParChild: getDefaultGraph(),
      inputFormat: "edges",
    });
    return init;
  });

  const [directed, setDirected] = useState<boolean>(
    localStorage.getItem("directed") !== null
      ? localStorage.getItem("directed") === "true"
      : true
  );

  const [tabs, setTabs] = useState<number[]>([0]);
  const [inputs, setInputs] = useState<number[]>([0]);

  const [settings, setSettings] = useState<Settings>({
    language:
      localStorage.getItem("language") !== null
        ? (localStorage.getItem("language")! as "en" | "cn")
        : "en",
    drawMode:
      localStorage.getItem("drawMode") !== null
        ? (localStorage.getItem("drawMode") as "node" | "pen" | "erase")
        : "node",
    expandedCanvas:
      localStorage.getItem("expandedCanvas") !== null
        ? localStorage.getItem("expandedCanvas") === "true"
        : false,
    markBorder:
      localStorage.getItem("markBorder") !== null
        ? (localStorage.getItem("markBorder") as "single" | "double")
        : "double",
    markColor:
      localStorage.getItem("markColor") !== null
        ? Number.parseInt(localStorage.getItem("markColor")!)
        : 1,
    labelOffset:
      localStorage.getItem("labelOffset") !== null
        ? Number.parseInt(localStorage.getItem("labelOffset")!)
        : 0,
    darkMode:
      localStorage.getItem("darkMode") !== null
        ? localStorage.getItem("darkMode") === "true"
        : false,
    nodeRadius:
      localStorage.getItem("nodeRadius") !== null
        ? Number.parseInt(localStorage.getItem("nodeRadius")!)
        : 16,
    fontSize:
      localStorage.getItem("fontSize") !== null
        ? Number.parseInt(localStorage.getItem("fontSize")!)
        : 10,
    nodeBorderWidthHalf:
      localStorage.getItem("nodeBorderWidthHalf") !== null
        ? Number.parseFloat(localStorage.getItem("nodeBorderWidthHalf")!)
        : 1,
    edgeLength:
      localStorage.getItem("edgeLength") !== null
        ? Number.parseFloat(localStorage.getItem("edgeLength")!)
        : 100,
    edgeLabelSeparation:
      localStorage.getItem("edgeLabelSeparation") !== null
        ? Number.parseFloat(localStorage.getItem("edgeLabelSeparation")!)
        : 10,
    penThickness:
      localStorage.getItem("penThickness") !== null
        ? Number.parseFloat(localStorage.getItem("penThickness")!)
        : 1,
    penTransparency:
      localStorage.getItem("penTransparency") !== null
        ? Number.parseFloat(localStorage.getItem("penTransparency")!)
        : 0,
    eraserRadius:
      localStorage.getItem("eraserRadius") !== null
        ? Number.parseFloat(localStorage.getItem("eraserRadius")!)
        : 10,
    testCaseBoundingBoxes:
      localStorage.getItem("testCaseBoundingBoxes") !== null
        ? localStorage.getItem("testCaseBoundingBoxes") === "true"
        : true,
    showComponents:
      localStorage.getItem("showComponents") !== null
        ? localStorage.getItem("showComponents") === "true"
        : true,
    showBridges:
      localStorage.getItem("showBridges") !== null
        ? localStorage.getItem("showBridges") === "true"
        : false,
    showMSTs:
      localStorage.getItem("showMSTs") !== null
        ? localStorage.getItem("showMSTs") === "true"
        : false,
    treeMode:
      localStorage.getItem("treeMode") !== null
        ? localStorage.getItem("treeMode") === "true"
        : false,
    bipartiteMode:
      localStorage.getItem("bipartiteMode") !== null
        ? localStorage.getItem("bipartiteMode") === "true"
        : false,
    lockMode:
      localStorage.getItem("lockMode") !== null
        ? localStorage.getItem("lockMode") === "true"
        : false,
    markedNodes:
      localStorage.getItem("markedNodes") !== null
        ? localStorage.getItem("markedNodes") == "true"
        : true,
    fixedMode:
      localStorage.getItem("fixedMode") !== null
        ? localStorage.getItem("fixedMode") === "true"
        : true,
    multiedgeMode:
      localStorage.getItem("multiedgeMode") !== null
        ? localStorage.getItem("multiedgeMode") === "true"
        : true,
    settingsFormat:
      localStorage.getItem("settingsFormat") !== null
        ? (localStorage.getItem("settingsFormat") as SettingsFormat)
        : "general",
    gridMode:
      localStorage.getItem("gridMode") !== null
        ? localStorage.getItem("gridMode") === "true"
        : false,
    collisionAvoidance:
      localStorage.getItem("collisionAvoidance") !== null
        ? localStorage.getItem("collisionAvoidance") === "true"
        : true,
    collisionStrength:
      localStorage.getItem("collisionStrength") !== null
        ? Number.parseFloat(localStorage.getItem("collisionStrength")!)
        : 0.2,
    minNodeDistance:
      localStorage.getItem("minNodeDistance") !== null
        ? Number.parseFloat(localStorage.getItem("minNodeDistance")!)
        : 1,
  });

  const [init, setInit] = useState<boolean>(false);
  const [importExport, setImportExport] = useState<boolean>(false);

  // Function to get current graph data as multiline text
  const getCurrentGraphData = (): string => {
    const currentTestCase = testCases.get(currentId);
    if (!currentTestCase) return "";
    
    if (currentTestCase.inputFormat === "edges") {
      // Read directly from structured input fields
      const edgeInputsContainer = document.getElementById(`edgeInputs${currentId}`);
      if (edgeInputsContainer) {
        const edgeRows = edgeInputsContainer.querySelectorAll("div");
        const edgeData: string[] = [];
        
        edgeRows.forEach((row) => {
          const inputs = row.querySelectorAll("input");
          if (inputs.length >= 2) {
            const node1 = (inputs[0] as HTMLInputElement).value.trim();
            const node2 = (inputs[1] as HTMLInputElement).value.trim();
            const edgeLabel = inputs.length >= 3 ? (inputs[2] as HTMLInputElement).value.trim() : "";
            
            if (node1 && node2) {
              if (edgeLabel) {
                edgeData.push(`${node1} ${node2} ${edgeLabel}`);
              } else {
                edgeData.push(`${node1} ${node2}`);
              }
            }
          }
        });
        
        return edgeData.join("\n");
      }
      
      // Fallback to hidden textarea if structured inputs not found
      const textarea = document.getElementById(`graphInputEdges${currentId}`) as HTMLTextAreaElement;
      return textarea ? textarea.value : "";
    } else {
      // For parent-child format, combine parent and child arrays
      const parentTextarea = document.getElementById(`graphInputParent${currentId}`) as HTMLTextAreaElement;
      const childTextarea = document.getElementById(`graphInputChild${currentId}`) as HTMLTextAreaElement;
      const labelsTextarea = document.getElementById(`graphInputEdgeLabels${currentId}`) as HTMLTextAreaElement;
      
      const parent = parentTextarea ? parentTextarea.value : "";
      const child = childTextarea ? childTextarea.value : "";
      const labels = labelsTextarea ? labelsTextarea.value : "";
      
      // Convert to edge format
      const parentArray = parent.trim().split(/\s+/);
      const childArray = child.trim().split(/\s+/);
      const labelsArray = labels.trim().split(/\s+/);
      
      let result = "";
      for (let i = 0; i < Math.min(parentArray.length, childArray.length); i++) {
        if (parentArray[i] && childArray[i]) {
          result += `${parentArray[i]} ${childArray[i]}`;
          if (labelsArray[i]) {
            result += ` ${labelsArray[i]}`;
          }
          result += "\n";
        }
      }
      return result.trim();
    }
  };

  // Function to handle importing data
  const handleImportData = (data: string): void => {
    const currentTestCase = testCases.get(currentId);
    if (!currentTestCase) return;
    
    if (currentTestCase.inputFormat === "edges") {
      // Update the hidden textarea
      const textarea = document.getElementById(`graphInputEdges${currentId}`) as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = data;
        
        // Rebuild the structured input fields from the imported data
        const edgeInputsContainer = document.getElementById(`edgeInputs${currentId}`) as HTMLDivElement;
        if (edgeInputsContainer) {
          // Clear existing structured inputs
          edgeInputsContainer.innerHTML = "";
          
          // Parse the imported data and create structured inputs
          const lines = data.trim().split('\n');
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 2) {
              // Create a new row for each edge
              const newRow = document.createElement("div");
              newRow.className = "flex justify-between items-center space-x-2";

              const node1Input = document.createElement("input");
              node1Input.type = "text";
              node1Input.className = "bg-ovr font-semibold font-jetbrains resize-none border-2 rounded-md px-2 py-1 border-single focus:outline-none text-lg border-border focus:border-border-active w-24";
              node1Input.placeholder = "Server";
              node1Input.value = parts[0];
              node1Input.addEventListener("input", () => {
                updateTestCasesFromStructuredInputs(currentId);
              });

              const node2Input = document.createElement("input");
              node2Input.type = "text";
              node2Input.className = "bg-ovr font-semibold font-jetbrains resize-none border-2 rounded-md px-2 py-1 border-single focus:outline-none text-lg border-border focus:border-border-active w-24";
              node2Input.placeholder = "Client";
              node2Input.value = parts[1];
              node2Input.addEventListener("input", () => {
                updateTestCasesFromStructuredInputs(currentId);
              });

              const edgeLabelInput = document.createElement("input");
              edgeLabelInput.type = "text";
              edgeLabelInput.className = "bg-ovr font-semibold font-jetbrains resize-none border-2 rounded-md px-2 py-1 border-single focus:outline-none text-lg border-border focus:border-border-active w-24";
              edgeLabelInput.placeholder = "Service";
              edgeLabelInput.value = parts[2] || "";
              edgeLabelInput.addEventListener("input", () => {
                updateTestCasesFromStructuredInputs(currentId);
              });

              const removeButton = document.createElement("button");
              removeButton.className = "bg-clear-normal hover:bg-clear-hover active:bg-clear-active inline rounded-md px-2 py-1 text-sm";
              removeButton.innerHTML = `
                <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-text w-4 h-4">
                  <path d="M3 6H5H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              `;
              removeButton.title = "Remove Edge";
              removeButton.onclick = () => {
                newRow.remove();
                // Trigger the processGraphInput function
                updateTestCasesFromStructuredInputs(currentId);
              };

              newRow.appendChild(node1Input);
              newRow.appendChild(node2Input);
              newRow.appendChild(edgeLabelInput);
              newRow.appendChild(removeButton);
              edgeInputsContainer.appendChild(newRow);
            }
          });
          
          // If no valid lines, add one empty row
          if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === "")) {
            const newRow = document.createElement("div");
            newRow.className = "flex justify-between items-center space-x-2";

            const node1Input = document.createElement("input");
            node1Input.type = "text";
            node1Input.className = "bg-ovr font-semibold font-jetbrains resize-none border-2 rounded-md px-2 py-1 border-single focus:outline-none text-lg border-border focus:border-border-active w-24";
            node1Input.placeholder = "Server";
            node1Input.addEventListener("input", () => {
              // Trigger the processGraphInput function
              updateTestCasesFromStructuredInputs(currentId);
            });

            const node2Input = document.createElement("input");
            node2Input.type = "text";
            node2Input.className = "bg-ovr font-semibold font-jetbrains resize-none border-2 rounded-md px-2 py-1 border-single focus:outline-none text-lg border-border focus:border-border-active w-24";
            node2Input.placeholder = "Client";
            node2Input.addEventListener("input", () => {
              // Trigger the processGraphInput function
              updateTestCasesFromStructuredInputs(currentId);
            });

            const edgeLabelInput = document.createElement("input");
            edgeLabelInput.type = "text";
            edgeLabelInput.className = "bg-ovr font-semibold font-jetbrains resize-none border-2 rounded-md px-2 py-1 border-single focus:outline-none text-lg border-border focus:border-border-active w-24";
            edgeLabelInput.placeholder = "Service";
            edgeLabelInput.addEventListener("input", () => {
              // Trigger the processGraphInput function
              updateTestCasesFromStructuredInputs(currentId);
            });

            const removeButton = document.createElement("button");
            removeButton.className = "bg-clear-normal hover:bg-clear-hover active:bg-clear-active inline rounded-md px-2 py-1 text-sm";
            removeButton.innerHTML = `
              <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-text w-4 h-4">
                <path d="M3 6H5H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            `;
            removeButton.title = "Remove Edge";
            removeButton.onclick = () => {
              newRow.remove();
              // Trigger the processGraphInput function
              updateTestCasesFromStructuredInputs(currentId);
            };

            newRow.appendChild(node1Input);
            newRow.appendChild(node2Input);
            newRow.appendChild(edgeLabelInput);
            newRow.appendChild(removeButton);
            edgeInputsContainer.appendChild(newRow);
          }
          
          // Trigger processGraphInput directly to update the graph
          setTimeout(() => {
            const firstInput = edgeInputsContainer.querySelector("input") as HTMLInputElement;
            if (firstInput) {
              // Trigger the event to update the graph
              updateTestCasesFromStructuredInputs(currentId);
              // Sort the rows after import
              sortEdgeRows(currentId);
            }
          }, 100); // Increased delay to ensure DOM is fully ready
        }
        
        // Remove the old trigger since we're handling it above
        // const event = new Event('input', { bubbles: true });
        // textarea.dispatchEvent(event);
      }
    } else {
      // For parent-child format, parse the data and update the fields
      const lines = data.trim().split('\n');
      const parentArray: string[] = [];
      const childArray: string[] = [];
      const labelsArray: string[] = [];
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          parentArray.push(parts[0]);
          childArray.push(parts[1]);
          labelsArray.push(parts[2] || "");
        }
      });
      
      const parentTextarea = document.getElementById(`graphInputParent${currentId}`) as HTMLTextAreaElement;
      const childTextarea = document.getElementById(`graphInputChild${currentId}`) as HTMLTextAreaElement;
      const labelsTextarea = document.getElementById(`graphInputEdgeLabels${currentId}`) as HTMLTextAreaElement;
      
      if (parentTextarea) parentTextarea.value = parentArray.join(" ");
      if (childTextarea) childTextarea.value = childArray.join(" ");
      if (labelsTextarea) labelsTextarea.value = labelsArray.join(" ");
      
      // Trigger the processGraphInput function
      if (parentTextarea) {
        updateTestCasesFromStructuredInputs(currentId);
      }
    }
  };

  // Function to sort edge rows alphabetically with animation
  const sortEdgeRows = (inputId: number) => {
    const edgeInputsContainer = document.getElementById(`edgeInputs${inputId}`) as HTMLDivElement;
    if (!edgeInputsContainer) return;

    const rows = Array.from(edgeInputsContainer.children) as HTMLDivElement[];
    if (rows.length <= 1) return; // No need to sort if 1 or fewer rows

    // Track the currently focused element
    const activeElement = document.activeElement as HTMLInputElement;
    let focusedInputIndex = -1;
    let focusedInputType = -1; // 0 = node1, 1 = node2, 2 = edgeLabel

    // Find which input is currently focused
    if (activeElement && activeElement.tagName === 'INPUT') {
      rows.forEach((row, rowIndex) => {
        const inputs = row.querySelectorAll("input");
        inputs.forEach((input, inputIndex) => {
          if (input === activeElement) {
            focusedInputIndex = rowIndex;
            focusedInputType = inputIndex;
          }
        });
      });
    }

    // Create array of row data with their positions
    const rowData = rows.map((row, index) => {
      const inputs = row.querySelectorAll("input");
      const node1 = (inputs[0] as HTMLInputElement)?.value.trim() || "";
      const node2 = (inputs[1] as HTMLInputElement)?.value.trim() || "";
      const edgeLabel = (inputs[2] as HTMLInputElement)?.value.trim() || "";
      
      // Create sortable string (node1 + node2 + edgeLabel)
      const sortString = `${node1} ${node2} ${edgeLabel}`.toLowerCase();
      
      return {
        row,
        sortString,
        originalIndex: index,
        node1,
        node2,
        edgeLabel
      };
    });

    // Sort by the combined string
    rowData.sort((a, b) => a.sortString.localeCompare(b.sortString));

    // Check if sorting is actually needed
    const needsSorting = rowData.some((item, index) => item.originalIndex !== index);
    if (!needsSorting) return;

    // Clear container
    edgeInputsContainer.innerHTML = "";

    // Add rows back in sorted order with animation
    rowData.forEach((item) => {
      const row = item.row;
      
      // Add transition class for smooth animation
      row.style.transition = "all 0.3s ease-in-out";
      row.style.transform = "translateY(0)";
      
      // Add to container
      edgeInputsContainer.appendChild(row);
      
      // Trigger reflow to ensure animation works
      row.offsetHeight;
      
      // Remove transition after animation completes
      setTimeout(() => {
        row.style.transition = "";
      }, 300);
    });

    // Restore focus to the correct input after sorting
    if (focusedInputIndex !== -1 && focusedInputType !== -1) {
      // Find the new position of the row that was focused
      const newRowIndex = rowData.findIndex(item => item.originalIndex === focusedInputIndex);
      if (newRowIndex !== -1) {
        const newRow = edgeInputsContainer.children[newRowIndex] as HTMLDivElement;
        const inputs = newRow.querySelectorAll("input");
        const targetInput = inputs[focusedInputType] as HTMLInputElement;
        if (targetInput) {
          // Restore focus and cursor position
          setTimeout(() => {
            targetInput.focus();
            // Restore cursor to end of text
            const length = targetInput.value.length;
            targetInput.setSelectionRange(length, length);
          }, 50); // Small delay to ensure DOM is ready
        }
      }
    }

    // Re-process graph input after sorting
    updateTestCasesFromStructuredInputs(inputId);
  };

  const updateTestCasesFromStructuredInputs = (inputId: number) => {
    const edgeInputsContainer = document.getElementById(`edgeInputs${inputId}`);
    const hiddenTextarea = document.getElementById(`graphInputEdges${inputId}`) as HTMLTextAreaElement;
    
    if (edgeInputsContainer && hiddenTextarea) {
      const edgeRows = edgeInputsContainer.querySelectorAll("div");
      const edgeData: string[] = [];
      
      edgeRows.forEach((row) => {
        const inputs = row.querySelectorAll("input");
        if (inputs.length >= 2) {
          const node1 = (inputs[0] as HTMLInputElement).value.trim();
          const node2 = (inputs[1] as HTMLInputElement).value.trim();
          const edgeLabel = inputs.length >= 3 ? (inputs[2] as HTMLInputElement).value.trim() : "";
          
          if (node1 && node2) {
            if (edgeLabel) {
              edgeData.push(`${node1} ${node2} ${edgeLabel}`);
            } else {
              edgeData.push(`${node1} ${node2}`);
            }
          }
        }
      });
      
      // Update hidden textarea with collected data
      hiddenTextarea.value = edgeData.join("\n");
      
      // Parse the graph data and update test cases
      const parsedGraph = parseGraphInputEdges("", hiddenTextarea.value, "", inputId);
      
      if (parsedGraph.status !== "BAD") {
        setTestCases((testCases) => {
          const newTestCases = new Map(testCases);
          newTestCases.set(inputId, {
            graphEdges: parsedGraph.graph!,
            graphParChild: newTestCases.get(inputId)!.graphParChild!,
            inputFormat: "edges",
          });
          return newTestCases;
        });
      }
    }
  };

  return (
    <>
      <div
        className={
          settings.darkMode
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
          {settings.language == "en" ? "Changelog" : "更新记录"}
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
                settings.language == "en" ? "text-selected" : "text-text"
              }
              onClick={() => {
                setSettings({ ...settings, language: "en" });
                localStorage.setItem("language", "en");
              }}
            >
              EN
            </button>
            <div>|</div>
            <button
              className={
                settings.language == "cn" ? "text-selected" : "text-text"
              }
              onClick={() => {
                setSettings({ ...settings, language: "cn" });
                localStorage.setItem("language", "cn");
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
            {settings.darkMode ? (
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
            settings={settings}
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

        {importExport ? (
          <ImportExportScreen
            settings={settings}
            setImportExport={setImportExport}
            currentGraphData={getCurrentGraphData()}
            onImportData={handleImportData}
          />
        ) : (
          <></>
        )}

        <InputTabs
          settings={settings}
          tabs={tabs}
          setTabs={setTabs}
          inputs={inputs}
          setInputs={setInputs}
          testCases={testCases}
          setTestCases={setTestCases}
          testCaseNumber={testCaseNumber}
          setTestCaseNumber={setTestCaseNumber}
          currentId={currentId}
          setCurrentId={setCurrentId}
          directed={directed}
          setDirected={setDirected}
          setInit={setInit}
          setImportExport={setImportExport}
        />

        <div className="relative z-0">
          <GraphCanvas
            testCases={testCases}
            directed={directed}
            settings={settings}
            setSettings={setSettings}
            setTestCases={setTestCases}
            currentId={currentId}
          />
        </div>

        {settings.expandedCanvas ? (
          <></>
        ) : (
          <GraphSettings
            directed={directed}
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </div>
    </>
  );
}

export default App;
