import {
  Box,
  Dialog,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  InputAdornment,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Paper,
  Avatar,
  Chip,
  Tooltip,
  alpha,
  Tabs,
  Tab,
  Menu,
  MenuItem,
} from "@mui/material";
import { useGetMessages, useSendMessage, useMarkAsRead, useDeleteMessage, useGetShopUsers } from "@/hooks/admin-chat";
import { useState, useEffect, useRef } from "react";
import { 
  IconSearch, 
  IconCheck, 
  IconTrash, 
  IconPaperclip, 
  IconShoppingCart, 
  IconX, 
  IconPhoto, 
  IconExternalLink,
  IconSend,
  IconUserFilled,
  IconBubbleTextFilled,
  IconDotsVertical,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { useGetAllShopProducts, useGetShopProductById } from "@/hooks/shop-products";
import { useGetProductById } from "@/hooks/product";
import { useUploadImage } from "@/hooks/image";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ShopProduct {
  id: string;
  productId?: string;
  product?: {
    name?: string;
    price?: number | string;
    imageUrls?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  allUsers: any[];
  shop: any;
}

// Message component to handle individual message rendering and product data fetching
const MessageItem = ({ msg, handleMarkAsRead, handleDeleteMessage }: { 
  msg: any;
  handleMarkAsRead: (id: string) => void;
  handleDeleteMessage: (id: string) => void;
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isUserMessage = msg.senderRole === "user";
  const senderInfo = isUserMessage
    ? msg.user?.fullName || "Người dùng"
    : msg.shop?.shopName || "Shop";

  const productId = msg.shopProduct?.productId;
  const productQueryEnabled = !!productId && !msg.shopProduct?.product;
  const { data: productData, isLoading: isLoadingProduct } = useGetProductById(
    productQueryEnabled ? productId : ""
  );

  const handleProductClick = () => {
    if (productId) {
      router.push(`/admin/products/${productId}`);
    }
  };

  const getFirstImage = (imageUrls: string[] | undefined): string => {
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return 'https://placehold.co/400x400/png';
    }
    return imageUrls[0].startsWith('http') ? imageUrls[0] : `http://localhost:3000${imageUrls[0]}`;
  };

  return (
    <Box
      mb={2}
      className={isUserMessage ? "ml-auto" : ""}
      sx={{ 
        maxWidth: msg.message?.length > 50 ? "70%" : "fit-content",
        marginLeft: isUserMessage ? "auto" : "0",
        position: "relative",
      }}
    >
      <Box
        sx={{
          bgcolor: isUserMessage ? alpha('#1976d2', 0.08) : alpha('#616161', 0.05),
          p: 1.5,
          borderRadius: 2,
          position: 'relative',
          '&:hover .message-actions': {
            opacity: 1,
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography 
            variant="caption" 
            color={isUserMessage ? "primary" : "text.secondary"} 
            fontWeight={500}
          >
            {senderInfo}
          </Typography>
          <IconButton
            size="small"
            sx={{ 
              color: isUserMessage ? 'primary.main' : 'text.secondary',
              p: 0.5,
              opacity: 0,
              transition: 'opacity 0.2s',
              '&:hover': { bgcolor: alpha(isUserMessage ? '#1976d2' : '#616161', 0.1) }
            }}
            className="message-actions"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <IconDotsVertical size={14} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              className: "!rounded-[6px] shadow-xl",
            }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: isUserMessage ? 'left' : 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: isUserMessage ? 'right' : 'left',
            }}
          >
            <MenuItem onClick={() => {
              handleMarkAsRead(msg.id);
              setAnchorEl(null);
            }}>
              <Box className="flex items-center gap-2">
                <IconCheck size={16} className="text-green-400" />
                <span>Đánh dấu đã đọc</span>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => {
              handleDeleteMessage(msg.id);
              setAnchorEl(null);
            }}>
              <Box className="flex items-center gap-2">
                <IconTrash size={16} className="text-red-400" />
                <span>Xóa tin nhắn</span>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
        
        {msg.message && (
          <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            {msg.message}
          </Typography>
        )}
        
        {/* Display attached images */}
        {msg.imageUrls && msg.imageUrls.length > 0 && (
          <Box mt={1.5} display="flex" gap={1} flexWrap="wrap">
            {msg.imageUrls.map((url: string, idx: number) => (
              <Box 
                key={idx} 
                sx={{ 
                  position: 'relative',
                  width: msg.imageUrls.length > 1 ? '120px' : '200px',
                  height: msg.imageUrls.length > 1 ? '120px' : '200px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }}
              >
                <Image 
                  src={url.startsWith('http') ? url : `http://localhost:3000${url}`}
                  alt="Attached image" 
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Box>
        )}
        
        {/* Display attached product */}
        {msg.shopProductId && (
          <Box 
            mt={1.5} 
            p={1.5} 
            sx={{
              bgcolor: alpha(isUserMessage ? '#1976d2' : '#616161', 0.05),
              borderRadius: 1.5,
              display: "flex",
              gap: 2,
              border: `1px solid ${alpha(isUserMessage ? '#1976d2' : '#616161', 0.1)}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
              }
            }}
            onClick={handleProductClick}
          >
            {productQueryEnabled && isLoadingProduct ? (
              <Box sx={{ display: "flex", width: "100%", justifyContent: "center", p: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : (
              <>
                <Box sx={{ 
                  width: '60px', 
                  height: '60px', 
                  position: 'relative', 
                  flexShrink: 0, 
                  bgcolor: "#f0f0f0", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  borderRadius: '6px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {productData?.data?.imageUrls ? (
                    <Image
                      src={getFirstImage(productData.data.imageUrls) || "/placeholder.svg"}
                      alt={productData.data.name || "Product image"}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <IconShoppingCart size={24} color="#999" />
                  )}
                </Box>
                <Box flex={1}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight={500}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: isUserMessage ? '#1976d2' : '#424242',
                      mb: 0.5
                    }}
                  >
                    {productData?.data?.name || "Sản phẩm đính kèm"}
                    <IconExternalLink size={14} style={{ marginLeft: '4px' }} />
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={isUserMessage ? "primary.dark" : "text.secondary"}
                    fontWeight={500}
                  >
                    {productData?.data?.price ? `$${productData.data.price}` : "Xem chi tiết sản phẩm"}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        )}
        
        <Typography 
          variant="caption" 
          color="text.secondary" 
          display="block" 
          mt={1}
          textAlign="right"
          fontSize="10px"
        >
          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Typography>
      </Box>
    </Box>
  );
};

export default function ChatDialog({
  open,
  onClose,
  userId: selectedShopId,
  allUsers,
  shop,
}: ChatDialogProps) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const previousMessagesCount = useRef(0);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [currentRelationId, setCurrentRelationId] = useState<string | null>(null);

  const { data: messages, isLoading, refetch } = useGetMessages(
    selectedUserId || "",
    selectedShopId || ""
  );
  const {data: shopUsers} = useGetShopUsers(selectedShopId || "")
  
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const deleteMessageMutation = useDeleteMessage();
  const uploadImageMutation = useUploadImage();

  // Fetch products if product selector is shown
  const { data: productsData, isLoading: isLoadingProducts } = useGetAllShopProducts({
    shopId: selectedShopId || "",
    page: 1,
    take: 1000,
    search: searchProduct,
  });

  // Add fetch for product details when needed
  const shopProductDetailsEnabled = !!selectedProduct?.id && !selectedProduct?.product;
  const { data: productDetailsData } = useGetShopProductById(
    shopProductDetailsEnabled ? selectedProduct?.id : ""
  );

  // Fetch product details for the selected product
  const productDetailsEnabled = !!selectedProduct?.productId && !selectedProduct?.product?.name;
  const { data: selectedProductData } = useGetProductById(
    (productDetailsEnabled && selectedProduct?.productId ? selectedProduct.productId : "") as string
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update product data when details are fetched
  useEffect(() => {
    if (productDetailsData?.data && selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        product: productDetailsData.data?.product
      });
    }
  }, [productDetailsData, selectedProduct]);

  // Update product data when product details are fetched
  useEffect(() => {
    if (selectedProductData?.data && selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        product: {
          name: selectedProductData.data.name,
          price: selectedProductData.data.price,
          imageUrls: selectedProductData.data.imageUrls
        }
      });
    }
  }, [selectedProductData, selectedProduct]);

  // Thêm interval để fetch tin nhắn mới
  useEffect(() => {
    if (!open || !selectedUserId || !selectedShopId) return;

    const interval = setInterval(() => {
      refetch();
    }, 20000); // 20 giây

    return () => clearInterval(interval);
  }, [open, selectedUserId, selectedShopId, refetch]);

  // Kiểm tra tin nhắn mới và hiển thị thông báo
  useEffect(() => {
    if (!messages?.data || isLoading) return;

    const currentMessagesCount = messages.data.length;
    if (previousMessagesCount.current > 0 && 
        currentMessagesCount > previousMessagesCount.current) {
      const newMessagesCount = currentMessagesCount - previousMessagesCount.current;
      toast.info(`Bạn có ${newMessagesCount} tin nhắn mới`);
    }

    previousMessagesCount.current = currentMessagesCount;
  }, [messages, isLoading]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newURLs = newFiles.map(file => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newURLs]);
    }
  };

  // Handle image remove
  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Handle product selection
  const handleSelectProduct = (product: ShopProduct) => {
    setSelectedProduct(product);
    setShowProductSelector(false);
  };

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Reset selectedUserId when switching tabs
    setSelectedUserId(null);
  };

  // Filter users based on search term and current tab
  const filteredUsers = (tabValue === 0 ? allUsers : shopUsers?.data?.data || []).filter((user: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.invitationCode?.toLowerCase().includes(searchLower) ||
      user.referralCode?.toLowerCase().includes(searchLower) ||
      [user.address, user.ward, user.district, user.city]
        .filter(Boolean)
        .join(", ")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const handleSendMessage = async () => {
    if (!selectedUserId || !selectedShopId || (!message && images.length === 0 && !selectedProduct)) return;

    try {
      // First upload all images if any
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        toast.info("Đang tải ảnh lên...", { autoClose: false, toastId: "upload-images" });
        
        // Upload all images in parallel
        const uploadPromises = images.map(file => 
          uploadImageMutation.mutateAsync({
            file,
            isPublic: true,
            description: `Chat image from ${selectedUserId} to ${selectedShopId}`
          })
        );
        
        const results = await Promise.all(uploadPromises);
        uploadedImageUrls = results.map(result => result.data.url);
        
        toast.update("upload-images", { 
          render: "Tải ảnh thành công!",
          autoClose: 2000
        });
      }

      await sendMessageMutation.mutateAsync({
        userId: selectedUserId,
        shopId: selectedShopId,
        message,
        imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        shopProductId: selectedProduct?.id || undefined,
      });
      
      setMessage("");
      setImages([]);
      setImageUrls([]);
      setSelectedProduct(null);
      toast.success("Đã gửi tin nhắn thành công");
      
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markAsReadMutation.mutateAsync(messageId);
      refetch();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessageMutation.mutateAsync(messageId);
      refetch();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const getFirstImage = (imageUrls: string[] | undefined): string => {
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return 'https://placehold.co/400x400/png';
    }
    return imageUrls[0].startsWith('http') ? imageUrls[0] : `http://localhost:3000${imageUrls[0]}`;
  };

  const handleProductClick = () => {
    if (selectedProduct?.productId) {
      router.push(`/admin/products/${selectedProduct.productId}`);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', height: '650px' }}>
        <Box display="flex" width="100%" height="100%">
          {/* Sidebar */}
          <Box
            width="300px"
            borderRight="1px solid #e0e0e0"
            display="flex"
            flexDirection="column"
            sx={{ bgcolor: '#f9fafb' }}
          >
            {/* Tabs */}
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ 
                borderBottom: '1px solid #e0e0e0',
                minHeight: '48px',
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#616161',
                  '&.Mui-selected': {
                    color: '#1976d2',
                  }
                }
              }}
            >
              <Tab label="Tất cả" />
              <Tab label="Đã nhắn" />
            </Tabs>
            
            <Box 
              p={2} 
              borderBottom="1px solid #e0e0e0" 
              sx={{
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                gap: 1,  
                height: "80px"
              }}
            >
              <IconUserFilled size={22} color="#1976d2"/>
              <TextField
                size="small"
                fullWidth
                placeholder="Tìm theo email, SĐT, mã, địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} color="#666" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                    },
                  }
                }}
              />
            </Box>
            <Box flex={1} overflow="auto" sx={{ scrollbarWidth: 'thin' }}>
              {filteredUsers.length === 0 ? (
                <Box p={3} textAlign="center">
                  <Typography color="text.secondary">Không tìm thấy người dùng</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {filteredUsers.map((user: any) => (
                    <ListItem key={user.id} disablePadding>
                      <ListItemButton
                        selected={selectedUserId === user.id}
                        onClick={() => {
                          setSelectedUserId(user.id);
                        }}
                        sx={{
                          py: 1.5,
                          borderLeft: selectedUserId === user.id ? '3px solid #1976d2' : '3px solid transparent',
                          bgcolor: selectedUserId === user.id ? alpha('#1976d2', 0.05) : 'transparent',
                          '&:hover': {
                            bgcolor: alpha('#1976d2', 0.05),
                          }
                        }}
                      >
                        <Box display="flex" width="100%" gap={1.5}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: selectedUserId === user.id ? '#1976d2' : '#9e9e9e',
                              fontSize: '1rem'
                            }}
                          >
                            {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="subtitle2" 
                                fontWeight={selectedUserId === user.id ? 600 : 500}
                                noWrap
                              >
                                {user.fullName || user.username || 'Người dùng'}
                              </Typography>
                            }
                            secondary={
                              <Box component="div" sx={{ mt: 0.5 }}>
                                {user.email && (
                                  <Typography 
                                    variant="caption" 
                                    component="div" 
                                    noWrap
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                  >
                                    {user.email}
                                  </Typography>
                                )}
                                {user.phone && (
                                  <Typography variant="caption" component="div" noWrap>
                                    {user.phone}
                                  </Typography>
                                )}
                                {/* Show last message if in Đã nhắn tab and it exists */}
                                {tabValue === 1 && user.lastMessage && (
                                  <Typography 
                                    variant="caption" 
                                    component="div" 
                                    noWrap
                                    sx={{ 
                                      color: user.lastMessage.isRead ? 'text.secondary' : 'primary.main',
                                      fontWeight: user.lastMessage.isRead ? 400 : 600,
                                      mt: 0.5
                                    }}
                                  >
                                    {user.lastMessage.message || (user.lastMessage.imageUrls ? "Đã gửi ảnh" : "Đã gửi sản phẩm")}
                                  </Typography>
                                )}
                                {[user.address, user.ward, user.district, user.city].filter(Boolean).length > 0 && (
                                  <Typography 
                                    variant="caption" 
                                    component="div" 
                                    sx={{ 
                                      mt: 0.5,
                                      color: 'text.secondary',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                    }}
                                  >
                                    {[user.address, user.ward, user.district, user.city]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>

          {/* Chat Area */}
          <Box flex={1} display="flex" flexDirection="column" bgcolor="white">
            {/* Chat Header */}
            <Box 
              p={2} 
              borderBottom="1px solid #e0e0e0"
              sx={{
                bgcolor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: "80px"
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <IconBubbleTextFilled size={22} color="#1976d2" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedUserId
                      ? allUsers.find((u) => u.id === selectedUserId)?.fullName ||
                        "Người dùng"
                      : ""}
                  </Typography>
                  {selectedUserId && (
                    <Typography variant="caption" color="text.secondary">
                      Đang chat với {shop?.shopName || "shop"}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Chip 
                label={shop?.shopName || "Shop"} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Box>

            {/* Messages */}
            <Box 
              flex={1} 
              p={2.5} 
              overflow="auto" 
              sx={{ 
                bgcolor: '#f9fafb',
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                scrollbarWidth: 'thin'
              }}
            >
              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress size={30} />
                </Box>
              ) : !selectedUserId ? (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  justifyContent="center" 
                  alignItems="center" 
                  height="100%"
                  gap={2}
                >
                  <IconBubbleTextFilled size={50} color="#ccc" />
                  <Typography color="text.secondary" variant="h6">
                    Chọn người dùng để bắt đầu cuộc trò chuyện
                  </Typography>
                </Box>
              ) : messages?.data?.length === 0 ? (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  justifyContent="center" 
                  alignItems="center" 
                  height="100%"
                  gap={2}
                >
                  <IconBubbleTextFilled size={50} color="#ccc" />
                  <Typography color="text.secondary" variant="h6">
                    Chưa có tin nhắn nào
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Hãy bắt đầu cuộc trò chuyện
                  </Typography>
                </Box>
              ) : (
                <>
                  {messages?.data?.map((msg: any) => (
                    <MessageItem 
                      key={msg.id} 
                      msg={msg} 
                      handleMarkAsRead={handleMarkAsRead} 
                      handleDeleteMessage={handleDeleteMessage} 
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Selected product preview */}
            {selectedProduct && (
              <Box 
                p={1.5} 
                borderTop="1px solid #e0e0e0" 
                bgcolor={alpha('#1976d2', 0.03)}
                
              >
                <Box display="flex" flexDirection="column" alignItems="start" gap={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                  Sản phẩm đính kèm:
                  </Typography>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    gap={1} 
                    flex={1} 
                    p={1.5} 
                    border="1px solid #e0e0e0" 
                    borderRadius={1.5} 
                    bgcolor="white"
                    sx={{
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <Box sx={{ 
                      width: '40px', 
                      height: '40px', 
                      position: 'relative', 
                      flexShrink: 0, 
                      bgcolor: "#f0f0f0", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      {selectedProduct.product?.imageUrls ? (
                        <Image
                          src={getFirstImage(selectedProduct.product?.imageUrls) || "/placeholder.svg"}
                          alt={selectedProduct.product?.name || "Product"}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <IconShoppingCart size={20} color="#999" />
                      )}
                    </Box>
                    <Typography 
                      variant="body2" 
                      fontWeight={500}
                      sx={{ 
                        flex: 1, 
                        cursor: selectedProduct.productId ? 'pointer' : 'default',
                        color: '#1976d2',
                        '&:hover': selectedProduct.productId ? { 
                          textDecoration: 'underline' 
                        } : {},
                        wordBreak: 'break-word',
                      }}
                      onClick={handleProductClick}
                    >
                      {selectedProduct.product?.name || "Sản phẩm đã chọn"}
                      {selectedProduct.productId && (
                        <IconExternalLink size={14} style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                      )}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setSelectedProduct(null)}
                      sx={{ 
                        color: '#f44336',
                        p: 0.5,
                        '&:hover': { bgcolor: alpha('#f44336', 0.1) }
                      }}
                    >
                      <IconX size={16} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Image previews */}
            {imageUrls.length > 0 && (
              <Box 
                p={1.5} 
                borderTop="1px solid #e0e0e0" 
                bgcolor={alpha('#1976d2', 0.03)}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  <Chip 
                    label="Hình ảnh đính kèm" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                  <Typography variant="caption" color="text.secondary" ml={1}>
                    {imageUrls.length} ảnh
                  </Typography>
                </Box>
                <Box display="flex" gap={1.5} flexWrap="wrap">
                  {imageUrls.map((url, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        position: 'relative',
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      <Image 
                        src={url || "/placeholder.svg"} 
                        alt={`Preview ${index}`} 
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      <IconButton 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          right: 0, 
                          bgcolor: 'rgba(255,255,255,0.8)', 
                          p: '2px',
                          '&:hover': { 
                            bgcolor: 'rgba(255,255,255,0.9)',
                            color: '#f44336'
                          }
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <IconX size={12} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Product selector */}
            {showProductSelector && selectedShopId && (
              <Paper 
                elevation={4} 
                sx={{ 
                  position: 'absolute', 
                  bottom: '80px', 
                  right: '24px', 
                  width: '600px',
                  maxHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 10,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
              >
                <Box 
                  p={2} 
                  borderBottom="1px solid #e0e0e0" 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  bgcolor="#f5f5f5"
                >
                  <Typography variant="subtitle1" fontWeight={600} display="flex" alignItems="center" gap={1}>
                    <IconShoppingCart size={18} />
                    Chọn sản phẩm
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowProductSelector(false)}
                    sx={{ 
                      bgcolor: alpha('#000', 0.05),
                      '&:hover': { bgcolor: alpha('#000', 0.1) }
                    }}
                  >
                    <IconX size={16} />
                  </IconButton>
                </Box>
                
                <Box p={2} borderBottom="1px solid #f0f0f0">
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={18} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1976d2',
                        },
                      }
                    }}
                  />
                </Box>
                
                <Box overflow="auto" flex={1} maxHeight="300px" sx={{ scrollbarWidth: 'thin' }}>
                  {isLoadingProducts ? (
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <List disablePadding>
                      {productsData?.data?.data?.length === 0 ? (
                        <Box p={3} textAlign="center">
                          <Typography color="text.secondary">Không tìm thấy sản phẩm</Typography>
                        </Box>
                      ) : (
                        productsData?.data?.data?.map((item: any) => (
                          <ListItem key={item.id} disablePadding divider>
                            <ListItemButton 
                              onClick={() => handleSelectProduct(item)}
                              sx={{
                                py: 1.5,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  bgcolor: alpha('#1976d2', 0.05),
                                }
                              }}
                            >
                              <Box display="flex" gap={2} width="100%">
                                <Box sx={{ 
                                  width: '50px', 
                                  height: '50px', 
                                  position: 'relative', 
                                  flexShrink: 0,
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  border: '1px solid #e0e0e0'
                                }}>
                                  <Image
                                    src={getFirstImage(item.product?.imageUrls) || "/placeholder.svg"}
                                    alt={item.product?.name || "Product"}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                  />
                                </Box>
                                <Box flex={1}>
                                  <Typography variant="body2" fontWeight={500}>
                                    {item.product?.name || "Sản phẩm"}
                                  </Typography>
                                  <Box display="flex" gap={2} mt={0.5}>
                                    <Typography variant="caption" color="success.main" fontWeight={500}>
                                      ${item.salePrice || item.price || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Còn {item.product?.stock || 0} sản phẩm
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </ListItemButton>
                          </ListItem>
                        ))
                      )}
                    </List>
                  )}
                </Box>
              </Paper>
            )}

            {/* Message Input */}
            <Box 
              p={2} 
              borderTop="1px solid #e0e0e0"
              sx={{ 
                bgcolor: '#fff',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedUserId ? "Nhập tin nhắn..." : "Chọn người dùng để bắt đầu..."}
                  size="small"
                  disabled={!selectedUserId}
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      bgcolor: selectedUserId ? '#fff' : '#f5f5f5',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: selectedUserId ? '#1976d2' : '#e0e0e0',
                      },
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Đính kèm hình ảnh">
                            <IconButton 
                              size="small" 
                              onClick={() => fileInputRef.current?.click()}
                              disabled={!selectedUserId}
                              sx={{ 
                                color: '#1976d2',
                                opacity: selectedUserId ? 1 : 0.5,
                                '&:hover': { bgcolor: alpha('#1976d2', 0.1) }
                              }}
                            >
                              <IconPaperclip size={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Đính kèm sản phẩm">
                            <IconButton 
                              size="small" 
                              onClick={() => setShowProductSelector(prev => !prev)}
                              disabled={!selectedUserId}
                              sx={{ 
                                color: selectedProduct ? '#1976d2' : 'inherit',
                                opacity: selectedUserId ? 1 : 0.5,
                                '&:hover': { bgcolor: alpha(selectedProduct ? '#4caf50' : '#1976d2', 0.1) }
                              }}
                            >
                              <IconShoppingCart size={20} />
                            </IconButton>
                          </Tooltip>
                          <input
                            type="file"
                            multiple
                            hidden
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                          />
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  variant="contained"
                  color="primary"
                  disabled={!selectedUserId || (!message && images.length === 0 && !selectedProduct)}
                  sx={{ 
                    backgroundColor: !selectedUserId || (!message && images.length === 0 && !selectedProduct) ? "#1976d295 !important" : "#5D87FF !important",
                    minWidth: '80px',
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    }
                  }}
                  endIcon={<IconSend size={16} />}
                >
                  Gửi
                </Button>
              </Box>
              
              <Box display="flex" gap={1} mt={1} alignItems="center">
                {(images.length > 0 || selectedProduct) && (
                  <Typography variant="caption" color="text.secondary">
                    Đính kèm:
                  </Typography>
                )}
                
                {images.length > 0 && (
                  <Chip 
                    size="small" 
                    icon={<IconPhoto size={14} />}
                    label={`${images.length} ảnh`}
                    color="primary"
                    variant="outlined"
                    sx={{ height: 24 }}
                  />
                )}
                
                {selectedProduct && (
                  <Chip
                    size="small"
                    icon={<IconShoppingCart size={14} />}
                    label="1 sản phẩm"
                    color="success"
                    variant="outlined"
                    sx={{ height: 24 }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
