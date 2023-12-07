import { createWorkInProcess, FiberNode } from "./fiber";
import { Props, ReactElementType } from "shared/ReactTypes";
import { FunctionComponent, HostComponent, HostText, WorkTag } from "./workTag";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { ChildDeletion, Placement } from "./fiberFlags";

type ExistingChildren = Map<string | number, FiberNode>;

function ChildReconciler(shouldTrackEffect: boolean) {
  function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
    if (!shouldTrackEffect) {
      return;
    }
    const deletions = returnFiber.deletions;
    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion;
    } else {
      deletions.push(childToDelete);
    }
  }
  function deleteRemainChildren(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
  ) {
    if (!shouldTrackEffect) {
      return;
    }
    let childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
  }
  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElementType,
  ) {
    const key = element.key;
    while (currentFiber !== null) {
      // update
      if (currentFiber.key === key) {
        // same key
        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          // same type
          if (currentFiber.type === element.type) {
            const existing = useFiber(currentFiber, element.props);
            existing.return = returnFiber;
            // 当前阶段可复用，标记剩下的节点删除
            deleteRemainChildren(returnFiber, currentFiber.sibling);
            return existing;
          }
          // key相同，type不同 删掉所有旧的
          deleteRemainChildren(returnFiber, currentFiber);
          break;
        } else {
          if (__DEV__) {
            console.warn("还未实现的React类型", element);
            break;
          }
        }
      } else {
        // key不同，删掉旧的
        deleteChild(returnFiber, currentFiber);
        currentFiber = currentFiber.sibling;
      }
    }
    // create
    const fiber = createFiberFromElement(element);
    fiber.return = returnFiber;
    return fiber;
  }
  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number,
  ) {
    while (currentFiber !== null) {
      if (currentFiber.tag === HostText) {
        // 类型不变可以复用
        const existing = useFiber(currentFiber, { content });
        existing.return = returnFiber;
        // 当前阶段可复用，标记剩下的节点删除
        deleteRemainChildren(returnFiber, currentFiber.sibling);
        return existing;
      }
      deleteChild(returnFiber, currentFiber);
      currentFiber = currentFiber.sibling;
    }
    // create
    const fiber = new FiberNode(HostText, { content }, null);
    fiber.return = returnFiber;
    return fiber;
  }
  function placeSingleChild(fiber: FiberNode) {
    if (shouldTrackEffect && fiber.alternate === null) {
      fiber.flags |= Placement;
    }
    return fiber;
  }
  function reconcileChildrenArray(
    returnFiber: FiberNode,
    currentFirstChild: FiberNode | null,
    newChild: any[],
  ) {
    // 最后一个可复用的fiber在current中的index
    let lastPlacedIndex: number = 0;
    // 创建的最后一个fiber
    let lastNewFiber: FiberNode | null = null;
    // 创建的第一个fiber
    let firstNewFiber: FiberNode | null = null;

    // 将current保存在map中
    const existingChildren: ExistingChildren = new Map();
    let current = currentFirstChild;
    while (current !== null) {
      const keyToUse = current.key !== null ? current.key : current.index;
      existingChildren.set(keyToUse, current);
      current = current.sibling;
    }
    for (let i = 0; i < newChild.length; i++) {
      // 遍历newChild，寻找是否可复用
      const after = newChild[i];
      const newFiber = updateFromMap(returnFiber, existingChildren, i, after);
      if (newFiber === null) {
        continue;
      }

      // 标记移动还是插入
      newFiber.index = i;
      newFiber.return = returnFiber;

      if (lastNewFiber === null) {
        lastNewFiber = newFiber;
        firstNewFiber = newFiber;
      } else {
        lastNewFiber.sibling = newFiber;
        lastNewFiber = lastNewFiber.sibling;
      }
      if (!shouldTrackEffect) {
        continue;
      }

      const current = newFiber.alternate;
      if (current !== null) {
        const oldIndex = current.index;
        if (oldIndex < lastPlacedIndex) {
          newFiber.flags |= Placement;
          continue;
        } else {
          lastPlacedIndex = oldIndex;
        }
      } else {
        // mount
        newFiber.flags |= Placement;
      }
    }
    // 将map中剩下的标记为删除
    existingChildren.forEach((fiber) => {
      deleteChild(returnFiber, fiber);
    });
    return firstNewFiber;
  }
  function updateFromMap(
    returnFiber: FiberNode,
    existingChildren: ExistingChildren,
    index: number,
    element: any,
  ): FiberNode | null {
    const keyToUse = element.key !== null ? element.key : index;
    const before = existingChildren.get(keyToUse);
    if (typeof element === "string" || typeof element === "number") {
      // HostText
      if (before) {
        if (before.tag === HostText) {
          existingChildren.delete(keyToUse);
          return useFiber(before, { content: element.toString() });
        }
      }
      return new FiberNode(HostText, { content: element.toString() }, keyToUse);
    }

    if (typeof element === "object" && element !== null) {
      switch (element.$$typeof) {
        case REACT_ELEMENT_TYPE:
          if (before) {
            if (before.type === element.type) {
              existingChildren.delete(keyToUse);
              return useFiber(before, element.props);
            }
          }
          return createFiberFromElement(element);
      }
    }

    // todo is Array
    if (Array.isArray(element) && __DEV__) {
      console.warn("还未实现数组类型的child");
    }
    return null;
  }

  return function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: ReactElementType | string | number,
  ) {
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFiber, newChild),
          );
        default:
          if (__DEV__) {
            console.warn(`未定义的reconcile类型：${newChild}`);
          }
          break;
      }
      if (Array.isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFiber, newChild);
      }
    }

    if (typeof newChild === "string" || typeof newChild === "number") {
      return placeSingleChild(
        reconcileSingleTextNode(returnFiber, currentFiber, newChild),
      );
    }

    return null;
  };
}
function createFiberFromElement(element: ReactElementType) {
  const { type, props, key } = element;
  let fiberTag: WorkTag = FunctionComponent;
  if (typeof type === "string") {
    fiberTag = HostComponent;
  } else if (typeof type === "function") {
    fiberTag = FunctionComponent;
  } else {
    if (__DEV__) {
      console.warn("未定义的type类型", element);
    }
  }
  const fiber = new FiberNode(fiberTag, props, key);
  fiber.type = type;
  return fiber;
}
function useFiber(fiber: FiberNode, pendingProps: Props): FiberNode {
  const clone = createWorkInProcess(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
