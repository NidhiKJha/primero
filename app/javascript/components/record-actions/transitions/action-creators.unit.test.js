/* eslint-disable no-unused-expressions */
import clone from "lodash/clone";
import { expect } from "chai";
import sinon from "sinon";
import configureStore from "redux-mock-store";

import * as actionCreators from "./action-creators";
import actions from "./actions";

describe("<Transitions /> - Action Creators", () => {
  it("should have known action creators", () => {
    const creators = clone(actionCreators);

    expect(creators).to.have.property("fetchAssignUsers");
    expect(creators).to.have.property("removeFormErrors");
    expect(creators).to.have.property("saveAssignedUser");
    expect(creators).to.have.property("saveTransferUser");
    expect(creators).to.have.property("fetchTransferUsers");
    expect(creators, "DEPRECATED fetchTransitionData").to.not.have.property(
      "fetchTransitionData"
    );
    expect(creators).to.have.property("fetchReferralUsers");
    expect(creators).to.have.property("saveReferral");
    delete creators.fetchAssignUsers;
    delete creators.removeFormErrors;
    delete creators.saveAssignedUser;
    delete creators.saveTransferUser;
    delete creators.fetchTransferUsers;
    delete creators.fetchTransitionData;
    delete creators.fetchReferralUsers;
    delete creators.saveReferral;

    expect(creators).to.deep.equal({});
  });

  it("should check the 'fetchAssignUsers' action creator to return the correct object", () => {
    const store = configureStore()({});
    const dispatch = sinon.spy(store, "dispatch");

    dispatch(actionCreators.fetchAssignUsers());
    const firstCallReturnValue = dispatch.getCall(0).returnValue;

    expect(firstCallReturnValue.type).to.equal(actions.ASSIGN_USERS_FETCH);
    expect(firstCallReturnValue.api.path).to.equal("users/assign-to");
  });

  it("should check the 'fetchTransferUsers' action creator to return the correct object", () => {
    const store = configureStore()({});
    const dispatch = sinon.spy(store, "dispatch");

    dispatch(actionCreators.fetchTransferUsers());
    const firstCallReturnValue = dispatch.getCall(0).returnValue;

    expect(firstCallReturnValue.type).to.equal(actions.TRANSFER_USERS_FETCH);
    expect(firstCallReturnValue.api.path).to.equal("users/transfer-to");
  });

  it("should check the 'removeFormErrors' action creator to return the correct object", () => {
    const dispatch = sinon.spy(actionCreators, "removeFormErrors");

    actionCreators.removeFormErrors("reassign");

    expect(dispatch.getCall(0).returnValue).to.deep.equal({
      type: actions.CLEAR_ERRORS,
      payload: "reassign"
    });
  });

  it("should check the 'saveAssignedUser' action creator to return the correct object", () => {
    const body = {
      data: {
        trasitioned_to: "primero_cp",
        notes: "Some notes"
      }
    };
    const store = configureStore()({});
    const dispatch = sinon.spy(store, "dispatch");

    dispatch(
      actionCreators.saveAssignedUser("123abc", body, "Success Message")
    );
    const firstCallReturnValue = dispatch.getCall(0).returnValue;

    expect(firstCallReturnValue.type).to.equal(actions.ASSIGN_USER_SAVE);
    expect(firstCallReturnValue.api.path).to.equal("cases/123abc/assigns");
    expect(firstCallReturnValue.api.method).to.equal("POST");
    expect(firstCallReturnValue.api.body).to.equal(body);
    expect(firstCallReturnValue.api.successCallback.action).to.equal(
      "notifications/ENQUEUE_SNACKBAR"
    );
    expect(firstCallReturnValue.api.successCallback.payload.message).to.equal(
      "Success Message"
    );
  });

  it("should check the 'saveTransferUser' action creator to return the correct object", () => {
    const body = {
      data: {
        trasitioned_to: "primero_user_mgr_cp",
        notes: "Some transfer notes"
      }
    };
    const store = configureStore()({});
    const dispatch = sinon.spy(store, "dispatch");

    dispatch(
      actionCreators.saveTransferUser("123abc", body, "Success Message")
    );

    const firstCallReturnValue = dispatch.getCall(0).returnValue;

    expect(firstCallReturnValue.type).to.equal(actions.TRANSFER_USER);
    expect(firstCallReturnValue.api.path).to.equal("cases/123abc/transfers");
    expect(firstCallReturnValue.api.method).to.equal("POST");
    expect(firstCallReturnValue.api.body).to.equal(body);
    expect(firstCallReturnValue.api.successCallback.action).to.equal(
      "notifications/ENQUEUE_SNACKBAR"
    );
    expect(firstCallReturnValue.api.successCallback.payload.message).to.equal(
      "Success Message"
    );
  });

  it("should check the 'fetchReferralUsers' action creator to return the correct object", () => {
    const store = configureStore()({});
    const dispatch = sinon.spy(store, "dispatch");

    dispatch(actionCreators.fetchReferralUsers());

    expect(dispatch.getCall(0).returnValue.type).to.equal(
      actions.REFERRAL_USERS_FETCH
    );
    expect(dispatch.getCall(0).returnValue.api.path).to.equal("users/refer-to");
  });

  it("should check the 'saveReferral' action creator to return the correct object", () => {
    const body = {
      data: {
        trasitioned_to: "primero_cp",
        notes: "Some referral notes"
      }
    };
    const store = configureStore()({});
    const dispatch = sinon.spy(store, "dispatch");

    dispatch(
      actionCreators.saveReferral("123abc", "cases", body, "Success Message")
    );

    const firstCallReturnValue = dispatch.getCall(0).returnValue;

    expect(firstCallReturnValue.type).to.equal(actions.REFER_USER);
    expect(firstCallReturnValue.api.path).to.equal("cases/123abc/referrals");
    expect(firstCallReturnValue.api.method).to.equal("POST");
    expect(firstCallReturnValue.api.body).to.equal(body);
    expect(firstCallReturnValue.api.successCallback.action).to.equal(
      "notifications/ENQUEUE_SNACKBAR"
    );
    expect(firstCallReturnValue.api.successCallback.payload.message).to.equal(
      "Success Message"
    );
  });
});
