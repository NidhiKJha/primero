import { DB_COLLECTIONS_NAMES } from "../../db";
import { ENQUEUE_SNACKBAR, generate } from "../notifier";

import * as Actions from "./actions";

export const fetchRecord = (recordType, id) => async dispatch => {
  dispatch({
    type: `${recordType}/${Actions.RECORD}`,
    api: {
      path: `${recordType}/${id}`,
      db: {
        collection: DB_COLLECTIONS_NAMES.RECORDS,
        recordType,
        id
      }
    }
  });
};

export const saveRecord = (
  recordType,
  saveMethod,
  body,
  id,
  message,
  messageForQueue,
  redirect
) => async dispatch => {
  await dispatch({
    type: `${recordType}/${Actions.SAVE_RECORD}`,
    api: {
      path: saveMethod === "update" ? `${recordType}/${id}` : `${recordType}`,
      method: saveMethod === "update" ? "PATCH" : "POST",
      body,
      successCallback: {
        action: ENQUEUE_SNACKBAR,
        payload: {
          message,
          messageForQueue,
          options: {
            variant: "success",
            key: generate.messageKey()
          }
        },
        redirectWithIdFromResponse: saveMethod !== "update",
        redirect: redirect === false ? false : redirect || `/${recordType}`
      },
      db: {
        collection: DB_COLLECTIONS_NAMES.RECORDS,
        recordType
      }
    }
  });
};
