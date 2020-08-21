/* eslint-disable react/no-multi-comp, react/display-name */
import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Formik, Form, getIn } from "formik";
import { object } from "yup";

import { fieldValidations } from "../../validations";
import { SUBFORM_DIALOG } from "../constants";
import ServicesSubform from "../services-subform";
import SubformMenu from "../subform-menu";
import { serviceHasReferFields } from "../../utils";
import ActionDialog from "../../../../action-dialog";
import { compactValues } from "../../../utils";
import SubformErrors from "../subform-errors";
import SubformDialogFields from "../subform-dialog-fields";
import { valuesWithDisplayConditions } from "../subform-field-array/utils";

const Component = ({
  arrayHelpers,
  dialogIsNew,
  field,
  formik,
  formSection,
  i18n,
  index,
  initialSubformValue,
  isFormShow,
  mode,
  oldValue,
  open,
  setOpen,
  title
}) => {
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const childFormikRef = useRef();
  const isValidIndex = index === 0 || index > 0;

  const { subform_section_configuration: subformSectionConfiguration } = field;

  const { display_conditions: displayConditions } = subformSectionConfiguration || {};

  const subformValues = () => {
    if (isValidIndex) {
      if (displayConditions) {
        return valuesWithDisplayConditions(getIn(formik.values, field.name), displayConditions)[index];
      }

      return getIn(formik.values, `${field.name}[${index}]`);
    }

    return {};
  };

  const initialSubformValues = {
    ...initialSubformValue,
    ...subformValues()
  };

  const initialSubformErrors = isValidIndex ? getIn(formik.errors, `${field.name}[${index}]`) : {};

  const buildSchema = () => {
    const subformSchema = field.subform_section_id.fields.map(sf => fieldValidations(sf, i18n));

    return object().shape(Object.assign({}, ...subformSchema));
  };

  const handleClose = () => {
    const compactedValues = compactValues(childFormikRef.current.state.values, initialSubformValues);

    if (Object.keys(childFormikRef.current.state.touched).length && Object.keys(compactedValues).length) {
      setOpenConfirmationModal(true);
    } else {
      setOpen({ open: false, index: null });
    }
  };

  let boundSubmitForm = null;

  const bindSubmitForm = submitForm => {
    boundSubmitForm = submitForm;
  };

  const onSubmit = values => {
    if (isValidIndex) {
      formik.setFieldValue(`${field.name}[${index}]`, values, false);
    } else {
      arrayHelpers.push({ ...initialSubformValues, ...values });
    }

    // Trigger validations only if the form was already submitted.
    if (formik.submitCount) {
      formik.validateForm();
    }

    setOpen({ open: false, index: null });
  };

  const buttonDialogText = dialogIsNew ? "buttons.add" : "buttons.update";

  const dialogActions =
    field.subform_section_id.unique_id === "services_section" &&
    mode.isShow &&
    serviceHasReferFields(formik.values.services_section[index]) ? (
      <SubformMenu index={index} values={formik.values.services_section} />
    ) : null;

  const renderSubform = (subformField, subformIndex) => {
    if (subformField.subform_section_id.unique_id === "services_section") {
      return <ServicesSubform field={subformField} index={subformIndex} mode={mode} formSection={formSection} />;
    }

    return <SubformDialogFields field={subformField} mode={mode} index={subformIndex} formSection={formSection} />;
  };

  const modalConfirmationProps = {
    open: openConfirmationModal,
    maxSize: "xs",
    confirmButtonLabel: i18n.t("buttons.ok"),
    dialogTitle: title,
    dialogText: i18n.t("messages.confirmation_message"),
    disableBackdropClick: true,
    cancelHandler: () => setOpenConfirmationModal(false),
    successHandler: () => {
      arrayHelpers.replace(index, oldValue);
      setOpen({ open: false, index: null });
      setOpenConfirmationModal(true);
    }
  };

  return (
    <>
      <ActionDialog
        open={open}
        successHandler={e => boundSubmitForm(e)}
        cancelHandler={handleClose}
        dialogTitle={title}
        omitCloseAfterSuccess
        confirmButtonLabel={i18n.t(buttonDialogText)}
        onClose={handleClose}
        dialogActions={dialogActions}
        disableActions={isFormShow}
      >
        <Formik
          initialValues={initialSubformValues}
          validationSchema={buildSchema()}
          validateOnBlur={false}
          validateOnChange={false}
          enableReinitialize
          onSubmit={values => onSubmit(values)}
          ref={childFormikRef}
        >
          {({ handleSubmit, submitForm, setErrors, setTouched, errors }) => {
            bindSubmitForm(submitForm);

            return (
              <Form autoComplete="off" onSubmit={handleSubmit}>
                <SubformErrors
                  initialErrors={initialSubformErrors}
                  errors={errors}
                  setErrors={setErrors}
                  setTouched={setTouched}
                />
                {renderSubform(field, index)}
              </Form>
            );
          }}
        </Formik>
      </ActionDialog>
      <ActionDialog {...modalConfirmationProps} />
    </>
  );
};

Component.displayName = SUBFORM_DIALOG;

Component.propTypes = {
  arrayHelpers: PropTypes.object.isRequired,
  dialogIsNew: PropTypes.bool.isRequired,
  field: PropTypes.object.isRequired,
  formik: PropTypes.object.isRequired,
  formSection: PropTypes.object,
  i18n: PropTypes.object.isRequired,
  index: PropTypes.number,
  initialSubformValue: PropTypes.object.isRequired,
  isFormShow: PropTypes.bool,
  mode: PropTypes.object.isRequired,
  oldValue: PropTypes.object,
  open: PropTypes.bool.isRequired,
  recordType: PropTypes.string,
  setOpen: PropTypes.func.isRequired,
  subformSectionConfiguration: PropTypes.object,
  title: PropTypes.string.isRequired
};

export default Component;
