import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

/**
 * size:
 *  - "normal": 16/9
 *  - "tall":   4/3 (mostra mais imagem)
 *  - "hero":   3/2 desktop, 4/3 mobile
 */
function UserRecipeCard({ recipe, onEdit, onDelete, size = "normal" }) {
  const { id, name, image, description, category } = recipe;

  const ratio =
    size === "hero"
      ? { xs: "4 / 3", md: "3 / 2" }
      : size === "tall"
      ? { xs: "4 / 3", md: "4 / 3" }
      : { xs: "16 / 9", md: "16 / 9" };

  return (
    <Card
      sx={{
        overflow: "hidden",
        borderRadius: 3,
        boxShadow: (t) => `0 10px 26px ${alpha(t.palette.common.black, 0.18)}`,
        transition: "transform .22s ease, box-shadow .22s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (t) => `0 16px 36px ${alpha(t.palette.common.black, 0.26)}`,
        },
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Topo: imagem livre, sem texto por cima */}
      <MDBox sx={{ position: "relative" }}>
        <MDBox
          component="img"
          src={image}
          alt={name}
          loading="lazy"
          sx={{
            width: "100%",
            height: "auto",
            display: "block",
            aspectRatio: ratio, // controla a altura
            objectFit: "cover",
            objectPosition: "center",
            transform: "scale(1)",
            transition: "transform .45s ease",
            ".MuiCard-root:hover &": { transform: "scale(1.045)" },
          }}
        />

        {/* Chip de categoria opcional */}
        {category ? (
          <Chip
            label={category}
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 2,
              bgcolor: alpha("#0f1a17", 0.5),
              color: "#fff",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,.25)",
              "& .MuiChip-label": { px: 1.25, fontWeight: 600, letterSpacing: ".2px" },
            }}
          />
        ) : null}
      </MDBox>

      {/* Divider sutil entre imagem e conteúdo */}
      <Divider sx={{ opacity: 0.5 }} />

      {/* Base: conteúdo visível (fora da imagem) + ações à direita */}
      <MDBox
        sx={{
          px: 1.5,
          py: 1.25,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
          flexGrow: 1,
        }}
      >
        <MDBox
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <MDTypography
            variant="h6"
            fontWeight="bold"
            sx={{ lineHeight: 1.2, pr: 1, flex: 1, minWidth: 0 }}
            title={name}
          >
            {name}
          </MDTypography>

          {/* Ações (não cobrem a imagem) */}
          <MDBox className="action-buttons" sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
            <Tooltip title="Editar receita" arrow enterDelay={150}>
              <MDButton
                aria-label="Editar receita"
                variant="contained"
                size="small"
                onClick={() => onEdit(id)}
                sx={{
                  minWidth: 34,
                  height: 34,
                  p: 0,
                  borderRadius: "10px",
                  backgroundColor: "#C9A635",
                  color: "#fff",
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#B5942E" },
                }}
              >
                <Icon fontSize="small">edit</Icon>
              </MDButton>
            </Tooltip>

            <Tooltip title="Excluir receita" arrow enterDelay={150}>
              <MDButton
                aria-label="Excluir receita"
                variant="outlined"
                color="error"
                size="small"
                onClick={() => onDelete(id)}
                sx={{
                  minWidth: 34,
                  height: 34,
                  p: 0,
                  borderRadius: "10px",
                }}
              >
                <Icon fontSize="small">delete</Icon>
              </MDButton>
            </Tooltip>
          </MDBox>
        </MDBox>

        {description ? (
          <MDTypography
            variant="caption"
            color="text"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3, // mostra mais texto sem bagunçar
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              opacity: 0.9,
            }}
          >
            {description}
          </MDTypography>
        ) : null}
      </MDBox>
    </Card>
  );
}

UserRecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  size: PropTypes.oneOf(["normal", "tall", "hero"]),
};

export default UserRecipeCard;
