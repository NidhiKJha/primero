import React from "react";
import PropTypes from "prop-types";
import { differenceInYears, parseISO } from "date-fns";
import { DatePicker, DateTimePicker } from "@material-ui/pickers";
import { InputAdornment } from "@material-ui/core";
import { FastField, connect, getIn } from "formik";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import omitBy from "lodash/omitBy";
import isEmpty from "lodash/isEmpty";

import { DATE_FORMAT, DATE_TIME_FORMAT } from "../../../../config";
import { useI18n } from "../../../i18n";
import { DATE_FIELD_NAME } from "../constants";
import { NOT_FUTURE_DATE } from "../../constants";

const DateField = ({ name, helperText, mode, formik, InputProps, ...rest }) => {
  const i18n = useI18n();
  const allowedDefaultValues = ["TODAY", "NOW"];

  const { date_include_time: dateIncludeTime, selected_value: selectedValue } = rest.field;

  const fieldProps = {
    name
  };

  const updateAgeField = (form, date) => {
    const matches = name.match(/(.*)date_of_birth$/);

    if (matches && date) {
      const diff = differenceInYears(new Date(), date || new Date());

      form.setFieldValue(`${matches[1]}age`, diff, true);
    }
  };

  const getDateValue = (form, field) => {
    const { value } = field;
    let dateValue = null;

    if (value) {
      dateValue = value;
    } else if (!value && allowedDefaultValues.includes(selectedValue.toUpperCase()) && !mode?.isShow) {
      dateValue = new Date();
    }
    form.setFieldValue(name, dateValue, true);

    if (dateIncludeTime || isEmpty(value)) {
      return dateValue;
    }

    return parseISO(dateValue.slice(0, 10));
  };

  const fieldError = getIn(formik.errors, name);
  const fieldTouched = getIn(formik.touched, name);

  return (
    <FastField
      {...fieldProps}
      render={({ field, form }) => {
        const dateProps = {
          ...{ ...field, value: getDateValue(form, field) },
          ...omitBy(rest, (v, k) => ["recordType", "recordID"].includes(k)),
          format: dateIncludeTime ? DATE_TIME_FORMAT : DATE_FORMAT,
          helperText: (fieldTouched && fieldError) || helperText || i18n.t("fields.date_help"),
          clearable: true,
          InputProps: {
            ...InputProps,
            ...(mode.isShow || {
              endAdornment: (
                <InputAdornment position="end">
                  <CalendarTodayIcon />
                </InputAdornment>
              )
            })
          },
          onChange: date => {
            updateAgeField(form, date);

            return form.setFieldValue(name, date, true);
          },
          disableFuture: rest.field && rest.field.get("date_validation") === NOT_FUTURE_DATE,
          error: !!(fieldError && fieldTouched)
        };

        return dateIncludeTime ? <DateTimePicker {...dateProps} /> : <DatePicker {...dateProps} />;
      }}
    />
  );
};

DateField.displayName = DATE_FIELD_NAME;

DateField.propTypes = {
  formik: PropTypes.object.isRequired,
  helperText: PropTypes.string,
  InputProps: PropTypes.object,
  mode: PropTypes.object,
  name: PropTypes.string,
  value: PropTypes.string
};

export default connect(DateField);
