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

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

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
        borderRadius: { xs: 2, md: 3 },
        overflow: "hidden",
        height: { xs: 200, sm: 220, md: 240 },
        cursor: "pointer",
        border: `1px solid ${alpha(palette.green, 0.1)}`,
        boxShadow: `0 4px 20px ${alpha(palette.green, 0.1)}`,
        backgroundColor: "#fff",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: `0 12px 32px ${alpha(palette.green, 0.2)}`,
          "& .category-image": {
            transform: "scale(1.08)",
          },
          "& .category-overlay": {
            background: `linear-gradient(180deg, ${alpha("#000", 0.3)} 0%, ${alpha(
              "#000",
              0.75
            )} 100%)`,
          },
          "& .category-badge": {
            opacity: 1,
          },
        },
      }}
    >
      {/* Barra superior com gradiente */}
      <MDBox
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${palette.gold}, ${alpha(palette.gold, 0.6)})`,
          zIndex: 2,
        }}
      />

      {/* Imagem de fundo */}
      <MDBox
        component="img"
        src={image}
        alt={name}
        loading="lazy"
        className="category-image"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Overlay com gradiente */}
      <MDBox
        className="category-overlay"
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${alpha("#000", 0.2)} 0%, ${alpha(
            "#000",
            0.7
          )} 100%)`,
          transition: "background 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Badge com ícone */}
      <MDBox
        className="category-badge"
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          backgroundColor: alpha(palette.gold, 0.9),
          backdropFilter: "blur(10px)",
          px: 1.5,
          py: 0.75,
          borderRadius: "12px",
          boxShadow: `0 4px 12px ${alpha(palette.gold, 0.3)}`,
          zIndex: 1,
          opacity: 0.95,
          transition: "opacity 0.3s ease",
        }}
      >
        <Icon sx={{ fontSize: 16, color: "#fff" }}>restaurant</Icon>
        <MDTypography
          variant="caption"
          fontWeight="bold"
          sx={{ fontSize: "0.7rem", color: "#fff" }}
        >
          Categoria
        </MDTypography>
      </MDBox>

      {/* Conteúdo de texto */}
      <MDBox
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: { xs: 2, md: 2.5 },
          zIndex: 1,
        }}
      >
        <MDTypography
          variant="h6"
          fontWeight="bold"
          sx={{
            fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
            color: "#fff",
            textShadow: "0 2px 12px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)",
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >
          {name}
        </MDTypography>

        {description && (
          <MDTypography
            variant="caption"
            sx={{
              display: { xs: "none", sm: "-webkit-box" },
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "#fff",
              fontSize: { xs: "0.75rem", md: "0.8125rem" },
              textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.9)",
              lineHeight: 1.5,
            }}
          >
            {description}
          </MDTypography>
        )}
      </MDBox>

      {/* Botões de ação */}
      {isAdmin && (
        <MDBox
          className="action-buttons"
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
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
                minWidth: { xs: 32, md: 36 },
                height: { xs: 32, md: 36 },
                borderRadius: "10px",
                p: 0,
                backgroundColor: alpha("#fff", 0.95),
                backdropFilter: "blur(10px)",
                color: palette.green,
                boxShadow: `0 2px 8px ${alpha("#000", 0.15)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: palette.gold,
                  color: "#fff",
                  transform: "scale(1.08)",
                },
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Icon sx={{ fontSize: { xs: 16, md: 18 } }}>edit</Icon>
            </MDButton>
          </Tooltip>

          <Tooltip title="Excluir categoria" arrow enterDelay={250}>
            <MDButton
              aria-label={`Excluir categoria ${name}`}
              variant="contained"
              size="small"
              onClick={() => onDelete(category)}
              sx={{
                minWidth: { xs: 32, md: 36 },
                height: { xs: 32, md: 36 },
                borderRadius: "10px",
                p: 0,
                backgroundColor: alpha("#fff", 0.95),
                backdropFilter: "blur(10px)",
                color: "#d32f2f",
                boxShadow: `0 2px 8px ${alpha("#000", 0.15)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                  color: "#fff",
                  transform: "scale(1.08)",
                },
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Icon sx={{ fontSize: { xs: 16, md: 18 } }}>delete</Icon>
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
