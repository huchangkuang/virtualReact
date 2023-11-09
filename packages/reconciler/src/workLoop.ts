import { FiberNode } from "./fiber";

export const renderRoot = () => {};

const workInProgress: FiberNode | null = null;

export const workLoop = () => {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
};

const performUnitOfWork = (unitOfWork: FiberNode) => {};
