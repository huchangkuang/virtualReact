import { FiberNode } from "./fiber";
import { HostComponent, HostRoot, HostText } from "./workTag";
import { processUpdateQueue } from "./updateQueue";
import { ReactElementType } from "shared/ReactTypes";
import { mountChildFibers, reconcileChildFibers } from "./childFibers";

export const beginWork = (wip: FiberNode) => {
  switch (wip.type) {
    case HostRoot:
      return updateHostRoot(wip);
    case HostComponent:
      return updateHostComponent(wip);
    case HostText:
      return null;
    default:
      if (__DEV__) {
        console.warn(`未定义的type类型:${wip.type}`);
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

const reconcileChildren = (wip: FiberNode, children?: ReactElementType) => {
  const current = wip.alternate;
  if (current !== null) {
    wip.child = reconcileChildFibers(wip, current?.child, children);
  } else {
    wip.child = mountChildFibers(wip, null, children);
  }
};
