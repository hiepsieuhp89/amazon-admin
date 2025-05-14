"use client"
import DataTable from "@/components/DataTable"
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TableCell,
  TableRow,
  Typography,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Tooltip,
} from "@mui/material"
import { IconEye, IconChevronDown, IconChevronUp, IconPhoto, IconMoodSadDizzy, IconMessageUser, IconBrandTelegram, IconSearch, IconX, IconPlus } from "@tabler/icons-react"
import { message } from "antd"
import React, { useState } from "react"
import { useGetAllUsers } from "@/hooks/user"
import { useGetUserOrders, useCreateFakeReview, useDeleteFakeReview } from "@/hooks/fake-review"
import { CircularProgress } from "@mui/material"
import { useUploadImage } from "@/hooks/image"

function FakeReviewsPage() {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false)
  const [orderStatus, setOrderStatus] = useState<string>('DELIVERED')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [productReviewDialogOpen, setProductReviewDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: userData, isLoading, error } = useGetAllUsers({
    page,
    take: rowsPerPage,
    order: "DESC",
    role: "user",
    search: searchTerm
  })

  const { data: orders, isLoading: isOrdersLoading, refetch } = useGetUserOrders(selectedUserId || '', orderStatus)
  const { mutate: createReview, isPending: isCreatingReview } = useCreateFakeReview()
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage()
  const { mutate: deleteReview, isPending: isDeletingReview } = useDeleteFakeReview()
  const filteredUsers = userData?.data?.data || []
  const pagination = userData?.data?.meta || {
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false
  }

  const columns = [
    { key: 'stt', label: 'STT' },
    { key: 'fullName', label: 'Họ tên' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Số điện thoại' },
    { key: 'address', label: 'Địa chỉ' },
    { key: 'actions', label: 'Thao tác' },
  ]

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
      <TableCell>{user.fullName}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.phone}</TableCell>
      <TableCell>{[user.address, user.ward, user.district, user.city].filter(Boolean).join(', ')}</TableCell>
      <TableCell>
        <Box className="flex items-center justify-center gap-4">
          <Tooltip title="Chi tiết đơn hàng">
            <IconButton
              color="primary"
              onClick={() => {
                setSelectedUserId(user.id)
                setOrdersDialogOpen(true)
              }}
              sx={{ mr: 1 }}
            >
              <IconEye size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  )

  const handleOrderStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderStatus(event.target.value)
    refetch()
  }

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  const handleOpenProductReviewDialog = (product: any) => {
    setSelectedProduct(product)
    setProductReviewDialogOpen(true)
  }

  const handleCloseProductReviewDialog = () => {
    setProductReviewDialogOpen(false)
    setRating(5)
    setContent("")
    setImages([])
    setSelectedProduct(null)
  }

  const renderOrderItems = (items: any[]) => {
    return (
      <Box sx={{ pt: 2 }}>
        {items.map((item, index) => (
          <Box
            key={index} display="flex" alignItems="start" gap={2} mb={2}>
            <img
              className="rounded-[4px]"
              src={item?.shopProduct?.product?.imageUrls[0] || "/images/white-image.png"}
              alt={item.productName}
              style={{ width: 80, height: 80, objectFit: 'cover' }}
            />
            <Box>
              <Typography
                mb={1}
                fontSize="14px"
                variant="body2">{item.productName}</Typography>
              <Typography variant="body2" color="textSecondary">
                Số lượng: {item.quantity}
              </Typography>
            </Box>
            <IconButton
              sx={{
                width: 32,
                height: 32,
                border: '1px solid #1976d2',
                background: '#fff',
                ml: 1
              }}
              onClick={() => handleOpenProductReviewDialog(item)}
            >
              <IconPlus size={20} color="#1976d2" />
            </IconButton>
          </Box>
        ))}
      </Box>
    )
  }

  const handleDeleteReview = (orderId: string) => {
    deleteReview(orderId, {
      onSuccess: () => {
        message.success("Xóa review thành công!")
        refetch()
      },
      onError: () => {
        message.error("Có lỗi xảy ra khi xóa review")
      }
    })
  }

  const orderStatusMap: { [key: string]: string } = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
  };

  const renderOrdersDialogContent = () => {
    if (!selectedUserId) return null

    return (
      <Box>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            fontSize="14px"
            variant="body2" color="textSecondary">
            Lọc đơn hàng theo trạng thái
          </Typography>

          <Box>
            <select
              value={orderStatus}
              onChange={handleOrderStatusChange}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #e0e0e0',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              {Object.entries(orderStatusMap).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </Box>
        </Box>

        {isOrdersLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : !orders?.data?.length ? (
          <Typography>Không có đơn hàng nào với trạng thái &quot;{orderStatusMap[orderStatus]}&quot;</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table className="border">
              <TableHead className="bg-[#F5F5F5]">
                <TableRow>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Ngày đặt hàng</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.data.map((order: any) => (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>${order.totalAmount}</TableCell>
                      <TableCell>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {orderStatus === 'DELIVERED' && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => toggleExpandOrder(order.id)}
                              disabled={order.hasReview}
                              endIcon={expandedOrderId === order.id ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                              sx={{
                                backgroundColor: order.hasReview ? "#1976d295 !important" : "#5D87FF !important",
                                color: 'white !important',
                                minWidth: '80px',
                                boxShadow: 'none',
                                '&:hover': {
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                },
                                textTransform: "none"
                              }}
                            >
                              {order.hasReview ? 'Đã đánh giá' : 'Đánh giá sản phẩm'}
                            </Button>
                          )}
                          {order.hasReview && (
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteReview(order.id)}
                              disabled={isDeletingReview}
                            >
                              {isDeletingReview ? 'Đang xóa...' : 'Xóa review'}
                            </Button>
                          )}

                        </Box>
                      </TableCell>
                    </TableRow>
                    {expandedOrderId === order.id && (
                      <TableRow className="bg-[#F5F5F5]">
                        <TableCell colSpan={4}>
                          {renderOrderItems(order.items)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    )
  }

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false)
    setRating(5)
    setContent("")
    setImages([])
    setOrdersDialogOpen(true)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const formData = new FormData()
      formData.append("file", file)

      uploadImage({ file: file }, {
        onSuccess: (response) => {
          setImages((prev) => [...prev, response.data.url])
        },
        onError: () => {
          message.error("Có lỗi xảy ra khi tải ảnh lên")
        }
      })
    })
  }

  const handleSubmitProductReview = () => {
    createReview({
      userId: selectedUserId,
      orderId: selectedProduct?.orderId,
      productId: selectedProduct?.shopProduct?.productId,
      rating,
      content,
      images
    }, {
      onSuccess: () => {
        message.success("Tạo đánh giá sản phẩm thành công!")
        handleCloseProductReviewDialog()
        refetch()
      },
      onError: () => {
        message.error("Có lỗi xảy ra khi tạo đánh giá sản phẩm")
      }
    })
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerateImage = () => {
    const width = 100; // Default width
    const height = 100; // Default height
    const randomId = Math.floor(Math.random() * 10000);
    const imageUrl = `https://picsum.photos/${width}/${height}?random=${randomId}`;
    setImages((prev) => [...prev, imageUrl]);
  };

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
        </Box>
        <DataTable
          columns={columns}
          data={filteredUsers}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage)
            setPage(1)
          }}
          renderRow={renderRow}
          emptyMessage="Không tìm thấy người dùng nào"
        />
      </Box>

      <Dialog
        open={ordersDialogOpen}
        onClose={() => setOrdersDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Danh sách đơn hàng của người dùng</DialogTitle>
        <DialogContent>
          {renderOrdersDialogContent()}
          <Box className="flex justify-end mt-6">
            <Button
              variant="outlined"
              onClick={() => setOrdersDialogOpen(false)}>Đóng</Button>
          </Box>
        </DialogContent>
      </Dialog>

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
                  src={selectedProduct?.shopProduct?.product?.imageUrls[0] || "/images/white-image.png"}
                  alt={selectedProduct.productName}
                  style={{ width: 80, height: 80, objectFit: 'cover' }}
                />
                <Box>
                  <Typography variant="h6">{selectedProduct.productName}</Typography>
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
              <Box mb={2} display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<IconPhoto size={16} />}
                >
                  Chọn Image
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleGenerateImage}
                  startIcon={<IconPlus size={16} />}
                >
                  Generate Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  accept='image/*'
                  onChange={handleImageUpload}
                />
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
              endIcon={<IconBrandTelegram size={16} />}
              onClick={handleSubmitProductReview}>Gửi đánh giá</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FakeReviewsPage 