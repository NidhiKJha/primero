import { fromJS } from "immutable";

import { fake } from "../../../test";
import { ACTIONS } from "../../../libs/permissions";
import { TEXT_FIELD, SUBFORM_SECTION } from "../../record-form/constants";
import { RECORD_PATH } from "../../../config/constants";

import { ALL_EXPORT_TYPES, EXPORT_FORMAT } from "./constants";
import * as utils from "./utils";

describe("<RecordActions /> - exports/utils", () => {
  describe("with exposed properties", () => {
    it("should have known methods", () => {
      const clone = { ...utils };

      ["allowedExports", "buildFields", "exporterFilters", "formatFields", "formatFileName"].forEach(property => {
        expect(clone).to.have.property(property);
        expect(clone[property]).to.be.a("function");
        delete clone[property];
      });
      expect(clone).to.be.empty;
    });
  });

  describe("allowedExports", () => {
    const i18n = {
      t: fake.returns("test.label")
    };

    it("should return all export types if userPermission contains manage permission and recordType is cases", () => {
      const userPermission = fromJS(["manage"]);

      const expected = ALL_EXPORT_TYPES.filter(exportType => exportType.recordTypes.includes(RECORD_PATH.cases)).map(
        a => {
          return {
            ...a,
            display_name: "test.label"
          };
        }
      );

      expect(utils.allowedExports(userPermission, i18n, false, RECORD_PATH.cases)).to.deep.equal(expected);
    });

    it("should return export types contained in userPermission", () => {
      const expected = [
        {
          id: "csv",
          display_name: "test.label",
          permission: ACTIONS.EXPORT_CSV,
          format: EXPORT_FORMAT.CSV,
          recordTypes: [RECORD_PATH.cases, RECORD_PATH.incidents]
        },
        {
          id: "json",
          display_name: "test.label",
          permission: ACTIONS.EXPORT_JSON,
          format: EXPORT_FORMAT.JSON,
          recordTypes: [RECORD_PATH.cases, RECORD_PATH.incidents]
        }
      ];

      const userPermission = fromJS([ACTIONS.EXPORT_CSV, ACTIONS.EXPORT_JSON]);

      expect(utils.allowedExports(userPermission, i18n, false, RECORD_PATH.cases)).to.deep.equal(expected);
    });
  });

  describe("formatFileName", () => {
    it("should set to default filename if any filename was not specified", () => {
      expect(utils.formatFileName("", "csv")).to.be.empty;
    });

    it("should not return labels if there are not translations", () => {
      const expected = "hello world.csv";

      expect(utils.formatFileName("hello world", "csv")).to.be.equal(expected);
    });
  });

  describe("exporterFilters", () => {
    const record = fromJS({
      record_state: true,
      sex: "female",
      date_of_birth: "2005-01-29",
      case_id: "1b21e684-c6b1-4e74-b148-317a2b575f47",
      created_at: "2020-01-29T21:57:00.274Z",
      name: "User 1",
      alert_count: 0,
      case_id_display: "b575f47",
      created_by: "primero_cp_ar",
      module_id: "primeromodule-cp",
      owned_by: "primero_cp",
      status: "open",
      registration_date: "2020-01-29",
      complete: true,
      type: "cases",
      id: "b342c488-578e-4f5c-85bc-35ece34cccdf",
      name_first: "User",
      short_id: "b575f47",
      age: 15,
      workflow: "new"
    });
    const appliedFilters = fromJS({
      sex: ["female"]
    });
    const shortIds = ["b575f47"];

    it("should return filters with short_id, if isShowPage true", () => {
      const expected = { filters: { short_id: shortIds } };

      expect(utils.exporterFilters(true, false, shortIds, appliedFilters, {}, record, false)).to.be.deep.equals(
        expected
      );
    });

    it(
      "should return filters with short_id, " +
        "if isShowPage is false and allRowsSelected is false and there are not appliedFilters",
      () => {
        const expected = { filters: { short_id: shortIds } };

        expect(utils.exporterFilters(false, false, shortIds, fromJS({}), {}, record, false)).to.be.deep.equals(
          expected
        );
      }
    );

    it("should return and object with applied filters, if isShowPage is false and allRowsSelected is true", () => {
      const expected = { filters: { short_id: shortIds } };

      expect(utils.exporterFilters(false, true, shortIds, appliedFilters, {}, record, false)).to.be.deep.equals(
        expected
      );
    });

    it(
      "should return and object with short_id, and query " +
        "if isShowPage is false, allRowsSelected is false and a query is specified",
      () => {
        const query = "test";
        const expected = { filters: { short_id: shortIds } };

        expect(utils.exporterFilters(false, true, shortIds, fromJS({ query }), {}, record, false)).to.be.deep.equals(
          expected
        );
      }
    );

    it(
      "should return and object with applied filters and query, " +
        "if isShowPage is false, allRowsSelected is true and a query is specified",
      () => {
        const query = "test";
        const expected = { filters: { short_id: shortIds } };

        expect(utils.exporterFilters(false, true, shortIds, fromJS({ query }), {}, record, false)).to.be.deep.equals(
          expected
        );
      }
    );

    it("should return and object with default filter if allRecordsSelected are selected", () => {
      const expected = {
        filters: {
          status: ["open"],
          record_state: ["true"]
        }
      };

      expect(utils.exporterFilters(false, false, shortIds, fromJS({}), {}, record, true)).to.be.deep.equals(expected);
    });
  });

  describe("buildFields", () => {
    const data = [
      {
        unique_id: "test_form",
        name: {
          en: "Test Form"
        },
        fields: [
          {
            name: "field_form",
            display_name: { en: "Field Form" },
            type: TEXT_FIELD,
            visible: true
          }
        ]
      },
      {
        unique_id: "test_subform",
        name: {
          en: "Test Subform"
        },
        fields: [
          {
            name: "field_subform",
            display_name: { en: "Field Subform" },
            type: SUBFORM_SECTION,
            visible: true,
            subform_section_id: {
              unique_id: "field_subform_section",
              name: {
                en: "Field Subform Section"
              },
              fields: [
                {
                  name: "field_subform_section_test",
                  display_name: { en: "Field from Subform" },
                  type: TEXT_FIELD,
                  visible: true
                },
                {
                  name: "field_subform_section_test1",
                  display_name: { en: "Field from Subform 1" },
                  type: TEXT_FIELD,
                  visible: true
                }
              ]
            }
          }
        ]
      }
    ];

    it("should return fields from forms and subforms when individual fields is false", () => {
      expect(utils.buildFields(data, "en")).to.have.lengthOf(3);
    });
  });

  describe("formatFields", () => {
    it("should return an array of strings with field_names", () => {
      const fields = ["form1:field1", "form2:field1", "form3:field10"];

      expect(utils.formatFields(fields)).to.be.deep.equals(["field1", "field10"]);
    });
  });
});
