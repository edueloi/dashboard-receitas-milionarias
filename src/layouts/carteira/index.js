// src/layouts/carteira/index.js

// --- Componentes do Material UI ---
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// --- Componentes do Template ---
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import PageWrapper from "components/PageWrapper";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import DataTable from "examples/Tables/DataTable"; // CORREÇÃO: Importação correta da tabela

// --- Dados do Gráfico ---
import ganhosMensaisChartData from "layouts/carteira/data/ganhosMensaisChartData";

// --- Dados de Exemplo para a Tabela (com formatação correta) ---
const tabelaAfiliados = {
  columns: [
    { Header: "afiliado", accessor: "afiliado", width: "45%", align: "left" },
    { Header: "valor", accessor: "valor", align: "center" },
    { Header: "data", accessor: "data", align: "center" },
  ],
  // CÓDIGO FORMATADO PARA O PRETTIER
  rows: [
    {
      afiliado: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Maria Silva
        </MDTypography>
      ),
      valor: (
        <MDTypography variant="caption" color="primary" fontWeight="medium">
          R$ 50,00
        </MDTypography>
      ),
      data: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          23/08/2025
        </MDTypography>
      ),
    },
    {
      afiliado: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          João Pereira
        </MDTypography>
      ),
      valor: (
        <MDTypography variant="caption" color="primary" fontWeight="medium">
          R$ 75,50
        </MDTypography>
      ),
      data: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          21/08/2025
        </MDTypography>
      ),
    },
    {
      afiliado: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Ana Costa
        </MDTypography>
      ),
      valor: (
        <MDTypography variant="caption" color="primary" fontWeight="medium">
          R$ 35,00
        </MDTypography>
      ),
      data: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          20/08/2025
        </MDTypography>
      ),
    },
    {
      afiliado: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Lucas Martins
        </MDTypography>
      ),
      valor: (
        <MDTypography variant="caption" color="primary" fontWeight="medium">
          R$ 110,00
        </MDTypography>
      ),
      data: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          15/08/2025
        </MDTypography>
      ),
    },
  ],
};

function MinhaCarteira() {
  return (
    <PageWrapper title="Minha Carteira">
      <MDBox pt={6} pb={3}>
        {/* Seção 1: Resumo Financeiro */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={5}>
            <ComplexStatisticsCard
              color="primary"
              icon="account_balance_wallet"
              title="Saldo Disponível"
              count="R$ 1.540,50"
              percentage={{ color: "info", amount: "", label: "Pronto para saque" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ComplexStatisticsCard
              icon="hourglass_top"
              title="Ganhos Pendentes"
              count="R$ 320,00"
              percentage={{ color: "secondary", amount: "", label: "Aguardando liberação" }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            {/* CÓDIGO FORMATADO PARA O PRETTIER */}
            <Card
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MDBox p={2} textAlign="center">
                <MDButton variant="gradient" color="primary" size="large">
                  Solicitar Saque
                </MDButton>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Seção 2: Desempenho Visual */}
        <MDBox mb={3}>
          <ReportsLineChart
            color="primary"
            title="Ganhos Mensais"
            description="Evolução dos seus ganhos de afiliados nos últimos meses."
            date="atualizado hoje"
            chart={ganhosMensaisChartData}
          />
        </MDBox>

        {/* Seção 3: Detalhes e Histórico */}
        <Card>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <MDTypography variant="h6">Histórico de Ganhos por Afiliado</MDTypography>
          </MDBox>
          <MDBox>
            {/* CORREÇÃO: Usando o componente DataTable com as props corretas */}
            <DataTable
              table={tabelaAfiliados}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
              noEndBorder
            />
          </MDBox>
        </Card>
      </MDBox>
    </PageWrapper>
  );
}

export default MinhaCarteira;
