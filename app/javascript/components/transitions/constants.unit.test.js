import { expect } from "chai";

import * as transitionsConstants from "./constants";

describe("<Transitions /> - Constants", () => {
  it("should have known constant", () => {
    const constants = { ...transitionsConstants };

    [
      "REFERRAL_SUMMARY_NAME",
      "REFERRAL_DETAILS_NAME",
      "TRANSITIONS_NAME",
      "TRANSFER_REQUEST_SUMMARY_NAME",
      "TRANSFER_REQUEST_DETAILS_NAME"
    ].forEach(property => {
      expect(constants).to.have.property(property);
      expect(constants[property]).to.be.a("string");
      delete constants[property];
    });

    expect(constants).to.have.property("TRANSITION_STATUS");
    expect(constants.TRANSITION_STATUS).to.be.an("object");
    expect(constants.TRANSITION_STATUS).to.have.all.keys(
      "pending",
      "accepted",
      "rejected",
      "done",
      "inProgress"
    );
    delete constants.TRANSITION_STATUS;

    expect(constants).to.be.empty;
  });
});
