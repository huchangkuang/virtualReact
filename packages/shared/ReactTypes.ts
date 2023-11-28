import * as React from "react";

export type Type = any;
export type Key = any;
export type Props = any;
export type Ref = any;
export interface ReactElementType {
  $$typeof: symbol | number;
  type: Type;
  key: Key;
  props: Props;
  ref: Ref;
  __mark: string;
}
export type Action<State> = State | ((preState: State) => State);
