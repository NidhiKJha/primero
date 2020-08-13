import { fromJS } from "immutable";
import { object, string } from "yup";

import { generalForm, generalFields, subform, visibilityFields, visibilityForm } from "./base";

/* eslint-disable import/prefer-default-export */
export const subformField = ({ field, i18n, formMode }) => {
  const fieldName = field.get("name");
  const { showOn, visible, mobileVisible, hideOnViewPage } = visibilityFields({
    fieldName,
    i18n
  });
  const { disabled } = generalFields({ fieldName, formMode, i18n });

  return {
    forms: fromJS([
      subform({ i18n }),
      generalForm({ fields: [disabled], fieldName, formMode, i18n }),
      visibilityForm({
        fieldName,
        i18n,
        fields: [showOn, { row: [visible, mobileVisible, hideOnViewPage] }]
      })
    ]),
    validationSchema: object().shape({
      subform_section: object().shape({
        name: object({
          en: string().required(
            i18n.t("forms.required_field", {
              field: i18n.t("fields.subform_section.name")
            })
          )
        })
      })
    })
  };
};
