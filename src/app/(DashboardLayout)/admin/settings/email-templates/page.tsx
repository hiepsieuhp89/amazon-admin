"use client";
import React, { useState } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TableContainer,
  TablePagination,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  useTheme,
} from "@mui/material";
import { IconSearch, IconEdit } from "@tabler/icons-react";
import PageContainer from "@/component/container/PageContainer";
import DashboardCard from "@/component/shared/DashboardCard";
import { useGetAllEmailTemplates } from "@/hooks/emailTemplate";
import { useRouter } from "next/navigation";

const EmailTemplatesPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [templateType, setTemplateType] = useState("");
  const router = useRouter();
  const theme = useTheme();

  const { data: response, isLoading, refetch } = useGetAllEmailTemplates({
    page: page + 1,
    take: rowsPerPage,
    search: searchTerm,
    type: templateType,
  });
  
  const emailTemplates = response?.data?.data || [];
  const total = response?.data?.meta?.itemCount || 0;
  const handleChangePage = (_event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
    refetch();
  };

  const handleEdit = (type: string) => {
    router.push(`/admin/settings/email-templates/${type}`);
  };

  return (
    <PageContainer
      title="Quản lý Template Email"
      description="Quản lý các template email trong hệ thống"
    >
      <DashboardCard title="Quản lý Template Email">
        <>
          <Box sx={{ mb: 3 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Tìm kiếm theo tên hoặc mô tả"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Loại Template</InputLabel>
                <Select
                  value={templateType}
                  label="Loại Template"
                  onChange={(e) => setTemplateType(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="VERIFY_EMAIL_REGISTER_USER">VERIFY_EMAIL_REGISTER_USER</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<IconSearch size="18" />}
                onClick={handleSearch}
                sx={{ px: 3 }}
              >
                Tìm kiếm
              </Button>
            </Stack>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[2], borderRadius: '8px' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#1E293B' : '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'semibold', fontSize: '0.9rem', py: 2 }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 'semibold', fontSize: '0.9rem', py: 2 }}>Tên Template</TableCell>
                  <TableCell sx={{ fontWeight: 'semibold', fontSize: '0.9rem', py: 2 }}>Loại</TableCell>
                  <TableCell sx={{ fontWeight: 'semibold', fontSize: '0.9rem', py: 2 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 'semibold', fontSize: '0.9rem', py: 2 }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'semibold', fontSize: '0.9rem', py: 2 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">Đang tải...</Typography>
                    </TableCell>
                  </TableRow>
                ) : emailTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">Không có dữ liệu</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  emailTemplates.map((template: any, index: number) => (
                    <TableRow 
                      key={template.id}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' },
                        '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.875rem', py: 2 }}>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', py: 2, fontWeight: 500 }}>{template.name}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', py: 2 }}>
                        <Typography variant="body2" sx={{ 
                          display: 'inline-block',
                          fontSize: '0.75rem',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '4px',
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.08)',
                          fontFamily: 'monospace'
                        }}>
                          {template.type}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', py: 2 }}>{template.description}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          sx={{
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            borderRadius: '16px',
                            height: '24px',
                            backgroundColor: template.deletedAt === null
                              ? theme.palette.mode === 'dark' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.15)'
                              : theme.palette.mode === 'dark' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.15)',
                            color: template.deletedAt === null
                              ? theme.palette.mode === 'dark' ? '#2ecc71' : '#27ae60'
                              : theme.palette.mode === 'dark' ? '#e74c3c' : '#c0392b',
                            boxShadow: 'none',
                            '& .MuiChip-label': {
                              px: 1.5,
                            }
                          }}
                          size="small"
                          label={template.deletedAt === null ? "Đang hoạt động" : "Không hoạt động"}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEdit(template.type)}
                          startIcon={<IconEdit size="16" />}
                          sx={{
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            px: 2,
                            py: 0.5,
                            minWidth: '120px',
                            boxShadow: 'none',
                            '&:hover': {
                              boxShadow: theme.shadows[1]
                            }
                          }}
                        >
                          Chỉnh sửa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
              },
              '.MuiTablePagination-select': {
                fontSize: '0.875rem',
              }
            }}
          />
        </>
      </DashboardCard>
    </PageContainer>
  );
};

export default EmailTemplatesPage; 