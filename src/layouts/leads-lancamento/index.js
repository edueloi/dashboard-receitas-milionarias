import { useState, useEffect } from "react";
import api from "services/api";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import {
  CircularProgress,
  TextField,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout
import PageWrapper from "components/PageWrapper";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

const palette = { gold: "#C9A635", green: "#1C3B32" };

function LeadsLancamento() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch leads
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/lancamento/leads");
      setLeads(response.data.leads || []);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      toast.error("Erro ao carregar leads do lancamento");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get("/api/lancamento/leads/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "leads-lancamento.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar leads");
    }
  };

  // Filtrar leads por termo de busca
  const filteredLeads = leads.filter(
    (lead) =>
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.whatsapp.includes(searchTerm)
  );

  // Paginacao
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedLeads = filteredLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Estatisticas
  const totalLeads = leads.length;
  const leadsHoje = leads.filter((lead) => {
    const today = new Date().toDateString();
    const leadDate = new Date(lead.data_cadastro).toDateString();
    return today === leadDate;
  }).length;

  const leadsSemana = leads.filter((lead) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(lead.data_cadastro) >= weekAgo;
  }).length;

  const leadsMes = leads.filter((lead) => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return new Date(lead.data_cadastro) >= monthAgo;
  }).length;

  const percentSemana = totalLeads ? Math.round((leadsSemana / totalLeads) * 100) : 0;
  const percentMes = totalLeads ? Math.round((leadsMes / totalLeads) * 100) : 0;

  const headerActions = (
    <Stack
      direction={isSmDown ? "column" : "row"}
      spacing={1.5}
      alignItems="center"
      sx={{ width: { xs: "100%", sm: "auto" } }}
    >
      <MDButton
        variant="gradient"
        onClick={handleExportCSV}
        startIcon={<Icon>download</Icon>}
        fullWidth={isSmDown}
        sx={{
          backgroundColor: `${palette.green} !important`,
          color: "#fff !important",
          "&:hover": { backgroundColor: `${palette.gold} !important` },
        }}
      >
        Exportar CSV
      </MDButton>
      <MDButton
        variant="outlined"
        onClick={fetchLeads}
        startIcon={<Icon>refresh</Icon>}
        fullWidth={isSmDown}
        sx={{
          borderColor: palette.gold,
          color: palette.gold,
          "&:hover": {
            borderColor: palette.green,
            color: palette.green,
            backgroundColor: alpha(palette.green, 0.05),
          },
        }}
      >
        Atualizar
      </MDButton>
    </Stack>
  );

  return (
    <PageWrapper
      size="compact"
      title="Leads do Lancamento"
      subtitle="Pessoas interessadas no lancamento do sistema"
      actions={headerActions}
    >
      <MDBox px={{ xs: 0, md: 0 }}>
        {/* KPIs */}
        {!loading && (
          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <MDBox height="100%">
                <ComplexStatisticsCard
                  color="dark"
                  icon="groups"
                  title="Total de Leads"
                  count={totalLeads}
                  percentage={{
                    color: "success",
                    amount: `+${leadsSemana}`,
                    label: "esta semana",
                  }}
                />
              </MDBox>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <MDBox height="100%">
                <ComplexStatisticsCard
                  color="success"
                  icon="today"
                  title="Cadastros Hoje"
                  count={leadsHoje}
                  percentage={{
                    color: leadsHoje > 0 ? "success" : "secondary",
                    amount: leadsHoje > 0 ? "OK" : "",
                    label: leadsHoje > 0 ? "novos hoje" : "aguardando",
                  }}
                />
              </MDBox>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <MDBox height="100%">
                <ComplexStatisticsCard
                  color="info"
                  icon="date_range"
                  title="Ultimos 7 Dias"
                  count={leadsSemana}
                  percentage={{
                    color: "info",
                    amount: `${percentSemana}%`,
                    label: "do total",
                  }}
                />
              </MDBox>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <MDBox height="100%">
                <ComplexStatisticsCard
                  color="warning"
                  icon="calendar_month"
                  title="Ultimos 30 Dias"
                  count={leadsMes}
                  percentage={{
                    color: "warning",
                    amount: `${percentMes}%`,
                    label: "do total",
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        )}

        {/* Busca */}
        <Card
          sx={{
            mb: 3,
            border: `1px solid ${alpha(palette.green, 0.1)}`,
            boxShadow: `0 4px 12px ${alpha(palette.green, 0.08)}`,
          }}
        >
          <MDBox p={{ xs: 2, md: 2.5 }}>
            <TextField
              fullWidth
              label="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              placeholder="Busque por nome, email ou WhatsApp"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": { borderColor: palette.green },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: palette.green },
              }}
              InputProps={{
                startAdornment: <Icon sx={{ mr: 1, color: "text.secondary" }}>search</Icon>,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <Icon fontSize="small">close</Icon>
                  </IconButton>
                ),
              }}
            />
          </MDBox>
        </Card>

        {/* Tabela / Cards */}
        <Card
          sx={{
            border: `1px solid ${alpha(palette.green, 0.1)}`,
            boxShadow: `0 4px 12px ${alpha(palette.green, 0.08)}`,
          }}
        >
          {loading ? (
            <MDBox display="flex" flexDirection="column" alignItems="center" py={8}>
              <CircularProgress sx={{ color: palette.gold, mb: 2 }} size={48} />
              <MDTypography variant="button" color="text">
                Carregando leads...
              </MDTypography>
            </MDBox>
          ) : filteredLeads.length === 0 ? (
            <MDBox textAlign="center" py={8} px={3}>
              <Icon
                sx={{
                  fontSize: 80,
                  color: "text.secondary",
                  mb: 2,
                  opacity: 0.4,
                }}
              >
                {searchTerm ? "search_off" : "inbox"}
              </Icon>
              <MDTypography variant="h5" color="text" mb={1}>
                {searchTerm ? "Nenhum lead encontrado" : "Nenhum lead cadastrado"}
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {searchTerm
                  ? "Tente ajustar os termos de busca"
                  : "Aguarde os primeiros interessados se cadastrarem"}
              </MDTypography>
            </MDBox>
          ) : (
            <>
              {isSmDown ? (
                <MDBox p={2}>
                  <Grid container spacing={2}>
                    {paginatedLeads.map((lead) => (
                      <Grid item xs={12} key={lead.id}>
                        <Card
                          sx={{
                            border: `1px solid ${alpha(palette.green, 0.12)}`,
                            boxShadow: `0 6px 16px ${alpha(palette.green, 0.08)}`,
                            borderRadius: 3,
                          }}
                        >
                          <MDBox p={2.5}>
                            <MDBox
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <MDBox display="flex" alignItems="center" gap={1.5}>
                                <MDBox
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "50%",
                                    background: `linear-gradient(135deg, ${palette.green}, ${palette.gold})`,
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: "1rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  {lead.nome.charAt(0).toUpperCase()}
                                </MDBox>
                                <MDBox>
                                  <MDTypography variant="button" fontWeight="bold" color="dark">
                                    {lead.nome}
                                  </MDTypography>
                                  <MDTypography variant="caption" color="text.secondary">
                                    {lead.email}
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
                              <Chip
                                icon={<Icon fontSize="small">phone_iphone</Icon>}
                                label={lead.whatsapp}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(palette.green, 0.1),
                                  color: palette.green,
                                  fontWeight: 600,
                                  border: `1px solid ${alpha(palette.green, 0.2)}`,
                                  "& .MuiChip-icon": { color: palette.green },
                                }}
                              />
                            </MDBox>

                            <MDBox mt={2}>
                              <MDTypography variant="caption" color="text.secondary">
                                Interesse
                              </MDTypography>
                              {lead.interesse ? (
                                <MDTypography
                                  variant="button"
                                  color="dark"
                                  display="block"
                                  mt={0.5}
                                >
                                  {lead.interesse}
                                </MDTypography>
                              ) : (
                                <Chip
                                  label="Nao informado"
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    mt: 0.5,
                                    borderColor: alpha("#000", 0.1),
                                    color: "text.secondary",
                                    fontStyle: "italic",
                                  }}
                                />
                              )}
                            </MDBox>

                            <MDBox
                              mt={2}
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <MDTypography variant="caption" color="text.secondary">
                                Data de cadastro
                              </MDTypography>
                              <Chip
                                label={lead.data_cadastro}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(palette.gold, 0.12),
                                  color: palette.green,
                                  fontWeight: 600,
                                }}
                              />
                            </MDBox>
                          </MDBox>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </MDBox>
              ) : (
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table sx={{ minWidth: 900 }}>
                    <TableHead
                      sx={{
                        background: `linear-gradient(135deg, ${alpha(palette.green, 0.08)}, ${alpha(
                          palette.gold,
                          0.05
                        )})`,
                      }}
                    >
                      <TableRow>
                        <TableCell sx={{ py: 2, pl: 3 }}>
                          <MDBox display="flex" alignItems="center">
                            <Icon sx={{ mr: 1, color: palette.gold }}>person</Icon>
                            <MDTypography
                              variant="caption"
                              fontWeight="bold"
                              textTransform="uppercase"
                            >
                              Nome
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <MDBox display="flex" alignItems="center">
                            <Icon sx={{ mr: 1, color: palette.gold }}>email</Icon>
                            <MDTypography
                              variant="caption"
                              fontWeight="bold"
                              textTransform="uppercase"
                            >
                              Email
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <MDBox display="flex" alignItems="center">
                            <Icon sx={{ mr: 1, color: palette.gold }}>phone</Icon>
                            <MDTypography
                              variant="caption"
                              fontWeight="bold"
                              textTransform="uppercase"
                            >
                              WhatsApp
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <MDBox display="flex" alignItems="center">
                            <Icon sx={{ mr: 1, color: palette.gold }}>interests</Icon>
                            <MDTypography
                              variant="caption"
                              fontWeight="bold"
                              textTransform="uppercase"
                            >
                              Interesse
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                        <TableCell sx={{ py: 2, pr: 3 }}>
                          <MDBox display="flex" alignItems="center">
                            <Icon sx={{ mr: 1, color: palette.gold }}>event</Icon>
                            <MDTypography
                              variant="caption"
                              fontWeight="bold"
                              textTransform="uppercase"
                            >
                              Data de Cadastro
                            </MDTypography>
                          </MDBox>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedLeads.map((lead, index) => (
                        <TableRow
                          key={lead.id}
                          hover
                          sx={{
                            transition: "all 0.2s ease",
                            backgroundColor: index % 2 === 0 ? "transparent" : alpha("#000", 0.01),
                            "&:hover": {
                              backgroundColor: `${alpha(palette.gold, 0.05)} !important`,
                              transform: "scale(1.001)",
                              boxShadow: `inset 3px 0 0 ${palette.gold}`,
                            },
                          }}
                        >
                          <TableCell sx={{ pl: 3 }}>
                            <MDBox display="flex" alignItems="center">
                              <MDBox
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, ${palette.green}, ${palette.gold})`,
                                  color: "#fff",
                                  fontWeight: 700,
                                  fontSize: "0.9rem",
                                  mr: 1.5,
                                  flexShrink: 0,
                                }}
                              >
                                {lead.nome.charAt(0).toUpperCase()}
                              </MDBox>
                              <MDTypography variant="button" fontWeight="medium" color="dark">
                                {lead.nome}
                              </MDTypography>
                            </MDBox>
                          </TableCell>
                          <TableCell>
                            <MDBox display="flex" alignItems="center">
                              <MDTypography
                                variant="button"
                                color="text"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                {lead.email}
                              </MDTypography>
                            </MDBox>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<Icon fontSize="small">phone_iphone</Icon>}
                              label={lead.whatsapp}
                              size="small"
                              sx={{
                                backgroundColor: alpha(palette.green, 0.1),
                                color: palette.green,
                                fontWeight: 600,
                                border: `1px solid ${alpha(palette.green, 0.2)}`,
                                "& .MuiChip-icon": { color: palette.green },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 250 }}>
                            {lead.interesse ? (
                              <Tooltip title={lead.interesse} arrow placement="top">
                                <MDBox
                                  sx={{
                                    backgroundColor: alpha(palette.gold, 0.08),
                                    border: `1px solid ${alpha(palette.gold, 0.15)}`,
                                    borderRadius: 1,
                                    px: 1.5,
                                    py: 0.75,
                                    display: "inline-block",
                                    maxWidth: "100%",
                                  }}
                                >
                                  <MDTypography
                                    variant="caption"
                                    color="dark"
                                    sx={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {lead.interesse}
                                  </MDTypography>
                                </MDBox>
                              </Tooltip>
                            ) : (
                              <Chip
                                label="Nao informado"
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: alpha("#000", 0.1),
                                  color: "text.secondary",
                                  fontStyle: "italic",
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ pr: 3 }}>
                            <MDBox>
                              <MDTypography variant="button" fontWeight="medium" color="dark">
                                {lead.data_cadastro}
                              </MDTypography>
                            </MDBox>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <TablePagination
                component="div"
                count={filteredLeads.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                labelRowsPerPage="Linhas por pagina:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              />
            </>
          )}
        </Card>
      </MDBox>
    </PageWrapper>
  );
}

export default LeadsLancamento;
