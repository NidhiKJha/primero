import React from "react";
import PropTypes from "prop-types";
import CloseIcon from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/styles";
import { DialogTitle, IconButton } from "@material-ui/core";

import { useI18n } from "../../i18n";

import { NAME } from "./constants";
import styles from "./styles.css";

const Component = ({ dialogTitle, dialogSubtitle, closeHandler }) => {
  const css = makeStyles(styles)();
  const i18n = useI18n();
  const subtitle = dialogSubtitle ? (
    <span className={css.dialogSubtitle}>{dialogSubtitle}</span>
  ) : null;

  return (
    <DialogTitle>
      {dialogTitle}
      {subtitle}
      <IconButton
        aria-label={i18n.t("buttons.close")}
        className={css.closeButton}
        onClick={closeHandler}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
};

Component.propTypes = {
  closeHandler: PropTypes.func.isRequired,
  dialogSubtitle: PropTypes.string,
  dialogTitle: PropTypes.string.isRequired
};

Component.displayName = NAME;

export default Component;
