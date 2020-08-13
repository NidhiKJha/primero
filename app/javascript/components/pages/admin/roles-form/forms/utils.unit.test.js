import { buildPermissionOptions } from "./utils";

describe("pages/admin/<RolesForm>/forms - utils", () => {
  const i18n = { t: label => label };
  const approvalsLabels = {
    assessment: "Assessment"
  };

  describe("buildPermissionOptions", () => {
    it("returns the action as option objects", () => {
      const actions = ["action_1", "action_2", "request_approval_assessment"];
      const expected = [
        {
          id: "action_1",
          display_text: "permissions.resource.case.actions.action_1.label",
          tooltip: "permissions.resource.case.actions.action_1.explanation"
        },
        {
          id: "action_2",
          display_text: "permissions.resource.case.actions.action_2.label",
          tooltip: "permissions.resource.case.actions.action_2.explanation"
        },
        {
          id: "request_approval_assessment",
          display_text: "permissions.resource.case.actions.request_approval_assessment.label",
          tooltip: "permissions.resource.case.actions.request_approval_assessment.explanation"
        }
      ];

      expect(buildPermissionOptions(actions, i18n, "case", approvalsLabels)).to.deep.equal(expected);
    });
  });
});
