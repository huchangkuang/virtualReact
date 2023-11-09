import { Key } from "shared/ReactTypes";
import { WorkTag } from "./workTag";

export class FiberNode {
  tag: WorkTag;
  key: Key;
  stateNode: FiberNode;

  return: FiberNode;
  child: FiberNode;
  sibling: FiberNode;
  index: number;

  pendingProps: any;
  alternate: FiberNode | null;

  constructor(tag: WorkTag, pendingProps: any, key: Key) {
    // 实例
    this.tag = tag;
    this.key = key;
    this.stateNode = null;

    // Fiber结构
    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;

    this.pendingProps = pendingProps;
    this.alternate = null;
  }
}
