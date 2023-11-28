import { FiberNode } from "./fiber";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./workTag";
import { processUpdateQueue } from "./updateQueue";
import { ReactElementType } from "shared/ReactTypes";
import { mountChildFibers, reconcileChildFibers } from "./childFibers";
import { renderWithHooks } from "./fiberHooks";

export const beginWork = (wip: FiberNode) => {
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip);
    case HostComponent:
      return updateHostComponent(wip);
    case HostText:
      return null;
    case FunctionComponent:
      return updateFunctionComponent(wip);
    default:
      if (__DEV__) {
        console.warn(`未定义的tag类型:${wip.tag}`);
      }
      return null;
  }
};

const updateHostRoot = (wip: FiberNode) => {
  const baseState = wip.memoizedState;
  const updateQueue = wip.updateQueue;
  const pending = updateQueue.shared.pending;
  updateQueue.shared.pending = null;
  const { memoizedState } = processUpdateQueue(baseState, pending);
  wip.memoizedState = memoizedState;

  const nextChildren = wip.memoizedState;
  reconcileChildren(wip, nextChildren);
  return wip.child;
};
const updateHostComponent = (wip: FiberNode) => {
  const nextProps = wip.pendingProps;
  const nextChildren = nextProps.children;
  reconcileChildren(wip, nextChildren);
  return wip.child;
};

const updateFunctionComponent = (wip: FiberNode) => {
  const nextChildren = renderWithHooks(wip);
  reconcileChildren(wip, nextChildren);
  return wip.child;
};

const reconcileChildren = (wip: FiberNode, children?: ReactElementType) => {
  const current = wip.alternate;
  if (current !== null) {
    wip.child = reconcileChildFibers(wip, current?.child, children);
  } else {
    wip.child = mountChildFibers(wip, null, children);
  }
};
