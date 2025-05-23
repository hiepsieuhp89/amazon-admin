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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Menu,
    FormControl,
    InputLabel
} from "@mui/material"
import { IconCopy, IconEye, IconList, IconMessage, IconSearch, IconTrash, IconEdit, IconDotsVertical, IconWallet, IconMoodSadDizzy, IconBuildingStore, IconStairsUp, IconMail } from "@tabler/icons-react"
import { message, Pagination } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"

import ChatDialog from "@/components/ChatDialog"
import {useUpdateFakeOrder, useDeleteFakeOrder } from "@/hooks/fake-order"
import { useDeleteUser, useGetAllUsers, useUpdateUser } from "@/hooks/user"
import { useGetDeliveryStages, useGetOrderDetail, useUpdateDeliveryStage, useGetShopOrders } from "@/hooks/order"
import { useGetAllEmailTemplates, useSendEmailByTemplate } from "@/hooks/emailTemplate"
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
        status: "PENDING",
        orderIds: [] as string[]
    })
    const { data: userData, isLoading, error } = useGetAllUsers({
        page,
        role: 'shop',
        take: rowsPerPage,
        order: "DESC",
        search: searchTerm
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
    const { data: ordersData, isLoading: isOrdersLoading } = useGetShopOrders(orderParams)
    const [isEditingOrder, setIsEditingOrder] = useState(false)
    const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<any>(null)
    const [previousOrdersDialogState, setPreviousOrdersDialogState] = useState(false)
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
    const [fedexBalanceDialogOpen, setFedexBalanceDialogOpen] = useState(false);
    const [fedexBalanceActionType, setFedexBalanceActionType] = useState<'deposit' | 'withdraw'>('deposit');
    const [verifyShopDialogOpen, setVerifyShopDialogOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [orderAnchorEl, setOrderAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const { data: deliveryStages } = useGetDeliveryStages("SHIPPING")
    const [isUpdatingStage, setIsUpdatingStage] = useState(false)
    const [selectedStage, setSelectedStage] = useState<number | null>(null)
    const updateDeliveryStageMutation = useUpdateDeliveryStage()
    const { data: orderDetail } = useGetOrderDetail(selectedOrderId || "")
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [selectedTemplateType, setSelectedTemplateType] = useState<string>("");
    const { data: emailTemplatesData } = useGetAllEmailTemplates();
    const sendEmailMutation = useSendEmailByTemplate();
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

    const handleOrderParamChange = (key: string, value: string | number | string[]) => {
        setOrderParams(prev => {
            const newParams = { ...prev, [key]: value };
            if (key === 'page' || key === 'take') {
                newParams.page = 1; // Reset về trang đầu tiên khi thay đổi số lượng item mỗi trang
            }
            return newParams;
        });
    }

    const handleEditOrder = (order: any) => {
        setPreviousOrdersDialogState(ordersDialogOpen);
        setOrdersDialogOpen(false);
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

    const handleCloseEditOrder = () => {
        setIsEditingOrder(false);
        setSelectedOrderForEdit(null);
        setOrdersDialogOpen(previousOrdersDialogState);
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
            // Xử lý định dạng ngày tháng
            const payload = {
                ...editOrderForm,
                orderTime: editOrderForm.orderTime ? new Date(editOrderForm.orderTime).toISOString() : undefined,
                confirmedAt: editOrderForm.confirmedAt ? new Date(editOrderForm.confirmedAt).toISOString() : undefined,
                deliveredAt: editOrderForm.deliveredAt ? new Date(editOrderForm.deliveredAt).toISOString() : undefined,
                cancelledAt: editOrderForm.cancelledAt ? new Date(editOrderForm.cancelledAt).toISOString() : undefined,
                paidAt: editOrderForm.paidAt ? new Date(editOrderForm.paidAt).toISOString() : undefined,
            };

            await updateOrderMutation.mutateAsync({
                orderId: selectedOrderForEdit.id,
                payload
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

    const handleVerifyShopDialogOpen = (userId: string) => {
        setSelectedUserId(userId);
        setVerifyShopDialogOpen(true);
    };

    const handleVerifyShopDialogClose = () => {
        setVerifyShopDialogOpen(false);
        setSelectedUserId(null);
    };

    const handleVerifyShop = async () => {
        if (!selectedUserId) return;

        try {
            const user = filteredUsers.find(user => user.id === selectedUserId);
            if (!user) {
                message.error('Không tìm thấy thông tin người dùng');
                return;
            }

            await updateUserMutation.mutateAsync({
                id: selectedUserId,
                payload: {
                    isVerified: true
                }
            });

            message.success('Xác minh cửa hàng thành công!');
            handleVerifyShopDialogClose();
        } catch (error) {
            message.error('Không thể xác minh cửa hàng. Vui lòng thử lại.');
            console.error(error);
        }
    };

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
            const amountNumber = Number(amount);
            let payload: any = { isHaveLogTransaction: true };
            if (balanceActionType === 'deposit') {
                payload.balanceAddBalance = amountNumber;
            } else {
                payload.balanceSubBalance = amountNumber;
            }

            await updateUserMutation.mutateAsync({
                id: selectedUserId,
                payload
            });

            message.success(`${balanceActionType === 'deposit' ? 'Nạp' : 'Rút'} tiền thành công!`);
            handleBalanceDialogClose();
        } catch (error) {
            message.error(`Không thể ${balanceActionType === 'deposit' ? 'nạp' : 'rút'} tiền. Vui lòng thử lại.`);
            console.error(error);
        }
    };

    const handleFedexBalanceDialogOpen = (userId: string, type: 'deposit' | 'withdraw') => {
        setSelectedUserId(userId);
        setFedexBalanceActionType(type);
        setFedexBalanceDialogOpen(true);
    };

    const handleFedexBalanceDialogClose = () => {
        setFedexBalanceDialogOpen(false);
        setAmount('');
        setSelectedUserId(null);
    };

    const handleFedexBalanceUpdate = async () => {
        if (!selectedUserId || !amount || isNaN(Number(amount))) {
            message.error('Số tiền không hợp lệ');
            return;
        }

        try {
            const amountNumber = Number(amount);
            let payload: any = { isHaveLogTransaction: true };
            if (fedexBalanceActionType === 'deposit') {
                payload.fedexAddBalance = amountNumber;
            } else {
                payload.fedexSubBalance = amountNumber;
            }

            await updateUserMutation.mutateAsync({
                id: selectedUserId,
                payload
            });

            message.success(`${fedexBalanceActionType === 'deposit' ? 'Nạp' : 'Rút'} tiền Fedex thành công!`);
            handleFedexBalanceDialogClose();
        } catch (error) {
            message.error(`Không thể ${fedexBalanceActionType === 'deposit' ? 'nạp' : 'rút'} tiền Fedex. Vui lòng thử lại.`);
            console.error(error);
        }
    };

    const handleOrderMenuOpen = (event: React.MouseEvent<HTMLElement>, orderId: string) => {
        setOrderAnchorEl(event.currentTarget);
        setSelectedOrderId(orderId);
    };

    const handleOrderMenuClose = () => {
        setOrderAnchorEl(null);
        setSelectedOrderId(null);
    };

    const handleEmailDialogOpen = (userId: string) => {
        setSelectedUserId(userId);
        setEmailDialogOpen(true);
    };

    const handleEmailDialogClose = () => {
        setEmailDialogOpen(false);
        setSelectedTemplateType("");
        setSelectedUserId(null);
    };

    const handleSendEmail = async () => {
        if (!selectedUserId || !selectedTemplateType) {
            message.error('Vui lòng chọn loại template');
            return;
        }

        try {
            await sendEmailMutation.mutateAsync({
                userId: selectedUserId,
                templateType: selectedTemplateType
            });

            message.success('Gửi email thành công!');
            handleEmailDialogClose();
        } catch (error) {
            message.error('Không thể gửi email. Vui lòng thử lại.');
            console.error(error);
        }
    };

    const renderOrderFilters = () => (
        <Box className="grid grid-cols-2 gap-4 p-4">
            <TextField
                size="small"
                select
                label="Sắp xếp"
                value={orderParams.order}
                onChange={(e) => handleOrderParamChange('order', e.target.value)}
            >
                <MenuItem value="ASC">ASC</MenuItem>
                <MenuItem value="DESC">DESC</MenuItem>
            </TextField>

            <TextField
                size="small"
                label="Tìm kiếm"
                value={orderParams.search}
                onChange={(e) => handleOrderParamChange('search', e.target.value)}
            />

            <TextField
                size="small"
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
                size="small"
                select
                label="Trạng thái đơn hàng"
                value={orderParams.status}
                onChange={(e) => handleOrderParamChange('status', e.target.value)}
            >
                <MenuItem value="PENDING" className="!text-orange-500">Chờ xử lý</MenuItem>
                <MenuItem value="CONFIRMED" className="!text-blue-500">Đã xác nhận</MenuItem>
                <MenuItem value="SHIPPING" className="!text-purple-500">Đang giao hàng</MenuItem>
                <MenuItem value="DELIVERED" className="!text-green-500">Đã giao hàng</MenuItem>
                <MenuItem value="CANCELLED" className="!text-red-500">Đã hủy</MenuItem>
            </TextField>
            
            <TextField
                size="small"
                label="Lọc theo ID đơn hàng (ngăn cách bởi dấu phẩy)"
                value={orderParams.orderIds.join(',')}
                onChange={(e) => {
                    const value = e.target.value;
                    const orderIdsArray = value ? value.split(',').map(id => id.trim()).filter(Boolean) : [];
                    handleOrderParamChange('orderIds', orderIdsArray);
                }}
                className="col-span-2"
            />
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
                    <Box className="flex items-center justify-center">
                        <IconButton
                            onClick={(e) => handleOrderMenuOpen(e, order.id)}
                            size="medium"
                        >
                            <IconDotsVertical size={18} />
                        </IconButton>

                        <Menu
                            anchorEl={orderAnchorEl}
                            open={Boolean(orderAnchorEl) && selectedOrderId === order.id}
                            onClose={handleOrderMenuClose}
                            PaperProps={{
                                className: "!rounded-[6px] shadow-xl",
                            }}
                        >
                            <MenuItem onClick={() => {
                                handleEditOrder(order);
                                handleOrderMenuClose();
                            }}>
                                <Box className="flex items-center gap-2">
                                    <IconEdit size={16} className="text-blue-400" />
                                    <span>Sửa đơn hàng</span>
                                </Box>
                            </MenuItem>
                            <MenuItem onClick={() => {
                                setIsUpdatingStage(true)
                                setSelectedOrderForEdit(order)
                                handleOrderMenuClose()
                            }}>
                                <Box className="flex items-center gap-2">
                                    <IconStairsUp size={16} className="text-purple-400" />
                                    <span>Cập nhật giai đoạn</span>
                                </Box>
                            </MenuItem>
                            <MenuItem onClick={() => {
                                handleDeleteOrder(order.id);
                                handleOrderMenuClose();
                            }}>
                                <Box className="flex items-center gap-2">
                                    <IconTrash size={16} className="text-red-400" />
                                    <span>Xóa đơn hàng</span>
                                </Box>
                            </MenuItem>
                        </Menu>
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
        { key: 'isVerified', label: 'Trạng thái xác minh' },
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
            </TableCell>
            <TableCell>
                <Chip
                    label={user.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                    color={user.isVerified ? "success" : "error"}
                    size="small"
                    variant="filled"
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
                                handleEmailDialogOpen(user.id);
                                handleMenuClose();
                            }}>
                                <Box className="flex items-center gap-2">
                                    <IconMail size={16} className="text-indigo-400" />
                                    <span>Gửi email</span>
                                </Box>
                            </MenuItem>
                        )}
                        {user.role === "shop" && (
                            <MenuItem onClick={() => {
                                handleViewOrders(user.id);
                                handleMenuClose();
                            }}>
                                <Box className="flex items-center gap-2">
                                    <IconList size={16} className="text-purple-400" />
                                    <span>Xem đơn hàng</span>
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
                        {user.role === "shop" && !user.isVerified && (
                            <MenuItem onClick={() => {
                                handleVerifyShopDialogOpen(user.id);
                                handleMenuClose();
                            }}>
                                <Box className="flex items-center gap-2">
                                    <IconBuildingStore size={16} className="text-green-400" />
                                    <span>Xác minh cửa hàng</span>
                                </Box>
                            </MenuItem>
                        )}
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
                            handleFedexBalanceDialogOpen(user.id, 'deposit');
                            handleMenuClose();
                        }}>
                            <Box className="flex items-center gap-2">
                                <IconWallet size={16} className="text-blue-400" />
                                <span>Nạp tiền Fedex</span>
                            </Box>
                        </MenuItem>
                        <MenuItem onClick={() => {
                            handleFedexBalanceDialogOpen(user.id, 'withdraw');
                            handleMenuClose();
                        }}>
                            <Box className="flex items-center gap-2">
                                <IconWallet size={16} className="text-purple-400" />
                                <span>Rút tiền Fedex</span>
                            </Box>
                        </MenuItem>
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
        <div className="flex flex-col h-full min-h-screen ">
            <Box className="relative flex flex-col items-center justify-center py-8">
                <Box className="absolute" />
                <Box className="relative flex flex-col items-center gap-2">
                    <Box className="p-4 mb-3 rounded-full shadow-lg bg-gradient-to-r from-amber-100 to-orange-100">
                        <IconBuildingStore size={36} className="text-main-golden-orange" />
                    </Box>
                    <Typography variant="h3" className="font-semibold tracking-wide text-center uppercase text-main-charcoal-blue">
                        Quản lý cửa hàng
                    </Typography>
                </Box>
            </Box>
            <Box className="flex flex-col flex-1 w-full bg-[#F5F5F5]">
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', padding: 3, paddingTop: 0, paddingBottom: 0 }}>
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm cửa hàng..."
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
                </Box>
                <Box className="flex flex-col flex-1 overflow-auto">
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
                    />
                </Box>
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
                onClose={handleCloseEditOrder}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
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
                        onClick={handleCloseEditOrder}
                        className="!normal-case"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleEditOrderSubmit}
                        disabled={updateOrderMutation.isPending}
                        className="!normal-case ! hover:!bg-blue-600"
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

            <Dialog
                open={fedexBalanceDialogOpen}
                onClose={handleFedexBalanceDialogClose}
                PaperProps={{
                    className: "!rounded-[6px] shadow-xl",
                }}
            >
                <DialogTitle fontSize={18}>
                    {fedexBalanceActionType === 'deposit' ? 'Nạp tiền Fedex' : 'Rút tiền Fedex'}
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
                        onClick={handleFedexBalanceDialogClose}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleFedexBalanceUpdate}
                        className="text-white transition-colors !bg-main-golden-orange !border-main-golden-orange"
                        disabled={updateUserMutation.isPending}
                    >
                        {updateUserMutation.isPending ? (
                            <div className="flex items-center gap-2 text-white">
                                <CircularProgress size={16} className="text-white" />
                                Đang xử lý...
                            </div>
                        ) : (
                            fedexBalanceActionType === 'deposit' ? <span className="text-white">Nạp tiền Fedex</span> : <span className="text-white">Rút tiền Fedex</span>
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={verifyShopDialogOpen}
                onClose={handleVerifyShopDialogClose}
                PaperProps={{
                    className: "!rounded-[6px] shadow-xl",
                }}
            >
                <DialogTitle fontSize={18}>
                    Xác minh cửa hàng
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className="mt-2 text-gray-500">
                        Bạn có chắc chắn muốn xác minh cửa hàng này không? Sau khi xác minh, cửa hàng sẽ được đánh dấu là đã xác minh và có thể tiếp tục hoạt động.
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="!p-4 !pb-6">
                    <Button
                        variant="outlined"
                        onClick={handleVerifyShopDialogClose}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleVerifyShop}
                        className="text-white transition-colors !bg-main-golden-orange !border-main-golden-orange"
                        disabled={updateUserMutation.isPending}
                    >
                        {updateUserMutation.isPending ? (
                            <div className="flex items-center gap-2 text-white">
                                <CircularProgress size={16} className="text-white" />
                                Đang xử lý...
                            </div>
                        ) : (
                            <span className="text-white">Xác minh</span>
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isUpdatingStage}
                onClose={() => {
                    setIsUpdatingStage(false)
                    setSelectedStage(null)
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Cập nhật giai đoạn đơn hàng #{selectedOrderForEdit?.id}
                </DialogTitle>
                <DialogContent>
                    <Box className="mt-2 space-y-4">
                        {/* Thông tin đơn hàng */}
                        <Box className="p-4 border !rounded-[4px] bg-gray-50">
                            <Typography variant="subtitle2" className="mb-2 font-medium">
                                Thông tin đơn hàng
                            </Typography>
                            <Box className="grid grid-cols-2 gap-4">
                                <Box>
                                    <Typography variant="caption" className="text-gray-500">
                                        Email
                                    </Typography>
                                    <Typography>
                                        {selectedOrderForEdit?.email || selectedOrderForEdit?.user?.email || "N/A"}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" className="text-gray-500">
                                        Số điện thoại
                                    </Typography>
                                    <Typography>
                                        {selectedOrderForEdit?.phone || selectedOrderForEdit?.user?.phone || "N/A"}
                                    </Typography>
                                </Box>
                                <Box className="col-span-2">
                                    <Typography variant="caption" className="text-gray-500">
                                        Địa chỉ
                                    </Typography>
                                    <Typography>
                                        {selectedOrderForEdit?.address || selectedOrderForEdit?.user?.address || "N/A"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Select giai đoạn */}
                        <FormControl fullWidth size="small">
                            <TextField
                                select
                                fullWidth
                                label="Giai đoạn"
                                value={selectedStage || ''}
                                onChange={(e) => setSelectedStage(Number(e.target.value))}
                                size="small"
                            >
                                {(() => {
                                    // Lấy stage hiện tại từ selectedOrderForEdit
                                    const currentStage = selectedOrderForEdit?.stageDelivery || 0;

                                    // Lọc và hiển thị các stage lớn hơn stage hiện tại
                                    return deliveryStages?.data?.filter(stage => 
                                        (stage as any).stage > currentStage
                                    ).map((stage) => (
                                        <MenuItem key={(stage as any).stage} value={(stage as any).stage}>
                                            {(stage as any).description}
                                        </MenuItem>
                                    ));
                                })()}
                            </TextField>
                            {(() => {
                                const currentStage = (orderDetail?.data as any)?.statusHistory?.length > 0 
                                    ? (orderDetail?.data as any).statusHistory[(orderDetail?.data as any).statusHistory.length - 1].stageDelivery 
                                    : 0;

                                const hasNextStages = deliveryStages?.data?.some(stage => 
                                    (stage as any).stage > currentStage
                                );

                                if (!hasNextStages) {
                                    return (
                                        <Typography variant="caption" color="error" className="mt-2">
                                            Không có giai đoạn tiếp theo có sẵn
                                        </Typography>
                                    );
                                }
                                return null;
                            })()}
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions className="!p-4 !pt-2">
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setIsUpdatingStage(false)
                            setSelectedStage(null)
                        }}
                        className="!normal-case"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (!selectedOrderForEdit?.id || !selectedStage) return
                            updateDeliveryStageMutation.mutate({
                                id: selectedOrderForEdit.id,
                                payload: {
                                    stage: selectedStage
                                }
                            }, {
                                onSuccess: () => {
                                    message.success("Cập nhật giai đoạn thành công!")
                                    setIsUpdatingStage(false)
                                    setSelectedStage(null)
                                },
                                onError: () => {
                                    message.error("Cập nhật giai đoạn thất bại!")
                                }
                            })
                        }}
                        disabled={updateDeliveryStageMutation.isPending || !selectedStage}
                        className="!normal-case !hover:!bg-blue-600"
                    >
                        {updateDeliveryStageMutation.isPending ? (
                            <Box className="flex items-center gap-2">
                                <CircularProgress size={16} className="!text-white" />
                                Đang cập nhật...
                            </Box>
                        ) : 'Cập nhật giai đoạn'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={emailDialogOpen}
                onClose={handleEmailDialogClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Gửi email cho người dùng
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Loại template"
                            value={selectedTemplateType}
                            onChange={(e) => setSelectedTemplateType(e.target.value)}
                        >
                            {emailTemplatesData?.data?.data?.map((template: any) => (
                                <MenuItem key={template.type} value={template.type}>
                                    {template.type}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                </DialogContent>
                <DialogActions className="!p-4 !pb-6">
                    <Button
                        variant="outlined"
                        onClick={handleEmailDialogClose}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleSendEmail}
                        className="text-white transition-colors !bg-main-golden-orange !border-main-golden-orange"
                        disabled={sendEmailMutation.isPending || !selectedTemplateType}
                    >
                        {sendEmailMutation.isPending ? (
                            <div className="flex items-center gap-2 text-white">
                                <CircularProgress size={16} className="text-white" />
                                Đang gửi...
                            </div>
                        ) : (
                            <span className="text-white">Gửi email</span>
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </ div>
    )
}

export default ShopsPage

