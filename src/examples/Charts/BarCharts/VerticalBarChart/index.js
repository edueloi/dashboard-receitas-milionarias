import { useMemo } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import configs from "examples/Charts/BarCharts/VerticalBarChart/configs";
import colors from "assets/theme/base/colors";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

function VerticalBarChart({ icon, title, description, height, chart }) {
  const chartDatasets = useMemo(
    () =>
      (chart.datasets || []).map((dataset) => {
        const color = resolveColor(dataset.color);
        return {
          ...dataset,
          weight: 5,
          borderWidth: 0,
          borderRadius: 6,
          backgroundColor: color,
          hoverBackgroundColor: color,
          fill: false,
          maxBarThickness: 32,
        };
      }),
    [chart]
  );

  const { data, options } = useMemo(
    () => configs(chart.labels || [], chartDatasets),
    [chart.labels, chartDatasets]
  );

  const iconBg = {
    success: "rgba(39,174,96,0.12)",
    primary: "rgba(201,166,53,0.12)",
    warning: "rgba(243,156,18,0.12)",
    error: "rgba(231,76,60,0.12)",
    info: "rgba(26,115,232,0.12)",
    dark: "rgba(52,71,103,0.10)",
  };
  const iconColors = {
    success: "#27ae60",
    primary: "#C9A635",
    warning: "#F39C12",
    error: "#E74C3C",
    info: "#1A73E8",
    dark: "#344767",
  };

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
                background: iconBg[icon.color] || iconBg.info,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon
                sx={{
                  fontSize: "1.25rem !important",
                  color: iconColors[icon.color] || iconColors.info,
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
        <Bar
          data={{ labels: data?.labels || [], datasets: data?.datasets || [] }}
          options={{
            ...options,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              ...options?.plugins,
              legend: {
                display: false,
              },
              tooltip: {
                mode: "index",
                intersect: false,
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
          }}
        />
      </Box>
    </Card>
  );
}

VerticalBarChart.defaultProps = {
  icon: { color: "info", component: "" },
  title: "",
  description: "",
  height: "200px",
};

VerticalBarChart.propTypes = {
  icon: PropTypes.shape({
    color: PropTypes.string,
    component: PropTypes.node,
  }),
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chart: PropTypes.objectOf(PropTypes.array).isRequired,
};

export default VerticalBarChart;
