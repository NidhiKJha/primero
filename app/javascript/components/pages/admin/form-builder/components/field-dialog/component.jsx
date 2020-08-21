/* eslint-disable react/display-name, react/no-multi-comp */
import React, { useEffect, useImperativeHandle, useRef } from "react";
import PropTypes from "prop-types";
import { batch, useSelector, useDispatch } from "react-redux";
import { FormContext, useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import Add from "@material-ui/icons/Add";
import CheckIcon from "@material-ui/icons/Check";

import { selectDialog } from "../../../../../record-actions/selectors";
import { setDialog } from "../../../../../record-actions/action-creators";
import bindFormSubmit from "../../../../../../libs/submit-form";
import { submitHandler, whichFormMode } from "../../../../../form";
import FormSection from "../../../../../form/components/form-section";
import { useI18n } from "../../../../../i18n";
import ActionDialog from "../../../../../action-dialog";
import { compare } from "../../../../../../libs";
import { getSelectedField, getSelectedSubform, getSelectedFields } from "../../selectors";
import {
  createSelectedField,
  clearSelectedSubformField,
  clearSelectedSubform,
  updateSelectedField,
  updateSelectedSubform
} from "../../action-creators";
import FieldsList from "../fields-list";
import ClearButtons from "../clear-buttons";
import { NEW_FIELD } from "../../constants";
import { CUSTOM_FIELD_SELECTOR_DIALOG } from "../custom-field-selector-dialog/constants";
import { getOptions } from "../../../../../record-form/selectors";
import { getLabelTypeField } from "../utils";
import CustomFieldDialog from "../custom-field-dialog";
import FieldTranslationsDialog, { NAME as FieldTranslationsDialogName } from "../field-translations-dialog";

import styles from "./styles.css";
import {
  getFormField,
  getSubformValues,
  isSubformField,
  setInitialForms,
  setSubformData,
  subformContainsFieldName,
  transformValues,
  toggleHideOnViewPage,
  buildDataToSave
} from "./utils";
import { NAME, ADMIN_FIELDS_DIALOG } from "./constants";

const Component = ({ mode, onClose, onSuccess }) => {
  const css = makeStyles(styles)();
  const formMode = whichFormMode(mode);
  const openFieldDialog = useSelector(state => selectDialog(state, ADMIN_FIELDS_DIALOG));
  const i18n = useI18n();
  const formRef = useRef();
  const dispatch = useDispatch();
  const selectedField = useSelector(state => getSelectedField(state), compare);
  const selectedSubform = useSelector(state => getSelectedSubform(state), compare);
  const lastField = useSelector(state => getSelectedFields(state, false), compare)?.last();
  const selectedFieldName = selectedField?.get("name");
  const lookups = useSelector(state => getOptions(state), compare);
  const isNested = subformContainsFieldName(selectedSubform, selectedFieldName);
  const { forms: fieldsForm, validationSchema } = getFormField({
    field: selectedField,
    i18n,
    formMode,
    css,
    lookups,
    isNested,
    onManageTranslations: () => {
      dispatch(setDialog({ dialog: FieldTranslationsDialogName, open: true }));
    }
  });

  const formMethods = useForm({ validationSchema });
  const handleClose = () => {
    if (onClose) {
      onClose();
    }

    if (selectedSubform.toSeq().size && !isNested) {
      dispatch(clearSelectedSubform());
    }

    if (selectedSubform.toSeq().size && isNested) {
      if (selectedFieldName === NEW_FIELD) {
        dispatch(setDialog({ dialog: ADMIN_FIELDS_DIALOG, open: false }));
      }
      dispatch(clearSelectedSubformField());
    } else {
      dispatch(setDialog({ dialog: ADMIN_FIELDS_DIALOG, open: false }));
    }

    if (selectedFieldName === NEW_FIELD) {
      dispatch(setDialog({ dialog: CUSTOM_FIELD_SELECTOR_DIALOG, open: true }));
    }
  };

  const editDialogTitle = isSubformField(selectedField)
    ? selectedSubform.getIn(["name", i18n.locale])
    : i18n.t("fields.edit_label");

  const dialogTitle = formMode.get("isEdit")
    ? editDialogTitle
    : i18n.t("fields.add_field_type", {
        file_type: i18n.t(`fields.${getLabelTypeField(selectedField)}`)
      });

  const confirmButtonLabel = formMode.get("isEdit") ? i18n.t("buttons.update") : i18n.t("buttons.add");
  const confirmButtonIcon = formMode.get("isNew") ? <Add /> : <CheckIcon />;

  const modalProps = {
    confirmButtonLabel,
    confirmButtonProps: {
      icon: confirmButtonIcon
    },
    dialogTitle,
    open: openFieldDialog,
    successHandler: () => bindFormSubmit(formRef),
    cancelHandler: () => handleClose(),
    omitCloseAfterSuccess: true
  };

  const addOrUpdatedSelectedField = fieldData => {
    let newFieldData = fieldData;
    const subformUniqueId = selectedSubform?.get("unique_id");
    const currentFieldName = selectedFieldName === NEW_FIELD ? Object.keys(fieldData)[0] : selectedFieldName;

    if (typeof fieldData[currentFieldName].disabled !== "undefined") {
      newFieldData = {
        [currentFieldName]: {
          ...fieldData[currentFieldName],
          disabled: !fieldData[currentFieldName].disabled
        }
      };
    }

    if (selectedFieldName === NEW_FIELD) {
      if (subformUniqueId) {
        dispatch(updateSelectedField(newFieldData, subformUniqueId));
        dispatch(clearSelectedSubformField());
      } else {
        dispatch(createSelectedField(newFieldData));
      }
    } else {
      const subformId = isNested && subformUniqueId;

      dispatch(updateSelectedField(newFieldData, subformId));

      if (subformId) {
        dispatch(clearSelectedSubformField());
      }
    }
  };

  const onSubmit = data => {
    const subformData = setInitialForms(data.subform_section);
    const fieldData = setSubformData(toggleHideOnViewPage(data[selectedFieldName]), subformData);

    const dataToSave = buildDataToSave(selectedField, fieldData, i18n.locale, lastField?.get("order"));

    batch(() => {
      if (!isNested) {
        onSuccess(dataToSave);
        dispatch(setDialog({ dialog: ADMIN_FIELDS_DIALOG, open: false }));
      }

      if (fieldData) {
        addOrUpdatedSelectedField(dataToSave);
      }

      if (isSubformField(selectedField)) {
        dispatch(updateSelectedSubform(subformData));
      }
    });
  };

  const renderForms = () =>
    fieldsForm.map(formSection => <FormSection formSection={formSection} key={formSection.unique_id} />);

  const renderFieldsList = () =>
    isSubformField(selectedField) && (
      <>
        <div className={css.subformFieldTitle}>
          <h1>{i18n.t("forms.fields")}</h1>
          <CustomFieldDialog />
        </div>
        <FieldsList subformField={selectedField} />
      </>
    );

  const renderClearButtons = () => isSubformField(selectedField) && <ClearButtons subformField={selectedField} />;

  const setLocaleField = (fieldName, locales) => {
    Object.entries(locales).forEach(([localeId, value]) => {
      if (!localeId) {
        return;
      }

      const fieldPath = `${fieldName}.${localeId}`;

      if (!formMethods.control.fields[fieldPath]) {
        formMethods.register({ name: fieldPath });
      }

      formMethods.setValue(`${fieldPath}`, value);
    });
  };

  const onUpdateTranslation = data => {
    Object.entries(data).forEach(([fieldKey, fieldNames]) => {
      Object.entries(fieldNames).forEach(([fieldName, locales]) => {
        setLocaleField(`${fieldKey}.${fieldName}`, locales);
      });
    });
  };

  useEffect(() => {
    if (selectedField?.toSeq()?.size) {
      const fieldData = toggleHideOnViewPage(transformValues(selectedField.toJS()));

      const subform =
        isSubformField(selectedField) && selectedSubform.toSeq()?.size ? getSubformValues(selectedSubform) : {};

      const resetOptions = isNested ? { errors: true, dirtyFields: true, dirty: true, touched: true } : {};

      formMethods.reset(
        {
          [selectedFieldName]: { ...fieldData, disabled: !fieldData.disabled },
          ...subform
        },
        resetOptions
      );
    }
  }, [selectedField]);

  useImperativeHandle(
    formRef,
    submitHandler({
      dispatch,
      formMethods,
      formMode,
      i18n,
      initialValues: {},
      onSubmit
    })
  );

  useEffect(() => {
    return () => {
      dispatch(setDialog({ dialog: ADMIN_FIELDS_DIALOG, open: false }));
    };
  }, []);

  return (
    <>
      <ActionDialog {...modalProps}>
        <FormContext {...formMethods} formMode={formMode}>
          <form className={css.fieldDialog}>
            {renderForms()}
            {renderFieldsList()}
            {renderClearButtons()}
          </form>
        </FormContext>
      </ActionDialog>

      <FieldTranslationsDialog
        mode={mode}
        field={selectedField}
        subform={selectedSubform}
        currentValues={formMethods.getValues({ nest: true })}
        onSuccess={onUpdateTranslation}
      />
    </>
  );
};

Component.displayName = NAME;

Component.propTypes = {
  mode: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func
};

export default Component;
