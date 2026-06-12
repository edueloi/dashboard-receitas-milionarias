import { useMemo } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import colors from "assets/theme/base/colors";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function resolveColor(name) {
  const fallbacks = {
    primary: "#C9A635",
    secondary: "#1C3B32",
    info: "#1A73E8",
    success: "#27ae60",
    warning: "#F39C12",
    error: "#E74C3C",
    dark: "#344767",
    light: "#adb5bd",
  };
  return (colors[name] && colors[name].main) || fallbacks[name] || fallbacks.dark;
}

// Plugin inline para criar gradiente no canvas no momento do render
function makeGradientPlugin(datasetColors) {
  return {
    id: "gradient-fill",
    beforeUpdate(chart) {
      chart.data.datasets.forEach((dataset, i) => {
        const color = datasetColors[i] || "#1A73E8";
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        if (!chartArea) return;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, `${color}40`);
        gradient.addColorStop(1, `${color}08`);
        dataset.backgroundColor = gradient;
      });
    },
  };
}

const ICON_BG = {
  success: "rgba(39,174,96,0.12)",
  primary: "rgba(201,166,53,0.12)",
  warning: "rgba(243,156,18,0.12)",
  error: "rgba(231,76,60,0.12)",
  info: "rgba(26,115,232,0.12)",
  dark: "rgba(52,71,103,0.10)",
};
const ICON_COLOR = {
  success: "#27ae60",
  primary: "#C9A635",
  warning: "#F39C12",
  error: "#E74C3C",
  info: "#1A73E8",
  dark: "#344767",
};

function GradientLineChart({ icon, title, description, height, chart }) {
  const datasetColors = useMemo(
    () => (chart.datasets || []).map((d) => resolveColor(d.color)),
    [chart.datasets]
  );

  const chartData = useMemo(() => {
    const datasets = (chart.datasets || []).map((dataset, i) => {
      const color = datasetColors[i];
      return {
        ...dataset,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        borderColor: color,
        fill: true,
        backgroundColor: `${color}20`,
        pointBackgroundColor: color,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      };
    });
    return { labels: chart.labels || [], datasets };
  }, [chart, datasetColors]);

  const gradientPlugin = useMemo(() => makeGradientPlugin(datasetColors), [datasetColors]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: (chart.datasets || []).length > 1,
          position: "bottom",
          labels: {
            boxWidth: 12,
            padding: 16,
            font: { size: 11 },
            color: "rgba(0,0,0,0.55)",
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "#fff",
          titleColor: "#344767",
          bodyColor: "#344767",
          borderColor: "#e9ecef",
          borderWidth: 1,
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: "rgba(0,0,0,0.4)", maxRotation: 0 },
        },
        y: {
          grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
          ticks: { font: { size: 11 }, color: "rgba(0,0,0,0.4)" },
        },
      },
    }),
    [chart.datasets]
  );

  return (
    <Card
      sx={{
        borderRadius: "14px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      {(title || description) && (
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            pt: { xs: 2, sm: 2.5 },
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {icon?.component && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: ICON_BG[icon.color] || ICON_BG.info,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon
                sx={{
                  fontSize: "1.25rem !important",
                  color: ICON_COLOR[icon.color] || ICON_COLOR.info,
                }}
              >
                {icon.component}
              </Icon>
            </Box>
          )}
          <Box>
            {title && (
              <Box
                component="span"
                sx={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#1C3B32",
                  lineHeight: 1.3,
                  fontFamily: "inherit",
                }}
              >
                {title}
              </Box>
            )}
            {description && (
              <Box
                component="span"
                sx={{
                  display: "block",
                  fontSize: "0.72rem",
                  color: "rgba(0,0,0,0.45)",
                  fontFamily: "inherit",
                  mt: "1px",
                }}
              >
                {description}
              </Box>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ px: { xs: 1, sm: 2 }, pb: 2, pt: 1, height }}>
        <Line data={chartData} options={options} plugins={[gradientPlugin]} />
      </Box>
    </Card>
  );
}

GradientLineChart.defaultProps = {
  icon: { color: "info", component: "" },
  title: "",
  description: "",
  height: "280px",
};

GradientLineChart.propTypes = {
  icon: PropTypes.shape({
    color: PropTypes.string,
    component: PropTypes.node,
  }),
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chart: PropTypes.objectOf(PropTypes.array).isRequired,
};

export default GradientLineChart;
