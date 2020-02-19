import { fromJS } from "immutable";

import { expect } from "../../../../test/unit-test-helpers";

import actions from "./actions";
import { reducers } from "./reducers";

describe("<UserGroupsList /> - Reducers", () => {
  it("should handle USER_GROUPS_SUCCESS", () => {
    const expected = fromJS({
      data: [{ id: 1, unique_id: "usergroup-my-usergroup" }],
      metadata: { per: 20 }
    });

    const action = {
      type: actions.USER_GROUPS_SUCCESS,
      payload: {
        data: [{ id: 1, unique_id: "usergroup-my-usergroup" }],
        metadata: { per: 20 }
      }
    };

    const newState = reducers(fromJS({}), action);

    expect(newState).to.deep.equal(expected);
  });
});
