import React, { useState } from "react";
import { Box, useMediaQuery } from "@material-ui/core";
import PropTypes from "prop-types";
import { makeStyles, useTheme } from "@material-ui/styles";

import UnicefLogo from "../../images/unicef.png";
import UnicefPictorial from "../../images/unicef-pictorial.png";

import styles from "./styles.css";

const AgencyLogo = ({ logo, agency }) => {
  const css = makeStyles(styles)();
  const theme = useTheme();
  const tabletDisplay = useMediaQuery(theme.breakpoints.only("md"));
  const unicefLogo = tabletDisplay ? UnicefPictorial : UnicefLogo;
  const [showImage, setShowImage] = useState(true);

  return (
    <Box className={css.agencyLogoContainer}>
      {showImage ? (
        <>
          <div className={css.line} />
          <img
            onError={() => {
              setShowImage(false);
            }}
            className={css.agencyLogo}
            src={logo || unicefLogo}
            alt={agency}
          />
          <div className={css.line} />
        </>
      ) : null}
    </Box>
  );
};

AgencyLogo.displayName = "AgencyLogo";

AgencyLogo.defaultProps = {
  agency: "unicef"
};

AgencyLogo.propTypes = {
  agency: PropTypes.string,
  logo: PropTypes.string
};

export default AgencyLogo;
