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

function SidenavCollapse({ icon, name, active, ...rest }) {
  const [controller] = useMaterialUIController();
  const { transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;

  return (
    <ListItem
      component="li"
      disablePadding
      sx={{
        mb: 0.75,
        display: "flex",
        width: "100%",
      }}
    >
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
          display: "flex",
          alignItems: "center",
          width: "100%",
          minHeight: { xs: 44, sm: 48 },
          borderRadius: { xs: 10, sm: 12 },
          px: { xs: 1.5, sm: 1 },
          py: { xs: 1, sm: 0 },
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        })}
      >
        <ListItemIcon
          sx={(theme) => ({
            ...collapseIconBox(theme, { transparentSidenav, whiteSidenav, darkMode, active }),
            minWidth: { xs: 36, sm: 40 },
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
            margin: 0,
          })}
        >
          {typeof icon === "string" ? (
            <Icon
              sx={(theme) => ({
                ...collapseIcon(theme, { active }),
                fontSize: { xs: 20, sm: 24 },
                transition: "all 0.3s ease",
              })}
            >
              {icon}
            </Icon>
          ) : (
            icon
          )}
        </ListItemIcon>

        <ListItemText
          primary={name}
          sx={(theme) => ({
            ...collapseText(theme, {
              miniSidenav: false,
              transparentSidenav,
              whiteSidenav,
              active,
            }),
            margin: 0,
            "& .MuiListItemText-primary": {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: { xs: 13, sm: 14 },
              lineHeight: { xs: 1.4, sm: 1.2 },
              fontWeight: active ? 600 : 500,
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
};

export default SidenavCollapse;
