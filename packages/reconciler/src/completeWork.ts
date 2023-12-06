import { FiberNode } from "./fiber";
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from "./workTag";
import {
  appendInitialChild,
  Container,
  createInstance,
  createTextInstance,
  Instance,
  updateTextInstance,
} from "hostConfig";
import { NoFlags, Update } from "./fiberFlags";
import { updateFiberProps } from "react-dom/src/SyntheticEvent";
import { Props } from "shared/ReactTypes";

const markUpdate = (fiber: FiberNode) => {
  fiber.flags |= Update;
};

export const completeWork = (wip: FiberNode) => {
  const newProps = wip.pendingProps;
  const current = wip.alternate;

  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode) {
        // update
        // 1.props是否变化
        // 2.变了 Update flag
        // 保存变化后的props
        diffProps(newProps, current.memoizedProps, wip);
      } else {
        // 构建DOM
        const instance = createInstance(wip.type, newProps);
        // 将DOM插入到DOM树中
        appendAllChildren(instance, wip);
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostText:
      if (current !== null && wip.stateNode) {
        // update
        const oldText = current.memoizedProps.content;
        const newText = newProps.content;
        if (oldText !== newText) {
          markUpdate(wip);
          updateTextInstance(wip.stateNode, newText);
        }
      } else {
        // 构建DOM
        const instance = createTextInstance(newProps.content);
        wip.stateNode = instance;
      }
      bubbleProperties(wip);
      return null;
    case HostRoot:
      bubbleProperties(wip);
      return null;
    case FunctionComponent:
      bubbleProperties(wip);
      return null;
    default:
      if (__DEV__) {
        console.warn("未实现的fiber类型", wip);
      }
      break;
  }
};

function diffProps(newProps: Props, oldProps: Props, wip: FiberNode) {
  if (newProps.length !== oldProps.length) {
    updateProps(wip, newProps);
    return;
  }
  const keys = Object.keys(newProps);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const oldProp = oldProps[key];
    const newProp = newProps[key];
    if (!oldProp || oldProp !== newProp) {
      updateProps(wip, newProps);
      break;
    }
  }
}

function updateProps(wip: FiberNode, newProps: Props) {
  markUpdate(wip);
  wip.memoizedProps = newProps;
  updateFiberProps(wip.stateNode, newProps);
}

function appendAllChildren(parent: Instance | Container, wip: FiberNode) {
  let node = wip.child;

  while (node !== null) {
    if (node?.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === wip) {
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return;
      }
      node = node?.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function bubbleProperties(wip: FiberNode) {
  let subtreeFlags = NoFlags;
  let child = wip.child;

  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;

    child.return = wip;
    child = child.sibling;
  }
  wip.subtreeFlags |= subtreeFlags;
}
