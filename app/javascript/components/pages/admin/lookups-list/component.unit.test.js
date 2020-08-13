import { fromJS } from "immutable";
import MUIDataTable from "mui-datatables";

import { setupMountedComponent, lookups } from "../../../../test";
import { PageHeading } from "../../../page";
import { ACTIONS } from "../../../../libs/permissions";
import IndexTable from "../../../index-table";

import LookupList from "./component";

describe("<LookupList />", () => {
  let component;

  const dataLength = 30;
  const data = Array.from({ length: dataLength }, (_, i) => ({
    id: i + 1,
    unique_id: `lookup-${i + 1}`,
    name: { en: `User Group ${i + 1}` },
    values: [
      {
        id: `value-${i + 1}`,
        display_text: {
          en: `Value ${i + 1}`
        }
      }
    ]
  }));
  const state = fromJS({
    records: {
      admin: {
        lookups: {
          data,
          metadata: { total: dataLength, per: 20, page: 1 },
          loading: false,
          errors: false
        }
      }
    },
    user: {
      permissions: {
        metadata: [ACTIONS.MANAGE]
      }
    },
    forms: {
      options: {
        lookups: lookups()
      }
    }
  });

  beforeEach(() => {
    ({ component } = setupMountedComponent(LookupList, {}, state, ["/admin/lookups"]));
  });

  it("renders a PageHeading component", () => {
    expect(component.find(PageHeading)).to.have.lengthOf(1);
  });

  it("renders a MUIDataTable component", () => {
    expect(component.find(MUIDataTable)).to.have.lengthOf(1);
  });

  it("should trigger a valid action with next page when clicking next page", () => {
    const indexTable = component.find(IndexTable);
    const expectAction = {
      api: {
        params: { total: dataLength, per: 20, page: 2 },
        path: "lookups"
      },
      type: "admin/lookups/FETCH_LOOKUPS"
    };

    expect(indexTable.find("p").at(1).text()).to.be.equals(`1-20 of ${dataLength}`);
    expect(component.props().store.getActions()).to.have.lengthOf(2);
    indexTable.find("#pagination-next").at(0).simulate("click");

    expect(indexTable.find("p").at(1).text()).to.be.equals(`21-${dataLength} of ${dataLength}`);
    expect(component.props().store.getActions()[2]).to.deep.equals(expectAction);
  });
});
