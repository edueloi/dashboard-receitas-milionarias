import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// @mui material components
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import { alpha } from "@mui/material/styles";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function TagCard({ tag, isAdmin, onEdit, onDelete }) {
  const { id, nome } = tag;

  return (
    <MDBox
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        position: "relative",
      }}
    >
      <Link
        to={`/todas-as-receitas?tag=${encodeURIComponent(nome)}`}
        style={{ textDecoration: "none" }}
      >
        <Chip
          label={nome}
          icon={<Icon sx={{ fontSize: "18px !important", color: palette.gold }}>label</Icon>}
          variant="outlined"
          sx={{
            cursor: "pointer",
            fontSize: { xs: "0.8125rem", md: "0.875rem" },
            fontWeight: 600,
            px: 1,
            py: 2.5,
            height: "auto",
            borderRadius: "12px",
            borderColor: alpha(palette.green, 0.3),
            color: palette.green,
            backgroundColor: alpha(palette.green, 0.03),
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "& .MuiChip-label": {
              px: 1,
            },
            "& .MuiChip-icon": {
              ml: 1,
            },
            "&:hover": {
              backgroundColor: palette.gold,
              borderColor: palette.gold,
              color: "#fff",
              transform: "translateY(-2px) scale(1.02)",
              boxShadow: `0 4px 12px ${alpha(palette.gold, 0.3)}`,
              "& .MuiChip-icon": {
                color: "#fff",
              },
            },
          }}
        />
      </Link>

      {isAdmin && (
        <MDBox sx={{ display: "flex", gap: 0.5, ml: 0.5 }}>
          <Tooltip title="Editar tag" arrow>
            <IconButton
              size="small"
              onClick={() => onEdit(tag)}
              sx={{
                width: 28,
                height: 28,
                color: palette.green,
                backgroundColor: alpha(palette.green, 0.08),
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: palette.gold,
                  color: "#fff",
                  transform: "scale(1.1)",
                },
              }}
            >
              <Icon sx={{ fontSize: 16 }}>edit</Icon>
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir tag" arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(tag)}
              sx={{
                width: 28,
                height: 28,
                color: "#d32f2f",
                backgroundColor: alpha("#d32f2f", 0.08),
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                  color: "#fff",
                  transform: "scale(1.1)",
                },
              }}
            >
              <Icon sx={{ fontSize: 16 }}>delete</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      )}
    </MDBox>
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
