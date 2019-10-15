import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { useI18n } from "components/i18n";
import { getPermissionsByRecord } from "components/user/selectors";
import { RECORD_TYPES } from "config";
import { Notes } from "./notes";
import { Transitions } from "./transitions";
import { ToggleOpen } from "./toggle-open";
import { ToggleEnable } from "./toggle-enable";
import { fetchAssignUsers } from "./transitions/action-creators";

const checkPermissions = (currentPermissions, allowedPermissions) => {
  return (
    currentPermissions &&
    currentPermissions.filter(permission => {
      return allowedPermissions.includes(permission);
    }).size > 0
  );
};

const RecordActions = ({ recordType, iconColor, record, mode }) => {
  const i18n = useI18n();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openReopenDialog, setOpenReopenDialog] = useState(false);
  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [transitionType, setTransitionType] = useState("");
  const [openEnableDialog, setOpenEnableDialog] = useState(false);

  const enableState =
    record && record.get("record_state") ? "disable" : "enable";

  const openState =
    record && record.get("status") === "open" ? "close" : "reopen";

  const assignPermissions = [
    "manage",
    "assign",
    "assign_within_user_group",
    "assign_within_agency permissions"
  ];

  useEffect(() => {
    dispatch(fetchAssignUsers(RECORD_TYPES[recordType]));
  }, [dispatch, recordType]);

  const userPermissions = useSelector(state =>
    getPermissionsByRecord(state, recordType)
  );

  const canAddNotes = checkPermissions(userPermissions, ["manage", "add_note"]);
  const canReopen = checkPermissions(userPermissions, ["manage", "reopen"]);
  const canClose = checkPermissions(userPermissions, ["manage", "close"]);
  const canEnable = checkPermissions(userPermissions, [
    "manage",
    "enable_disable_record"
  ]);
  const canTransfer = checkPermissions(userPermissions, assignPermissions);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemAction = itemAction => {
    handleClose();
    itemAction();
  };

  const handleReopenDialogOpen = () => {
    setOpenReopenDialog(true);
  };

  const handleReopenDialogClose = () => {
    setOpenReopenDialog(false);
  };

  const handleEnableDialogOpen = () => {
    setOpenEnableDialog(true);
  };

  const handleEnableDialogClose = () => {
    setOpenEnableDialog(false);
  };

  const transitionsProps = {
    record,
    transitionType,
    setTransitionType,
    recordType,
    userPermissions
  };

  const handleNotesClose = () => {
    setOpenNotesDialog(false);
  };

  const handleNotesOpen = () => {
    setOpenNotesDialog(true);
  };

  const actions = [
    {
      name: i18n.t("buttons.import"),
      action: () => console.log("Some action"),
      recordType: "all"
    },
    {
      name: i18n.t("exports.custom_exports.label"),
      action: () => console.log("Some action"),
      recordType: "all"
    },
    {
      name: i18n.t("buttons.mark_for_mobile"),
      action: () => console.log("Some action"),
      recordType: "all"
    },
    {
      name: i18n.t("buttons.unmark_for_mobile"),
      action: () => console.log("Some action"),
      recordType: "all"
    },
    {
      name: `${i18n.t("buttons.referral")} ${recordType}`,
      action: () => setTransitionType("referral"),
      recordType
    },
    {
      name: `${i18n.t("buttons.reassign")} ${recordType}`,
      action: () => setTransitionType("reassign"),
      recordType,
      condition: canTransfer
    },
    {
      name: `${i18n.t("buttons.transfer")} ${recordType}`,
      action: () => setTransitionType("transfer"),
      recordType: ["cases", "incidents"]
    },
    {
      name: i18n.t("actions.incident_details_from_case"),
      action: () => console.log("Some action"),
      recordType: "cases"
    },
    {
      name: i18n.t("actions.services_section_from_case"),
      action: () => console.log("Some action"),
      recordType: "cases"
    },
    {
      name: i18n.t(`actions.${openState}`),
      action: handleReopenDialogOpen,
      recordType: "all",
      condition:
        mode &&
        mode.isShow &&
        ((canReopen && openState === "reopen") ||
          (canClose && openState === "close"))
    },
    {
      name: i18n.t(`actions.${enableState}`),
      action: handleEnableDialogOpen,
      recordType: "all",
      condition: mode && mode.isShow && canEnable
    },
    {
      name: i18n.t("actions.notes"),
      action: handleNotesOpen,
      recordType: "all",
      condition: canAddNotes
    }
  ];

  const enable = (
    <ToggleEnable
      close={handleEnableDialogClose}
      openEnableDialog={openEnableDialog}
      record={record}
      recordType={recordType}
    />
  );

  const open = (
    <ToggleOpen
      close={handleReopenDialogClose}
      openReopenDialog={openReopenDialog}
      record={record}
      recordType={recordType}
    />
  );

  return (
    <>
      {mode && mode.isShow ? (
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon color={iconColor} />
        </IconButton>
      ) : null}

      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {actions
          .filter(a => {
            return (
              (a.recordType === "all" ||
                a.recordType === recordType ||
                (Array.isArray(a.recordType) &&
                  a.recordType.includes(recordType))) &&
              (typeof a.condition === "undefined" || a.condition)
            );
          })
          .map(action => (
            <MenuItem
              key={action.name}
              selected={action.name === "Pyxis"}
              onClick={() => handleItemAction(action.action)}
            >
              {action.name}
            </MenuItem>
          ))}
      </Menu>

      {(canReopen && openState === "reopen") ||
      (canClose && openState === "close")
        ? open
        : null}

      {canEnable ? enable : null}

      <Transitions {...transitionsProps} />

      {canAddNotes ? (
        <Notes close={handleNotesClose} openNotesDialog={openNotesDialog} />
      ) : null}
    </>
  );
};

RecordActions.propTypes = {
  recordType: PropTypes.string.isRequired,
  iconColor: PropTypes.string,
  record: PropTypes.object,
  mode: PropTypes.object
};

export default RecordActions;
