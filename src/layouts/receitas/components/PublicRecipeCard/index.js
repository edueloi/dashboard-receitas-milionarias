import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { slugify } from "utils/slugify";
import toast from "react-hot-toast";
import { useAuth } from "context/AuthContext";

import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function PublicRecipeCard({ recipe }) {
  const { user } = useAuth();
  const { id, name, image, description, author, rating, votes, category, tags } = recipe;

  const showRating =
    (typeof rating === "number" && rating > 0) || (typeof votes === "number" && votes > 0);

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let affiliateCode = user?.codigo_afiliado_proprio;
    if (!affiliateCode) {
      toast.error("Você precisa ser um afiliado para compartilhar receitas.");
      return;
    }

    if (affiliateCode.startsWith("afiliado_")) {
      affiliateCode = affiliateCode.replace("afiliado_", "");
    }

    const externalSiteUrl =
      process.env.REACT_APP_EXTERNAL_SITE_URL || "https://receitasmilionarias.com.br";
    const shareUrl = `${externalSiteUrl}/receita.html?id=${id}&ref=${affiliateCode}`;

    navigator.clipboard.writeText(shareUrl).then(
      () => {
        toast.success("Link de compartilhamento copiado!");
      },
      (err) => {
        console.error("Erro ao copiar o link: ", err);
        toast.error("Não foi possível copiar o link.");
      }
    );
  };

  return (
    <Link to={`/receita/${id}-${slugify(name)}`} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          borderRadius: { xs: 2.5, md: 3 },
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${alpha(palette.green, 0.12)}`,
          boxShadow: `0 4px 20px ${alpha(palette.green, 0.1)}`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${palette.gold}, ${palette.green})`,
            opacity: 0,
            transition: "opacity 0.3s ease",
          },
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: `0 12px 40px ${alpha(palette.gold, 0.2)}`,
            borderColor: alpha(palette.gold, 0.3),
            "&::before": {
              opacity: 1,
            },
          },
        }}
      >
        {/* IMAGEM */}
        <MDBox sx={{ position: "relative", overflow: "hidden" }}>
          <MDBox
            component="img"
            src={image}
            alt={name}
            loading="lazy"
            sx={{
              width: "100%",
              display: "block",
              aspectRatio: { xs: "16/9", md: "4/3" },
              objectFit: "cover",
              objectPosition: "center",
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              ".MuiCard-root:hover &": { transform: "scale(1.08)" },
            }}
          />

          {/* Overlay gradiente sutil */}
          <MDBox
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, ${alpha(palette.green, 0)} 50%, ${alpha(
                palette.green,
                0.4
              )} 100%)`,
              opacity: 0,
              transition: "opacity 0.3s ease",
              ".MuiCard-root:hover &": { opacity: 1 },
            }}
          />

          {/* Categoria */}
          {category && (
            <Chip
              label={category}
              size="small"
              icon={<Icon sx={{ fontSize: "14px !important" }}>restaurant</Icon>}
              sx={{
                position: "absolute",
                top: { xs: 8, md: 12 },
                left: { xs: 8, md: 12 },
                bgcolor: alpha(palette.green, 0.95),
                color: "#fff",
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha("#fff", 0.2)}`,
                fontWeight: 600,
                fontSize: { xs: "0.7rem", md: "0.75rem" },
                height: { xs: 24, md: 26 },
                "& .MuiChip-icon": {
                  color: palette.gold,
                  marginLeft: "4px",
                },
                "& .MuiChip-label": { px: 1 },
                boxShadow: `0 2px 8px ${alpha(palette.green, 0.3)}`,
              }}
            />
          )}

          {/* Rating */}
          {showRating && (
            <MDBox
              sx={{
                position: "absolute",
                top: { xs: 8, md: 12 },
                right: { xs: 8, md: 12 },
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: { xs: 1, md: 1.25 },
                py: 0.5,
                borderRadius: 999,
                bgcolor: alpha(palette.gold, 0.95),
                color: "#fff",
                fontWeight: 700,
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha("#fff", 0.2)}`,
                boxShadow: `0 2px 8px ${alpha(palette.gold, 0.3)}`,
              }}
            >
              <Icon sx={{ fontSize: { xs: 16, md: 18 } }}>star</Icon>
              <MDTypography
                variant="button"
                color="inherit"
                sx={{ fontSize: { xs: "0.75rem", md: "0.8rem" } }}
              >
                {Number(rating ?? 0).toFixed(1)}
                <MDTypography
                  component="span"
                  variant="caption"
                  color="inherit"
                  sx={{ ml: 0.25, fontSize: { xs: "0.65rem", md: "0.7rem" } }}
                >
                  ({votes ?? 0})
                </MDTypography>
              </MDTypography>
            </MDBox>
          )}
        </MDBox>

        {/* CONTEÚDO */}
        <MDBox
          p={{ xs: 2, md: 2.5 }}
          pb={{ xs: 1.5, md: 2 }}
          flexGrow={1}
          display="flex"
          flexDirection="column"
          gap={1}
        >
          <MDTypography
            variant="h6"
            fontWeight="bold"
            sx={{
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: palette.green,
              fontSize: { xs: "1rem", md: "1.1rem" },
              transition: "color 0.3s ease",
              ".MuiCard-root:hover &": {
                color: palette.gold,
              },
            }}
            title={name}
          >
            {name}
          </MDTypography>

          {description && (
            <MDTypography
              variant="caption"
              color="text"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                opacity: 0.85,
                lineHeight: 1.5,
                fontSize: { xs: "0.8rem", md: "0.85rem" },
              }}
            >
              {description}
            </MDTypography>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <MDBox display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
              {tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.nome}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    backgroundColor: alpha(palette.gold, 0.1),
                    color: palette.gold,
                    fontWeight: 600,
                    border: `1px solid ${alpha(palette.gold, 0.2)}`,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              ))}
              {tags.length > 3 && (
                <Chip
                  label={`+${tags.length - 3}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    backgroundColor: alpha(palette.green, 0.1),
                    color: palette.green,
                    fontWeight: 600,
                    border: `1px solid ${alpha(palette.green, 0.2)}`,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              )}
            </MDBox>
          )}
        </MDBox>

        {/* RODAPÉ */}
        <MDBox
          px={{ xs: 2, md: 2.5 }}
          pb={{ xs: 2, md: 2.5 }}
          pt={1}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          borderTop={`1px solid ${alpha(palette.green, 0.08)}`}
        >
          {/* Autor */}
          <MDBox display="flex" alignItems="center" gap={1} minWidth={0} flex={1}>
            {author?.avatar ? (
              <Avatar
                src={author.avatar}
                alt={author.name}
                sx={{
                  width: { xs: 32, md: 36 },
                  height: { xs: 32, md: 36 },
                  border: `2px solid ${alpha(palette.gold, 0.3)}`,
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: { xs: 32, md: 36 },
                  height: { xs: 32, md: 36 },
                  bgcolor: palette.green,
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {author?.name?.[0] || "A"}
              </Avatar>
            )}
            <MDBox minWidth={0}>
              <MDTypography
                variant="caption"
                sx={{
                  display: "block",
                  fontSize: "0.65rem",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Criado por
              </MDTypography>
              <MDTypography
                variant="button"
                sx={{
                  display: "block",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", md: "0.85rem" },
                  color: palette.green,
                }}
                title={author?.name}
              >
                {author?.name}
              </MDTypography>
            </MDBox>
          </MDBox>

          {/* Botão Compartilhar */}
          <Tooltip title="Copiar link de afiliado" placement="top">
            <IconButton
              onClick={handleShare}
              size="small"
              sx={{
                bgcolor: alpha(palette.gold, 0.1),
                color: palette.gold,
                border: `1px solid ${alpha(palette.gold, 0.3)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: palette.gold,
                  color: "#fff",
                  transform: "scale(1.1)",
                  boxShadow: `0 4px 12px ${alpha(palette.gold, 0.3)}`,
                },
              }}
            >
              <Icon sx={{ fontSize: { xs: 18, md: 20 } }}>share</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      </Card>
    </Link>
  );
}

PublicRecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string,
    author: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
    rating: PropTypes.number,
    votes: PropTypes.number,
    category: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        nome: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default PublicRecipeCard;
