"use client";
import PageContainer from "@/component/container/PageContainer";
import DashboardCard from "@/component/shared/DashboardCard";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Stack,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useGetOrders } from "@/hooks/fake-order";
import { useAddDelayMessage, useGetDeliveryStages, useGetOrderDetail } from "@/hooks/order";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { IconSearch, IconEye, IconClock } from "@tabler/icons-react";
import { toast } from "react-toastify";
import { formatTime } from "@/utils";

const OrdersPage = () => {
  const [searchParams, setSearchParams] = useState({
    page: 1,
    take: 10,
    search: "",
  });
  const [delayDialogOpen, setDelayDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [delayMessage, setDelayMessage] = useState("");
  const [isDetailView, setIsDetailView] = useState(false);

  // Sử dụng searchParams để xác định xem có phải là tìm kiếm chi tiết hay không
  useEffect(() => {
    setIsDetailView(searchParams.search.length === 36);
  }, [searchParams.search]);

  // Gọi hook dựa vào trạng thái isDetailView
  const { data: ordersResponse, isLoading: isLoadingOrders } = useGetOrders(
    !isDetailView ? searchParams : { page: 1, take: 0, search: "" }
  );
  const { data: orderDetail, isLoading: isLoadingOrderDetail } = useGetOrderDetail(
    isDetailView ? searchParams.search : ""
  );
  const addDelayMessageMutation = useAddDelayMessage();
  const { data: deliveryStagesData, isLoading: isLoadingStages } = useGetDeliveryStages('SHIPPING');

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({ ...prev, search: event.target.value }));
  };

  const handleSearch = () => {
    setSearchParams((prev) => ({ ...prev, page: 1 }));
  };

  const openDelayDialog = (order: any) => {
    setSelectedOrder(order);
    setDelayMessage("Delay đơn hàng");
    setDelayDialogOpen(true);
  };

  const closeDelayDialog = () => {
    setDelayDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleSubmitDelay = async () => {
    if (!delayMessage.trim()) {
      toast.error("Vui lòng nhập thông báo delay!");
      return;
    }

    if (!selectedOrder?.id) {
      toast.error("Không tìm thấy thông tin đơn hàng!");
      return;
    }
    try {
      await addDelayMessageMutation.mutateAsync({
        orderId: selectedOrder.id,
        payload: { message: delayMessage },
      });
      
      toast.success("Đã thêm thông báo delay thành công!");
      closeDelayDialog();
    } catch (error: any) {
      // Kiểm tra nếu message chính xác là "Order not found"
      if (error?.response?.data?.message === "Order not found") {
        toast.error("Đơn hàng không ở trạng thái SHIPPING");
      } else {
        const errorMessage = error?.response?.data?.message || "Không thể thêm thông báo delay. Vui lòng thử lại!";
        toast.error(errorMessage);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "shipping":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getDelayStatusText = (delayStatus: string) => {
    switch (delayStatus) {
      case "NORMAL":
        return "Bình thường";
      case "DELAY_24H":
        return "Trễ 24h";
      case "DELAY_48H":
        return "Trễ 48h";
      case "DELAY_72H":
        return "Trễ 72h";
      default:
        return delayStatus;
    }
  };

  const getDelayStatusColor = (delayStatus: string) => {
    switch (delayStatus) {
      case "NORMAL":
        return "success";
      case "DELAY_24H":
        return "warning";
      case "DELAY_48H":
        return "error";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: string | number) => {
    return (parseFloat(amount as string) || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return "N/A";
    }
  };

  // Get stage name from stageId
  const getStageName = (stageId: string) => {
    if (!deliveryStagesData?.data || !stageId) return "N/A";
    
    const stage = deliveryStagesData.data.find((stage: any) => stage.id === stageId);
    return stage ? stage.name : "N/A";
  };

  // Get stage color
  const getStageColor = (stageId: string) => {
    if (!deliveryStagesData?.data || !stageId) return "default";
    
    const stage = deliveryStagesData.data.find((stage: any) => stage.id === stageId);
    if (!stage) return "default";
    
    // Define colors based on stage position
    const index = deliveryStagesData.data.findIndex((s: any) => s.id === stageId);
    const totalStages = deliveryStagesData.data.length;
    
    if (index < totalStages / 3) return "warning";
    if (index < (2 * totalStages) / 3) return "info";
    return "success";
  };

  // Hiển thị chi tiết đơn hàng từ orderDetail
  const renderOrderDetail = () => {
    if (isLoadingOrderDetail) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!orderDetail) {
      return (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">Không tìm thấy đơn hàng</Typography>
        </Box>
      );
    }

    const order = orderDetail.data;

    return (
      <Box sx={{ overflowX: "auto" }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>ID đơn hàng</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Ngày tạo đơn hàng</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Ngày đặt hàng</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Khách hàng</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Cửa hàng</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Tổng tiền</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Giá nhập</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Lợi nhuận</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tiến độ</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Ngày thanh toán</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {order.id.substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(order.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {
                      formatTime(order.orderTime)
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {order.user?.fullName || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {order.email || order.user?.email || "N/A"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {order.shop?.shopName || order.shop?.fullName || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {order.shop?.username || "N/A"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(order.totalPaidAmount || 0)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    {formatCurrency(order.totalProfit || 0)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                    sx={{ fontWeight: "medium" }}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title={getDelayStatusText(order.delayStatus || "NORMAL")}> 
                    <Chip
                      label={getDelayStatusText(order.delayStatus || "NORMAL")}
                      color={getDelayStatusColor(order.delayStatus || "NORMAL")}
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.confirmedAt ? formatDate(order.confirmedAt) : "N/A"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        color="primary"
                        href={`/admin/orders/${order.id}`}
                      >
                        <IconEye size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Thông báo delay">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => openDelayDialog(order)}
                      >
                        <IconClock size={18} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Hiển thị danh sách đơn hàng từ ordersResponse
  const renderOrdersList = () => {
    if (isLoadingOrders || isLoadingStages) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ overflowX: "auto" }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>ID đơn hàng</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Ngày tạo đơn hàng</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Ngày đặt hàng</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Khách hàng</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Cửa hàng</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">Tổng tiền</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">Giá nhập</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">Lợi nhuận</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Tiến độ</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Ngày thanh toán</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordersResponse?.data?.data?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {order.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.createdAt || order.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.orderTime || order.orderTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {order.user?.fullName || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.email || order.user?.email || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {order.shop?.shopName || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.shop?.username || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(order.totalPaidAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        {formatCurrency(order.totalProfit)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ fontWeight: "medium" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={getDelayStatusText(order.delayStatus)}>
                        <Chip
                          label={getDelayStatusText(order.delayStatus)}
                          color={getDelayStatusColor(order.delayStatus)}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.confirmedAt ? formatDate(order.confirmedAt) : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            color="primary"
                            href={`/admin/orders/${order.id}`}
                          >
                            <IconEye size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Thông báo delay">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => openDelayDialog(order)}
                          >
                            <IconClock size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {(!ordersResponse?.data?.data ||
          ordersResponse.data.data.length === 0) && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body1">Không có đơn hàng nào</Typography>
          </Box>
        )}

        {ordersResponse?.data?.total !== undefined && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              px: 2,
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Tổng cộng: {ordersResponse.data.total || 0} đơn hàng
            </Typography>
            <Pagination
              count={Math.ceil((ordersResponse.data.total || 0) / searchParams.take)}
              page={searchParams.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <PageContainer
      title="Quản lý đơn hàng"
      description="Quản lý tất cả đơn hàng trong hệ thống"
    >
      <DashboardCard title="Danh sách đơn hàng">
        <Box>
          <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="Tìm kiếm"
              variant="outlined"
              size="small"
              value={searchParams.search}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1, minWidth: "200px" }}
              placeholder="Tìm theo ID, tên khách hàng, email..."
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={handleSearch}>
                    <IconSearch size={18} />
                  </IconButton>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <Button variant="contained" color="primary" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Box>

          {/* Hiển thị dữ liệu dựa vào trạng thái tìm kiếm */}
          {isDetailView ? renderOrderDetail() : renderOrdersList()}
        </Box>
      </DashboardCard>

      {/* Delay Message Dialog */}
      <Dialog 
        open={delayDialogOpen} 
        onClose={closeDelayDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thông báo delay đơn hàng</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              label="Lý do delay"
              fullWidth
              multiline
              rows={3}
              value={delayMessage}
              onChange={(e) => setDelayMessage(e.target.value)}
              placeholder="Nhập lý do delay đơn hàng..."
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions className="!px-6 !pb-4">
          <Button onClick={closeDelayDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleSubmitDelay} 
            variant="contained" 
            color="primary"
            disabled={addDelayMessageMutation.isPending}
          >
            {addDelayMessageMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default OrdersPage;
