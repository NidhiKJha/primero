import * as modules from "./index";

describe("middleware/utils/index.js", () => {
  describe("known properties", () => {
    let clone;

    before(() => {
      clone = { ...modules };
    });

    after(() => {
      expect(clone).to.be.empty;
    });

    [
      "checkFieldSubformErrors",
      "defaultErrorCallback",
      "generateRecordProperties",
      "handleRestCallback",
      "isOnline",
      "partitionObject",
      "processAttachments",
      "startSignout",
      "retrieveData",
      "queueData",
      "processSubforms"
    ].forEach(property => {
      it(`exports '${property}'`, () => {
        expect(modules).to.have.property(property);
        delete clone[property];
      });
    });
  });
});
