// GradientLineChart — gráfico limpo e funcional
import { useRef, useEffect, useState, useMemo } from "react";
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
import gradientChartLine from "assets/theme/functions/gradientChartLine";
import configs from "examples/Charts/LineCharts/GradientLineChart/configs";
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

// Resolve cor mesmo quando colors[name] não existe
function resolveColor(name) {
  const fallbacks = {
    primary: "#C9A635",
    secondary: "#1C3B32",
    info: "#1A73E8",
    success: "#2ECC71",
    warning: "#F39C12",
    error: "#E74C3C",
    dark: "#344767",
    light: "#adb5bd",
  };
  return (colors[name] && colors[name].main) || fallbacks[name] || fallbacks.dark;
}

function GradientLineChart({ icon, title, description, height, chart }) {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const datasets = (chart.datasets || []).map((dataset) => {
      const color = resolveColor(dataset.color);
      return {
        ...dataset,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        borderColor: color,
        fill: true,
        backgroundColor: gradientChartLine(el.canvas, color, 0.15),
        pointBackgroundColor: color,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      };
    });

    setChartData(configs(chart.labels || [], datasets));
  }, [chart]);

  const { data, options } = useMemo(() => chartData, [chartData]);

  return (
    <Card
      sx={{
        borderRadius: "14px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      {/* Header do card */}
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
                background:
                  icon.color === "success"
                    ? "rgba(46,204,113,0.12)"
                    : icon.color === "primary"
                    ? "rgba(201,166,53,0.12)"
                    : icon.color === "warning"
                    ? "rgba(243,156,18,0.12)"
                    : icon.color === "error"
                    ? "rgba(231,76,60,0.12)"
                    : "rgba(26,115,232,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon
                sx={{
                  fontSize: "1.25rem !important",
                  color:
                    icon.color === "success"
                      ? "#2ECC71"
                      : icon.color === "primary"
                      ? "#C9A635"
                      : icon.color === "warning"
                      ? "#F39C12"
                      : icon.color === "error"
                      ? "#E74C3C"
                      : "#1A73E8",
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

      {/* Gráfico */}
      <Box sx={{ px: { xs: 1, sm: 2 }, pb: 2, pt: 1, height }}>
        {data && options ? (
          <Line
            ref={chartRef}
            data={{ labels: data?.labels || [], datasets: data?.datasets || [] }}
            options={{
              ...options,
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                ...options?.plugins,
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    boxWidth: 12,
                    padding: 16,
                    font: { size: 11, family: "inherit" },
                    color: "rgba(0,0,0,0.55)",
                  },
                },
                tooltip: {
                  mode: "index",
                  intersect: false,
                  callbacks: {
                    label: (ctx) => {
                      const val = ctx.raw;
                      if (typeof val === "number" && val > 100) {
                        return ` ${ctx.dataset.label}: R$ ${(val / 100).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}`;
                      }
                      return ` ${ctx.dataset.label}: ${val}`;
                    },
                  },
                },
              },
              scales: {
                ...options?.scales,
                x: {
                  ...options?.scales?.x,
                  grid: { display: false },
                  ticks: { font: { size: 11 }, color: "rgba(0,0,0,0.4)", maxRotation: 0 },
                },
                y: {
                  ...options?.scales?.y,
                  grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
                  ticks: {
                    font: { size: 11 },
                    color: "rgba(0,0,0,0.4)",
                    callback: (v) =>
                      v > 100
                        ? `R$ ${(v / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
                        : v,
                  },
                },
              },
            }}
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(0,0,0,0.3)",
              fontSize: "0.8rem",
            }}
          >
            Carregando dados...
          </Box>
        )}
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
