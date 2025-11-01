import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { alpha } from "@mui/material/styles";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function TagCard({ tag, isAdmin, onEdit, onDelete }) {
  const { id, nome } = tag;

  return (
    <Card
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: { xs: 1.5, md: 2 },
        borderRadius: "16px",
        border: `2px solid ${alpha(palette.green, 0.15)}`,
        backgroundColor: alpha(palette.green, 0.02),
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        overflow: "visible",
        "&:hover": {
          borderColor: palette.gold,
          backgroundColor: alpha(palette.gold, 0.04),
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${alpha(palette.gold, 0.2)}`,
        },
      }}
    >
      <Link
        to={`/todas-as-receitas?tag=${encodeURIComponent(nome)}`}
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: 1,
        }}
      >
        <MDBox
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { xs: 36, md: 40 },
            height: { xs: 36, md: 40 },
            borderRadius: "12px",
            backgroundColor: alpha(palette.gold, 0.1),
            border: `1px solid ${alpha(palette.gold, 0.3)}`,
            transition: "all 0.3s ease",
            "& .MuiIcon-root": {
              transition: "all 0.3s ease",
            },
          }}
        >
          <Icon sx={{ fontSize: { xs: 20, md: 22 }, color: palette.gold }}>label</Icon>
        </MDBox>

        <MDTypography
          variant="button"
          fontWeight="bold"
          sx={{
            color: palette.green,
            fontSize: { xs: "0.875rem", md: "0.9375rem" },
            transition: "color 0.3s ease",
          }}
        >
          {nome}
        </MDTypography>
      </Link>

      {isAdmin && (
        <MDBox
          sx={{
            display: "flex",
            gap: 0.75,
            ml: 2,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Editar tag" arrow placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                onEdit(tag);
              }}
              sx={{
                width: { xs: 34, md: 36 },
                height: { xs: 34, md: 36 },
                color: palette.green,
                backgroundColor: alpha(palette.green, 0.08),
                border: `1px solid ${alpha(palette.green, 0.2)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: palette.gold,
                  borderColor: palette.gold,
                  color: "#fff",
                  transform: "scale(1.1) rotate(5deg)",
                  boxShadow: `0 4px 12px ${alpha(palette.gold, 0.3)}`,
                },
              }}
            >
              <Icon sx={{ fontSize: { xs: 18, md: 19 } }}>edit</Icon>
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir tag" arrow placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                onDelete(tag);
              }}
              sx={{
                width: { xs: 34, md: 36 },
                height: { xs: 34, md: 36 },
                color: "#d32f2f",
                backgroundColor: alpha("#d32f2f", 0.08),
                border: `1px solid ${alpha("#d32f2f", 0.2)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                  borderColor: "#d32f2f",
                  color: "#fff",
                  transform: "scale(1.1) rotate(-5deg)",
                  boxShadow: `0 4px 12px ${alpha("#d32f2f", 0.3)}`,
                },
              }}
            >
              <Icon sx={{ fontSize: { xs: 18, md: 19 } }}>delete</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      )}
    </Card>
  );
}

TagCard.propTypes = {
  tag: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nome: PropTypes.string.isRequired,
  }).isRequired,
  isAdmin: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

TagCard.defaultProps = {
  isAdmin: false,
  onEdit: () => {},
  onDelete: () => {},
};

export default TagCard;
