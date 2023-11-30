import { FiberNode } from "./fiber";
import internals from "shared/internals";
import {
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  processUpdateQueue,
  UpdateQueue,
} from "./updateQueue";
import { Action } from "shared/ReactTypes";
import { scheduleUpdateOnFiber } from "./workLoop";
import { Dispatch, Dispatcher } from "react/src/currentDispatcher";

const { currentDispatcher } = internals;

let currentlyRenderingFiber: FiberNode | null = null;
let workInProcessHook: Hook | null = null;
let currentHook: Hook | null = null;

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
  const children = Component(props);

  // 重置
  currentlyRenderingFiber = null;
  return children;
};

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
};

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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

function updateState<State>(): [State, Dispatch<State>] {
  const hook = updateWorkInProcessHook();

  const queue = hook.updateQueue as UpdateQueue<State>;
  const pending = queue.shared.pending;

  if (pending !== null) {
    const { memoizedState } = processUpdateQueue(hook.memoizedState, pending);
    hook.memoizedState = memoizedState;
  }

  return [hook.memoizedState, queue.dispatch!];
}

function updateWorkInProcessHook(): Hook {
  // todo render阶段触发的更新没处理
  let nextCurrentHook: Hook | null = null;

  if (currentHook === null) {
    const current = currentlyRenderingFiber?.alternate;
    if (current !== null) {
      nextCurrentHook = current?.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }

  if (nextCurrentHook === null) {
    throw new Error("本次执行是的hook比上次执行时的多");
  }

  currentHook = nextCurrentHook;
  const newHook: Hook = {
    memoizedState: currentHook?.memoizedState,
    updateQueue: currentHook?.updateQueue,
    next: null,
  };

  if (workInProcessHook === null) {
    // mount时 第一个hook
    if (currentlyRenderingFiber === null) {
      throw new Error("请在函数组件内调用hook");
    } else {
      workInProcessHook = newHook;
      currentlyRenderingFiber.memoizedState = workInProcessHook;
    }
  } else {
    // mount时 后续的hook
    workInProcessHook.next = newHook;
    workInProcessHook = newHook;
  }
  return workInProcessHook;
}
