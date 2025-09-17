import { useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Checkbox from "@mui/material/Checkbox";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Data
import { roles } from "../data/mockData";
import { features, permission_actions, initialRolePermissions } from "../data/mockPermissions";

function PermissionsManager() {
  const [selectedRole, setSelectedRole] = useState("editor");
  const [permissions, setPermissions] = useState(initialRolePermissions);

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handlePermissionChange = (featureKey, actionKey) => {
    const currentPermissions = permissions[selectedRole] || [];
    const featurePermissions = currentPermissions[featureKey] || [];

    let newPermissions;
    if (featurePermissions.includes(actionKey)) {
      newPermissions = featurePermissions.filter((p) => p !== actionKey);
    } else {
      newPermissions = [...featurePermissions, actionKey];
    }

    setPermissions({
      ...permissions,
      [selectedRole]: {
        ...currentPermissions,
        [featureKey]: newPermissions,
      },
    });
  };

  return (
    <MDBox>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Selecionar Função</InputLabel>
          <Select value={selectedRole} label="Selecionar Função" onChange={handleRoleChange}>
            {roles.map((role) => (
              <MenuItem key={role.key} value={role.key}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <MDButton variant="gradient" color="success">
          <Icon sx={{ mr: 1 }}>save</Icon>
          Salvar Permissões
        </MDButton>
      </MDBox>

      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ display: "table-header-group" }}>
            <TableRow>
              <TableCell sx={{ width: "25%" }}>Funcionalidade</TableCell>
              {permission_actions.map((action) => (
                <TableCell key={action.key} align="center">
                  {action.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature.key}>
                <TableCell>{feature.name}</TableCell>
                {permission_actions.map((action) => (
                  <TableCell key={action.key} align="center">
                    <Checkbox
                      checked={(permissions[selectedRole]?.[feature.key] || []).includes(
                        action.key
                      )}
                      onChange={() => handlePermissionChange(feature.key, action.key)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MDBox>
  );
}

export default PermissionsManager;
