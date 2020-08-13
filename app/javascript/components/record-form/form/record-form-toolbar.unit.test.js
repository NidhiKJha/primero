import { fromJS } from "immutable";
import { CircularProgress, Badge } from "@material-ui/core";

import { setupMountedComponent } from "../../../test";
import { RECORD_PATH, RECORD_TYPES, MODULES } from "../../../config";
import { ACTIONS } from "../../../libs/permissions";
import { PrimeroModuleRecord } from "../../application/records";
import ActionButton from "../../action-button";

import { WorkflowIndicator } from "./components";
import RecordFormToolbar from "./record-form-toolbar";

describe("<RecordFormToolbar />", () => {
  const mode = {
    isNew: false,
    isEdit: true,
    isShow: false
  };

  const params = {
    recordType: RECORD_PATH.cases,
    id: "ca1c1365-3be6-427f-9b56-000e35e2ef20"
  };

  const record = fromJS({
    enabled: true,
    sex: "female",
    owned_by_agency_id: 1,
    notes_section: [],
    date_of_birth: "2013-02-11",
    record_in_scope: true,
    case_id: "9bd46317-e4dc-4f99-a0ae-e03be6965869",
    created_at: "2020-02-11T13:53:09.345Z",
    date_closure: "2020-02-11",
    name_last: "tercero",
    name: "martes tercero",
    alert_count: 0,
    previously_owned_by: "primero_cp",
    case_id_display: "6965869",
    created_by: "primero_cp",
    module_id: "primeromodule-cp",
    owned_by: "primero_cp",
    reopened_logs: [
      {
        reopened_date: "2020-02-11T13:54:38.265Z",
        reopened_user: "primero_mgr_cp"
      }
    ],
    status: "open",
    registration_date: "2020-02-11",
    complete: true,
    case_status_reopened: true,
    type: "cases",
    id: "ca1c1365-3be6-427f-9b56-000e35e2ef20",
    flag_count: 0,
    name_first: "martes",
    short_id: "6965869",
    age: 7,
    workflow: "reopened"
  });

  const props = {
    mode,
    params,
    record,
    recordType: RECORD_TYPES[RECORD_PATH.cases],
    shortId: record.get("short_id"),
    primeroModule: MODULES.CP,
    handleFormSubmit: () => {}
  };

  const initialState = {
    application: {
      online: true,
      modules: [
        PrimeroModuleRecord({
          unique_id: MODULES.CP,
          name: "CP",
          associated_record_types: [RECORD_TYPES.cases],
          options: {
            user_group_filter: true
          },
          workflows: {
            case: {
              en: [
                {
                  id: "new",
                  display_text: "New"
                },
                {
                  id: "reopened",
                  display_text: "Reopened"
                }
              ]
            }
          }
        })
      ]
    },
    user: {
      modules: [MODULES.CP],
      permissions: {
        cases: [ACTIONS.CREATE, ACTIONS.FLAG]
      }
    }
  };

  let component;

  beforeEach(() => {
    ({ component } = setupMountedComponent(RecordFormToolbar, props, fromJS(initialState)));
  });

  it("renders a RecordFormToolbar/>", () => {
    expect(component.find(RecordFormToolbar)).to.have.lengthOf(1);
    expect(component.find(ActionButton)).to.have.lengthOf(2);
  });

  it("renders a <WorkflowIndicator /> component, when record is enabled", () => {
    expect(component.find(WorkflowIndicator)).to.have.lengthOf(1);
  });

  it("renders 'Case is disabled' text, when record is disabled", () => {
    const { component: recordFormToolbarComponent } = setupMountedComponent(
      RecordFormToolbar,
      { ...props, record: fromJS({ enabled: false }) },
      fromJS(initialState)
    );

    expect(recordFormToolbarComponent.find(WorkflowIndicator)).to.be.empty;
    expect(recordFormToolbarComponent.find("h3").text()).to.be.equals("case.messages.case_disabled");
  });

  describe("when records is being save", () => {
    let savingComponent;

    const initialStateSavingRecord = fromJS({
      ...initialState,
      records: {
        cases: {
          saving: true
        }
      }
    });

    beforeEach(() => {
      ({ component: savingComponent } = setupMountedComponent(
        RecordFormToolbar,
        props,
        fromJS(initialStateSavingRecord)
      ));
    });

    it("renders a RecordFormToolbar/>", () => {
      expect(savingComponent.find(RecordFormToolbar)).to.have.lengthOf(1);
      expect(savingComponent.find(CircularProgress)).to.have.lengthOf(1);
    });
  });

  describe("when is show mode", () => {
    const initialStateShowMode = {
      ...initialState,
      records: {
        flags: {
          data: [
            {
              id: 7,
              record_id: "ca1c1365-3be6-427f-9b56-000e35e2ef20",
              record_type: "cases",
              date: "2019-08-01",
              message: "This is a flag 1",
              flagged_by: "primero",
              removed: false
            }
          ]
        }
      }
    };

    beforeEach(() => {
      ({ component } = setupMountedComponent(
        RecordFormToolbar,
        {
          ...props,
          mode: {
            isNew: false,
            isEdit: false,
            isShow: true
          }
        },
        fromJS(initialStateShowMode)
      ));
    });
    it("renders a Badge indicator for Flag", () => {
      expect(component.find(Badge)).to.have.lengthOf(1);
    });
  });
});
