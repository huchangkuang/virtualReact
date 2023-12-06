import { Props } from "shared/ReactTypes";
import { Container } from "hostConfig";

export const elementPropsKey = "__props";
const validEventTypeList = ["click"];
export interface DOMElement extends Element {
  [elementPropsKey]: Props;
}
type EventCallback = (e: Event) => void;
export interface Paths {
  capture: EventCallback[];
  bubble: EventCallback[];
}
interface SyntheticEvent extends Event {
  __stopPropagation: boolean;
}
export function updateFiberProps(node: DOMElement, props: Props) {
  node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
  if (!validEventTypeList.includes(eventType)) {
    console.warn("当前不支持", eventType, "事件");
    return;
  }
  if (__DEV__) {
    console.log("事件初始化");
  }
  container.addEventListener(eventType, (e) => {
    dispatchEvent(container, eventType, e);
  });
}
function dispatchEvent(container: Container, eventType: string, e) {
  const targetElement = e.target;
  if (targetElement === null) {
    console.warn("事件不存在target", e);
    return;
  }
  // 收集沿途事件
  const { bubble, capture } = collectPaths(targetElement, container, eventType);
  // 构造合成事件
  const se = createSyntheticEvent(e);
  // 遍历capture
  triggerEventFlow(capture, se);
  if (!se.__stopPropagation) {
    // 遍历bubble
    triggerEventFlow(bubble, se);
  }
}
function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
  for (let i = 0; i < paths.length; i++) {
    const callback = paths[i];
    callback.call(null, se);

    if (se.__stopPropagation) {
      break;
    }
  }
}
function createSyntheticEvent(e: Event) {
  const syntheticEvent = e as SyntheticEvent;
  syntheticEvent.__stopPropagation = false;
  const originStopPropagation = e.stopPropagation;
  syntheticEvent.stopPropagation = () => {
    syntheticEvent.__stopPropagation = true;
    if (originStopPropagation) {
      originStopPropagation();
    }
  };
  return syntheticEvent;
}
function getEventCallbackNameFromEventType(
  eventType: string,
): string[] | undefined {
  return {
    click: ["onClickCapture", "onClick"],
  }[eventType];
}
function collectPaths(
  targetElement: DOMElement,
  container: Container,
  eventType: string,
) {
  const paths: Paths = {
    capture: [],
    bubble: [],
  };
  while (targetElement && targetElement !== container) {
    const elementProps = targetElement[elementPropsKey];
    if (elementProps) {
      const callbackNameList = getEventCallbackNameFromEventType(eventType);
      if (callbackNameList) {
        callbackNameList.forEach((callbackName, i) => {
          const eventCallback = elementProps[callbackName];
          if (eventCallback) {
            if (i === 0) {
              paths.capture.unshift(eventCallback);
            } else {
              paths.bubble.push(eventCallback);
            }
          }
        });
      }
    }
    targetElement = targetElement.parentNode as DOMElement;
  }
  return paths;
}
