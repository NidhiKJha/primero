import React from "react";
import PropTypes from "prop-types";
import { Divider, makeStyles } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import { useI18n } from "../../../i18n";
import { ResolvedFlagIcon } from "../../../../images/primero-icons";
import { currentUser } from "../../../user";
import { FormAction } from "../../../form";
import styles from "../styles.css";
import { setDialog } from "../../../record-actions/action-creators";
import { UNFLAG_DIALOG } from "../unflag/constants";
import { FLAG_DIALOG } from "../../constants";
import { setSelectedFlag } from "../../action-creators";

import { NAME } from "./constants";

const Component = ({ flag }) => {
  const i18n = useI18n();
  const dispatch = useDispatch();
  const css = makeStyles(styles)();
  const userName = useSelector(state => currentUser(state));
  const showResolveButton =
    // eslint-disable-next-line camelcase
    !flag?.removed && userName === flag?.flagged_by;

  if (!flag) {
    return null;
  }

  const handleUnflagDialog = () => {
    dispatch(setSelectedFlag(flag.id));
    dispatch(setDialog({ dialog: FLAG_DIALOG, open: false }));
    dispatch(setDialog({ dialog: UNFLAG_DIALOG, open: true }));
  };

  const renderFlagActions = showResolveButton && (
    <FormAction
      actionHandler={handleUnflagDialog}
      text={i18n.t("flags.resolve_button")}
      startIcon={<ResolvedFlagIcon fontSize="small" />}
    />
  );

  const renderActions = flag.removed ? (
    <div className={css.flagRemovedInfo}>
      <div className={css.date}>
        {i18n.t("flags.resolved_date")} {i18n.l("date.formats.default", flag.unflagged_date)}
      </div>
      <div className={css.resolvedReason}>
        {i18n.t("flags.resolved_reason")} {flag.unflag_message}
      </div>
    </div>
  ) : (
    <div className={css.actions}>
      <div className={css.date}>
        {i18n.t("flags.date")} {i18n.l("date.formats.default", flag.date)}
      </div>
      <div className={css.actionDivider}>
        <Divider orientation="vertical" classes={{ vertical: css.verticalDivider }} />
      </div>
      <div className={css.resolveButton}>{renderFlagActions}</div>
    </div>
  );

  return renderActions;
};

Component.displayName = NAME;

Component.propTypes = {
  flag: PropTypes.object.isRequired
};

export default Component;
