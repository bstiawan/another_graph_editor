import { Layer, ColorMap, LayerMap } from "../types";

export function buildBipartite(
  nodes: string[],
  adj: Map<string, string[]>,
): [boolean, ColorMap, LayerMap] {
  const colorMap: ColorMap = new Map<string, number>();
  const layerMap: LayerMap = new Map<string, Layer>();
  
  const adjFull = new Map<string, string[]>();

  for (const u of nodes) {
    adjFull.set(u, []);
  }

  for (const u of nodes) {
    const adjU = adj.get(u);
    if (adjU) {
      for (const v of adjU) {
        const adjFullU = adjFull.get(u);
        const adjFullV = adjFull.get(v);
        if (adjFullU && adjFullV) {
          adjFull.set(u, [...adjFullU, v]);
          adjFull.set(v, [...adjFullV, u]);
        }
      }
    }
  }

  let okay = true;

  const dfs = (u: string): void => {
    const adjFullU = adjFull.get(u);
    if (adjFullU) {
      for (const v of adjFullU) {
        if (!colorMap.has(v)) {
          colorMap.set(v, colorMap.get(u) === 1 ? 2 : 1);
          const layerMapU = layerMap.get(u);
          if (layerMapU) {
            layerMap.set(v, [layerMapU[0] === 1 ? 2 : 1, 2]);
          }
          dfs(v);
        } else if (colorMap.get(v) === colorMap.get(u)) {
          okay = false;
        }
      }
    }
  };

  for (const u of nodes) {
    if (!colorMap.has(u)) {
      colorMap.set(u, 1);
      layerMap.set(u, [1, 2]);
      dfs(u);
    }
  }

  return [okay, colorMap, layerMap];
}
