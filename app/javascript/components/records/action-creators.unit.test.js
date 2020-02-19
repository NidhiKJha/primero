import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import configureStore from "redux-mock-store";

import * as actionCreators from "./action-creators";

chai.use(sinonChai);

describe("records - Action Creators", () => {
  it("should have known action creators", () => {
    const creators = { ...actionCreators };

    expect(creators, "DEPRECATED setFilters").to.not.have.property(
      "setFilters"
    );
    expect(creators, "DEPRECATED fetchCases").to.not.have.property(
      "fetchCases"
    );
    expect(creators, "DEPRECATED fetchIncidents").to.not.have.property(
      "fetchIncidents"
    );
    expect(creators, "DEPRECATED fetchTracingRequests").to.not.have.property(
      "fetchTracingRequests"
    );
    expect(creators).to.have.property("fetchRecord");
    expect(creators).to.have.property("saveRecord");
    delete creators.setFilters;
    delete creators.fetchCases;
    delete creators.fetchIncidents;
    delete creators.fetchTracingRequests;
    delete creators.fetchRecord;
    delete creators.saveRecord;

    expect(creators).to.deep.equal({});
  });

  it("should check the 'fetchRecord' action creator to return the correct object", () => {
    const store = configureStore()({});
    const dispatch = sinon.spy(store, "dispatch");

    actionCreators.fetchRecord("cases", "123")(dispatch);

    expect(dispatch.getCall(0).returnValue.type).to.eql("cases/RECORD");
    expect(dispatch.getCall(0).returnValue.api.path).to.eql("cases/123");
  });

  describe("should check the 'saveRecord' action creator", () => {
    const body = {
      data: {
        name_first: "Gerald",
        name_last: "Padgett",
        name_given_post_separation: "true",
        registration_date: "2019-08-06",
        sex: "male",
        age: 26,
        date_of_birth: "1993-06-05",
        module_id: "primeromodule-cp"
      }
    };

    it("when path it's 'update' should return the correct object", () => {
      const store = configureStore()({});
      const dispatch = sinon.spy(store, "dispatch");

      actionCreators.saveRecord("cases", "update", body, "123", () => {})(
        dispatch
      );

      expect(dispatch.getCall(0).returnValue.type).to.eql("cases/SAVE_RECORD");
      expect(dispatch.getCall(0).returnValue.api.path).to.eql("cases/123");
      expect(dispatch.getCall(0).returnValue.api.method).to.eql("PATCH");
      expect(dispatch.getCall(0).returnValue.api.body).to.eql(body);
    });

    it("when path it's not 'update', the path and method should be different", () => {
      const store = configureStore()({});
      const dispatch = sinon.spy(store, "dispatch");

      actionCreators.saveRecord("cases", "edit", body, "123", () => {})(
        dispatch
      );

      expect(dispatch.getCall(0).returnValue.type).to.eql("cases/SAVE_RECORD");
      expect(dispatch.getCall(0).returnValue.api.path).to.eql("cases");
      expect(dispatch.getCall(0).returnValue.api.method).to.eql("POST");
      expect(dispatch.getCall(0).returnValue.api.body).to.eql(body);
    });
  });
});
