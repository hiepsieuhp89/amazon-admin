'use client';
import PageContainer from '@/component/container/PageContainer';
import DashboardCard from '@/component/shared/DashboardCard';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  Stack,
  LinearProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Rating,
  InputLabel,
  FormControl,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { sendGet } from '@/api/apiClient';
import { useGetDeliveryStages } from '@/hooks/order';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { IconArrowLeft, IconUser, IconBuildingStore, IconTruckDelivery, IconInfoCircle, IconHistory, IconCircleFilled, IconPackage, IconMailSpark, IconPhone, IconStar, IconMapPin, IconPhoto, IconX, IconBrandTelegram } from '@tabler/icons-react';
import { useCreateFakeReview } from '@/hooks/fake-review';
import { useUploadImage } from '@/hooks/image';
import { useDeleteFakeReview } from '@/hooks/fake-review';
import { message } from 'antd';

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [productReviewDialogOpen, setProductReviewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const { mutate: createReview, isPending: isCreatingReview } = useCreateFakeReview();
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutate: deleteReview, isPending: isDeletingReview } = useDeleteFakeReview();
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sendGet(`/admin/orders/${id}`);
      if (response.status) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Không thể tải thông tin đơn hàng');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipping':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDelayStatusText = (delayStatus: string) => {
    switch (delayStatus) {
      case 'NORMAL':
        return 'Bình thường';
      case 'DELAY_24H':
        return 'Trễ 24h';
      case 'DELAY_48H':
        return 'Trễ 48h';
      default:
        return delayStatus;
    }
  };

  const getDelayStatusColor = (delayStatus: string) => {
    switch (delayStatus) {
      case 'NORMAL':
        return 'success';
      case 'DELAY_24H':
        return 'warning';
      case 'DELAY_48H':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: string | number) => {
    return parseFloat(amount as string || '0').toLocaleString('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const InfoIcon = () => <IconInfoCircle size={20} />;
  const UserIcon = () => <IconUser size={20} />;
  const ShopIcon = () => <IconBuildingStore size={20} />;
  const DeliveryIcon = () => <IconTruckDelivery size={20} />;
  const HistoryIcon = () => <IconHistory size={20} />;
  const StagesIcon = () => <IconPackage size={20} />;

  const calculateDeliveryProgress = () => {
    if (!order || !order.stageDelivery) return 0;
    const currentStage = parseFloat(order.stageDelivery);
    return (currentStage / 12) * 100;
  };

  const handleOpenProductReviewDialog = (product: any) => {
    setSelectedProduct(product);
    setProductReviewDialogOpen(true);
  };

  const handleCloseProductReviewDialog = () => {
    setProductReviewDialogOpen(false);
    setRating(5);
    setContent("");
    setImages([]);
    setSelectedProduct(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      uploadImage({ file: file }, {
        onSuccess: (response) => {
          setImages((prev) => [...prev, response.data.url]);
        },
        onError: () => {
          message.error("Có lỗi xảy ra khi tải ảnh lên");
        }
      });
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitProductReview = () => {
    if (!order || !selectedProduct) return;
    
    createReview({
      userId: order.user?.id,
      orderId: order.id,
      productId: selectedProduct?.shopProduct?.product?.id,
      rating,
      content,
      images
    }, {
      onSuccess: () => {
        message.success("Tạo đánh giá sản phẩm thành công!");
        handleCloseProductReviewDialog();
        fetchOrderDetail();
      },
      onError: () => {
        message.error("Có lỗi xảy ra khi tạo đánh giá sản phẩm");
      }
    });
  };

  // Kiểm tra xem sản phẩm đã được đánh giá chưa
  const checkItemReviewed = (item: any) => {
    // Kiểm tra theo nhiều thuộc tính có thể có
    // Trả về true nếu sản phẩm đã có đánh giá
    return (
      item.hasReview === true || 
      item.isReviewed === true || 
      item.reviewed === true || 
      (item.review && Object.keys(item.review).length > 0)
    );
  };

  const handleDeleteReview = (itemId: string) => {
    if (!order || !order.id) return;
    deleteReview(itemId, {
      onSuccess: () => {
        message.success("Xóa đánh giá sản phẩm thành công!");
        fetchOrderDetail();
      },
      onError: (error) => {
        console.error("Error deleting review:", error);
        message.error("Có lỗi xảy ra khi xóa đánh giá sản phẩm");
      }
    });
  };

  return (
    <PageContainer title="Chi tiết đơn hàng" description="Xem chi tiết đơn hàng">
      <Box sx={{padding: '30px'}}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<IconArrowLeft size={18} />}
            onClick={() => router.push('/admin/orders')}
          >
            Quay lại danh sách
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : order ? (
          <Box sx={{display: 'flex', gap: 2, flexDirection: "column"}}>
            {/* Order Status Summary */}
            <Box >
              <Paper sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', md: 'center' }, gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Đơn hàng #{order.id.substring(0, 8)}...
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                    <Chip
                      label={getDelayStatusText(order.delayStatus)}
                      color={getDelayStatusColor(order.delayStatus)}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Đặt ngày: {formatDate(order.orderTime || order.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="textSecondary">Tổng giá trị</Typography>
                    <Typography variant="h6" color="primary.main">${formatCurrency(order.totalAmount)}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="textSecondary">Lợi nhuận</Typography>
                    <Typography variant="h6" color="success.main">${formatCurrency(order.totalProfit)}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            <Box  >
              <DashboardCard
                title="Thông tin đơn hàng"
                action={<InfoIcon />}
              >
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2, boxShadow: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    {/* Cột trái: Thông tin chính */}
                    <Box sx={{ flex: 1, minWidth: 0, mb: { xs: 2, md: 0 } }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconInfoCircle size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">ID:</Typography>
                          <Typography variant="body2">{order.id}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            icon={<IconCircleFilled size={14} color="#ffffff" />}
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                          <Chip
                            label={getDelayStatusText(order.delayStatus)}
                            color={getDelayStatusColor(order.delayStatus)}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconTruckDelivery size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Giai đoạn giao hàng:</Typography>
                          <Typography variant="body2">{order.stageDelivery || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconMapPin size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Địa chỉ giao hàng:</Typography>
                          <Typography variant="body2">{order.address || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconMailSpark size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Email:</Typography>
                          <Typography variant="body2">{order.email || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconPhone size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Số điện thoại:</Typography>
                          <Typography variant="body2">{order.phone || 'N/A'}</Typography>
                        </Stack>
                      </Stack>
                    </Box>
                    {/* Cột phải: Các mốc thời gian */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconInfoCircle size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Ngày đặt hàng:</Typography>
                          <Typography variant="body2">{formatDate(order.orderTime || order.createdAt)}</Typography>
                        </Stack>
                        {order.confirmedAt && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconInfoCircle size={18} color="#6C92FE" />
                            <Typography variant="body2" fontWeight="bold">Ngày xác nhận:</Typography>
                            <Typography variant="body2">{formatDate(order.confirmedAt)}</Typography>
                          </Stack>
                        )}
                        {order.deliveredAt && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconTruckDelivery size={18} color="#6C92FE" />
                            <Typography variant="body2" fontWeight="bold">Ngày giao hàng:</Typography>
                            <Typography variant="body2">{formatDate(order.deliveredAt)}</Typography>
                          </Stack>
                        )}
                        {order.cancelledAt && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <IconInfoCircle size={18} color="#6C92FE" />
                            <Typography variant="body2" fontWeight="bold">Ngày hủy:</Typography>
                            <Typography variant="body2">{formatDate(order.cancelledAt)}</Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              </DashboardCard>
            </Box>

            <Box  >
              <Box >
                <Box sx={{marginBottom: 2}}>
                  <DashboardCard
                    title="Thông tin khách hàng"
                    action={<UserIcon />}
                  >
                    <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2, boxShadow: 1 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconUser size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Họ tên:</Typography>
                          <Typography variant="body2">{order.user?.fullName || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconMailSpark size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Email:</Typography>
                          <Typography variant="body2">{order.email || order.user?.email || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconPhone size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Số điện thoại:</Typography>
                          <Typography variant="body2">{order.phone || order.user?.phone || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconInfoCircle size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Mã khách hàng:</Typography>
                          <Typography variant="body2">{order.user?.id || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconMapPin size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Địa chỉ:</Typography>
                          <Typography variant="body2">{order.user?.address || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconInfoCircle size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Mã bưu điện:</Typography>
                          <Typography variant="body2">{order.user?.postalCode || 'N/A'}</Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </DashboardCard>
                </Box>
                <Box >
                  <DashboardCard
                    title="Thông tin cửa hàng"
                    action={<ShopIcon />}
                  >
                    <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2, boxShadow: 1 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconBuildingStore size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Tên cửa hàng:</Typography>
                          <Typography variant="body2">{order.shop?.shopName || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconMailSpark size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Email:</Typography>
                          <Typography variant="body2">{order.shop?.email || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconPhone size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Số điện thoại:</Typography>
                          <Typography variant="body2">{order.shop?.phone || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconMapPin size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Địa chỉ:</Typography>
                          <Typography variant="body2">{order.shop?.shopAddress || order.shop?.address || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconInfoCircle size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Trạng thái cửa hàng:</Typography>
                          <Typography variant="body2">
                            <Chip
                              label={order.shop?.shopStatus || 'N/A'}
                              color={order.shop?.shopStatus === 'ACTIVE' ? 'success' : 'default'}
                              size="small"
                            />
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconStar size={18} color="#6C92FE" />
                          <Typography variant="body2" fontWeight="bold">Đánh giá:</Typography>
                          <Typography variant="body2">{order.shop?.stars || 0} sao ({order.shop?.reputationPoints || 0} điểm)</Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </DashboardCard>
                </Box>
              </Box>
            </Box>

            {/* Delivery Stages - Show only for SHIPPING orders */}
            {order.status === 'SHIPPING' && (
              <Box >
                <DashboardCard
                  title="Tiến trình giao hàng"
                  action={<StagesIcon />}
                >
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Tiến độ giao hàng
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={calculateDeliveryProgress()}
                        sx={{ height: 10, borderRadius: 5, mb: 1 }}
                      />
                      <Typography variant="caption" align="right" display="block">
                        Giai đoạn hiện tại: {order.stageDelivery}
                      </Typography>
                    </Box>

                    <Typography variant="subtitle1" gutterBottom>
                      Các giai đoạn giao hàng
                    </Typography>

                    <Box >
                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">1</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  Kiện hàng của bạn đang được gửi đến trung tâm FedEx và đang trong quá trình xử lý giao hàng
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">2</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  Kiện hàng của bạn đang trên đường đến địch
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">3</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  Cơ quan hải quan tại quốc gia xuất xứ đã thông quan kiện hàng quốc tế của bạn
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">4</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  Kiện hàng của bạn đã rời khỏi quốc gia bạn đầu
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">5</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  FedEx đã nhận hàng của bạn sau thời gian hạn chót
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">6</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  Kiện hàng của bạn đang được chuyển đến trung tâm FedEx để phân loại
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">7</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  Kiện hàng của bạn đã được gửi đi từ trung tâm FedEx
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">8</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  Kiện hàng quốc tế của bạn đã được hải quan tại quốc gia đích thông quan
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">9</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  FedEx đã xác nhận gói hàng của bạn bằng cách quét nhận
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">10</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  Kiện hàng của bạn đang được vận chuyển bằng xe FedEx và sẽ được giao trong ngày hôm nay
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">11</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  Kiện hàng của bạn đang ở cơ sở địa phương và sẵn sàng để giao hàng
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                      <Box >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    backgroundColor: 'grey.200',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">12</Typography>
                                </Box>
                                <Typography variant="subtitle2">
                                  Kiện hàng của bạn đã đến cơ sở FedEx tại khu vực của người nhận
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    </Box>
                  </Box>
                </DashboardCard>
              </Box>
            )}

            {/* Order Status History */}
            <Box >
              <DashboardCard
                title="Lịch sử trạng thái đơn hàng"
                action={<HistoryIcon />}
              >
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  <Box sx={{ p: 2 }}>
                    {order.statusHistory.map((status: any, index: number) => (
                      <Box key={status.id} sx={{ mb: index !== order.statusHistory.length - 1 ? 2 : 0 }}>
                        <Card variant="outlined" sx={{ mb: 1 }}>
                          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <IconCircleFilled
                                size={16}
                                style={{
                                  marginTop: 4,
                                  marginRight: 8,
                                  color: index === 0 ? '#4caf50' :
                                    index === order.statusHistory.length - 1 ? '#1976d2' : '#03a9f4'
                                }}
                              />
                              <Box>
                                <Typography variant="subtitle2" component="span">
                                  Giai đoạn: {status.stageDelivery}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(status.time)}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {status.description}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                        {index !== order.statusHistory.length - 1 && (
                          <Box sx={{ display: 'flex', ml: 0.7, pl: 0.1, height: 20 }}>
                            <Divider orientation="vertical" sx={{ height: '100%' }} />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1">Chưa có lịch sử trạng thái</Typography>
                  </Box>
                )}
              </DashboardCard>
            </Box>

            <Box >
              <DashboardCard
                title="Chi tiết đơn hàng"
                action={<DeliveryIcon />}
              >
                <Box>
                  {order.items && order.items.length > 0 ? (
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', flexShrink: 0 }}>Sản phẩm</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', flexShrink: 0 }} align="center">Số lượng</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', flexShrink: 0 }} align="right">Đơn giá</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', flexShrink: 0 }} align="right">Thành tiền</TableCell>
                            {order.status === 'DELIVERED' && (
                              <TableCell sx={{ fontWeight: 'bold' }} align="center">Thao tác</TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {order.items.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                  {item.shopProduct?.product?.imageUrls && item.shopProduct.product.imageUrls.length > 0 && (
                                    <Box
                                      component="img"
                                      src={item.shopProduct.product.imageUrls[0]}
                                      alt={item.shopProduct?.product?.name}
                                      sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                  )}
                                  <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                      {item.shopProduct?.product?.name || item.shopProduct?.name || `Sản phẩm #${item.shopProductId.substring(0, 8)}...`}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                      ID: {item.shopProductId}
                                    </Typography>
                                    {item.shopProduct?.product?.category && (
                                      <Typography variant="caption" color="textSecondary" display="block">
                                        Danh mục: {item.shopProduct.product.category.name}
                                      </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                      {item.shopProduct?.product?.isHot && (
                                        <Chip label="Hot" size="small" color="error" variant="outlined" sx={{ height: 20 }} />
                                      )}
                                      {item.shopProduct?.product?.isNew && (
                                        <Chip label="New" size="small" color="info" variant="outlined" sx={{ height: 20 }} />
                                      )}
                                      {item.shopProduct?.product?.isFeatured && (
                                        <Chip label="Featured" size="small" color="success" variant="outlined" sx={{ height: 20 }} />
                                      )}
                                      {item.shopProduct?.product?.averageRating && (
                                        <Chip
                                          label={`${item.shopProduct.product.averageRating} ★`}
                                          size="small"
                                          color="warning"
                                          variant="outlined"
                                          sx={{ height: 20 }}
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                                <Box sx={{ mt: 1 }}>
                                  <Tooltip title={
                                    <div dangerouslySetInnerHTML={{
                                      __html: item.shopProduct?.product?.description || 'Không có mô tả'
                                    }} />
                                  }>
                                    <Button size="small" variant="text" sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}>
                                      Xem mô tả
                                    </Button>
                                  </Tooltip>
                                  <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                                    Tồn kho: {item.shopProduct?.product?.stock || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                                    Đã bán: {item.shopProduct?.soldCount || 0}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={item.quantity}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="right">
                                ${formatCurrency(item.price)}
                              </TableCell>
                              <TableCell align="right">
                                <Typography>
                                  ${formatCurrency(item.totalAmount)}
                                </Typography>
                              </TableCell>
                              {order.status === 'DELIVERED' && (
                                <TableCell align="center">
                                  <Box display="flex" gap={1} justifyContent="center">
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      size="small"
                                      onClick={() => handleOpenProductReviewDialog(item)}
                                      disabled={checkItemReviewed(item)}
                                      sx={{
                                        textTransform: 'none',
                                        backgroundColor: checkItemReviewed(item) ? "rgba(25, 118, 210, 0.12)" : "white",
                                        flexShrink: 0
                                      }}
                                    >
                                      {checkItemReviewed(item) ? 'Đã đánh giá' : 'Đánh giá sản phẩm'}
                                    </Button>
                                    {checkItemReviewed(item) && (
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => handleDeleteReview(item.id)}
                                        disabled={isDeletingReview}
                                        sx={{ textTransform: 'none' }}
                                      >
                                        {isDeletingReview ? 'Đang xóa...' : 'Xóa đánh giá'}
                                      </Button>
                                    )}
                                  </Box>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={order.status === 'DELIVERED' ? 4 : 3} align="right">
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                Tổng cộng:
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                ${formatCurrency(order.totalAmount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={order.status === 'DELIVERED' ? 4 : 3} align="right">
                              <Typography variant="body2">
                                Lợi nhuận:
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                                ${formatCurrency(order.totalProfit)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1">Không có sản phẩm nào</Typography>
                    </Box>
                  )}
                </Box>
              </DashboardCard>
            </Box>
          </Box>
        ) : (
          <DashboardCard>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">Không tìm thấy đơn hàng</Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => router.push('/admin/orders')}
              >
                Quay lại danh sách đơn hàng
              </Button>
            </Box>
          </DashboardCard>
        )}
      </Box>

      {/* Dialog đánh giá sản phẩm */}
      <Dialog
        open={productReviewDialogOpen}
        onClose={handleCloseProductReviewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              <Box mb={2} display="flex" alignItems="center" gap={2} className="bg-[#F5F5F5] !rounded-[4px] border p-2 overflow-hidden">
                <img
                  draggable={false}
                  className="rounded-[4px]"
                  src={selectedProduct?.shopProduct?.product?.imageUrls?.[0] || "/images/white-image.png"}
                  alt={selectedProduct.shopProduct?.product?.name || 'Sản phẩm'}
                  style={{ width: 80, height: 80, objectFit: 'cover' }}
                />
                <Box>
                  <Typography variant="h6">{selectedProduct.shopProduct?.product?.name || 'Sản phẩm'}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Số lượng: {selectedProduct.quantity}
                  </Typography>
                </Box>
              </Box>
              <Box mb={2}>
                <Typography variant="body1" gutterBottom>
                  Đánh giá của bạn
                </Typography>
                <Rating
                  value={rating}
                  onChange={(_, value) => setRating(value || 5)}
                  size="large"
                />
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Nội dung đánh giá"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </Box>
              <Box mb={2}>
                <InputLabel className="mb-2">Hình ảnh</InputLabel>
                <FormControl fullWidth variant="outlined">
                  <OutlinedInput
                    type="file"
                    inputProps={{ multiple: true, accept: 'image/*' }}
                    onChange={handleImageUpload}
                    startAdornment={
                      <InputAdornment position="start">
                        <IconPhoto />
                      </InputAdornment>
                    }
                  />
                </FormControl>
                {isUploading && <CircularProgress size={24} className="mt-4" />}
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {images.map((img, index) => (
                    <Box key={index} sx={{ position: 'relative', width: 100, height: 100 }}>
                      <img
                        draggable={false}
                        key={index}
                        src={img}
                        alt={`Review image ${index}`}
                        style={{ width: 100, height: 100, objectFit: 'contain' }}
                        className="rounded-[4px] border"
                      />
                      <IconButton
                        size="small"
                        className="!bg-red-100"
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          background: 'rgba(255,255,255,0.7)'
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <IconX size={16} color="red" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
          <Box className="flex justify-end gap-4 mt-6">
            <Button
              variant="outlined"
              onClick={handleCloseProductReviewDialog}>Hủy</Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: !content ? "#1976d295 !important" : "#5D87FF !important",
                minWidth: '80px',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                },
                textTransform: 'none'
              }}
              disabled={!content || isCreatingReview}
              endIcon={<IconBrandTelegram size={16} />}
              onClick={handleSubmitProductReview}>
              {isCreatingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default OrderDetailPage; 