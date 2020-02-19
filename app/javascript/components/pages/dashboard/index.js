export { default as Dashboard } from "./container";
export { default as namespace } from "./namespace";
export { reducers } from "./reducer";
export {
  selectFlags,
  selectCasesByStatus,
  selectCasesByCaseWorker,
  selectCasesRegistration,
  selectCasesOverview,
  selectServicesStatus,
  selectIsOpenPageActions
} from "./selectors";
export { fetchDashboards } from "./action-creators";
export { DASHBOARD_NAMES } from "./constants";
