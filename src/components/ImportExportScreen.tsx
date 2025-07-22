import { Settings } from "../types";
import { useState, useEffect } from "react";

interface Props {
  settings: Settings;
  setImportExport: React.Dispatch<React.SetStateAction<boolean>>;
  currentGraphData: string;
  onImportData: (data: string) => void;
}

const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Escape") {
    e.currentTarget.blur();
  }
};

export function ImportExportScreen({
  settings,
  setImportExport,
  currentGraphData,
  onImportData,
}: Props) {
  const [textareaValue, setTextareaValue] = useState(currentGraphData);

  // Update textarea value when currentGraphData changes
  useEffect(() => {
    setTextareaValue(currentGraphData);
  }, [currentGraphData]);

  // Trigger processGraphInput when modal opens to ensure data is up to date
  useEffect(() => {
    const edgeInputsContainer = document.querySelector('[id^="edgeInputs"]') as HTMLDivElement;
    if (edgeInputsContainer) {
      const firstInput = edgeInputsContainer.querySelector("input") as HTMLInputElement;
      if (firstInput) {
        const event = new Event('input', { bubbles: true });
        firstInput.dispatchEvent(event);
      }
    }
  }, []);

  return (
    <>
      <div
        className="absolute w-full h-full bg-ovr-darkened bg-opacity-80 z-50
          flex font-jetbrains"
        onClick={() => setImportExport(false)}
      >
        <div
          className={`font-jetbrains flex flex-col border-2 rounded-lg bg-block
            shadow-shadow shadow border-border hover:border-border-hover p-3
            space-y-3 w-150 m-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center">
            <h4 className="text-base font-semibold">
              {settings.language == "en"
                ? "Import/Export Graph Data"
                : "导入/导出图数据"}
            </h4>
            <button
              className="bg-clear-normal hover:bg-clear-hover active:bg-clear-active 
                inline rounded-md px-2 py-1 text-sm"
              onClick={() => setImportExport(false)}
            >
              ✕
            </button>
          </div>

          <hr className="border-dashed border-border" />

          <div className="flex-col space-y-3">
            <div>
              <label className="text-sm opacity-70">
                {settings.language == "en"
                  ? "Graph Data (one edge per line, format: node1 node2 [label])"
                  : "图数据 (每行一条边，格式: 节点1 节点2 [标签])"}
              </label>
              <textarea
                className="w-full h-64 bg-ovr-darkened rounded-md p-2 
                  font-jetbrains text-sm border border-border focus:border-border-active 
                  focus:outline-none resize-none"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                onKeyDown={handleTextAreaKeyDown}
                placeholder={
                  settings.language == "en"
                    ? "1 2\n2 3\n3 1 label1\n..."
                    : "1 2\n2 3\n3 1 标签1\n..."
                }
              />
            </div>

            <div className="flex justify-between space-x-2">
              <button
                className="bg-clear-normal hover:bg-clear-hover active:bg-clear-active 
                  inline rounded-md px-3 py-1 text-sm flex-1"
                onClick={() => {
                  onImportData(textareaValue);
                  setImportExport(false);
                }}
              >
                {settings.language == "en" ? "Import" : "导入"}
              </button>
              <button
                className="bg-clear-normal hover:bg-clear-hover active:bg-clear-active 
                  inline rounded-md px-3 py-1 text-sm flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(textareaValue);
                }}
              >
                {settings.language == "en" ? "Copy" : "复制"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 