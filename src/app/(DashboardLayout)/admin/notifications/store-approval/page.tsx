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
    IconButton,
    InputAdornment,
    MenuItem,
    TableCell,
    TableRow,
    TextField,
    Typography,
    Menu
} from "@mui/material"
import { IconCopy, IconEye, IconSearch, IconTrash, IconEdit, IconDotsVertical, IconWallet, IconMoodSadDizzy, IconMapPinCheck } from "@tabler/icons-react"
import { message } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"

import ChatDialog from "@/components/ChatDialog"
import {useUpdateFakeOrder, useDeleteFakeOrder } from "@/hooks/fake-order"
import { useDeleteUser, useGetAllUsers, useUpdateUser } from "@/hooks/user"
import { useGetShopOrders } from "@/hooks/order"

function ShopsPage() {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<string | null>(null)
    const [chatDialogOpen, setChatDialogOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [selectedShop, setSelectedShop] = useState<any>(null)
    const [ordersDialogOpen, setOrdersDialogOpen] = useState(false)
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
    const [orderParams, setOrderParams] = useState({
        order: "DESC",
        page: 1,
        take: 10,
        search: "",
        shopId: "",
        delayStatus: "NORMAL",
        status: "PENDING"
    })
    const { data: userData, isLoading, error } = useGetAllUsers({
        page,
        role: 'shop',
        take: 1000,
        order: "DESC",
        search: searchTerm
    })

    const filteredUsers = (userData?.data?.data || []).filter(user => user.shopStatus === "PENDING")
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
    const { data: ordersData, isLoading: isOrdersLoading } = useGetShopOrders(orderParams)
    const [isEditingOrder, setIsEditingOrder] = useState(false)
    const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<any>(null)
    const updateOrderMutation = useUpdateFakeOrder()
    const deleteOrderMutation = useDeleteFakeOrder()
    const [editOrderForm, setEditOrderForm] = useState({
        email: '',
        phone: '',
        address: '',
        status: 'PENDING',
        delayStatus: 'NORMAL',
        paymentStatus: 'PENDING',
        orderTime: '',
        confirmedAt: '',
        deliveredAt: '',
        cancelledAt: '',
        paidAt: ''
    });
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuUserId, setMenuUserId] = useState<string | null>(null);
    const updateUserMutation = useUpdateUser();
    const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
    const [balanceActionType, setBalanceActionType] = useState<'deposit' | 'withdraw'>('deposit');
    const [amount, setAmount] = useState('');
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [shopToApprove, setShopToApprove] = useState<string | null>(null);

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
        } catch (error) {
            message.error("Không thể xóa người dùng. Vui lòng thử lại.")
            console.error(error)
        }
    }

    const handleOpenChat = (userId: string) => {
        const shop = filteredUsers.find(u => u.id === userId);
        setSelectedShop(shop);
        setSelectedUserId(userId);
        setChatDialogOpen(true);
    }

    const handleViewOrders = (shopId: string) => {
        setSelectedShopId(shopId);
        setOrderParams(prev => ({ ...prev, shopId }));
        setOrdersDialogOpen(true);
    }

    const handleOrderParamChange = (key: string, value: string | number) => {
        setOrderParams(prev => {
            const newParams = { ...prev, [key]: value };
            if (key === 'page' || key === 'take') {
                newParams.page = 1; // Reset về trang đầu tiên khi thay đổi số lượng item mỗi trang
            }
            return newParams;
        });
    }

    const handleEditOrder = (order: any) => {
        setSelectedOrderForEdit(order);
        setEditOrderForm({
            email: order.email || order.user?.email || '',
            phone: order.phone || order.user?.phone || '',
            address: order.address || order.user?.address || '',
            status: order.status || 'PENDING',
            delayStatus: order.delayStatus || 'NORMAL',
            paymentStatus: order.paymentStatus || 'PENDING',
            orderTime: order.orderTime ? formatDateTimeLocal(order.orderTime) : formatDateTimeLocal(order.createdAt),
            confirmedAt: order.confirmedAt ? formatDateTimeLocal(order.confirmedAt) : '',
            deliveredAt: order.deliveredAt ? formatDateTimeLocal(order.deliveredAt) : '',
            cancelledAt: order.cancelledAt ? formatDateTimeLocal(order.cancelledAt) : '',
            paidAt: order.paidAt ? formatDateTimeLocal(order.paidAt) : ''
        });
        setIsEditingOrder(true);
    }

    const formatDateTimeLocal = (dateString: string) => {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().slice(0, 16);
    }

    const handleEditOrderSubmit = async () => {
        if (!selectedOrderForEdit) return;

        try {
            await updateOrderMutation.mutateAsync({
                orderId: selectedOrderForEdit.id,
                payload: editOrderForm
            });
            message.success("Đơn hàng đã được cập nhật thành công!");
            setIsEditingOrder(false);
            setSelectedOrderForEdit(null);
        } catch (error) {
            message.error("Không thể cập nhật đơn hàng. Vui lòng thử lại.");
        }
    }

    const handleDeleteOrder = async (orderId: string) => {
        try {
            await deleteOrderMutation.mutateAsync(orderId)
            message.success("Đơn hàng đã được xóa thành công!")
            setOrderParams(prev => ({ ...prev }))
        } catch (error) {
            message.error("Không thể xóa đơn hàng. Vui lòng thử lại.")
        }
    }

    const translateStatus = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xử lý';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'SHIPPING':
                return 'Đang giao hàng';
            case 'DELIVERED':
                return 'Đã giao hàng';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
        setAnchorEl(event.currentTarget);
        setMenuUserId(userId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuUserId(null);
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
            const currentUser = filteredUsers.find(user => user.id === selectedUserId);
            if (!currentUser) {
                message.error('Không tìm thấy thông tin người dùng');
                return;
            }

            const currentBalance = Number(currentUser.balance);
            const amountNumber = Number(amount);
            const newBalance = balanceActionType === 'deposit'
                ? currentBalance + amountNumber
                : currentBalance - amountNumber;

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

    const handleApproveShop = async () => {
        if (!shopToApprove) return;

        try {
            await updateUserMutation.mutateAsync({
                id: shopToApprove,
                payload: {
                    shopStatus: "ACTIVE",
                    isActive: true
                }
            });
            message.success("Cửa hàng đã được phê duyệt thành công!");
            setApprovalDialogOpen(false);
            setShopToApprove(null);
        } catch (error) {
            message.error("Không thể phê duyệt cửa hàng. Vui lòng thử lại.");
            console.error(error);
        }
    };

    const openApprovalDialog = (id: string) => {
        setShopToApprove(id);
        setApprovalDialogOpen(true);
    };

    const renderOrderFilters = () => (
        <Box className="grid grid-cols-2 gap-4 p-4">
            <TextField
                select
                label="Sắp xếp"
                value={orderParams.order}
                onChange={(e) => handleOrderParamChange('order', e.target.value)}
            >
                <MenuItem value="ASC">ASC</MenuItem>
                <MenuItem value="DESC">DESC</MenuItem>
            </TextField>

            <TextField
                label="Tìm kiếm"
                value={orderParams.search}
                onChange={(e) => handleOrderParamChange('search', e.target.value)}
            />

            <TextField
                select
                label="Trạng thái delay"
                value={orderParams.delayStatus}
                onChange={(e) => handleOrderParamChange('delayStatus', e.target.value)}
            >
                <MenuItem value="NORMAL">NORMAL</MenuItem>
                <MenuItem value="DELAY_24H">DELAY_24H</MenuItem>
                <MenuItem value="DELAY_48H">DELAY_48H</MenuItem>
                <MenuItem value="DELAY_72H">DELAY_72H</MenuItem>
            </TextField>

            <TextField
                select
                label="Trạng thái đơn hàng"
                value={orderParams.status}
                onChange={(e) => handleOrderParamChange('status', e.target.value)}
            >
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
                <MenuItem value="SHIPPING">SHIPPING</MenuItem>
                <MenuItem value="DELIVERED">DELIVERED</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </TextField>
        </Box>
    )

    const renderOrdersTable = () => {
        const orderColumns = [
            { key: 'id', label: 'ID' },
            { key: 'status', label: 'Trạng thái' },
            { key: 'createdAt', label: 'Ngày tạo' },
            { key: 'totalAmount', label: 'Tổng tiền' },
            { key: 'actions', label: 'Thao tác' }
        ];

        const renderOrderRow = (order: any) => (
            <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                    <Chip
                        label={translateStatus(order.status)}
                        color="primary"
                    />
                </TableCell>
                <TableCell>
                    {new Date(order.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                    {order.totalAmount?.toLocaleString()} USD
                </TableCell>
                <TableCell>
                    <Box display="flex" gap={1}>
                        <IconButton
                            onClick={() => handleEditOrder(order)}
                            size="small"
                            className="!bg-blue-100"
                        >
                            <IconEdit size={16} className="text-blue-500" />
                        </IconButton>
                        <IconButton
                            onClick={() => handleDeleteOrder(order.id)}
                            size="small"
                            className="!bg-red-100"
                        >
                            <IconTrash size={16} className="text-red-500" />
                        </IconButton>
                    </Box>
                </TableCell>
            </TableRow>
        );

        return (
            <DataTable
                columns={orderColumns}
                data={ordersData?.data?.data || []}
                isLoading={isOrdersLoading}
                pagination={{
                    page: orderParams.page,
                    take: orderParams.take,
                    itemCount: ordersData?.data?.meta?.itemCount || 0,
                    pageCount: ordersData?.data?.meta?.pageCount || 1,
                    hasPreviousPage: ordersData?.data?.meta?.hasPreviousPage || false,
                    hasNextPage: ordersData?.data?.meta?.hasNextPage || false
                }}
                onPageChange={(newPage) => {
                    setOrderParams(prev => ({ ...prev, page: newPage }));
                }}
                onRowsPerPageChange={(newRowsPerPage) => {
                    setOrderParams(prev => ({ ...prev, take: newRowsPerPage, page: 1 }));
                }}
                renderRow={renderOrderRow}
                emptyMessage="Không có đơn hàng nào"
            />
        );
    }

    const columns = [
        { key: 'stt', label: 'STT' },
        { key: 'shopName', label: 'Tên cửa hàng' },
        { key: 'username', label: 'Tên tài khoản' },
        { key: 'email', label: 'Mail' },
        { key: 'isActive', label: 'Trạng thái' },
        { key: 'balance', label: 'Số dư cửa hàng' },
        { key: 'fedexBalance', label: 'Số dư Fedex' },
        { key: 'address', label: 'Địa chỉ' },
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
            <TableCell>{user.shopName}</TableCell>
            <TableCell>{user.username || "Không có"}</TableCell>
            <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                    {user.email || "Không có"}
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
            <TableCell>
                <Chip
                    label={
                        user.shopStatus === "PENDING"
                            ? "Chờ duyệt"
                            : user.shopStatus === "SUSPENDED"
                                ? "Đã đóng băng"
                                : "Hoạt động"
                    }
                    color={
                        user.shopStatus === "PENDING"
                            ? "warning"
                            : user.shopStatus === "SUSPENDED"
                                ? "error"
                                : "success"
                    }
                    size="small"
                />
            </TableCell>
            <TableCell>{user.balance?.toLocaleString()} USD</TableCell>
            <TableCell>{user.fedexBalance?.toLocaleString()} USD</TableCell>
            <TableCell>{[user.address, user.ward, user.district, user.city].filter(Boolean).join(', ')}</TableCell>
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
                            openApprovalDialog(user.id);
                            handleMenuClose();
                        }}>
                            <Box className="flex items-center gap-2">
                                <IconEye size={16} className="text-blue-400" />
                                <span>Phê duyệt</span>
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
                        <IconMapPinCheck size={36} className="text-main-golden-orange" />
                    </Box>
                    <Typography variant="h3" className="font-semibold tracking-wide text-center uppercase text-main-charcoal-blue">
                        Quản lý phê duyệt cửa hàng
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ width: '100%' }}>
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    isLoading={isLoading}
                    pagination={pagination}
                    onPageChange={setPage}
                    onRowsPerPageChange={(newRowsPerPage) => {
                        setRowsPerPage(newRowsPerPage);
                        setPage(1);
                    }}
                    renderRow={renderRow}
                    emptyMessage="Không tìm thấy người dùng nào"
                    searchComponent={
                        <div className="flex items-center gap-4">
                            <TextField
                                size="small"
                                placeholder="Tìm kiếm cửa hàng..."
                                variant="outlined"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 rounded shadow-sm"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconSearch size={20} className="text-main-golden-orange" />
                                        </InputAdornment>
                                    ),
                                    className: "text-white rounded-lg hover:shadow-md transition-shadow",
                                }}
                            />
                        </div>
                    }
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
                        variant="contained"
                        onClick={handleDeleteConfirm}
                        className="text-white transition-colors !bg-red-500"
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
                open={ordersDialogOpen}
                onClose={() => setOrdersDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Danh sách đơn hàng</DialogTitle>
                <DialogContent>
                    {renderOrderFilters()}
                    {isOrdersLoading ? (
                        <Box className="flex justify-center p-4">
                            <CircularProgress />
                        </Box>
                    ) : (
                        renderOrdersTable()
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOrdersDialogOpen(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isEditingOrder}
                onClose={() => setIsEditingOrder(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    className: "!rounded-lg shadow-xl"
                }}
            >
                <DialogTitle className="!text-xl !font-semibold !pb-4">
                    Sửa đơn hàng #{selectedOrderForEdit?.id}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }} className="space-y-4">
                        {/* Thông tin cơ bản */}
                        <Box className="grid grid-cols-2 gap-4">
                            <TextField
                                fullWidth
                                label="Email"
                                value={editOrderForm.email}
                                onChange={(e) => setEditOrderForm(prev => ({ ...prev, email: e.target.value }))}
                                variant="outlined"
                                size="small"
                            />
                            <TextField
                                fullWidth
                                label="Số điện thoại"
                                value={editOrderForm.phone}
                                onChange={(e) => setEditOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                                variant="outlined"
                                size="small"
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Địa chỉ"
                            value={editOrderForm.address}
                            onChange={(e) => setEditOrderForm(prev => ({ ...prev, address: e.target.value }))}
                            variant="outlined"
                            size="small"
                            multiline
                            rows={2}
                        />

                        {/* Trạng thái đơn hàng */}
                        <Box className="grid grid-cols-2 gap-4">
                            <TextField
                                select
                                fullWidth
                                label="Trạng thái đơn hàng"
                                value={editOrderForm.status}
                                onChange={(e) => setEditOrderForm(prev => ({ ...prev, status: e.target.value }))}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="PENDING" className="!text-orange-500">Chờ xử lý</MenuItem>
                                <MenuItem value="CONFIRMED" className="!text-blue-500">Đã xác nhận</MenuItem>
                                <MenuItem value="SHIPPING" className="!text-purple-500">Đang giao hàng</MenuItem>
                                <MenuItem value="DELIVERED" className="!text-green-500">Đã giao hàng</MenuItem>
                                <MenuItem value="CANCELLED" className="!text-red-500">Đã hủy</MenuItem>
                            </TextField>

                            <TextField
                                select
                                fullWidth
                                label="Trạng thái delay"
                                value={editOrderForm.delayStatus}
                                onChange={(e) => setEditOrderForm(prev => ({ ...prev, delayStatus: e.target.value }))}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="NORMAL">Bình thường</MenuItem>
                                <MenuItem value="DELAY_24H">Delay 24h</MenuItem>
                                <MenuItem value="DELAY_48H">Delay 48h</MenuItem>
                                <MenuItem value="DELAY_72H">Delay 72h</MenuItem>
                            </TextField>
                        </Box>

                        {/* Thời gian */}
                        <Box className="grid grid-cols-2 gap-4">
                            <TextField
                                fullWidth
                                label="Thời gian đặt hàng"
                                type="datetime-local"
                                value={editOrderForm.orderTime}
                                onChange={(e) => setEditOrderForm(prev => ({ ...prev, orderTime: e.target.value }))}
                                variant="outlined"
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Thời gian xác nhận"
                                type="datetime-local"
                                value={editOrderForm.confirmedAt}
                                onChange={(e) => setEditOrderForm(prev => ({ ...prev, confirmedAt: e.target.value }))}
                                variant="outlined"
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Box>

                        <Box className="grid grid-cols-2 gap-4">
                            <TextField
                                fullWidth
                                label="Thời gian giao hàng"
                                type="datetime-local"
                                value={editOrderForm.deliveredAt}
                                onChange={(e) => setEditOrderForm(prev => ({ ...prev, deliveredAt: e.target.value }))}
                                variant="outlined"
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Thời gian hủy"
                                type="datetime-local"
                                value={editOrderForm.cancelledAt}
                                onChange={(e) => setEditOrderForm(prev => ({ ...prev, cancelledAt: e.target.value }))}
                                variant="outlined"
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Box>

                        {/* Trạng thái thanh toán */}
                        <TextField
                            select
                            fullWidth
                            label="Trạng thái thanh toán"
                            value={editOrderForm.paymentStatus}
                            onChange={(e) => setEditOrderForm(prev => ({ ...prev, paymentStatus: e.target.value }))}
                            variant="outlined"
                            size="small"
                        >
                            <MenuItem value="PENDING" className="!text-orange-500">Chờ thanh toán</MenuItem>
                            <MenuItem value="PAID" className="!text-green-500">Đã thanh toán</MenuItem>
                            <MenuItem value="FAILED" className="!text-red-500">Thanh toán thất bại</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions className="!p-4 !pt-2">
                    <Button
                        variant="outlined"
                        onClick={() => setIsEditingOrder(false)}
                        className="!normal-case"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleEditOrderSubmit}
                        disabled={updateOrderMutation.isPending}
                        className="!normal-case !bg-blue-500 hover:!bg-blue-600"
                    >
                        {updateOrderMutation.isPending ? (
                            <Box className="flex items-center gap-2">
                                <CircularProgress size={16} className="!text-white" />
                                Đang cập nhật...
                            </Box>
                        ) : 'Cập nhật đơn hàng'}
                    </Button>
                </DialogActions>
            </Dialog>

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
                        className="text-white transition-colors !bg-main-golden-orange"
                        disabled={updateUserMutation.isPending}
                    >
                        {updateUserMutation.isPending ? (
                            <div className="flex items-center gap-2 text-white">
                                <CircularProgress size={16} className="text-white" />
                                Đang xử lý...
                            </div>
                        ) : (
                            balanceActionType === 'deposit' ? 'Nạp tiền' : 'Rút tiền'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={approvalDialogOpen}
                onClose={() => setApprovalDialogOpen(false)}
                PaperProps={{
                    className: "!rounded-[6px] shadow-xl",
                }}
            >
                <DialogTitle fontSize={18}>
                    Xác nhận phê duyệt cửa hàng
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className="text-gray-400">
                        Bạn có chắc chắn muốn phê duyệt cửa hàng này?
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="!p-4 !pb-6">
                    <Button
                        variant="outlined"
                        onClick={() => setApprovalDialogOpen(false)}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApproveShop}
                        className="text-white transition-colors !bg-green-500"
                        disabled={updateUserMutation.isPending}
                    >
                        {updateUserMutation.isPending ?
                            <div className="flex items-center gap-2 text-white">
                                <CircularProgress size={16} className="text-white" />
                                Đang xử lý...
                            </div> : <span className="!text-white">Phê duyệt</span>}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ShopsPage

