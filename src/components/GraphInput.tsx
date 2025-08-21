import { Settings, TestCases } from "../types";
import { ParsedGraph } from "../types";
import { parseGraphInputEdges, parseGraphInputParentChild } from "./parseGraphInput";

import { useState, useEffect } from "react";

interface Props {
  settings: Settings;
  key: number;
  testCases: TestCases;
  setTestCases: React.Dispatch<React.SetStateAction<TestCases>>;
  inputId: number;
  currentId: number;
  directed: boolean;
  setDirected: React.Dispatch<React.SetStateAction<boolean>>;
  setImportExport: React.Dispatch<React.SetStateAction<boolean>>;
}

export function GraphInput({
  settings,
  testCases,
  setTestCases,
  inputId,
  currentId,
  directed,
  setDirected,
  setImportExport,
}: Props) {
  const [inputStatus, setInputStatus] = useState<boolean>(true);

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
    processGraphInput();
  };

  const processGraphInput = () => {
    if (testCases.get(inputId) === undefined) return;
    const inputFormat = testCases.get(inputId)!.inputFormat;

    let parsedGraph: ParsedGraph;

    let roots = "";

    if (!directed) {
      roots =
        inputFormat === "edges"
          ? (
              document.getElementById(
                "graphInputRootsEdges" + inputId,
              ) as HTMLTextAreaElement
            ).value
          : (
              document.getElementById(
                "graphInputRootsParChild" + inputId,
              ) as HTMLTextAreaElement
            ).value;
    }

    if (inputFormat === "edges") {
      // Collect data from structured edge inputs and populate hidden textarea
      const edgeInputsContainer = document.getElementById(`edgeInputs${inputId}`);
      const hiddenTextarea = document.getElementById(
        "graphInputEdges" + inputId,
      ) as HTMLTextAreaElement;
      
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
      }

      parsedGraph = parseGraphInputEdges(
        roots,
        (
          document.getElementById(
            "graphInputEdges" + inputId,
          ) as HTMLTextAreaElement
        ).value,
        "",
        inputId,
      );
      if (parsedGraph.status === "BAD") {
        setInputStatus(false);
      } else {
        setInputStatus(true);
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
    } else {
      parsedGraph = parseGraphInputParentChild(
        roots,
        (
          document.getElementById(
            "graphInputParent" + inputId,
          ) as HTMLTextAreaElement
        ).value,
        (
          document.getElementById(
            "graphInputChild" + inputId,
          ) as HTMLTextAreaElement
        ).value,
        (
          document.getElementById(
            "graphInputEdgeLabels" + inputId,
          ) as HTMLTextAreaElement
        ).value,
        "",
        inputId,
      );
      if (parsedGraph.status === "BAD") {
        setInputStatus(false);
      } else {
        setInputStatus(true);
        setTestCases((testCases) => {
          const newTestCases = new Map(testCases);
          newTestCases.set(inputId, {
            graphEdges: newTestCases.get(inputId)!.graphEdges!,
            graphParChild: parsedGraph.graph!,
            inputFormat: "parentChild",
          });
          return newTestCases;
        });
      }
    }
  };

  useEffect(() => {
    setTimeout(() => processGraphInput(), 100);
    
    // Initialize with one edge row for edges format
    if (testCases.get(inputId)?.inputFormat === "edges") {
      const edgeInputsContainer = document.getElementById(`edgeInputs${inputId}`);
      if (edgeInputsContainer && edgeInputsContainer.children.length === 0) {
        addEdgeRow(inputId);
      }
    }
  }, []);

  const handleTextAreaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  };

  const addEdgeRow = (inputId: number) => {
    const edgeInputsContainer = document.getElementById(
      `edgeInputs${inputId}`,
    ) as HTMLDivElement;
    const newRow = document.createElement("div");
    newRow.className = "flex justify-between items-center space-x-2";

    const node1Input = document.createElement("input");
    node1Input.type = "text";
    node1Input.className = "bg-ovr font-semibold font-jetbrains resize-none border-2 rounded-md px-2 py-1 border-single focus:outline-none text-lg border-border focus:border-border-active w-24";
    node1Input.placeholder = "Server";
    node1Input.addEventListener("input", () => {
      processGraphInput();
      // Sort after a short delay to allow the input to be processed
      setTimeout(() => sortEdgeRows(inputId), 100);
    });

    const node2Input = document.createElement("input");
    node2Input.type = "text";
    node2Input.className = "bg-ovr font-semibold font-jetbrains resize-none border-2 rounded-md px-2 py-1 border-single focus:outline-none text-lg border-border focus:border-border-active w-24";
    node2Input.placeholder = "Client";
    node2Input.addEventListener("input", () => {
      processGraphInput();
      // Sort after a short delay to allow the input to be processed
      setTimeout(() => sortEdgeRows(inputId), 100);
    });

    const edgeLabelInput = document.createElement("input");
    edgeLabelInput.type = "text";
    edgeLabelInput.className = "bg-ovr font-semibold font-jetbrains resize-none border-2 rounded-md px-2 py-1 border-single focus:outline-none text-lg border-border focus:border-border-active w-24";
    edgeLabelInput.placeholder = "Service";
    edgeLabelInput.addEventListener("input", () => {
      processGraphInput();
      // Sort after a short delay to allow the input to be processed
      setTimeout(() => sortEdgeRows(inputId), 100);
    });

    const removeButton = document.createElement("button");
    removeButton.className = "bg-clear-normal hover:bg-clear-hover active:bg-clear-active inline rounded-md px-2 py-1 text-sm";
    removeButton.innerHTML = `
      <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-text w-4 h-4">
        <path d="M3 6H5H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    `;
    removeButton.title = settings.language == "en" ? "Remove Edge" : "删除边";
    removeButton.onclick = () => {
      newRow.remove();
      processGraphInput(); // Re-process to update hidden textarea
      // Sort after removal
      setTimeout(() => sortEdgeRows(inputId), 100);
    };

    newRow.appendChild(node1Input);
    newRow.appendChild(node2Input);
    newRow.appendChild(edgeLabelInput);
    newRow.appendChild(removeButton);
    edgeInputsContainer.appendChild(newRow);
    
    // Sort after adding new row
    setTimeout(() => sortEdgeRows(inputId), 100);
    
    // Focus on the first input for better UX
    node1Input.focus();
  };

  return (
    <>
      <li
        className={
          inputId === currentId
            ? `font-jetbrains flex flex-col border-2 rounded-lg bg-block
              shadow-shadow shadow border-border p-3 space-y-3 list-none
              hover:border-border-hover mb-12`
            : "hidden"
        }
      >
        <div className="flex font-light text-sm justify-between">
          <span>
            <span>
              {!directed ? (
                <span className="text-selected p-0 hover:cursor-pointer">
                  {settings.language == "en" ? "Undirected" : "无向"}
                </span>
              ) : (
                <span
                  className="p-0 hover:cursor-pointer"
                  onClick={() => {
                    setDirected(false);
                    localStorage.setItem("directed", "false");
                    const checkbox = document.getElementById(
                      "directedCheckbox" + inputId,
                    ) as HTMLInputElement;
                    checkbox.checked = false;
                  }}
                >
                  {settings.language == "en" ? "Undirected" : "无向"}
                </span>
              )}
            </span>
            <span> | </span>
            <span>
              {directed ? (
                <span className="text-selected p-0 hover:cursor-pointer">
                  {settings.language == "en" ? "Directed" : "有向"}
                </span>
              ) : (
                <span
                  className="p-0 hover:cursor-pointer"
                  onClick={() => {
                    setDirected(true);
                    localStorage.setItem("directed", "true");
                    const checkbox = document.getElementById(
                      "directedCheckbox" + inputId,
                    ) as HTMLInputElement;
                    checkbox.checked = true;
                  }}
                >
                  {settings.language == "en" ? "Directed" : "有向"}
                </span>
              )}
            </span>
          </span>
          <label className="relative inline w-9">
            <input
              onClick={() => {
                const newDirected = !directed;
                setDirected(newDirected);
                localStorage.setItem("directed", newDirected.toString());
              }}
              type="checkbox"
              id={"directedCheckbox" + inputId}
              className="peer invisible"
              defaultChecked={directed}
            />
            <span
              className="absolute top-0 left-0 w-9 h-5 cursor-pointer
                rounded-full bg-toggle-uncheck border-none transition-all
                duration-75 hover:bg-toggle-hover peer-checked:bg-toggle-check"
            ></span>
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 bg-toggle-circle
                rounded-full transition-all duration-75 cursor-pointer
                peer-checked:translate-x-4"
            ></span>
          </label>
        </div>

        <br />

        <h4
          className={
            !directed && testCases.get(inputId)?.inputFormat === "edges"
              ? "text-base font-semibold"
              : "hidden"
          }
        >
          {settings.language == "en" ? "Roots" : "根"}
        </h4>
        <textarea
          wrap="off"
          name="graphInputRootsEdges"
          id={"graphInputRootsEdges" + inputId}
          rows={1}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          className={
            !directed && testCases.get(inputId)?.inputFormat === "edges"
              ? `bg-ovr font-semibold font-jetbrains resize-none border-2
                rounded-md px-2 py-1 border-single focus:outline-none text-lg
                border-border focus:border-border-active w-auto no-scrollbar`
              : "hidden"
          }
        ></textarea>

        <h4
          className={
            !directed && testCases.get(inputId)?.inputFormat === "parentChild"
              ? "text-base font-semibold"
              : "hidden"
          }
        >
          {settings.language == "en" ? "Roots" : "根"}
        </h4>
        <textarea
          wrap="off"
          name="graphInputRootsParChild"
          id={"graphInputRootsParChild" + inputId}
          rows={1}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          className={
            !directed && testCases.get(inputId)?.inputFormat === "parentChild"
              ? `bg-ovr font-semibold font-jetbrains resize-none border-2
                rounded-md px-2 py-1 border-single focus:outline-none text-lg
                border-border focus:border-border-active w-auto no-scrollbar`
              : "hidden"
          }
        ></textarea>

        <h4
          className={
            testCases.get(inputId)?.inputFormat === "edges"
              ? "text-base font-semibold"
              : "hidden"
          }
        >
          {settings.language == "en" ? "Edges" : "边集"}
        </h4>
        
        {/* New structured edges input */}
        <div
          className={
            testCases.get(inputId)?.inputFormat === "edges"
              ? "space-y-2"
              : "hidden"
          }
        >
          {/* Add button row - moved above edge list */}
          <div className="flex justify-between items-center">
            <button
              className="bg-clear-normal hover:bg-clear-hover
                active:bg-clear-active inline rounded-md px-2 py-1 text-sm"
              onClick={() => addEdgeRow(inputId)}
            >
              {settings.language == "en" ? "Add Edge" : "添加边"}
            </button>
          </div>
          
          {/* Edge input rows */}
          <div id={`edgeInputs${inputId}`} className="space-y-2">
            {/* Edge rows will be dynamically added here */}
          </div>
        </div>

        {/* Hidden textarea to maintain compatibility with existing parsing */}
        <textarea
          wrap="off"
          name="graphInputEdges"
          id={"graphInputEdges" + inputId}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          rows={8}
          className="hidden"
        ></textarea>

        <h4
          className={
            testCases.get(inputId)?.inputFormat === "parentChild"
              ? "text-base font-semibold"
              : "hidden"
          }
        >
          {settings.language == "en" ? "Parent Array" : "父节点数组"}
        </h4>
        <textarea
          wrap="off"
          name="graphInputParent"
          id={"graphInputParent" + inputId}
          rows={1}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          className={
            testCases.get(inputId)?.inputFormat === "parentChild"
              ? `bg-ovr font-semibold font-jetbrains resize-none border-2
                rounded-md px-2 py-1 border-single focus:outline-none text-lg
                border-border focus:border-border-active w-auto no-scrollbar`
              : "hidden"
          }
        ></textarea>

        <h4
          className={
            testCases.get(inputId)?.inputFormat === "parentChild"
              ? "text-base font-semibold"
              : "hidden"
          }
        >
          {settings.language == "en" ? "Child Array" : "子节点数组"}
        </h4>
        <textarea
          wrap="off"
          name="graphInputChild"
          id={"graphInputChild" + inputId}
          rows={1}
          defaultValue={"1 2 3 4 5 6 7 8 9"}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          className={
            testCases.get(inputId)?.inputFormat === "parentChild"
              ? `bg-ovr font-semibold font-jetbrains resize-none border-2
                rounded-md px-2 py-1 border-single focus:outline-none text-lg
                border-border focus:border-border-active w-auto no-scrollbar`
              : "hidden"
          }
        ></textarea>

        <h4
          className={
            testCases.get(inputId)?.inputFormat === "parentChild"
              ? "text-base font-semibold"
              : "hidden"
          }
        >
          {settings.language == "en" ? "Edge Labels" : "边标签"}
        </h4>
        <textarea
          wrap="off"
          name="graphInputEdgeLabels"
          id={"graphInputEdgeLabels" + inputId}
          rows={1}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          className={
            testCases.get(inputId)?.inputFormat === "parentChild"
              ? `bg-ovr font-semibold font-jetbrains resize-none border-2
                rounded-md px-2 py-1 border-single focus:outline-none text-lg
                border-border focus:border-border-active w-auto no-scrollbar`
              : "hidden"
          }
        ></textarea>

        <div className="flex justify-between">
          <button
            className="bg-clear-normal hover:bg-clear-hover
              active:bg-clear-active inline rounded-md px-2 py-1"
            onClick={() => {
              if (testCases.get(inputId)?.inputFormat === "edges") {
                // Clear structured edge inputs
                const edgeInputsContainer = document.getElementById(`edgeInputs${inputId}`);
                if (edgeInputsContainer) {
                  edgeInputsContainer.innerHTML = "";
                  // Add one empty row back
                  addEdgeRow(inputId);
                }
                // Also clear hidden textarea
                (
                  document.getElementById(
                    "graphInputEdges" + inputId,
                  ) as HTMLTextAreaElement
                ).value = "";
              } else {
                (
                  document.getElementById(
                    "graphInputParent" + inputId,
                  ) as HTMLTextAreaElement
                ).value = "";
              }
              processGraphInput();
            }}
          >
            {settings.language == "en" ? "Clear" : "清除"}
          </button>
          {inputStatus ? (
            <span
              className="font-jetbrains bg-format-ok rounded-md text-right px-2
                py-1 flex items-center"
            >
              {settings.language == "en" ? "Format ✓" : "格式 ✓"}
            </span>
          ) : (
            <span
              className="font-jetbrains bg-format-bad rounded-md text-right px-2
                py-1 flex items-center"
            >
              {settings.language == "en" ? "Format 𝗫" : "格式 𝗫"}
            </span>
          )}
          <div
            className="bg-randomize hover:bg-randomize-hover rounded-md px-2
              py-1 flex space-x-1.5 items-center"
          >
            <button
              className="hover:opacity-50 active:text-randomize"
              onClick={() => setImportExport(true)}
              title={settings.language == "en" ? "Import/Export" : "导入/导出"}
            >
              <svg
                width="800px"
                height="800px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-text w-4 h-4"
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10L12 15L17 10"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15V3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        {/* randomizerError ? (
          <footer className="text-format-bad-border">
            ERROR: {randomizerError}
          </footer>
        ) : (
          <></>
        ) */}
      </li>
    </>
  );
}
