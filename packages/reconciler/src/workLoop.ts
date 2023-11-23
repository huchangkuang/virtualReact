import { createWorkInProcess, FiberNode, FiberRootNode } from "./fiber";
import { beginWork } from "./beginWork";
import { completeWork } from "./completeWork";
import { HostRoot } from "./workTag";
import { MutationMask, NoFlags } from "./fiberFlags";
import { commitMutationEffects } from "./commitWork";

let workInProgress: FiberNode | null = null;

const prepareFreshStack = (root: FiberRootNode) => {
  workInProgress = createWorkInProcess(root.current, {});
};
export const scheduleUpdateOnFiber = (fiber: FiberNode) => {
  // todo
  const root = markUpdateFromFiberRoot(fiber);
  renderRoot(root);
};
const markUpdateFromFiberRoot = (fiber: FiberNode) => {
  let node = fiber;
  let parent = node.return;
  while (parent !== null) {
    node = parent;
    parent = parent.return;
  }
  if (node.tag === HostRoot) {
    return node.stateNode;
  }
};
export const renderRoot = (root: FiberRootNode) => {
  prepareFreshStack(root);

  while (true) {
    try {
      workLoop();
    } catch (e) {
      workInProgress = null;
      if (__DEV__) {
        console.warn("workLoop发生错误");
      }
      break;
    }
  }

  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;

  commitRoot(root);
};

const commitRoot = (root: FiberRootNode) => {
  const finishedWork = root.finishedWork;
  if (finishedWork === null) {
    return;
  }
  if (__DEV__) {
    console.warn("commit root begin", finishedWork);
  }

  root.finishedWork = null;

  const subtreeHasEffect =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

  if (subtreeHasEffect || rootHasEffect) {
    commitMutationEffects(finishedWork);
    root.current = finishedWork;
  } else {
    root.current = finishedWork;
  }
};

export const workLoop = () => {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
};

const performUnitOfWork = (unitOfWork: FiberNode) => {
  const next = beginWork(unitOfWork);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
};

const completeUnitOfWork = (unitOfWork: FiberNode) => {
  let node: FiberNode | null = unitOfWork;

  while (node !== null) {
    completeWork(node);
    const sibling = node.sibling;
    if (sibling !== null) {
      node = sibling;
      workInProgress = sibling;
      return;
    }
    node = node.return;
    workInProgress = node;
  }
};
