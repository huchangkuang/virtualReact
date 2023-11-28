import { FiberNode } from "./fiber";

export const renderWithHooks = (wip: FiberNode) => {
  const Component = wip.type;
  const props = wip.pendingProps;
  return Component(props);
};
