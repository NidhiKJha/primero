import NAMESPACE from "./namespace";

export const getErrorsByTransitionType = (state, transitionType) => {
  return state.getIn(["records", NAMESPACE, transitionType, "message"]);
};

export const getUsersByTransitionType = (state, transitionType) =>
  state.getIn(["records", NAMESPACE, transitionType, "users"]);
