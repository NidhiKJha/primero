import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from "@material-ui/core";
import { Clear } from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";

import styles from "../styles.css";

const TransitionDialog = ({
  open,
  transitionType,
  record,
  children,
  handleClose,
  recordType
}) => {
  const css = makeStyles(styles)();

  const recordName = {
    cases: "Case",
    tracing_requests: "Tracing request",
    incidents: "Incident"
  };

  const title = (type => {
    if (record) {
      const {
        case_id_display: caseId,
        incident_code: incidentId
      } = record.toJS();
      const recordWithId = `${recordName[recordType]} ${caseId || incidentId}`;

      switch (type) {
        case "referral":
          return `Referral ${recordWithId}`;
        case "reassign":
          return `Assign ${recordWithId}`;
        case "transfer":
          return `Transfer ${recordWithId}`;
        default:
          return null;
      }
    }

    return "";
  })(transitionType);

  const dialogProps = {
    open,
    maxWidth: "sm",
    fullWidth: true,
    onClose: handleClose
  };

  return (
    <Dialog {...dialogProps}>
      <DialogTitle id="customized-dialog-title" className={css.modalTitle}>
        <span>{title}</span>
        <IconButton onClick={handleClose}>
          <Clear />
        </IconButton>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

TransitionDialog.propTypes = {
  children: PropTypes.node.isRequired,
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  record: PropTypes.object,
  recordType: PropTypes.string.isRequired,
  transitionType: PropTypes.string
};

export default TransitionDialog;
