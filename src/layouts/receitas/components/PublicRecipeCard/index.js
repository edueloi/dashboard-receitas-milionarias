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

function PublicRecipeCard({ recipe }) {
  const { user } = useAuth();
  const { id, name, image, description, author, rating, votes, category } = recipe;

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
          borderRadius: 3,
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: (t) => `1px solid ${alpha(t.palette.common.black, 0.06)}`,
          boxShadow: (t) => `0 8px 24px ${alpha(t.palette.common.black, 0.08)}`,
          transition: "transform .24s ease, box-shadow .24s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: (t) => `0 14px 30px ${alpha(t.palette.common.black, 0.16)}`,
          },
        }}
      >
        {/* IMAGEM */}
        <MDBox sx={{ position: "relative" }}>
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
              transition: "transform .45s ease",
              ".MuiCard-root:hover &": { transform: "scale(1.035)" },
            }}
          />

          {/* Categoria (se tiver) */}
          {category ? (
            <Chip
              label={category}
              size="small"
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                bgcolor: alpha("#0f1a17", 0.55),
                color: "#fff",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,.25)",
                "& .MuiChip-label": { px: 1.25, fontWeight: 600 },
              }}
            />
          ) : null}

          {/* Nota */}
          {showRating ? (
            <MDBox
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 999,
                bgcolor: alpha("#C9A635", 0.9),
                color: "#fff",
                fontWeight: 700,
              }}
            >
              <Icon fontSize="small">star</Icon>
              <MDTypography variant="button" color="inherit">
                {Number(rating ?? 0).toFixed(1)}{" "}
                <MDTypography component="span" variant="caption" color="inherit" sx={{ ml: 0.25 }}>
                  ({votes ?? 0})
                </MDTypography>
              </MDTypography>
            </MDBox>
          ) : null}
        </MDBox>

        {/* CONTEÚDO */}
        <MDBox p={2} pb={1.5} flexGrow={1} display="flex" flexDirection="column" gap={0.75}>
          <MDTypography
            variant="h6"
            fontWeight="bold"
            sx={{
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            title={name}
          >
            {name}
          </MDTypography>

          {description ? (
            <MDTypography
              variant="caption"
              color="text"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                opacity: 0.9,
              }}
            >
              {description}
            </MDTypography>
          ) : null}
        </MDBox>

        {/* RODAPÉ */}
        <MDBox
          px={2}
          pb={2}
          pt={0.5}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
        >
          <MDBox display="flex" alignItems="center" gap={1} minWidth={0}>
            {author?.avatar ? (
              <Avatar src={author.avatar} alt={author.name} sx={{ width: 28, height: 28 }} />
            ) : (
              <Avatar sx={{ width: 28, height: 28 }}>{author?.name?.[0] || "A"}</Avatar>
            )}
            <MDTypography
              variant="caption"
              color="text"
              sx={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                maxWidth: 160,
              }}
              title={author?.name}
            >
              {author?.name}
            </MDTypography>
          </MDBox>

          <MDBox
            display="flex"
            alignItems="center"
            gap={0.5}
            onClick={handleShare}
            sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
          >
            <Icon>share</Icon>
            <MDTypography variant="button" color="text" sx={{ fontWeight: 700 }}>
              Compartilhar
            </MDTypography>
          </MDBox>
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
    category: PropTypes.string, // agora opcional
  }).isRequired,
};

export default PublicRecipeCard;
