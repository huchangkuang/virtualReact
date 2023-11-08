import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Props, ReactElementType, Ref, Type, Key } from "shared/ReactTypes";

const ReactElement = (
  type: Type,
  key: Key,
  ref: Ref,
  props: Props,
): ReactElementType => {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    __mark: "virtual",
  };
  return element;
};

export const jsx = (type: Type, config: any, ...children: any) => {
  let key: Key = null;
  const props: Props = {};
  let ref: Ref = null;

  for (const prop in config) {
    const val = config[prop];
    if (prop === "key" && val !== undefined) {
      key = val;
      continue;
    }
    if (prop === "ref" && val !== undefined) {
      ref = val;
      continue;
    }
    if (config.hasOwnProperty(prop)) {
      props[prop] = val;
    }
  }

  const length = children.length;
  if (length) {
    if (length === 1) {
      props.children = children[0];
    } else {
      props.children = children;
    }
  }
  return ReactElement(type, key, ref, props);
};

export const jsxDEV = (type: Type, config: any) => {
  let key: Key = null;
  const props: Props = {};
  let ref: Ref = null;

  for (const prop in config) {
    const val = config[prop];
    if (prop === "key" && val !== undefined) {
      key = val;
      continue;
    }
    if (prop === "ref" && val !== undefined) {
      ref = val;
      continue;
    }
    if (config.hasOwnProperty(prop)) {
      props[prop] = val;
    }
  }

  return ReactElement(type, key, ref, props);
};
