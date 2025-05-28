"use client";

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
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { IconArrowLeft, IconEdit, IconEye, IconEyeOff, IconMessage, IconStar, IconTrash, IconUpload, IconX, IconZoomIn, IconPhoto, IconPlus, IconWindmill } from "@tabler/icons-react";
import { message } from "antd";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useGetUserActionLogs } from "@/hooks/action-log";
import { useUploadImage } from "@/hooks/image";
import { useGetAllSellerPackages } from "@/hooks/seller-package";
import { useGetAllSpreadPackages } from "@/hooks/spread-package";
import { useDeleteUser, useGetUserById, useGetUserIpHistory, useUpdateUser } from "@/hooks/user";
import { ISellerPackage } from "@/interface/response/seller-package";
import { ISpreadPackage } from "@/interface/response/spread-package";
import { useGetBanks } from "@/hooks/bank";

// Add an interface for bank data
interface IBank {
  id: string;
  name: string;
  code: string;
  bin: number;
  short_name: string;
  logo_url: string;
  icon_url: string;
  swift_code: string | null;
  lookup_supported: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWithdrawPassword, setShowWithdrawPassword] = useState(false);
  const [showFedexPassword, setShowFedexPassword] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [shopStatusDialogOpen, setShopStatusDialogOpen] = useState(false);
  const [verifyShopDialogOpen, setVerifyShopDialogOpen] = useState(false);
  const [imagePreviewDialogOpen, setImagePreviewDialogOpen] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState("");
  const [previewImageTitle, setPreviewImageTitle] = useState("");
  const { data: banksData } = useGetBanks();
  // IP History state
  const [ipHistoryPage, setIpHistoryPage] = useState(0);
  const [ipHistoryRowsPerPage, setIpHistoryRowsPerPage] = useState(10);
  const [ipFilter, setIpFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  // Activity Logs state
  const [activityLogsPage, setActivityLogsPage] = useState(0);
  const [activityLogsRowsPerPage, setActivityLogsRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [endpointFilter, setEndpointFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: "",
    username: "",
    fullName: "",
    shopName: "",
    shopAddress: "",
    shopStatus: "PENDING",
    view: 0,
    stars: 0,
    reputationPoints: 0,
    logoUrl: "",
    balance: 0,
    fedexBalance: 0,
    totalWithdrawn: 0,
    totalShippingOrders: 0,
    totalDeliveredOrders: 0,
    totalProfit: 0,
    numberProduct: 0,
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankBranch: "",
    bankNumber: "",
    bankCode: "",
    password: "",
    withdrawPassword: "",
    fedexPassword: "",
    idCardType: "",
    idCardNumber: "",
    idCardFrontImage: "",
    idCardBackImage: "",
    role: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });
  const [sellerPackages, setSellerPackages] = useState<ISellerPackage[]>([]);
  const [spreadPackages, setSpreadPackages] = useState<ISpreadPackage[]>([]);
  const [imagePreviewFront, setImagePreviewFront] = useState<string | null>(null);
  const [imagePreviewBack, setImagePreviewBack] = useState<string | null>(null);
  const [imageFileFront, setImageFileFront] = useState<File | null>(null);
  const [imageFileBack, setImageFileBack] = useState<File | null>(null);
  const { data: userData, isLoading, error } = useGetUserById(id);
  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useUpdateUser();
  const { data: sellerPackageData } = useGetAllSellerPackages();
  const { data: spreadPackageData } = useGetAllSpreadPackages();
  const uploadImageMutation = useUploadImage();

  // Fetch IP history
  const { data: ipHistoryData, isLoading: ipHistoryLoading } = useGetUserIpHistory({
    userId: id,
    page: ipHistoryPage + 1,
    take: ipHistoryRowsPerPage,
    ip: ipFilter || undefined,
    action: actionFilter || undefined,
  });

  // Fetch Activity Logs
  const { data: activityLogsData, isLoading: activityLogsLoading } = useGetUserActionLogs(
    id,
    {
      page: activityLogsPage + 1,
      take: activityLogsRowsPerPage,
      search: searchFilter || undefined,
      description: descriptionFilter || undefined,
      endpoint: endpointFilter || undefined,
      method: methodFilter || undefined,
      order: sortOrder,
    }
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (userData?.data) {
      setFormData({
        email: userData?.data.email || "",
        phone: userData.data.phone || "",
        address: userData.data.address || "",
        username: userData.data.username || "",
        fullName: userData.data.fullName || "",
        shopName: userData.data.shopName || "",
        shopAddress: userData.data.shopAddress || "",
        shopStatus: userData.data.shopStatus || "PENDING",
        view: Number(userData.data.view),
        stars: Number(userData.data.stars),
        reputationPoints: Number(userData.data.reputationPoints),
        logoUrl: userData.data.logoUrl || "",
        balance: Number(userData.data.balance),
        fedexBalance: Number(userData.data.fedexBalance),
        totalWithdrawn: Number(userData.data.totalWithdrawn || 0),
        totalShippingOrders: Number(userData.data.totalShippingOrders || 0),
        totalDeliveredOrders: Number(userData.data.totalDeliveredOrders || 0),
        totalProfit: Number(userData.data.totalProfit),
        numberProduct: Number(userData.data.numberProduct || 0),
        bankName: userData.data.bankName || "",
        bankAccountNumber: userData.data.bankAccountNumber || "",
        bankAccountName: userData.data.bankAccountName || "",
        bankBranch: userData.data.bankBranch || "",
        bankNumber: userData.data.bankNumber || "",
        bankCode: userData.data.bankCode || "",
        password: userData.data.password || "",
        withdrawPassword: userData.data.withdrawPassword || "",
        fedexPassword: userData.data.fedexPassword || "",
        idCardType: userData.data.idCardType || "",
        idCardNumber: userData.data.idCardNumber || "",
        idCardFrontImage: userData.data.idCardFrontImage || "",
        idCardBackImage: userData.data.idCardBackImage || "",
        role: userData.data.role || "",
      });
    }
    if (sellerPackageData?.data) {
      setSellerPackages(sellerPackageData.data);
    }
    if (spreadPackageData?.data) {
      setSpreadPackages(spreadPackageData.data);
    }
  }, [userData, sellerPackageData, spreadPackageData]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      phone: "",
    };

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    // No longer validate phone number format - accept any number with any length
    // The error message for phone is kept empty to allow any input

    setErrors(newErrors);
    return isValid;
  };

  const handleBack = () => {
    router.push("/admin/users");
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUserMutation.mutateAsync(id);
      message.success("Người dùng đã được xóa thành công!");
      router.push("/admin/users");
    } catch (error) {
      message.error("Không thể xóa người dùng. Vui lòng thử lại.");
      console.error(error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | { name?: string; value: unknown }
      | SelectChangeEvent<string>
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (name) {
      setFormData({
        ...formData,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
              ? Number(value)
              : value,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (type === 'front') {
        setImageFileFront(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreviewFront(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        setFormData((prev) => ({
          ...prev,
          idCardFrontImage: "image-url-placeholder",
        }));
      } else {
        setImageFileBack(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreviewBack(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        setFormData((prev) => ({
          ...prev,
          idCardBackImage: "image-url-placeholder",
        }));
      }
    }
  };

  const removeImage = (type: 'front' | 'back') => {
    if (type === 'front') {
      setImagePreviewFront(null);
      setImageFileFront(null);
      setFormData((prev) => ({
        ...prev,
        idCardFrontImage: "",
      }));
    } else {
      setImagePreviewBack(null);
      setImageFileBack(null);
      setFormData((prev) => ({
        ...prev,
        idCardBackImage: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Vui lòng kiểm tra lại thông tin nhập");
      return;
    }

    try {
      let updatedFormData = { ...formData };

      // Upload ảnh mặt trước nếu có
      if (imageFileFront) {
        message.loading({ content: "Đang tải ảnh mặt trước lên...", key: "uploadImageFront" });

        const uploadResultFront = await uploadImageMutation.mutateAsync({
          file: imageFileFront,
          isPublic: true,
          description: `Ảnh mặt trước giấy tờ của người dùng: ${updatedFormData.email}`
        });

        message.success({ content: "Tải ảnh mặt trước thành công!", key: "uploadImageFront" });

        updatedFormData = {
          ...updatedFormData,
          idCardFrontImage: uploadResultFront.data.url
        };
      }

      // Upload ảnh mặt sau nếu có
      if (imageFileBack) {
        message.loading({ content: "Đang tải ảnh mặt sau lên...", key: "uploadImageBack" });

        const uploadResultBack = await uploadImageMutation.mutateAsync({
          file: imageFileBack,
          isPublic: true,
          description: `Ảnh mặt sau giấy tờ của người dùng: ${updatedFormData.email}`
        });

        message.success({ content: "Tải ảnh mặt sau thành công!", key: "uploadImageBack" });

        updatedFormData = {
          ...updatedFormData,
          idCardBackImage: uploadResultBack.data.url
        };
      }

      await updateUserMutation.mutateAsync({
        id,
        payload: {
          email: updatedFormData.email,
          phone: updatedFormData.phone,
          address: updatedFormData.address || undefined,
          shopName: updatedFormData.shopName || undefined,
          shopStatus: updatedFormData.shopStatus,
          view: updatedFormData.view,
          stars: updatedFormData.stars,
          reputationPoints: updatedFormData.reputationPoints,
          logoUrl: updatedFormData.logoUrl || undefined,
          balance: updatedFormData.balance.toString(),
          fedexBalance: updatedFormData.fedexBalance.toString(),
          totalProfit: updatedFormData.totalProfit,
          password: updatedFormData.password || undefined,
          withdrawPassword: updatedFormData.withdrawPassword || undefined,
          fedexPassword: updatedFormData.fedexPassword || undefined,
          idCardType: updatedFormData.idCardType || undefined,
          idCardNumber: updatedFormData.idCardNumber || undefined,
          idCardFrontImage: updatedFormData.idCardFrontImage || undefined,
          idCardBackImage: updatedFormData.idCardBackImage || undefined,
          role: updatedFormData.role,
          username: updatedFormData.username || undefined,
          fullName: updatedFormData.fullName || undefined,
          bankName: updatedFormData.bankName || undefined,
          bankAccountNumber: updatedFormData.bankAccountNumber || undefined,
          bankAccountName: updatedFormData.bankAccountName || undefined,
          bankBranch: updatedFormData.bankBranch || undefined,
          bankNumber: updatedFormData.bankNumber || undefined,
          bankCode: updatedFormData.bankCode || undefined,
        },
      });
      message.success("Thông tin người dùng đã được cập nhật!");
      setIsEditing(false);
    } catch (error) {
      message.error(
        "Không thể cập nhật thông tin người dùng. Vui lòng thử lại."
      );
      console.error(error);
    }
  };

  const generateRating = (value: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <IconStar
            key={index}
            size={16}
            fill={index < value ? "#FFD700" : "#e5e7eb"}
            className={index < value ? "text-[#FFD700]" : "text-gray-200"}
          />
        ))}
        <span className="ml-1">{value} sao</span>
      </div>
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleIpHistoryPageChange = (event: unknown, newPage: number) => {
    setIpHistoryPage(newPage);
  };

  const handleIpHistoryRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIpHistoryRowsPerPage(parseInt(event.target.value, 10));
    setIpHistoryPage(0);
  };

  const handleIpFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIpFilter(e.target.value);
  };

  const handleActionFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActionFilter(e.target.value);
  };

  const handleActivityLogsPageChange = (event: unknown, newPage: number) => {
    setActivityLogsPage(newPage);
  };

  const handleActivityLogsRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActivityLogsRowsPerPage(parseInt(event.target.value, 10));
    setActivityLogsPage(0);
  };

  const handleSearchFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(e.target.value);
  };

  const handleDescriptionFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionFilter(e.target.value);
  };

  const handleEndpointFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndpointFilter(e.target.value);
  };

  const handleMethodFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMethodFilter(e.target.value);
  };

  const handleSortOrderChange = (e: SelectChangeEvent<string>) => {
    setSortOrder(e.target.value as "ASC" | "DESC");
  };

  // Handle toggling shop freeze status
  const handleToggleFreeze = async () => {
    try {
      if (!userData?.data) return;

      const newStatus = userData.data.shopStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";

      await updateUserMutation.mutateAsync({
        id,
        payload: {
          shopStatus: newStatus
        }
      });

      message.success(newStatus === "SUSPENDED"
        ? "Đã đóng băng shop thành công!"
        : "Đã bỏ đóng băng shop thành công!");

      setShopStatusDialogOpen(false);
    } catch (error) {
      message.error("Không thể thay đổi trạng thái shop. Vui lòng thử lại.");
      console.error(error);
    }
  };

  // Handle shop verification
  const handleVerifyShop = async () => {
    try {
      if (!userData?.data) return;

      await updateUserMutation.mutateAsync({
        id,
        payload: {
          isVerified: true
        }
      });

      message.success("Đã xác minh cửa hàng thành công!");
      setVerifyShopDialogOpen(false);
    } catch (error) {
      message.error("Không thể xác minh cửa hàng. Vui lòng thử lại.");
      console.error(error);
    }
  };

  // Parse user agent to extract readable device info
  const parseUserAgent = (userAgent: string): string => {
    try {
      let deviceInfo = "";

      // Extract mobile info
      if (userAgent.includes("Mobile")) {
        if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
          deviceInfo = "iOS";
        } else if (userAgent.includes("Android")) {
          deviceInfo = "Android";
          // Try to extract Android version
          const androidMatch = userAgent.match(/Android\s([0-9.]+)/);
          if (androidMatch && androidMatch[1]) {
            deviceInfo += ` ${androidMatch[1]}`;
          }
        } else {
          deviceInfo = "Mobile";
        }
      } else {
        // Desktop info
        if (userAgent.includes("Windows")) {
          deviceInfo = "Windows";
        } else if (userAgent.includes("Mac")) {
          deviceInfo = "Mac";
        } else if (userAgent.includes("Linux")) {
          deviceInfo = "Linux";
        } else {
          deviceInfo = "Desktop";
        }
      }

      // Extract browser info
      if (userAgent.includes("Chrome") && !userAgent.includes("Chromium")) {
        deviceInfo += " - Chrome";
      } else if (userAgent.includes("Firefox")) {
        deviceInfo += " - Firefox";
      } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
        deviceInfo += " - Safari";
      } else if (userAgent.includes("Edge")) {
        deviceInfo += " - Edge";
      } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
        deviceInfo += " - IE";
      }

      return deviceInfo || userAgent.substring(0, 50) + "...";
    } catch (e) {
      return userAgent.substring(0, 50) + "...";
    }
  };

  // Format action for display
  const formatAction = (action: string): JSX.Element => {
    let color = "default";
    let label = action;

    switch (action) {
      case "LOGIN":
        color = "success";
        label = "Đăng nhập";
        break;
      case "REGISTER":
      case "REGISTER_SELLER":
        color = "primary";
        label = action === "REGISTER" ? "Đăng ký" : "Đăng ký cửa hàng";
        break;
      case "LOGOUT":
        color = "warning";
        label = "Đăng xuất";
        break;
      case "RESET_PASSWORD":
      case "CHANGE_PASSWORD":
        color = "info";
        label = action === "RESET_PASSWORD" ? "Đặt lại mật khẩu" : "Đổi mật khẩu";
        break;
      case "WITHDRAW":
        color = "error";
        label = "Rút tiền";
        break;
      case "DEPOSIT":
        color = "success";
        label = "Nạp tiền";
        break;
      default:
        color = "default";
    }

    return (
      <Chip
        label={label}
        color={color as any}
        size="small"
        variant="filled"
        className="min-w-[100px] text-center"
      />
    );
  };

  // Format HTTP method for display
  const formatMethod = (method: string): JSX.Element => {
    let color = "default";

    switch (method.toUpperCase()) {
      case "GET":
        color = "info";
        break;
      case "POST":
        color = "success";
        break;
      case "PUT":
      case "PATCH":
        color = "warning";
        break;
      case "DELETE":
        color = "error";
        break;
      default:
        color = "default";
    }

    return (
      <Chip
        label={method.toUpperCase()}
        color={color as any}
        size="small"
        variant="filled"
        className="min-w-[65px] text-center"
      />
    );
  };

  // Open image preview dialog
  const handleOpenImagePreview = (imageSrc: string, title: string) => {
    setPreviewImageSrc(imageSrc);
    setPreviewImageTitle(title);
    setImagePreviewDialogOpen(true);
  };

  // Handle image upload for logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    message.loading({ content: "Đang tải ảnh đại diện lên...", key: "uploadLogo" });

    try {
      const uploadResult = await uploadImageMutation.mutateAsync({
        file: file,
        isPublic: true,
        description: `Ảnh đại diện của người dùng: ${formData.email}`
      });

      message.success({ content: "Tải ảnh đại diện thành công!", key: "uploadLogo" });

      setFormData(prev => ({
        ...prev,
        logoUrl: uploadResult.data.url
      }));
    } catch (error) {
      message.error({ content: "Có lỗi xảy ra khi tải ảnh đại diện lên", key: "uploadLogo" });
      console.error(error);
    }
  };

  // Handle removing the logo image
  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      logoUrl: ""
    }));
  };

  // Handle generating a random image for the logo
  const handleGenerateLogo = () => {
    const width = 100; // Default width
    const height = 100; // Default height
    const randomId = Math.floor(Math.random() * 10000);
    const imageUrl = `https://picsum.photos/${width}/${height}?random=${randomId}`;
    setFormData(prev => ({
      ...prev,
      logoUrl: imageUrl
    }));
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center p-6 py-12">
        <CircularProgress className="text-main-golden-orange" />
      </Box>
    );
  }

  if (error || !userData) {
    return (
      <Box className="p-8 text-center">
        <Typography variant="h6" className="mb-2 text-red-400">
          Lỗi khi tải thông tin người dùng
        </Typography>
        <Typography className="mb-4 text-gray-400">
          {error?.message || "Không tìm thấy người dùng hoặc đã bị xóa"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft size={18} />}
          onClick={handleBack}
          className="text-gray-300 border-gray-500 hover:bg-gray-700"
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <div className="p-6">
      <Box className="flex items-center justify-between mb-4">
        <Button
          variant="text"
          startIcon={<IconArrowLeft size={18} />}
          onClick={handleBack}
          className="mr-4"
        >
          Quay lại
        </Button>
        <Typography
          fontSize={18}
          fontWeight={700}
          variant="h5"
          className="!text-main-golden-orange relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-[50%] after:h-0.5 after:bg-main-golden-orange after:rounded-full"
        >
          Chi tiết người dùng
        </Typography>
      </Box>

      <Paper className="p-6 border">
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="user detail tabs">
              <Tab label="Thông tin người dùng" id="user-tab-0" aria-controls="user-tabpanel-0" />
              <Tab label="Lịch sử IP" id="user-tab-1" aria-controls="user-tabpanel-1" />
              <Tab label="Lịch sử hoạt động" id="user-tab-2" aria-controls="user-tabpanel-2" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Thông tin cơ bản */}
              <Typography variant="h6" className="font-medium">Thông tin cơ bản</Typography>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <TextField
                  size="small"
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Địa chỉ"
                  name="address"
                  value={formData.address || formData.shopAddress}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
                <FormControl fullWidth size="small" disabled={!isEditing}>
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="Vai trò"
                    onChange={(e) => handleChange(e as any)}
                  >
                    <MenuItem value="user">Người dùng</MenuItem>
                    <MenuItem value="shop">Cửa hàng</MenuItem>
                    <MenuItem value="admin">Quản trị viên</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Thông tin người dùng */}
              <Typography variant="h6" className="mt-6 font-medium">Thông tin người dùng</Typography>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Tên người dùng"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
                <TextField
                  size="small"
                  label="Tên đầy đủ"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </div>

              {/* User Logo Section */}
              {userData?.data.role === "user" && (
                <Box mt={4}>
                  <Typography variant="h6" className="mb-4 font-medium">Ảnh đại diện người dùng</Typography>
                  <Box mb={2}>
                    <InputLabel className="mb-2">Upload ảnh đại diện</InputLabel>
                    <FormControl fullWidth variant="outlined" disabled={!isEditing}>
                      <OutlinedInput
                        type="file"
                        inputProps={{ multiple: false, accept: 'image/*' }}
                        onChange={handleLogoUpload}
                        startAdornment={
                          <InputAdornment position="start">
                            <IconPhoto />
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                    {uploadImageMutation.isPending && <CircularProgress size={24} className="mt-4" />}
                    <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {formData.logoUrl && (
                        <Box sx={{ position: 'relative', width: 100, height: 100 }}>
                          <img
                            draggable={false}
                            src={formData.logoUrl}
                            alt="User Avatar"
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
                            onClick={() => handleRemoveLogo()}
                            disabled={!isEditing}
                          >
                            <IconX size={16} color="red" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {isEditing && (
                    <Box mb={2} display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={handleGenerateLogo}
                        endIcon={<IconWindmill size={16} />}
                        disabled={!isEditing}
                      >
                        Generate Image
                      </Button>
                      {/* Reusing the ref for the logo upload input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        multiple={false} // Changed to false for single image upload
                        accept='image/*'
                        onChange={handleLogoUpload}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* Thông tin cửa hàng */}
              {userData?.data.role === "shop" &&
                <div className="flex items-center justify-between">
                  <Typography variant="h6" className="mt-6 font-medium">Thông tin cửa hàng</Typography>
                  <div className="flex items-center gap-4 px-4 py-2 border rounded-md bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Typography variant="body2" color={formData.shopStatus === "PENDING" ? "error" : "primary"}>
                        {formData.shopStatus === "PENDING" ? "Chờ duyệt" : "Đã duyệt"}
                      </Typography>
                      <Switch
                        checked={formData.shopStatus === "ACTIVE"}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            shopStatus: e.target.checked ? "ACTIVE" : "PENDING"
                          }))
                        }}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="h-6 border-l border-gray-300"></div>

                    <Button
                      size="small"
                      variant="outlined"
                      color={userData.data.shopStatus === "SUSPENDED" ? "success" : "error"}
                      onClick={() => setShopStatusDialogOpen(true)}
                      className={userData.data.shopStatus === "SUSPENDED" ? "!text-green-600 !border-green-600" : "!text-red-600 !border-red-600"}
                      disabled={isEditing}
                    >
                      {userData.data.shopStatus === "SUSPENDED" ? "Bỏ đóng băng shop" : "Đóng băng shop"}
                    </Button>

                    {!userData.data.isVerified && (
                      <>
                        <div className="h-6 border-l border-gray-300"></div>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => setVerifyShopDialogOpen(true)}
                          className="!text-green-600 !border-green-600"
                          disabled={isEditing}
                        >
                          Xác minh cửa hàng
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              }
              {userData?.data.role === "shop" && <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label={userData?.data.role === "shop" ? "Tên cửa hàng" : "Tên người dùng"}
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
                <TextField
                  size="small"
                  label="Lượt xem"
                  name="view"
                  type="number"
                  value={formData.view}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </div>}
              {userData?.data.role === "shop" && <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormControl fullWidth size="small" disabled={!isEditing}>
                  <InputLabel>Đánh giá sao</InputLabel>
                  <Select
                    name="stars"
                    value={formData.stars}
                    label="Đánh giá sao"
                    onChange={(e) => handleChange(e as any)}
                  >
                    <MenuItem value={0}>{generateRating(0)}</MenuItem>
                    <MenuItem value={1}>{generateRating(1)}</MenuItem>
                    <MenuItem value={2}>{generateRating(2)}</MenuItem>
                    <MenuItem value={3}>{generateRating(3)}</MenuItem>
                    <MenuItem value={4}>{generateRating(4)}</MenuItem>
                    <MenuItem value={5}>{generateRating(5)}</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Điểm uy tín"
                  name="reputationPoints"
                  type="number"
                  value={formData.reputationPoints}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </div>}

              {userData?.data.role === "shop" && <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <TextField
                    size="small"
                    label="Số lượng sản phẩm"
                    name="numberProduct"
                    type="number"
                    value={formData.numberProduct}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                    variant="outlined"
                    className="rounded"
                    disabled={true}
                  />
                </div>
                <div>
                  <TextField
                    size="small"
                    label="Tổng lợi nhuận"
                    name="totalProfit"
                    type="number"
                    value={formData.totalProfit}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                    variant="outlined"
                    className="rounded"
                    disabled={true}
                  />
                </div>
              </div>}
              {userData?.data.role === "shop" && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Typography variant="subtitle1" className="mb-2">Logo cửa hàng</Typography>
                    {formData.logoUrl ? (
                      <div className="relative w-32 h-32">
                        <Image
                          src={formData.logoUrl}
                          alt="Logo cửa hàng"
                          fill
                          sizes="(max-width: 128px) 100vw, 128px"
                          className="object-contain rounded"
                        />
                      </div>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Chưa có logo
                      </Typography>
                    )}
                  </div>
                </div>
              )}
              {/* Thông tin tài chính */}
              {userData?.data.role === "shop" && <Typography variant="h6" className="mt-6 font-medium">Thông tin tài chính</Typography>}
              {userData?.data.role === "shop" && <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Số dư ví cửa hàng"
                  name="balance"
                  type="number"
                  value={formData.balance}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
                <TextField
                  size="small"
                  label="Số dư ví Fedex"
                  name="fedexBalance"
                  type="number"
                  value={formData.fedexBalance}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </div>}
              {userData?.data.role === "shop" && <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Số tiền đã rút"
                  name="totalWithdrawn"
                  type="number"
                  value={formData.totalWithdrawn}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
                <TextField
                  size="small"
                  label="Tổng lợi nhuận"
                  name="totalProfit"
                  type="number"
                  value={formData.totalProfit}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </div>}
              {userData?.data.role === "shop" && <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Tổng tiền hàng đang giao"
                  name="totalShippingOrders"
                  type="number"
                  value={formData.totalShippingOrders}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
                <TextField
                  size="small"
                  label="Tổng tiền hàng đã giao"
                  name="totalDeliveredOrders"
                  type="number"
                  value={userData.data.totalRevenue || "0"}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </div>}

              {/* Thêm thông tin thống kê */}
              {userData?.data.role === "shop" && <Typography variant="subtitle1" className="mt-4 font-medium">Thống kê đơn hàng</Typography>}
              {userData?.data.role === "shop" && <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <TextField
                  size="small"
                  label="Tổng số đơn hàng"
                  type="text"
                  value={userData.data.totalOrders || 0}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={true}
                />
                <TextField
                  size="small"
                  label="Tổng doanh thu"
                  type="text"
                  value={userData.data.totalRevenue || "0"}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={true}
                />
                <TextField
                  size="small"
                  label="Số lượng sản phẩm"
                  name="numberProduct"
                  type="number"
                  value={formData.numberProduct}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </div>}

              {userData?.data.role === "shop" && <Typography variant="subtitle1" className="mt-4 font-medium">Thống kê hôm nay</Typography>}
              {userData?.data.role === "shop" && <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <TextField
                  size="small"
                  label="Đơn hàng hôm nay"
                  type="text"
                  value={userData.data.todayOrders || 0}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={true}
                />
                <TextField
                  size="small"
                  label="Doanh thu hôm nay"
                  type="text"
                  value={userData.data.todayRevenue || "0"}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={true}
                />
                <TextField
                  size="small"
                  label="Lợi nhuận hôm nay"
                  type="text"
                  value={userData.data.todayProfit || "0"}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={true}
                />
              </div>}

              {userData?.data.role === "shop" && <Typography variant="subtitle1" className="mt-4 font-medium">Đơn hàng đang chờ</Typography>}
              {userData?.data.role === "shop" && <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <TextField
                  size="small"
                  label="Tổng đơn hàng đang chờ"
                  type="text"
                  value={userData.data.totalPendingOrder || 0}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={true}
                />
                <TextField
                  size="small"
                  label="Tổng tiền đơn hàng đang chờ"
                  type="text"
                  value={userData.data.totalPendingOrderAmount || "0"}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={true}
                />
                <TextField
                  size="small"
                  label="Lợi nhuận từ đơn hàng đang chờ"
                  type="text"
                  value={userData.data.totalPendingProfit || "0"}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={true}
                />
              </div>}

              {userData?.data.role === "shop" && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <TextField
                    size="small"
                    label="Số lượng sản phẩm"
                    name="numberProduct"
                    type="number"
                    value={formData.numberProduct}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    className="rounded"
                    disabled={!isEditing}
                  />
                </div>
              )}

              {/* Thông tin ngân hàng */}
              <Typography variant="h6" className="mt-6 font-medium">Thông tin ngân hàng</Typography>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Mã ngân hàng"
                  name="bankCode"
                  value={formData.bankName}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={true}
                />
                <FormControl fullWidth size="small" disabled={!isEditing}>
                  <InputLabel>Tên ngân hàng</InputLabel>
                  <Select
                    name="bankName"
                    value={formData.bankName}
                    label="Tên ngân hàng"
                    onChange={(e) => handleChange(e as any)}
                    className="!p-0"
                  >
                    {Array.isArray(banksData?.data) && banksData?.data.map((bank: IBank) => (
                      <MenuItem key={bank.id} value={bank.code} className="!p-0">
                        <div className="flex items-center gap-2">
                          {bank.logo_url && (
                            <img
                              src={bank.logo_url}
                              alt={bank.name}
                              className="flex-shrink-0 object-contain w-5 h-5"
                            />
                          )}
                          <span>{bank.name}</span>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Số tài khoản"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
                <TextField
                  size="small"
                  label="Tên tài khoản"
                  name="bankAccountName"
                  value={formData.bankAccountName}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Số ngân hàng"
                  name="bankNumber"
                  value={formData.bankNumber}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
                <TextField
                  size="small"
                  label="Chi nhánh ngân hàng"
                  name="bankBranch"
                  value={formData.bankBranch}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </div>


              <Typography variant="h6" className="mt-6 font-medium">Thông tin mật khẩu</Typography>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Mật khẩu đăng nhập"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                  InputProps={formData.password ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  } : undefined}
                />
                <TextField
                  size="small"
                  label="Mật khẩu giao dịch"
                  name="withdrawPassword"
                  type={showWithdrawPassword ? "text" : "password"}
                  value={formData.withdrawPassword}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                  InputProps={formData.withdrawPassword ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowWithdrawPassword(!showWithdrawPassword)}
                          edge="end"
                        >
                          {showWithdrawPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  } : undefined}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Mật khẩu giao dịch FEDEX"
                  name="fedexPassword"
                  type={showFedexPassword ? "text" : "password"}
                  value={formData.fedexPassword}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                  InputProps={formData.fedexPassword ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowFedexPassword(!showFedexPassword)}
                          edge="end"
                        >
                          {showFedexPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  } : undefined}
                />
              </div>


              {/* Thông tin xác thực */}
              <Typography variant="h6" className="mt-6 font-medium">Thông tin xác thực</Typography>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <TextField
                    size="small"
                    label="Loại giấy tờ"
                    name="idCardType"
                    value={formData.idCardType}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    className="rounded"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <TextField
                    size="small"
                    label="Số giấy tờ"
                    name="idCardNumber"
                    value={formData.idCardNumber}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    className="rounded"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Typography variant="subtitle1" className="!mb-2">Ảnh mặt sau</Typography>
                  {imagePreviewBack || formData.idCardBackImage ? (
                    <div className="relative flex-1 w-full overflow-hidden border border-gray-600 rounded">
                      <img
                        src={imagePreviewBack || formData.idCardBackImage}
                        alt="Ảnh mặt sau"
                        className="object-cover w-full h-full cursor-pointer"
                        onClick={() => handleOpenImagePreview(imagePreviewBack || formData.idCardBackImage, "Ảnh mặt sau CCCD")}
                      />
                      <IconButton
                        className="absolute z-10 bg-white/80 hover:bg-white bottom-2 right-2"
                        size="small"
                        onClick={() => handleOpenImagePreview(imagePreviewBack || formData.idCardBackImage, "Ảnh mặt sau CCCD")}
                      >
                        <IconZoomIn size={18} />
                      </IconButton>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeImage('back')}
                          className="absolute p-1 transition-colors bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                        >
                          <IconX size={16} color="white" />
                        </button>
                      )}
                    </div>
                  ) : (
                    isEditing ? (
                      <label className="flex flex-col items-center justify-center w-full transition-colors border border-gray-500 border-dashed !rounded-lg cursor-pointer">
                        <div className="flex flex-col items-center justify-center py-4">
                          <IconUpload size={24} className="mb-2 text-gray-400" />
                          <p className="text-sm text-gray-400">Upload ảnh mặt sau</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'back')} />
                      </label>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Chưa có ảnh
                      </Typography>
                    )
                  )}
                </div>
                <div>
                  <Typography variant="subtitle1" className="!mb-2">Ảnh mặt trước</Typography>
                  {imagePreviewFront || formData.idCardFrontImage ? (
                    <div className="relative flex-1 w-full overflow-hidden border border-gray-600 rounded">
                      <img
                        src={imagePreviewFront || formData.idCardFrontImage}
                        alt="Ảnh mặt trước"
                        className="object-cover w-full h-full cursor-pointer"
                        onClick={() => handleOpenImagePreview(imagePreviewFront || formData.idCardFrontImage, "Ảnh mặt trước CCCD")}
                      />
                      <IconButton
                        className="absolute z-10 bg-white/80 hover:bg-white bottom-2 right-2"
                        size="small"
                        onClick={() => handleOpenImagePreview(imagePreviewFront || formData.idCardFrontImage, "Ảnh mặt trước CCCD")}
                      >
                        <IconZoomIn size={18} />
                      </IconButton>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeImage('front')}
                          className="absolute p-1 transition-colors bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                        >
                          <IconX size={16} color="white" />
                        </button>
                      )}
                    </div>
                  ) : (
                    isEditing ? (
                      <label className="flex flex-col items-center justify-center w-full transition-colors border border-gray-500 border-dashed !rounded-lg cursor-pointer">
                        <div className="flex flex-col items-center justify-center py-4">
                          <IconUpload size={24} className="mb-2 text-gray-400" />
                          <p className="text-sm text-gray-400">Upload ảnh mặt trước</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'front')} />
                      </label>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Chưa có ảnh
                      </Typography>
                    )
                  )}
                </div>
              </div>
              {isEditing && (
                <Box className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateUserMutation.isPending}
                    className="text-black !bg-main-golden-orange hover:bg-amber-600"
                  >
                    {updateUserMutation.isPending ? (
                      <CircularProgress size={16} className="text-white" />
                    ) : (
                      "Cập nhật"
                    )}
                  </Button>
                </Box>
              )}
            </form>
            <Box className={`flex justify-end gap-2 ${isEditing ? 'mt-0' : 'mt-6'}`}>
              {!isEditing ? (
                <>
                  <Button
                    variant="contained"
                    startIcon={<IconMessage size={18} />}
                    onClick={() => {
                      router.push(`/admin/users?chat=${id}`)
                    }}
                    className="!bg-blue-500 !text-white"
                  >
                    Chat
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<IconTrash size={18} />}
                    onClick={() => setDeleteDialogOpen(true)}
                    className="!bg-red-500 !text-white"
                  >
                    Xóa
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<IconEdit size={18} />}
                    onClick={() => setIsEditing(true)}
                    className="!normal-case !bg-main-golden-orange"
                  >
                    Cập nhật
                  </Button>
                </>
              ) : null}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box className="mb-4">
              <Typography variant="h6" className="mb-4 font-medium">Lịch sử IP người dùng</Typography>
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Lọc theo IP"
                  value={ipFilter}
                  onChange={handleIpFilterChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Ví dụ: 192.168.1.1"
                  className="rounded"
                />
                <TextField
                  size="small"
                  label="Lọc theo hành động"
                  value={actionFilter}
                  onChange={handleActionFilterChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Ví dụ: LOGIN"
                  className="rounded"
                />
              </div>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>IP</TableCell>
                    <TableCell>Hành động</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Thiết bị</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ipHistoryLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <CircularProgress size={24} className="py-4 my-4 text-main-golden-orange" />
                      </TableCell>
                    </TableRow>
                  ) : ipHistoryData?.data?.data && ipHistoryData.data.data.length > 0 ? (
                    ipHistoryData.data.data.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Chip
                            label={item.ip}
                            variant="outlined"
                            size="small"
                            color="default"
                            className="font-mono"
                          />
                        </TableCell>
                        <TableCell>{formatAction(item.action)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" className="whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={item.userAgent} arrow placement="top">
                            <span>{parseUserAgent(item.userAgent)}</span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {ipHistoryData?.data?.meta && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={ipHistoryData.data.meta.itemCount || 0}
                rowsPerPage={ipHistoryRowsPerPage}
                page={ipHistoryPage}
                onPageChange={handleIpHistoryPageChange}
                onRowsPerPageChange={handleIpHistoryRowsPerPageChange}
                labelRowsPerPage="Số dòng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
              />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box className="mb-4">
              <Typography variant="h6" className="mb-4 font-medium">Lịch sử hoạt động người dùng</Typography>
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                <TextField
                  size="small"
                  label="Tìm kiếm"
                  value={searchFilter}
                  onChange={handleSearchFilterChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Tìm kiếm..."
                  className="rounded"
                />
                <TextField
                  size="small"
                  label="Mô tả"
                  value={descriptionFilter}
                  onChange={handleDescriptionFilterChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Lọc theo mô tả..."
                  className="rounded"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <TextField
                  size="small"
                  label="Endpoint"
                  value={endpointFilter}
                  onChange={handleEndpointFilterChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Ví dụ: /users/login"
                  className="rounded"
                />
                <TextField
                  size="small"
                  label="Phương thức HTTP"
                  value={methodFilter}
                  onChange={handleMethodFilterChange}
                  fullWidth
                  variant="outlined"
                  placeholder="GET, POST, PUT, DELETE..."
                  className="rounded"
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Sắp xếp</InputLabel>
                  <Select
                    value={sortOrder}
                    label="Sắp xếp"
                    onChange={handleSortOrderChange}
                  >
                    <MenuItem value="DESC">Mới nhất trước</MenuItem>
                    <MenuItem value="ASC">Cũ nhất trước</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Phương thức</TableCell>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Mô tả</TableCell>
                    <TableCell>Metadata</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activityLogsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={24} className="py-4 my-4 text-main-golden-orange" />
                      </TableCell>
                    </TableRow>
                  ) : activityLogsData?.data?.data && activityLogsData.data.data.length > 0 ? (
                    activityLogsData.data.data.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2" className="whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatMethod(item.method)}</TableCell>
                        <TableCell>
                          <Tooltip title={item.endpoint} arrow placement="top">
                            <span className="inline-block max-w-[150px] truncate">
                              {item.endpoint}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={item.description} arrow placement="top">
                            <span className="inline-block max-w-[200px] truncate">
                              {item.description}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {item.metadata ? (
                            <Tooltip
                              title={
                                <pre className="text-xs whitespace-pre-wrap">
                                  {JSON.stringify(item.metadata, null, 2)}
                                </pre>
                              }
                              arrow
                              placement="left"
                            >
                              <IconButton size="small">
                                <IconZoomIn size={16} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {activityLogsData?.data?.meta && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={activityLogsData.data.meta.itemCount || 0}
                rowsPerPage={activityLogsRowsPerPage}
                page={activityLogsPage}
                onPageChange={handleActivityLogsPageChange}
                onRowsPerPageChange={handleActivityLogsRowsPerPageChange}
                labelRowsPerPage="Số dòng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
              />
            )}
          </TabPanel>
        </Box>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          className: "!rounded-[6px] shadow-xl",
        }}
      >
        <DialogTitle fontSize={18}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-400">
            Bạn có chắc chắn muốn xóa người dùng &quot;
            {userData?.data.fullName || userData?.data.username}&quot;? Hành động này không
            thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="!p-4 !pb-6">
          <Button variant="outlined" onClick={() => setDeleteDialogOpen(false)}>
            Hủy bỏ
          </Button>
          <Button
            variant="outlined"
            onClick={handleDeleteConfirm}
            className="text-white transition-colors !bg-red-500"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? (
              <div className="flex items-center gap-2 text-white">
                <CircularProgress size={16} className="text-white" />
                Đang xóa...
              </div>
            ) : (
              <span className="!text-white">Xóa</span>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shop Status Dialog */}
      <Dialog
        open={shopStatusDialogOpen}
        onClose={() => setShopStatusDialogOpen(false)}
        PaperProps={{
          className: "!rounded-[6px] shadow-xl",
        }}
      >
        <DialogTitle fontSize={18}>
          {userData?.data?.shopStatus === "SUSPENDED" ? "Bỏ đóng băng shop" : "Đóng băng shop"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-400">
            {userData?.data?.shopStatus === "SUSPENDED"
              ? "Bạn có chắc chắn muốn bỏ đóng băng shop này? Shop sẽ có thể tiếp tục hoạt động bình thường."
              : "Bạn có chắc chắn muốn đóng băng shop này? Shop sẽ không thể hoạt động cho đến khi được bỏ đóng băng."}
          </DialogContentText>
        </DialogContent>
        <DialogActions className="!p-4 !pb-6">
          <Button variant="outlined" onClick={() => setShopStatusDialogOpen(false)}>
            Hủy bỏ
          </Button>
          <Button
            variant="outlined"
            onClick={handleToggleFreeze}
            className={userData?.data?.shopStatus === "SUSPENDED"
              ? "text-white transition-colors !bg-green-500"
              : "text-white transition-colors !bg-red-500"
            }
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? (
              <div className="flex items-center gap-2 text-white">
                <CircularProgress size={16} className="text-white" />
                Đang xử lý...
              </div>
            ) : (
              <span className="!text-white">
                {userData?.data?.shopStatus === "SUSPENDED" ? "Bỏ đóng băng" : "Đóng băng"}
              </span>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shop Verification Dialog */}
      <Dialog
        open={verifyShopDialogOpen}
        onClose={() => setVerifyShopDialogOpen(false)}
        PaperProps={{
          className: "!rounded-[6px] shadow-xl",
        }}
      >
        <DialogTitle fontSize={18}>
          Xác minh cửa hàng
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-400">
            Bạn có chắc chắn muốn xác minh cửa hàng này? Sau khi xác minh, cửa hàng sẽ được đánh dấu là đã xác minh và có thể tiếp tục hoạt động.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="!p-4 !pb-6">
          <Button variant="outlined" onClick={() => setVerifyShopDialogOpen(false)}>
            Hủy bỏ
          </Button>
          <Button
            variant="outlined"
            onClick={handleVerifyShop}
            className="text-white transition-colors !bg-green-500"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? (
              <div className="flex items-center gap-2 text-white">
                <CircularProgress size={16} className="text-white" />
                Đang xử lý...
              </div>
            ) : (
              <span className="!text-white">Xác minh</span>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreviewDialogOpen}
        onClose={() => setImagePreviewDialogOpen(false)}
        maxWidth="lg"
        PaperProps={{
          className: "!rounded-[6px] shadow-xl",
        }}
      >
        <DialogTitle fontSize={18} className="flex items-center justify-between">
          {previewImageTitle}
          <IconButton onClick={() => setImagePreviewDialogOpen(false)} size="small">
            <IconX size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent className="min-w-[300px] sm:min-w-[500px] lg:min-w-[800px]">
          <div className="flex justify-center w-full">
            <img
              src={previewImageSrc}
              alt={previewImageTitle}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserDetailPage;
