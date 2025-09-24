// CategoryCard.jsx
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { alpha } from "@mui/material/styles";

function CategoryCard({ category, isAdmin, onDelete }) {
  const { id, name, image, description } = category;
  const navigate = useNavigate();

  const goToList = () => navigate(`/todas-as-receitas?category=${encodeURIComponent(name)}`);

  const onCardKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToList();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={goToList}
      onKeyDown={onCardKeyDown}
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        aspectRatio: "16 / 9",
        cursor: "pointer",
        // visual
        border: (t) => `1px solid ${alpha(t.palette.common.black, 0.06)}`,
        boxShadow: (t) => `0 8px 24px ${alpha(t.palette.common.black, 0.08)}`,
        backgroundColor: "#0f1a17",
        transition: "transform .28s ease, box-shadow .28s ease",
        willChange: "transform",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (t) => `0 14px 30px ${alpha(t.palette.common.black, 0.16)}`,
        },
        // evita “pulos” no grid no hover
        contain: "layout paint size",
      }}
    >
      {/* Imagem de fundo */}
      <MDBox
        component="img"
        src={image}
        alt={name}
        loading="lazy"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          transform: "scale(1)",
          transition: "transform .4s ease",
          ".MuiCard-root:hover &": { transform: "scale(1.05)" },
        }}
      />

      {/* Gradiente + blur para legibilidade */}
      <MDBox
        className="overlay"
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.45) 65%, rgba(0,0,0,.65) 100%)",
          backdropFilter: "blur(1.5px)",
          transition: "background .3s ease",
          p: 2,
        }}
      >
        <MDBox sx={{ textAlign: "center", px: 2 }}>
          <MDTypography
            variant="h5"
            fontWeight="bold"
            color="white"
            sx={{
              textShadow: "0 2px 6px rgba(0,0,0,.45)",
              lineHeight: 1.25,
              letterSpacing: ".2px",
            }}
          >
            {name}
          </MDTypography>

          {description ? (
            <MDTypography
              variant="caption"
              color="white"
              sx={{
                mt: 0.8,
                opacity: 0.9,
                display: { xs: "none", sm: "-webkit-box" },
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </MDTypography>
          ) : null}
        </MDBox>
      </MDBox>

      {/* Botões de ação: fora da área da imagem, com z-index alto */}
      {isAdmin && (
        <MDBox
          className="action-buttons"
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            gap: 1,
            zIndex: 2,
          }}
        >
          <Tooltip title="Editar categoria" arrow enterDelay={250}>
            <MDButton
              component={Link}
              to={`/categories/editar/${id}`}
              state={{ category }}
              aria-label={`Editar categoria ${name}`}
              variant="contained"
              size="small"
              sx={{
                minWidth: 36,
                height: 36,
                borderRadius: "12px",
                p: 0,
                backgroundColor: "#C9A635",
                color: "#fff",
                "&:hover": { backgroundColor: "#b4952e" },
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Icon fontSize="small">edit</Icon>
            </MDButton>
          </Tooltip>

          <Tooltip title="Excluir categoria" arrow enterDelay={250}>
            <MDButton
              aria-label={`Excluir categoria ${name}`}
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onDelete(category)}
              sx={{
                minWidth: 36,
                height: 36,
                borderRadius: "12px",
                p: 0,
                backdropFilter: "saturate(140%)",
                backgroundColor: (t) => alpha(t.palette.background.paper, 0.1),
                borderColor: (t) => alpha(t.palette.error.main, 0.4),
                "&:hover": {
                  borderColor: (t) => t.palette.error.main,
                  backgroundColor: (t) => alpha(t.palette.error.main, 0.06),
                },
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Icon fontSize="small">delete</Icon>
            </MDButton>
          </Tooltip>
        </MDBox>
      )}
    </Card>
  );
}

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CategoryCard;
