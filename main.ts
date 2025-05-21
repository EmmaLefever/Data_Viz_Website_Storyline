import Graph from "graphology";
import { parse } from "graphology-gexf/browser";
import Sigma from "sigma";
import { EdgeDisplayData, NodeDisplayData } from "sigma/types";

export default () => {
  let renderer: Sigma | null = null;

  // Load external GEXF file:
  fetch("trump4.gexf")
    .then((res) => res.text())
    .then((gexf) => {
      console.log("GEXF file loaded successfully:", gexf);
      console.log("Is parse defined?", typeof parse); // Should be "function"

      const graph = parse(Graph, gexf);
      console.log("Graph parsed successfully:", graph);

      // Retrieve DOM elements:
      const container = document.getElementById("container") as HTMLElement;
      const zoomInBtn = document.getElementById("zoom-in") as HTMLButtonElement;
      const zoomOutBtn = document.getElementById("zoom-out") as HTMLButtonElement;
      const zoomResetBtn = document.getElementById("zoom-reset") as HTMLButtonElement;
      const labelsThresholdRange = document.getElementById("labels-threshold") as HTMLInputElement;


      // Instantiate Sigma
      renderer = new Sigma(graph, container, {
        minCameraRatio: 0.08,
        maxCameraRatio: 3,
      });

      const camera = renderer.getCamera();

      // Zoom controls
      zoomInBtn.addEventListener("click", () => {
        camera.animatedZoom({ duration: 600 });
      });
      zoomOutBtn.addEventListener("click", () => {
        camera.animatedUnzoom({ duration: 600 });
      });
      zoomResetBtn.addEventListener("click", () => {
        camera.animatedReset({ duration: 600 });
      });

      // Label threshold control
      labelsThresholdRange.addEventListener("input", () => {
        renderer?.setSetting("labelRenderedSizeThreshold", +labelsThresholdRange.value);
      });
      labelsThresholdRange.value = renderer.getSetting("labelRenderedSizeThreshold") + "";

      // --- Reducer logic for node/edge appearance ---
      const state: { hoveredNode?: string; hoveredNeighbors?: Set<string> } = {};

      renderer.setSetting("nodeReducer", (node, data) => {
        const res: Partial<NodeDisplayData> = { ...data };



        // Gray out non-neighbors on hover
        if (state.hoveredNode && node !== state.hoveredNode && !state.hoveredNeighbors?.has(node)) {
          res.label = "";
          res.color = "#eee";
        }

        return res;
      });

      renderer.setSetting("edgeReducer", (edge, data) => {
        const res: Partial<EdgeDisplayData> = { ...data };

        if (state.hoveredNode) {
          const [source, target] = [graph.source(edge), graph.target(edge)];
          if (source !== state.hoveredNode && target !== state.hoveredNode) {
            res.hidden = true;
          }
        }

        return res;
      });

      // Hover interactions
      renderer.on("enterNode", ({ node }) => {
        state.hoveredNode = node;
        state.hoveredNeighbors = new Set(graph.neighbors(node));
        renderer.refresh({ skipIndexation: true });
      });

      renderer.on("leaveNode", () => {
        state.hoveredNode = undefined;
        state.hoveredNeighbors = undefined;
        renderer.refresh({ skipIndexation: true });
      });
    })
    .catch((err) => {
      console.error("Error loading GEXF:", err);
    });

  return () => {
    renderer?.kill();
  };
};
