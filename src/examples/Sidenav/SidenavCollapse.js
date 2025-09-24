// examples/Sidenav/SidenavCollapse.js
import PropTypes from "prop-types";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import {
  collapseItem,
  collapseIconBox,
  collapseIcon,
  collapseText,
} from "examples/Sidenav/styles/sidenavCollapse";
import { useMaterialUIController } from "context";

function SidenavCollapse({ icon, name, active, alwaysShowText = true, ...rest }) {
  const [controller] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;

  const miniForText = alwaysShowText ? false : miniSidenav;

  return (
    <ListItem component="li" disablePadding sx={{ mb: 0.5 }}>
      <MDBox
        role="button"
        tabIndex={0}
        aria-current={active ? "page" : undefined}
        {...rest}
        sx={(theme) => ({
          ...collapseItem(theme, {
            active,
            transparentSidenav,
            whiteSidenav,
            darkMode,
            sidenavColor,
          }),
          minHeight: 48,
          borderRadius: 12,
          px: 1, // encosta menos nas bordas
        })}
      >
        <ListItemIcon
          sx={(theme) => ({
            ...collapseIconBox(theme, { transparentSidenav, whiteSidenav, darkMode, active }),
            minWidth: 40,
          })}
        >
          {typeof icon === "string" ? (
            <Icon sx={(theme) => collapseIcon(theme, { active })}>{icon}</Icon>
          ) : (
            icon
          )}
        </ListItemIcon>

        <ListItemText
          primary={name}
          sx={(theme) => ({
            ...collapseText(theme, {
              miniSidenav: miniForText,
              transparentSidenav,
              whiteSidenav,
              active,
            }),
            "& .MuiListItemText-primary": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: 14,
              lineHeight: 1.2,
            },
          })}
        />
      </MDBox>
    </ListItem>
  );
}

SidenavCollapse.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  alwaysShowText: PropTypes.bool,
};

export default SidenavCollapse;
