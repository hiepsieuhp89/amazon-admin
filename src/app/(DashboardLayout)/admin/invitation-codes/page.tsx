"use client";

import { useCreateInvitationCodes, useDeleteInvitationCode, useGetAllInvitationCodes, useDeactivateInvitationCode } from "@/hooks/invitation";
import { useGetUserById } from "@/hooks/user";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import { IconCopy, IconTrash, IconUser, IconInfoCircle, IconBan, IconSearch, IconPlus, IconId, IconBrandTelegram } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const InvitationCodesPage = () => {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(5);
  const [expirationMinutes, setExpirationMinutes] = useState(15);
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const [search, setSearch] = useState("");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [totalPages, setTotalPages] = useState(1);

  // Get all invitation codes
  const { data, isLoading, refetch } = useGetAllInvitationCodes({
    page,
    take,
    order,
    search: search.trim() ? search : undefined
  });

  useEffect(() => {
    if (data?.data?.total) {
      const calculatedTotalPages = Math.ceil(data.data.total / take);
      setTotalPages(calculatedTotalPages);
    }
  }, [data, take]);

  // Get user details when selectedUserId is available
  const { data: userData, isLoading: isLoadingUser } = useGetUserById(selectedUserId || "");

  // Create invitation codes mutation
  const createInvitationCodesMutation = useCreateInvitationCodes();

  // Delete invitation code mutation
  const deleteInvitationCodeMutation = useDeleteInvitationCode();

  // Deactivate invitation code mutation
  const deactivateInvitationCodeMutation = useDeactivateInvitationCode();

  // Handle dialog open/close
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle user dialog open/close
  const handleUserDialogOpen = (userId: string) => {
    setSelectedUserId(userId);
    setUserDialogOpen(true);
  };

  const handleUserDialogClose = () => {
    setUserDialogOpen(false);
    setSelectedUserId(null);
  };

  // Handle deactivate dialog open/close
  const handleDeactivateDialogOpen = (code: string) => {
    setSelectedCode(code);
    setDeactivateDialogOpen(true);
  };

  const handleDeactivateDialogClose = () => {
    setDeactivateDialogOpen(false);
    setSelectedCode("");
  };

  // Handle pagination change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Handle items per page change
  const handleTakeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTake(event.target.value as number);
    setPage(1); // Reset to first page when changing items per page
  };

  // Handle order change
  const handleOrderChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setOrder(event.target.value as "ASC" | "DESC");
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    refetch();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle create invitation codes
  const handleCreateInvitationCodes = async () => {
    try {
      await createInvitationCodesMutation.mutateAsync({
        count,
        expirationMinutes,
      });
      toast.success("Tạo mã mời thành công!");
      handleClose();
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo mã mời!");
    }
  };

  // Handle delete invitation code
  const handleDeleteInvitationCode = async (id: string) => {
    try {
      await deleteInvitationCodeMutation.mutateAsync(id);
      toast.success("Xóa mã mời thành công!");
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa mã mời!");
    }
  };

  // Handle deactivate invitation code
  const handleDeactivateInvitationCode = async () => {
    try {
      await deactivateInvitationCodeMutation.mutateAsync(selectedCode);
      toast.success("Hủy kích hoạt mã mời thành công!");
      handleDeactivateDialogClose();
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi hủy kích hoạt mã mời!");
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã mời vào clipboard!");
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status chip
  const getStatusChip = (code: any) => {
    if (code.status === "deactivated") {
      return <Chip label="Đã hủy kích hoạt" color="error" size="small" />;
    } else if (code.status === "used" || code.usedById) {
      return <Chip label="Đã sử dụng" color="success" size="small" />;
    } else if (code.status === "expired" || (code.expiresAt && new Date(code.expiresAt) < new Date())) {
      return <Chip label="Hết hạn" color="warning" size="small" />;
    } else {
      return <Chip label="Khả dụng" color="primary" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Quản lý mã mời</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: "#5D87FF !important",
            minWidth: '80px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            },
            textTransform: "none"
          }}
          onClick={handleClickOpen}
          endIcon={<IconPlus size={16} />}
        >
          Tạo mã mời
        </Button>
      </Box>

      {/* Filter & Search Section */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
          <Box  >
            <FormControl fullWidth variant="outlined" size="small">
              <OutlinedInput
                placeholder="Tìm kiếm mã mời..."
                value={search}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} edge="end">
                      <IconSearch size={20} />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={order}
                label="Sắp xếp"
                onChange={handleOrderChange as any}
              >
                <MenuItem value="DESC">Mới nhất</MenuItem>
                <MenuItem value="ASC">Cũ nhất</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth size="small">
              <InputLabel>Số lượng hiển thị</InputLabel>
              <Select
                value={take}
                label="Số lượng hiển thị"
                onChange={handleTakeChange as any}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 2 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã mời</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Ngày hết hạn</TableCell>
                    <TableCell>Ngày sử dụng</TableCell>
                    <TableCell>Người dùng</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.data?.data?.map((code: any) => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {code.code}
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(code.code)}
                            sx={{ ml: 1 }}
                          >
                            <IconCopy size={18} />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(code)}
                      </TableCell>
                      <TableCell>{formatDate(code.createdAt)}</TableCell>
                      <TableCell>
                        {code.expiresAt ? formatDate(code.expiresAt) : "Không hết hạn"}
                      </TableCell>
                      <TableCell>
                        {code.usedAt ? formatDate(code.usedAt) : "Chưa sử dụng"}
                      </TableCell>
                      <TableCell>
                        {code.usedById ? (
                          <Tooltip title="Xem thông tin người dùng">
                            <IconButton
                              color="primary"
                              onClick={() => handleUserDialogOpen(code.usedById)}
                            >
                              <IconUser size={18} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          "Chưa sử dụng"
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex" }}>
                          {/* Deactivate button */}
                          {code.status !== "deactivated" && code.status !== "used" && !code.usedById && (
                            <Tooltip title="Hủy kích hoạt mã mời">
                              <IconButton
                                color="warning"
                                onClick={() => handleDeactivateDialogOpen(code.code)}
                                sx={{ mr: 1 }}
                              >
                                <IconBan size={18} />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Delete button */}
                          <Tooltip title="Xóa mã mời">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteInvitationCode(code.id)}
                              disabled={code.status === "used" || !!code.usedById}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", pt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Create Invitation Code Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className="border border-b !p-4 bg-gray-100">Tạo mã mời mới</DialogTitle>
        <DialogContent className="mt-2 !p-4 min-w-[400px]">
          <Box sx={{ mt: 1, display: "flex", gap: 2, flexDirection: "column" }}>
            <Box >
              <TextField
                label="Số lượng mã mời"
                type="number"
                size="small"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 100 } }}
              />
            </Box>
            <Box >
              <TextField
                label="Thời gian hết hạn (phút)"
                type="number"
                size="small"
                value={expirationMinutes}
                onChange={(e) => setExpirationMinutes(Number(e.target.value))}
                fullWidth
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className="border border-t !p-4 bg-gray-100">
          <Button 
          variant="outlined"
          onClick={handleClose}>Hủy</Button>
          <Button
            onClick={handleCreateInvitationCodes}
            variant="contained"
            color="primary"
            disabled={createInvitationCodesMutation.isPending}
            sx={{
              backgroundColor: "#5D87FF !important",
              minWidth: '80px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              },
              textTransform: "none"
            }}
          >
            {createInvitationCodesMutation.isPending ? "Đang tạo..." : "Tạo mã mời"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Invitation Code Dialog */}
      <Dialog open={deactivateDialogOpen} onClose={handleDeactivateDialogClose}>
        <DialogTitle className="border border-b !p-4 bg-gray-100">Xác nhận hủy kích hoạt</DialogTitle>
        <DialogContent className="mt-2 !p-4">
          <Typography
          >
            Bạn có chắc chắn muốn hủy kích hoạt mã mời <strong>{selectedCode}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Chỉ admin và super admin có thể hủy kích hoạt mã mời. Super admin có thể hủy mã mời của bất kỳ ai, admin chỉ có thể hủy mã mời do chính mình tạo ra.
          </Typography>
        </DialogContent>
        <DialogActions className="border border-t !p-4 bg-gray-100">
          <Button variant="outlined" onClick={handleDeactivateDialogClose}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDeactivateInvitationCode}
            sx={{
              backgroundColor: "#5D87FF !important",
              minWidth: '80px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              },
              textTransform: "none"
            }}
          >
            {deactivateInvitationCodeMutation.isPending ? "Đang xử lý..." : "Xác nhận hủy kích hoạt"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog
        open={userDialogOpen}
        onClose={handleUserDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="border border-b !p-4 bg-gray-100">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconInfoCircle size={24} style={{ marginRight: 8 }} />
            Thông tin người dùng
          </Box>
        </DialogTitle>
        <DialogContent className="mt-4 !p-4">
          {isLoadingUser ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : userData?.data ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{ width: 64, height: 64, mr: 2 }}
                  src={userData.data.logoUrl || ""}
                >
                  {userData.data.fullName?.[0] || userData.data.email?.[0] || "U"}
                </Avatar>
                <Box>
                  <Typography variant="h6">{userData.data.fullName || "Không có tên"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userData.data.email}
                  </Typography>
                  {userData.data.shopName && (
                    <Chip
                      label={`${userData.data.shopName}`}
                      size="small"
                      color="primary"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box >
                <Box  >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Thông tin cơ bản
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="ID người dùng"
                        secondary={userData.data.id}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Tên đăng nhập"
                        secondary={userData.data.username || "Không có"}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Số điện thoại"
                        secondary={userData.data.phone || "Không có"}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Vai trò"
                        secondary={
                          userData.data.role === "shop" ? "Người bán" :
                            userData.data.role === "admin" ? "Quản trị viên" :
                              userData.data.role === "supper_admin" ? "Quản trị viên cấp cao" : "Người dùng"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Trạng thái"
                        secondary={
                          <Chip
                            label={userData.data.isActive ? "Đang hoạt động" : "Đã khóa"}
                            color={userData.data.isActive ? "success" : "error"}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Xác thực email"
                        secondary={
                          <Chip
                            label={userData.data.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                            color={userData.data.isVerified ? "success" : "warning"}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Ngày tạo"
                        secondary={formatDate(userData.data.createdAt)}
                      />
                    </ListItem>
                  </List>
                </Box>

                {userData.data.role === "shop" && (
                  <Box  >
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Thông tin cửa hàng
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Tên cửa hàng"
                          secondary={userData.data.shopName || "Chưa có"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Địa chỉ cửa hàng"
                          secondary={userData.data.shopAddress || "Chưa có"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Trạng thái cửa hàng"
                          secondary={
                            <Chip
                              label={
                                userData.data.shopStatus === "APPROVED" ? "Đã duyệt" :
                                  userData.data.shopStatus === "PENDING" ? "Đang chờ duyệt" :
                                    userData.data.shopStatus === "REJECTED" ? "Đã từ chối" : "Không xác định"
                              }
                              color={
                                userData.data.shopStatus === "APPROVED" ? "success" :
                                  userData.data.shopStatus === "PENDING" ? "warning" :
                                    userData.data.shopStatus === "REJECTED" ? "error" : "default"
                              }
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Đánh giá"
                          secondary={`${userData.data.stars || 0} sao (${userData.data.reputationPoints || 0} điểm)`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Gói bán hàng"
                          secondary={userData.data.sellerPackage?.name || "Không có"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Hạn gói bán hàng"
                          secondary={userData.data.sellerPackageExpiry ? formatDate(userData.data.sellerPackageExpiry) : "Không có"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Số dư tài khoản"
                          secondary={userData.data.balance ? `${Number(userData.data.balance).toLocaleString('vi-VN')} đ` : "0 đ"}
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Typography>Không thể tải thông tin người dùng</Typography>
          )}
        </DialogContent>
        <DialogActions className="!p-4 border-t border bg-gray-100">
          <Button onClick={handleUserDialogClose}>Đóng</Button>
          {userData?.data && (
            <Button
              variant="contained"
              color="primary"
              href={`/admin/users/${userData.data.id}`}
              target="_blank"
              sx={{
                backgroundColor: "#5D87FF !important",
                minWidth: '80px',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                },
                textTransform: "none"
              }}
              endIcon={<IconId size={16} />}
            >
              Xem chi tiết
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box >
  );
};

export default InvitationCodesPage; 