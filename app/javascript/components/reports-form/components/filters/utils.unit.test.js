import { SELECT_FIELD, TICK_FIELD, DATE_FIELD } from "../../../form";
import { NOT_NULL } from "../../constants";

import * as utils from "./utils";

describe("<ReportFilters /> - utils", () => {
  describe("with exposed properties", () => {
    it("should have known methods", () => {
      const clone = { ...utils };

      ["formatValue", "registerValues", "getConstraintLabel"].forEach(property => {
        expect(clone).to.have.property(property);
        expect(clone[property]).to.be.a("function");
        delete clone[property];
      });
      expect(clone).to.be.empty;
    });
  });

  describe("formatValue()", () => {
    const i18n = { t: item => item, locale: "en" };

    it("should return a formatted date field if value is a valid date object", () => {
      const value = new Date("01/01/2020");

      expect(utils.formatValue(value, i18n, { field: {}, lookups: {} })).to.be.equals("01-Jan-2020");
    });

    describe("when field type is tick-field type", () => {
      const field = {
        type: TICK_FIELD
      };

      it("should return the value of tick_box_label included in the field", () => {
        const value = ["true"];

        expect(
          utils.formatValue(value, i18n, {
            field: { ...field, tick_box_label: "test" },
            lookups: {}
          })
        ).to.be.equals("test");
      });
      it("should return true if the value includes true and if there's not tick_box_label", () => {
        const value = ["true"];

        expect(
          utils.formatValue(value, i18n, {
            field,
            lookups: {}
          })
        ).to.be.equals("true");
      });
      it("should return not selected if the value doesn't include true", () => {
        const value = ["false"];

        expect(
          utils.formatValue(value, i18n, {
            field,
            lookups: {}
          })
        ).to.be.equals("report.not_selected");
      });
    });

    describe("when field type is select-field or radio-button-field type", () => {
      const field = {
        type: SELECT_FIELD
      };

      it("should return an empty array if value includes not_null", () => {
        const value = [NOT_NULL];

        expect(
          utils.formatValue(value, i18n, {
            field,
            lookups: {}
          })
        ).to.be.empty;
      });

      it("should return translated values if field contains the option_strings_source prop", () => {
        const value = ["opt1"];
        const lookups = [
          {
            unique_id: "test_lookup",
            values: [{ id: "opt1", display_text: "Option 1" }]
          }
        ];

        expect(
          utils.formatValue(value, i18n, {
            field: { ...field, option_strings_source: "test_lookup" },
            lookups
          })
        ).to.be.equals("Option 1");
      });

      it("should return translated values if field contains the option_strings_text ", () => {
        const value = ["test1"];
        const optionStringTexts = {
          en: [
            {
              id: "test1",
              display_text: "Test 1"
            }
          ]
        };

        expect(
          utils.formatValue(value, i18n, {
            field: { ...field, option_strings_text: optionStringTexts },
            lookups: {}
          })
        ).to.be.equals("Test 1");
      });
    });
  });

  describe("getConstraintLabel()", () => {
    const i18n = { t: value => value };

    it("should return not_blank when constraint is a boolean and it's true", () => {
      const data = { value: ["true"], constraint: true };

      expect(utils.getConstraintLabel(data, {}, i18n)).to.be.equals("report.filters.not_blank");
    });

    it("should return not_blank when value is an array an contains not_null value", () => {
      const data = {
        value: [NOT_NULL],
        constraint: false,
        attribute: "test"
      };

      expect(utils.getConstraintLabel(data, {}, i18n)).to.be.equals("report.filters.not_blank");
    });

    it("should return a valid constraint if value is not an array", () => {
      const data = {
        value: "15",
        constraint: "=",
        attribute: "test"
      };

      expect(utils.getConstraintLabel(data, {}, i18n)).to.be.equals("report.filters.equal_to");
    });

    describe("when the field is DATE_FIELD type", () => {
      const field = { type: DATE_FIELD };
      const data = {
        value: "01-Jan-2001",
        constraint: ">",
        attribute: "date_test"
      };

      it("should return after if the constraint is >", () => {
        expect(utils.getConstraintLabel(data, field, i18n)).to.be.equals("report.filters.after");
      });
      it("should return before if the constraint is <", () => {
        expect(utils.getConstraintLabel({ ...data, constraint: "<" }, field, i18n)).to.be.equals(
          "report.filters.before"
        );
      });
    });
  });
});
