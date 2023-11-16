import { FiberNode } from "./fiber";
import { ReactElementType } from "shared/ReactTypes";
import { FunctionComponent, HostComponent, HostText, WorkTag } from "./workTag";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Placement } from "./fiberFlags";

function ChildReconciler(shouldTrackEffect: boolean) {
  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElementType
  ) {
    const fiber = createFiberFromElement(element)
    fiber.return = returnFiber
    return fiber
  }
  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number
  ) {
    const fiber = new FiberNode(HostText, {content}, null)
    fiber.return = returnFiber
    return fiber
  }
  function placeSingleChild(fiber: FiberNode) {
    if (shouldTrackEffect && fiber.alternate === null) {
      fiber.flags |= Placement
    }
    return fiber
  }

  return function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: ReactElementType | string | number
  ) {
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFiber, newChild))
        default:
          if (__DEV__) {
            console.warn(`未定义的reconcile类型：${newChild}`)
          }
          break;
      }
    }

    if (typeof newChild === 'string' || typeof newChild  === 'number') {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFiber, newChild))
    }

    return null
  }
}
function createFiberFromElement(element: ReactElementType, ) {
  const {type, props, key} = element
  let fiberTag: WorkTag = FunctionComponent
  if (typeof type === 'string') {
    fiberTag = HostComponent
  } else if (typeof type === 'function' && __DEV__) {
    console.warn('未定义的type类型', element)
  }
  const fiber = new FiberNode(fiberTag, props, key)
  fiber.type = type
  return fiber
}
export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)