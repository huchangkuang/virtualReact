import { FiberNode } from "./fiber";
import {
  ChildDeletion,
  MutationMask,
  NoFlags,
  Placement,
  Update,
} from "./fiberFlags";
import { appendChildToContainer, Container } from "hostConfig";
import { HostComponent, HostRoot, HostText } from "./workTag";

let nextEffect: FiberNode | null = null;
export const commitMutationEffects = (finishedWork: FiberNode) => {
  nextEffect = finishedWork;

  while (nextEffect !== null) {
    const child: FiberNode | null = nextEffect.child;
    if (
      (nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
      child !== null
    ) {
      nextEffect = child;
    } else {
      up: while (nextEffect !== null) {
        commitMutationEffectsOnFiber(nextEffect);
        const sibling: FiberNode | null = nextEffect.sibling;

        if (sibling !== null) {
          nextEffect = sibling;
          break up;
        }
        nextEffect = nextEffect.return;
      }
    }
  }
};

export const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
  const flags = finishedWork.flags;

  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }
  if ((flags & Update) !== NoFlags) {
    commitUpdate(finishedWork);
    finishedWork.flags &= ~Update;
  }
  if ((flags & ChildDeletion) !== NoFlags) {
    commitChildDeletion(finishedWork);
    finishedWork.flags &= ~ChildDeletion;
  }
};

export const commitPlacement = (finishedWork: FiberNode) => {
  if (__DEV__) {
    console.warn("执行Placement操作", finishedWork);
  }
  const hostParent = getHostParent(finishedWork);
  if (hostParent !== null) {
    appendPlacementNodeIntoContainer(finishedWork, hostParent);
  }
};
export const commitUpdate = (finishedWork: FiberNode) => {};
export const commitChildDeletion = (finishedWork: FiberNode) => {};

const getHostParent = (fiber: FiberNode) => {
  let parent = fiber.return;

  while (parent) {
    const parentTag = parent.tag;

    if (parentTag === HostComponent) {
      return parent.stateNode;
    }
    if (parentTag === HostRoot) {
      return parent.stateNode.container;
    }
    parent = parent.return;
  }
  if (__DEV__ && parent === null) {
    console.warn("未找到hostParent", fiber);
  }
};

const appendPlacementNodeIntoContainer = (
  finishedWork: FiberNode,
  hostParent: Container,
) => {
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    appendChildToContainer(hostParent, finishedWork.stateNode);
    return;
  }
  const child = finishedWork.child;
  if (child !== null) {
    appendPlacementNodeIntoContainer(child, hostParent);
    let sibling = child.sibling;
    while (sibling !== null) {
      appendPlacementNodeIntoContainer(sibling, hostParent);
      sibling = sibling.sibling;
    }
  }
};
