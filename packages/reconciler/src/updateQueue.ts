import { Action } from "shared/ReactTypes";

export interface Update<State> {
  action: Action<State>;
}
export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
}
export const createUpdate = <State>(
  action: Action<State>,
): { action: Action<State> } => {
  return {
    action,
  };
};
export const createUpdateQueue = <Stete>() => {
  return {
    shared: {
      pending: null,
    },
  } as UpdateQueue<Stete>;
};

export const enqueueUpdate = <Stete>(
  updateQueue: UpdateQueue<Stete>,
  update: Update<Stete>,
) => {
  updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
  bashState: State,
  pendingUpdate: Update<State> | null,
): { memoizedState: State } => {
  const result: { memoizedState: State } = {
    memoizedState: bashState,
  };
  if (pendingUpdate !== null) {
    const action = pendingUpdate.action;
    if (action instanceof Function) {
      result.memoizedState = action(bashState);
    } else {
      result.memoizedState = action;
    }
  }
  return result;
};
