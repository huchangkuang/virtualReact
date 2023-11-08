const isSymbols = typeof Symbol !== "undefined" && Symbol.for;

export const REACT_ELEMENT_TYPE = isSymbols
  ? Symbol.for("react.element")
  : 0xdc5e;
