import { fromJS, OrderedMap } from "immutable";
import MUIDataTable, { TableBodyRow } from "mui-datatables";

import { setupMountedComponent } from "../../../test";
import { DashboardChip } from "../../dashboard";
import { ListHeaderRecord } from "../../user/records";
import { FieldRecord, FormSectionRecord } from "../../record-form/records";

import TaskList from "./container";

describe("<TaskList />", () => {
  let component;

  before(() => {
    component = setupMountedComponent(
      TaskList,
      {},
      fromJS({
        records: {
          tasks: {
            data: [
              {
                id: "0df32f52-4290-4ce1-b859-74ac14c081bf",
                record_type: "case",
                record_id_display: "040e0b7",
                priority: "high",
                type: "service",
                due_date: "2019-07-01",
                detail: "a",
                field_name: "test"
              },
              {
                id: "0df32f52-4290-4ce1-b859-74ac14c081bf",
                record_type: "case",
                record_id_display: "040e0b7",
                priority: "low",
                type: "case_plan",
                due_date: "2019-07-02",
                detail: "b",
                field_name: "case_plan_due_date"
              }
            ],
            metadata: {
              total: 2,
              per: 20,
              page: 1,
              field_names: {
                assessment: "test_assessment",
                case_plan: "case_plan_due_date",
                service: "test_service",
                follow_up: "test_follow_up"
              }
            }
          }
        },
        user: {
          listHeaders: {
            tasks: [
              ListHeaderRecord({
                name: "id",
                field_name: "record_id_display",
                id_search: false
              }),
              ListHeaderRecord({
                name: "priority",
                field_name: "priority",
                id_search: false
              }),
              ListHeaderRecord({
                name: "type",
                field_name: "type",
                id_search: false
              }),
              ListHeaderRecord({
                name: "due_date",
                field_name: "due_date",
                id_search: false
              }),
              ListHeaderRecord({
                name: "status",
                field_name: "status",
                id_search: false
              })
            ]
          }
        },
        forms: {
          formSections: OrderedMap({
            1: FormSectionRecord({
              id: 1,
              unique_id: "cp_incident_record_owner",
              parent_form: "incident",
              name: { en: "Form name" },
              fields: [1]
            }),
            2: FormSectionRecord({
              id: 2,
              unique_id: "assessment",
              parent_form: "case",
              name: { en: "Assessment" },
              fields: [2],
              is_nested: false
            })
          }),
          fields: OrderedMap({
            1: FieldRecord({
              id: 1,
              name: "test_service",
              display_name: { en: "Test Field" },
              type: "text_field",
              multi_select: false,
              form_section_id: 1,
              visible: true,
              mobile_visible: true
            }),
            2: FieldRecord({
              id: 2,
              name: "case_plan_due_date",
              display_name: { en: "Case Plan Due Date" },
              type: "text_field",
              multi_select: false,
              form_section_id: 2,
              visible: true,
              mobile_visible: true
            })
          }),
          options: {
            lookups: {
              data: [
                {
                  id: 1,
                  unique_id: "lookup-service-type",
                  values: [
                    { id: "a", display_text: { en: "Service a" } },
                    { id: "b", display_text: { en: "Service b" } }
                  ]
                }
              ]
            }
          }
        }
      })
    ).component;
  });

  it("should render tasks table", () => {
    expect(component.find(MUIDataTable).find(TableBodyRow)).to.have.length(2);
  });

  it("should render tasks table with priority as DashboardChip", () => {
    expect(component.find(MUIDataTable).find(DashboardChip)).to.have.length(2);
  });

  it("should an action that sets the form unique_id when clicking on a task", () => {
    const table = component.find(MUIDataTable);
    const firstRow = table.find("tr").at(1);
    const secondRow = table.find("tr").at(2);
    const expectedType = { type: "forms/SET_SELECTED_FORM" };

    expect(component.props().store.getActions()).to.have.lengthOf(2);

    // Simulating click on the first row (type=service) should dispatch an action
    firstRow.find("td").at(0).simulate("click");
    expect(component.props().store.getActions()).to.have.lengthOf(3);
    expect(component.props().store.getActions()[2]).to.deep.equals({
      ...expectedType,
      payload: "cp_incident_record_owner"
    });

    // Simulating click on the second row (type=case_plan) should dispatch an action
    secondRow.find("td").at(0).simulate("click");
    expect(component.props().store.getActions()).to.have.lengthOf(4);
    expect(component.props().store.getActions()[3]).to.deep.equals({
      ...expectedType,
      payload: "assessment"
    });
  });
});
