import { DOMElement, updateFiberProps } from "./SyntheticEvent";
import { Props } from "shared/ReactTypes";

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

export const createInstance = (type: string, props: Props): Instance => {
  // todo process props
  const element = document.createElement(type) as any;
  updateFiberProps(element as DOMElement, props);
  return element;
};
export const appendInitialChild = (
  parent: Instance | Container,
  child: Instance,
) => {
  parent.appendChild(child);
};

export const createTextInstance = (content: string) => {
  return document.createTextNode(content);
};
export const appendChildToContainer = appendInitialChild;

export const updateTextInstance = (element: TextInstance, text: string) => {
  element.textContent = text;
};
export const removeChild = (
  child: Instance | TextInstance,
  container: Container,
) => {
  container.removeChild(child);
};
