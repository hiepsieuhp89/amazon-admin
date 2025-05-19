"use client"
import DataTable from "@/components/DataTable"
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Menu,
  Select,
  TableCell,
  TableRow,
  TextField,
  Typography
} from "@mui/material"
import { IconCopy, IconEye, IconMessage, IconSearch, IconTrash, IconWallet, IconDotsVertical, IconMoodSadDizzy, IconUsers, IconUserCog } from "@tabler/icons-react"
import { message } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"

import ChatDialog from "@/components/ChatDialog"
import { useDeleteUser, useGetAllUsers, useUpdateUser } from "@/hooks/user"

function UsersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [chatDialogOpen, setChatDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedShop, setSelectedShop] = useState<any>(null)
  const [filters, setFilters] = useState({
    order: 'DESC',
    status: '',
    role: '',
    hasShop: '',
  } as any);
  const updateUserMutation = useUpdateUser();
  const { data: userData, isLoading, error } = useGetAllUsers({
    page,
    take: rowsPerPage,
    search: searchTerm,
    order: filters.order as 'ASC' | 'DESC' | undefined,
    status: filters.status || undefined,
    role: filters.role as 'shop' | 'admin' | 'user' | undefined,
    hasShop: filters.hasShop ? filters.hasShop === 'true' : undefined
  })
  const filteredUsers = userData?.data?.data || []
  const pagination = userData?.data?.meta || {
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false
  }
  const deleteUserMutation = useDeleteUser()
  const { data: allUsers } = useGetAllUsers({
    take: 1000,
    role: "user"
  })
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [balanceActionType, setBalanceActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);

  const handleCreateNew = () => {
    router.push("/admin/users/create-new")
  }

  const handleView = (id: string) => {
    router.push(`/admin/users/${id}`)
  }

  const openDeleteDialog = (id: string) => {
    setUserToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      await deleteUserMutation.mutateAsync(userToDelete)
      message.success("Người dùng đã được xóa thành công!")
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (err) {
      message.error("Không thể xóa người dùng. Vui lòng thử lại.")
      console.error(err)
    }
  }

  const handleOpenChat = (userId: string) => {
    const shop = filteredUsers.find(u => u.id === userId);
    setSelectedShop(shop);
    setSelectedUserId(userId);
    setChatDialogOpen(true);
  }

  const handleBalanceDialogOpen = (userId: string, type: 'deposit' | 'withdraw') => {
    setSelectedUserId(userId);
    setBalanceActionType(type);
    setBalanceDialogOpen(true);
  };

  const handleBalanceDialogClose = () => {
    setBalanceDialogOpen(false);
    setAmount('');
    setSelectedUserId(null);
  };

  const handleBalanceUpdate = async () => {
    if (!selectedUserId || !amount || isNaN(Number(amount))) {
      message.error('Số tiền không hợp lệ');
      return;
    }

    try {
      // Fetch current user data
      const currentUser = filteredUsers.find(user => user.id === selectedUserId);
      if (!currentUser) {
        message.error('Không tìm thấy thông tin người dùng');
        return;
      }

      // Calculate new balance
      const currentBalance = Number(currentUser.balance);
      const amountNumber = Number(amount);
      const newBalance = balanceActionType === 'deposit'
        ? currentBalance + amountNumber
        : currentBalance - amountNumber;

      // Update balance
      await updateUserMutation.mutateAsync({
        id: selectedUserId,
        payload: {
          balance: newBalance.toString()
        }
      });

      message.success(`${balanceActionType === 'deposit' ? 'Nạp' : 'Rút'} tiền thành công!`);
      handleBalanceDialogClose();
    } catch (error) {
      message.error(`Không thể ${balanceActionType === 'deposit' ? 'nạp' : 'rút'} tiền. Vui lòng thử lại.`);
      console.error(error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserId(null);
  };

  const handleToggleFreeze = async (userId: string) => {
    try {
      const user = filteredUsers.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.shopStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";

      await updateUserMutation.mutateAsync({
        id: userId,
        payload: {
          shopStatus: newStatus
        }
      });

      message.success(newStatus === "SUSPENDED"
        ? "Đã đóng băng shop thành công!"
        : "Đã bỏ đóng băng shop thành công!");

      handleMenuClose();
    } catch (error) {
      message.error("Không thể thay đổi trạng thái shop. Vui lòng thử lại.");
      console.error(error);
    }
  };

  const columns = [
    { key: 'stt', label: 'STT' },
    { key: 'email', label: 'Email' },
    { key: 'username', label: 'Tên đăng nhập' },
    { key: 'fullName', label: 'Họ tên' },
    { key: 'phone', label: 'Số điện thoại' },
    { key: 'invitationCode', label: 'Mã mời' },
    { key: 'role', label: 'Vai trò' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'actions', label: 'Thao tác' },
  ];

  const renderRow = (user: any, index: number) => (
    <TableRow
      key={user.id}
      sx={{
        "&:first-child td, &:first-child th": { borderTop: "1px solid #E0E0E0" },
        "& td": { borderBottom: "1px solid #E0E0E0" },
        backgroundColor: index % 2 !== 1 ? '#F5F5F5' : '#FFFFFF'
      }}
    >
      <TableCell>{(page - 1) * rowsPerPage + filteredUsers.indexOf(user) + 1}</TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          {user.email}
          <IconButton
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(user.email || "");
              message.success(`Đã sao chép email: ${user.email}`);
            }}
          >
            <IconCopy size={16} className="text-blue-500" />
          </IconButton>
        </Box>
      </TableCell>
      <TableCell>{user.username}</TableCell>
      <TableCell>{user.fullName}</TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          {user.phone}
          <IconButton
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(user.phone || "");
              message.success(`Đã sao chép số điện thoại: ${user.phone}`);
            }}
          >
            <IconCopy size={16} className="text-blue-500" />
          </IconButton>
        </Box>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          {user.invitationCode}
          {user.invitationCode && (
            <IconButton
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(user.invitationCode || "");
                message.success(`Đã sao chép mã giới thiệu: ${user.invitationCode}`);
              }}
            >
              <IconCopy size={16} className="text-blue-500" />
            </IconButton>
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={
            user.shopName === "admin2" ? "Xuất nhập khoản" :
            user.role === "supper_admin" ? "Super Admin" :
            user.role === "admin" ? "Admin" :
              user.role === "shop" ? "Người bán" :
                "Khách ảo"
          }
          color={
            user.shopName === "admin2" ? "info" :
            user.role === "supper_admin" ? "secondary" :
            user.role === "admin" ? "primary" :
              user.role === "shop" ? "warning" :
                "success"
          }
          size="small"
          variant="filled"
          className={user.role === "supper_admin" ? "!text-white" : ""}
        />
      </TableCell>
      <TableCell>
        {user.role === "shop" ? (
          <Chip
            label={
              user.shopStatus === "PENDING"
                ? "Chờ duyệt"
                : user.shopStatus === "SUSPENDED"
                  ? "Đã đóng băng"
                  : user.isActive
                    ? "Đang hoạt động"
                    : "Đã khóa"
            }
            color={
              user.shopStatus === "PENDING"
                ? "warning"
                : user.shopStatus === "SUSPENDED"
                  ? "error"
                  : user.isActive
                    ? "success"
                    : "error"
            }
            size="small"
            variant="filled"
          />
        ) : (
          <Chip
            label={user.isActive ? "Đang hoạt động" : "Đã khóa"}
            color={user.isActive ? "success" : "error"}
            size="small"
            variant="filled"
          />
        )}
      </TableCell>
      <TableCell>
        <Box className="flex items-center justify-center gap-4">
          <IconButton
            onClick={(e) => handleMenuOpen(e, user.id)}
            size="medium"
          >
            <IconDotsVertical size={18} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && menuUserId === user.id}
            onClose={handleMenuClose}
            PaperProps={{
              className: "!rounded-[6px] shadow-xl",
            }}
          >
            <MenuItem onClick={() => {
              handleBalanceDialogOpen(user.id, 'deposit');
              handleMenuClose();
            }}>
              <Box className="flex items-center gap-2">
                <IconWallet size={16} className="text-green-400" />
                <span>Nạp tiền</span>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => {
              handleBalanceDialogOpen(user.id, 'withdraw');
              handleMenuClose();
            }}>
              <Box className="flex items-center gap-2">
                <IconWallet size={16} className="text-orange-400" />
                <span>Rút tiền</span>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => {
              handleView(user.id);
              handleMenuClose();
            }}>
              <Box className="flex items-center gap-2">
                <IconEye size={16} className="text-blue-400" />
                <span>Xem chi tiết</span>
              </Box>
            </MenuItem>
            {user.role === "shop" && (
              <MenuItem onClick={() => {
                handleOpenChat(user.id);
                handleMenuClose();
              }}>
                <Box className="flex items-center gap-2">
                  <IconMessage size={16} className="text-green-400" />
                  <span>Nhắn tin</span>
                </Box>
              </MenuItem>
            )}
            {user.role === "shop" && (
              <MenuItem onClick={() => {
                handleToggleFreeze(user.id);
              }}>
                <Box className="flex items-center gap-2">
                  <IconWallet size={16} className={user.shopStatus === "SUSPENDED" ? "text-green-400" : "text-red-400"} />
                  <span>{user.shopStatus === "SUSPENDED" ? "Bỏ đóng băng shop" : "Đóng băng shop"}</span>
                </Box>
              </MenuItem>
            )}
            <MenuItem onClick={() => {
              openDeleteDialog(user.id);
              handleMenuClose();
            }}>
              <Box className="flex items-center gap-2">
                <IconTrash size={16} className="text-red-400" />
                <span>Xóa</span>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </TableCell>
    </TableRow>
  );

  if (error) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen gap-2 p-8 text-center">
        <IconMoodSadDizzy size={48} className="text-gray-400" />
        <Typography variant="h6" className="mb-2 text-red-400">
          Lỗi khi tải danh sách người dùng
        </Typography>
        <Typography className="text-gray-400">{error.message || "Vui lòng thử lại sau"}</Typography>
      </Box>
    )
  }

  return (
    <>
      <Box className="relative flex flex-col items-center justify-center py-8">
        <Box className="absolute" />
        <Box className="relative flex flex-col items-center gap-2">
          <Box className="p-4 mb-3 rounded-full shadow-lg bg-gradient-to-r from-amber-100 to-orange-100">
            <IconUserCog size={36} className="text-main-golden-orange" />
          </Box>
          <Typography variant="h3" className="font-semibold tracking-wide text-center uppercase text-main-charcoal-blue">
            Quản lý người dùng
          </Typography>
        </Box>
      </Box>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm người dùng..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-white"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sắp xếp</InputLabel>
            <Select
              className="bg-white"
              value={filters.order}
              label="Sắp xếp"
              onChange={(e) => setFilters((prev: any) => ({ ...prev, order: e.target.value }))}
            >
              <MenuItem value="DESC">Mới nhất</MenuItem>
              <MenuItem value="ASC">Cũ nhất</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              className="bg-white"
              value={filters.status}
              label="Trạng thái"
              onChange={(e) => setFilters((prev: any) => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="pending">Đang chờ duyệt</MenuItem>
              <MenuItem value="completed">Đã duyệt</MenuItem>
              <MenuItem value="rejected">Đã từ chối</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Vai trò</InputLabel>
            <Select
              className="bg-white"
              value={filters.role}
              label="Vai trò"
              onChange={(e) => setFilters((prev: any) => ({ ...prev, role: e.target.value }))}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="user">Người dùng</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="shop">Người bán</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Có shop</InputLabel>
            <Select
              className="bg-white"
              value={filters.hasShop}
              label="Có shop"
              onChange={(e) => setFilters((prev: any) => ({ ...prev, hasShop: e.target.value }))}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="true">Có</MenuItem>
              <MenuItem value="false">Không</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <DataTable
          columns={columns}
          data={filteredUsers}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          onRowsPerPageChange={(newRowsPerPage: number) => {
            setRowsPerPage(newRowsPerPage);
            setPage(1);
          }}
          renderRow={renderRow}
          emptyMessage="Không tìm thấy người dùng nào"
          createNewButton={{
            label: "Tạo người dùng mới",
            onClick: handleCreateNew
          }}
        />
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          className: "!rounded-[6px] shadow-xl",
        }}
      >
        <DialogTitle fontSize={18}>
          Xác nhận xóa người dùng
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-400">
            Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="!p-4 !pb-6">
          <Button
            variant="outlined"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="outlined"
            onClick={handleDeleteConfirm}
            className="text-white transition-colors !bg-red-500 !border-red-500"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ?
              <div className="flex items-center gap-2 text-white">
                <CircularProgress size={16} className="text-white" />
                Đang xóa...
              </div> : <span className="!text-white">Xóa</span>}
          </Button>
        </DialogActions>
      </Dialog>

      <ChatDialog
        open={chatDialogOpen}
        onClose={() => setChatDialogOpen(false)}
        userId={selectedUserId}
        allUsers={allUsers?.data?.data || []}
        shop={selectedShop}
      />

      <Dialog
        open={balanceDialogOpen}
        onClose={handleBalanceDialogClose}
        PaperProps={{
          className: "!rounded-[6px] shadow-xl",
        }}
      >
        <DialogTitle fontSize={18}>
          {balanceActionType === 'deposit' ? 'Nạp tiền' : 'Rút tiền'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Số tiền"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mt: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">USD</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions className="!p-4 !pb-6">
          <Button
            variant="outlined"
            onClick={handleBalanceDialogClose}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="outlined"
            onClick={handleBalanceUpdate}
            className="text-white transition-colors !bg-main-golden-orange !border-main-golden-orange"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? (
              <div className="flex items-center gap-2 text-white">
                <CircularProgress size={16} className="text-white" />
                Đang xử lý...
              </div>
            ) : (
              balanceActionType === 'deposit' ? <span className="text-white">Nạp tiền</span> : <span className="text-white">Rút tiền</span>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UsersPage

