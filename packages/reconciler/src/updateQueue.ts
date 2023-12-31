import { Action } from "shared/ReactTypes";
import { Dispatch } from "react/src/currentDispatcher";

export interface Update<State> {
  action: Action<State>;
}
export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;
  };
  dispatch: Dispatch<State> | null;
}
export const createUpdate = <State>(
  action: Action<State>,
): { action: Action<State> } => {
  return {
    action,
  };
};
export const createUpdateQueue = <State>(): UpdateQueue<State> => {
  return {
    shared: {
      pending: null,
    },
    dispatch: null,
  };
};

export const enqueueUpdate = <State>(
  updateQueue: UpdateQueue<State>,
  update: Update<State>,
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
