import { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";
import { importFromUrl, exportToUrl } from "../utils/urlState";
import { TestCases, Settings, Randomizer } from "../types";

interface AppState {
  testCases: TestCases;
  settings: Settings;
  randomizer?: Randomizer;
}

export function useUrlState(
  initialState: AppState
): [AppState, Dispatch<SetStateAction<AppState>>, boolean, string | null] {
  // Track if we initialized from URL
  const initializedFromUrl = useRef(false);
  const [state, setState] = useState<AppState>(() => {
    const urlState = importFromUrl();
    if (urlState) {
      initializedFromUrl.current = true;
      return urlState;
    }
    return initialState;
  });
  const debounceRef = useRef<number | null>(null);

  // On state change: update URL (debounced)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      exportToUrl(state.testCases, state.settings, state.randomizer);
    }, 400);
    // eslint-disable-next-line
  }, [state]);

  // Never allow default to overwrite after first init
  // (No-op, as we never setState to initialState after init)

  // Always return loading=false, error=null
  return [state, setState, false, null];
} 