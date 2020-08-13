import React from "react";
import PropTypes from "prop-types";
import { List, Collapse } from "@material-ui/core";

import NavItem from "../nav-item";

import { NAME } from "./constants";

const Component = ({ group, handleClick, isNew, open, recordAlerts, selectedForm, validationErrors }) => {
  const [...forms] = group.values();
  const isNested = forms.length > 1;
  const parentForm = forms[0];

  const groupHasError = validationErrors?.some(error => error.get("form_group_id") === parentForm.group);

  const formHasError = form => Boolean(validationErrors?.find(error => error.get("unique_id") === form.formId));

  const parentFormProps = {
    form: parentForm,
    name: isNested ? parentForm.groupName : parentForm.name,
    open: open === parentForm.group,
    isNested,
    hasError: groupHasError
  };

  const sharedProps = {
    handleClick,
    isNew,
    itemsOfGroup: forms.map(form => form.formId),
    recordAlerts,
    selectedForm
  };

  return (
    <>
      <NavItem {...parentFormProps} {...sharedProps} />
      {isNested && (
        <Collapse in={open === parentForm.group} timeout="auto" unmountOnExit>
          <List disablePadding dense>
            {forms.map(f => (
              <NavItem form={f} name={f.name} key={f.formId} groupItem hasError={formHasError(f)} {...sharedProps} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

Component.displayName = NAME;

Component.propTypes = {
  currentUser: PropTypes.string,
  group: PropTypes.object,
  handleClick: PropTypes.func,
  isNew: PropTypes.bool,
  open: PropTypes.string,
  recordAlerts: PropTypes.object,
  recordOwner: PropTypes.string,
  selectedForm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  validationErrors: PropTypes.object
};

export default Component;
