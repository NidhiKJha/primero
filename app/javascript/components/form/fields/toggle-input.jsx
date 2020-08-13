import React from "react";
import PropTypes from "prop-types";
import { Checkbox, FormControl, FormGroup, FormControlLabel, FormHelperText } from "@material-ui/core";
import { Controller } from "react-hook-form";

const ToggleInput = ({ commonInputProps }) => {
  const { helperText, error, disabled, name, label, className } = commonInputProps;

  return (
    <FormControl error={error} className={className}>
      <FormGroup>
        <FormControlLabel
          disabled={disabled}
          labelPlacement="end"
          control={<Controller name={name} as={Checkbox} defaultValue={false} />}
          label={label}
        />
      </FormGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

ToggleInput.displayName = "ToggleInput";

ToggleInput.propTypes = {
  commonInputProps: PropTypes.shape({
    className: PropTypes.string,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string
  })
};

export default ToggleInput;
