import { Container } from "hostConfig";
import {
  createContainer,
  updateContainer,
} from "reconciler/src/fiberReconciler";
import { ReactElementType } from "shared/ReactTypes";

export function createRoot(container: Container) {
  const root = createContainer(container);
  return {
    render(element: ReactElementType) {
      updateContainer(element, root);
    },
  };
}
