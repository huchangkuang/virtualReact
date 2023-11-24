import { Key, Props, Type } from "shared/ReactTypes";
import { WorkTag } from "./workTag";
import { Flags, NoFlags } from "./fiberFlags";
import { Container } from "hostConfig";

export class FiberNode {
  tag: WorkTag;
  key: Key;
  type: Type;
  stateNode: any;

  return: FiberNode | null;
  child: FiberNode | null;
  sibling: FiberNode | null;
  index: number;

  pendingProps: any;
  memoizedProps: any;
  memoizedState: any;
  alternate: FiberNode | null;

  flags: Flags;
  subtreeFlags: Flags;

  updateQueue: any;

  constructor(tag: WorkTag, pendingProps: any, key: Key) {
    // 实例
    this.tag = tag;
    this.key = key;
    this.stateNode = null;
    this.type = null;

    // Fiber结构
    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;

    // 工作单元
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.memoizedState = null;

    this.alternate = null;
    // 副作用
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;

    this.updateQueue = null;
  }
}

export class FiberRootNode {
  container: Container;
  current: FiberNode;
  finishedWork: FiberNode | null;

  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container;
    this.current = hostRootFiber;
    hostRootFiber.stateNode = this;
    this.finishedWork = null;
  }
}

export const createWorkInProcess = (
  current: FiberNode,
  pendingProps: Props,
): FiberNode => {
  let wip = current.alternate;
  if (wip === null) {
    // mount
    wip = new FiberNode(current.tag, pendingProps, current.key);
    wip.type = current.type;
    wip.stateNode = current.stateNode;
    wip.alternate = current;
  } else {
    // update
    wip.pendingProps = pendingProps;
    wip.flags = NoFlags;
    wip.subtreeFlags = NoFlags;
  }
  current.alternate = wip;
  wip.updateQueue = current.updateQueue;
  wip.child = current.child;
  wip.memoizedState = current.memoizedState;
  wip.memoizedProps = current.memoizedProps;
  return wip;
};
