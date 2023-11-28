import { FiberNode } from "./fiber";
import internals from "shared/internals";
import {
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  UpdateQueue,
} from "./updateQueue";
import { Action, ReactElementType } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";
import { Dispatch, Dispatcher } from "react/src/currentDispatcher";

const { currentDispatcher } = internals;

let currentlyRenderingFiber: FiberNode | null = null;
let workInProcessHook: Hook | null = null;

interface Hook {
  memoizedState: any;
  updateQueue: unknown;
  next: Hook | null;
}

export const renderWithHooks = (wip: FiberNode) => {
  // 赋值操作
  currentlyRenderingFiber = wip;
  wip.memoizedState = null;

  const current = wip.alternate;
  if (current !== null) {
    // update
  } else {
    // mount
    currentDispatcher.current = HooksDispatcherOnMount;
  }

  const Component = wip.type;
  const props = wip.pendingProps;

  // 重置
  currentlyRenderingFiber = null;
  return Component(props);
};

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
};

function mountState<State>(
  initialState: (() => State) | State,
): [State, Dispatch<State>] {
  const hook = mountWorkInProcessHook();
  let memoizedState;
  if (initialState instanceof Function) {
    memoizedState = initialState();
  } else {
    memoizedState = initialState;
  }
  const queue = createUpdateQueue<State>();
  hook.updateQueue = queue;
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber!, queue);
  queue.dispatch = dispatch;
  return [memoizedState, dispatch];
}
function dispatchSetState<State>(
  fiber: FiberNode,
  updateQueue: UpdateQueue<State>,
  action: Action<State>,
) {
  const update = createUpdate<State>(action);
  enqueueUpdate(updateQueue, update);
  scheduleUpdateOnFiber(fiber);
}
function mountWorkInProcessHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    updateQueue: null,
    next: null,
  };
  if (workInProcessHook === null) {
    // mount时 第一个hook
    if (currentlyRenderingFiber === null) {
      throw new Error("请在函数组件内调用hook");
    } else {
      workInProcessHook = hook;
      currentlyRenderingFiber.memoizedState = workInProcessHook;
    }
  } else {
    // mount时 后续的hook
    workInProcessHook.next = hook;
    workInProcessHook = hook;
  }
  return workInProcessHook;
}
