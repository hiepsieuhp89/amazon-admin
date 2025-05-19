"use client";

import { useGetCities } from "@/hooks/cities";
import { useGetCountries } from "@/hooks/countries";
import { useCreateFakeOrder, useGetValidUsers } from "@/hooks/fake-order";
import { useGetAllShopProducts } from "@/hooks/shop-products";
import { useGetStates } from "@/hooks/states";
import { useCreateUser, useGetAllUsers, useUpdateUser } from "@/hooks/user";
import { IValidUser } from "@/interface/response/fake-order";
import type { SelectChangeEvent } from "@mui/material";
import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Pagination,
  Paper,
  Popover,
  Select,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import {
  IconAlertCircle,
  IconBrandProducthunt,
  IconBuildingStore,
  IconCalendar,
  IconList,
  IconMail,
  IconMapPin,
  IconMapPinPin,
  IconMinus,
  IconPhone,
  IconPlus,
  IconSearch,
  IconTable,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { Empty, message } from "antd";
import Image from "next/image";
import type React from "react";
import { useState, useEffect, useCallback } from "react";
import styles from "./storehouse.module.scss";
import { debounce } from "lodash";
import { formatNumber } from "@/utils";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(timezone);

const AdminPosPage = () => {
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [totalSelectedProducts, setTotalSelectedProducts] = useState(0);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [searchShop, setSearchShop] = useState("");
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const { data: shopsData, isLoading: isLoadingShops } = useGetAllUsers({
    role: "shop",
    take: 1000,
    search: searchShop,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(21);
  const { data: productsData, isLoading } = useGetAllShopProducts({
    shopId: selectedShopId,
    page: currentPage,
    take: rowsPerPage,
  });

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerColors] = useState(new Map());
  const { mutate: createFakeOrder, isPending: isCreatingOrder } =
    useCreateFakeOrder();
  const [showShops, setShowShops] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const { data: validUsers, isLoading: isLoadingValidUsers } = useGetValidUsers(
    {
      search: searchUser || undefined,
    }
  );
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [hoveredCustomer, setHoveredCustomer] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedPostalCode, setSelectedPostalCode] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const updateUserMutation = useUpdateUser();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedInvalidUser, setSelectedInvalidUser] = useState<IValidUser>();
  const [showAddressList, setShowAddressList] = useState(true);
  const [newUserName, setNewUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderDateTime, setOrderDateTime] = useState(dayjs());
  const [deliveryScope, setDeliveryScope] = useState<'domestic' | 'global'>('domestic');
  const [orderStatusUI, setOrderStatusUI] = useState<string>('pending');

  const [hour, setHour] = useState(dayjs().hour());
  const [minute, setMinute] = useState(dayjs().minute());
  const [second, setSecond] = useState(dayjs().second());

  const { data: countries } = useGetCountries({ take: 1000 });
  const { data: states } = useGetStates({
    countryId: selectedCountry,
    take: 1000,
  });
  const { data: cities } = useGetCities({
    stateId: selectedState,
    take: 1000,
  });
  const { mutate: createUser } = useCreateUser();
  const [isCopied, setIsCopied] = useState(false);

  // Add debounced search function for optimized backend search
  const debouncedShopSearch = useCallback(
    debounce((value: string) => {
      setSearchShop(value);
    }, 500),
    []
  );

  // Add debounced user search function
  const debouncedUserSearch = useCallback(
    debounce((value: string) => {
      setSearchUser(value);
    }, 500),
    []
  );

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    const customer = event.currentTarget.dataset.customer;
    if (customer) {
      setAnchorEl(event.currentTarget);
      setHoveredCustomer(JSON.parse(customer));
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setHoveredCustomer(null);
  };

  const open = Boolean(anchorEl);
  const addProduct = (item: any) => {
    const productExists = selectedProducts.some(
      (product) => product.id === item.id
    );
    if (productExists) {
      message.warning("Sản phẩm đã tồn tại trong danh sách");
      return;
    }
    setSelectedProducts([...selectedProducts, item]);
    setTotalSelectedProducts(totalSelectedProducts + 1);
  };

  const removeProduct = (index: number) => {
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts.splice(index, 1);
    setSelectedProducts(newSelectedProducts);
    setTotalSelectedProducts(totalSelectedProducts - 1);
  };

  const checkImageUrl = (imageUrl: string): string => {
    if (!imageUrl) {
      return "https://placehold.co/400x400/png";
    }
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    return `http://localhost:3000${imageUrl}`;
  };

  const getFirstImage = (imageUrls: string[] | undefined): string => {
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return "https://placehold.co/400x400/png";
    }
    return checkImageUrl(imageUrls[0]);
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 1) + delta, 1),
    }));
  };

  const getRandomColor = () => {
    const colorPairs = [
      { background: "#E6EFFF !important", color: "#3F6AD8 !important" }, // Xanh dương
      { background: "#FFF8E6 !important", color: "#FCAF17 !important" }, // Vàng/Cam
      { background: "#E6F9FF !important", color: "#33C4FF !important" }, // Xanh da trời
      { background: "#FFE6E6 !important", color: "#FF6B6B !important" }, // Hồng
      { background: "#E6FFFA !important", color: "#13DEB9 !important" }, // Xanh lá
      { background: "#F0E6FF !important", color: "#7E3CF9 !important" }, // Tím
    ];

    const randomIndex = Math.floor(Math.random() * colorPairs.length);
    return colorPairs[randomIndex];
  };

  const getCustomerColor = (customer: any) => {
    if (!customerColors.has(customer.id)) {
      customerColors.set(customer.id, getRandomColor());
    }
    return customerColors.get(customer.id);
  };

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setSelectedShopId(customer.id);
    setAnchorEl(null);
    setShowProducts(true);
  };

  const handleSelectUser = (user: any) => {
    if (!user?.address) {
      message.warning(`Khách ảo: ${user.fullName} chưa có địa chỉ`);
      return;
    }

    setSelectedUser(user);
    setSelectedCustomer({
      ...selectedCustomer,
      email: user.email,
      phone: user.phone,
      address: user.address,
      userId: user.id,
    });
    message.success(`Khách ảo: ${user.fullName} đã được thêm thành công`);
  };

  const handleCreateFakeOrder = () => {
    setConfirmOpen(true);
  };

  const handleConfirmOrder = () => {
    if (!selectedUser) {
      message.warning("Vui lòng chọn người dùng hợp lệ");
      return;
    }

    if (!selectedCustomer || selectedProducts.length === 0) {
      message.warning("Vui lòng chọn khách hàng và sản phẩm");
      return;
    }

    if (!validUsers || validUsers.data.data.length === 0) {
      message.warning("Không tìm thấy người dùng hợp lệ cho sản phẩm đã chọn");
      return;
    }

    // Combine date with hour, minute, second only at order creation time
    const finalOrderDateTime = orderDateTime
      .hour(hour)
      .minute(minute)
      .second(second);

    const payload = {
      items: selectedProducts.map((item) => ({
        shopProductId: item.id,
        quantity: quantities[item.id] || 1,
      })),
      email: selectedUser.email,
      address: selectedUser.address || "New York, USA",
      userId: selectedUser.id,
      orderTime: finalOrderDateTime.toISOString(),
      deliveryScope: deliveryScope,
    };

    createFakeOrder(payload, {
      onSuccess: () => {
        message.success("Tạo đơn hàng ảo thành công");
        setSelectedProducts([]);
        setSelectedCustomer(null);
        setSelectedUser(null);
        setTotalSelectedProducts(0);
        setConfirmOpen(false);
      },
      onError: (error) => {
        message.error(`Lỗi khi tạo đơn hàng: ${error.message}`);
      },
    });
  };

  const handleSearchShop = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedShopSearch(e.target.value);
    setShowShops(true);
  };

  const handleSearchUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    debouncedUserSearch(searchValue);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCountryChange = (e: SelectChangeEvent<string>) => {
    setSelectedCountry(e.target.value);
    setSelectedState("");
    setSelectedCity("");
    setSelectedPostalCode("");
  };

  const handleStateChange = (e: SelectChangeEvent<string>) => {
    setSelectedState(e.target.value);
    setSelectedCity("");
    setSelectedPostalCode("");
  };

  const handleCityChange = (e: SelectChangeEvent<string>) => {
    setSelectedCity(e.target.value);
    setSelectedPostalCode("");
  };

  const handlePostalCodeChange = (e: SelectChangeEvent<string>) => {
    setSelectedPostalCode(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleSaveAddress = async () => {
    if (!selectedUserId) {
      message.warning("Vui lòng chọn người dùng");
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: selectedUserId,
        payload: {
          address: address,
        },
      });
      message.success("Đã cập nhật địa chỉ cho người dùng.");
      handleCloseDialog();
      setOpenUpdateDialog(false);
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật địa chỉ");
    }
  };

  const handleSelectShop = (shopId: string) => {
    setSelectedShopId(shopId);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const displayedShops =
    shopsData?.data?.data.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    ) || [];

  const handleOpenAddressDialog = (user: IValidUser) => {
    setSelectedInvalidUser(user);
    setSelectedUserId(user.id);
    setOpenUpdateDialog(true);
  };

  const handleUserPinClick = () => {
    setShowAddressList(!showAddressList);
  };

  const handleSaveAddressAndCreateUser = async () => {
    if (!newUserName) {
      message.warning("Vui lòng nhập tên người nhận hàng");
      return;
    }

    try {
      // Tạo username từ tên người dùng
      const username =
        newUserName.toLowerCase().replace(/\s+/g, "") + new Date().getTime();

      // Tạo payload mới, sử dụng fullName thay vì username
      const payload = {
        fullName: newUserName,
        email: email || undefined,
        phone: phone || undefined,
        username: username,
        password: "password123",
        role: "user",
        shopName: selectedCustomer?.shopName || undefined,
        shopAddress: selectedCustomer?.shopAddress || undefined,
        balance: 0,
        fedexBalance: 0,
        isActive: true,
        // isVerified: true,
        invitationCode: selectedCustomer?.invitationCode || undefined,
        referralCode: selectedCustomer?.referralCode || undefined,
        bankName: selectedCustomer?.bankName || undefined,
        bankAccountNumber: selectedCustomer?.bankAccountNumber || undefined,
        bankAccountName: selectedCustomer?.bankAccountName || undefined,
        bankBranch: selectedCustomer?.bankBranch || undefined,
        bankNumber: selectedCustomer?.bankNumber || undefined,
        bankCode: selectedCustomer?.bankCode || undefined,
        address: address || undefined,
        countryId: selectedCountry || undefined,
        stateId: selectedState || undefined,
        cityId: selectedCity || undefined,
        postalCode: selectedPostalCode || undefined,
        stars: 0,
        reputationPoints: 0,
      };

      // Gọi API createUser từ @user.ts
      await createUser(payload as any, {
        onSuccess: () => {
          message.success("Tạo người dùng và lưu địa chỉ thành công!");
          handleCloseDialog();
          // Reset các trường nhập liệu
          setNewUserName("");
          setEmail("");
          setPhone("");
          setSelectedCountry("");
          setSelectedState("");
          setSelectedCity("");
          setSelectedPostalCode("");
          setAddress("");
        },
        onError: (error) => {
          message.error("Có lỗi xảy ra. Vui lòng thử lại.");
          console.error(error);
        },
      });
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại.");
      console.error(error);
    }
  };

  const handleCopyCode = () => {
    const orderCode = "Mã đơn hàng"; // Thay thế bằng mã đơn hàng thực tế
    navigator.clipboard.writeText(orderCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <Box component="section" className={styles.storehouse}>
      <Box className="px-4 py-4 mx-auto ">
        <Box className="flex flex-col gap-4 md:flex-row">
          <Box className="flex flex-col md:flex-1">
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                    backgroundColor: "#ECF2FF",
                    borderRadius: "4px",
                    color: "#5D87FF",
                    border: "1px solid #5D87FF50",
                  }}
                >
                  <IconBuildingStore className="w-4 h-4" />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#3F6AD8" }}
                >
                  Các Shop hiện có ({shopsData?.data?.data.length || 0}). Vui
                  lòng nhấn chọn một Shop để hiển thị sản phẩm.
                </Typography>
              </Box>

              <Box className="flex justify-between w-full gap-2">
                <FormControl fullWidth>
                  <Autocomplete
                    options={shopsData?.data.data || []}
                    getOptionLabel={(option) => option.shopName}
                    value={selectedCustomer}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        handleCustomerSelect(newValue);
                        setSelectedShopId(newValue.id);
                      }
                    }}
                    onInputChange={(event, newInputValue) => {
                      debouncedShopSearch(newInputValue);
                    }}
                    loading={isLoadingShops}
                    filterOptions={(x) => x} // Disable client-side filtering as we're using backend search
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tìm kiếm shop"
                        variant="outlined"
                        size="small"
                        className="bg-white"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <IconSearch className="w-4 h-4" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                          endAdornment: (
                            <>
                              {isLoadingShops ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 500,
                              fontSize: 14,
                              ...getCustomerColor(option),
                            }}
                          >
                            {option.shopName?.substring(0, 2).toUpperCase()}
                          </Box>
                          <Box>
                            <Typography>{option.shopName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  />
                </FormControl>
              </Box>
              <Popover
                sx={{
                  pointerEvents: "none",
                  "& .MuiPopover-paper": {
                    overflow: "visible",
                  },
                  border: "none",
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "center",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "center",
                  horizontal: "right",
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
              >
                {hoveredCustomer && (
                  <Box
                    sx={{
                      p: 2,
                      maxWidth: 320,
                      bgcolor: "#ffffff",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      border: "1px solid #f0f0f0",
                      position: "relative",
                      borderRadius: "4px",
                      "&:before": {
                        content: '""',
                        position: "absolute",
                        left: -8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 0,
                        height: 0,
                        borderTop: "8px solid transparent",
                        borderBottom: "8px solid transparent",
                        borderRight: "8px solid #ffffff",
                        zIndex: 2,
                      },
                      "&:after": {
                        content: '""',
                        position: "absolute",
                        left: -9,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 0,
                        height: 0,
                        borderTop: "9px solid transparent",
                        borderBottom: "9px solid transparent",
                        borderRight: "9px solid #f0f0f0",
                        zIndex: 1,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                        pb: 2,
                        borderBottom: "1px solid #f5f5f5",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                          fontSize: 16,
                          ...getRandomColor(),
                        }}
                      >
                        {hoveredCustomer?.shopName
                          ?.substring(0, 2)
                          .toUpperCase()}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "#333",
                          fontSize: "16px",
                        }}
                      >
                        {hoveredCustomer.shopName}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "#555",
                          fontSize: "14px",
                          "&:hover": { color: "#3F6AD8" },
                        }}
                      >
                        <IconMail
                          className="w-4 h-4 mr-2"
                          style={{ color: "#3F6AD8", flexShrink: 0 }}
                        />
                        <Box component="span" sx={{ fontWeight: 500 }}>
                          Email:
                        </Box>
                        <Box component="span" sx={{ ml: 1 }}>
                          {hoveredCustomer.email}
                        </Box>
                      </Typography>

                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "#555",
                          fontSize: "14px",
                          "&:hover": { color: "#3F6AD8" },
                        }}
                      >
                        <IconPhone
                          className="w-4 h-4 mr-2"
                          style={{ color: "#3F6AD8", flexShrink: 0 }}
                        />
                        <Box component="span" sx={{ fontWeight: 500 }}>
                          Phone:
                        </Box>
                        <Box component="span" sx={{ ml: 1 }}>
                          {hoveredCustomer.phone}
                        </Box>
                      </Typography>

                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          color: "#555",
                          fontSize: "14px",
                          "&:hover": { color: "#3F6AD8" },
                        }}
                      >
                        <IconMapPin
                          className="w-4 h-4 mr-2"
                          style={{ color: "#3F6AD8", flexShrink: 0 }}
                        />
                        <Box component="span" sx={{ fontWeight: 500 }}>
                          Địa chỉ:
                        </Box>
                        <Box component="span" sx={{ ml: 1 }}>
                          {hoveredCustomer.shopAddress}
                        </Box>
                      </Typography>

                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "#555",
                          fontSize: "14px",
                          mt: 1,
                          pt: 1,
                          borderTop: "1px solid #f5f5f5",
                        }}
                      >
                        <IconCalendar
                          className="w-4 h-4 mr-2"
                          style={{ color: "#FCAF17", flexShrink: 0 }}
                        />
                        <Box component="span" sx={{ fontWeight: 500 }}>
                          Ngày tạo:
                        </Box>
                        <Box component="span" sx={{ ml: 1 }}>
                          {new Date(
                            hoveredCustomer.createdAt
                          ).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Popover>
            </Box>
            {showProducts && (
              <Paper className="p-4 bg-white">
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "30px",
                        height: "30px",
                        backgroundColor: "#ECF2FF",
                        borderRadius: "4px",
                        color: "#5D87FF",
                        border: "1px solid #5D87FF50",
                      }}
                    >
                      <IconBrandProducthunt className="w-4 h-4" />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#3F6AD8" }}
                    >
                      Sản phẩm hiện có của {selectedCustomer?.shopName} (
                      {(productsData?.data?.meta as any)?.itemCount})
                    </Typography>
                    <Box sx={{ ml: "auto" }}>
                      <ButtonGroup
                        variant="outlined"
                        aria-label="outlined button group"
                      >
                        <Button
                          variant={
                            viewMode === "table" ? "contained" : "outlined"
                          }
                          onClick={() => setViewMode("table")}
                          startIcon={<IconList />}
                          sx={{
                            backgroundColor: viewMode === "table" ? "#5D87FF !important" : "",
                            minWidth: '80px',
                            boxShadow: 'none',
                            '&:hover': {
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            },
                            textTransform: "none"
                          }}
                        >
                          Bảng
                        </Button>
                        <Button
                          variant={
                            viewMode === "grid" ? "contained" : "outlined"
                          }
                          onClick={() => setViewMode("grid")}
                          startIcon={<IconTable />}
                          sx={{
                            backgroundColor: viewMode === "grid" ? "#5D87FF !important" : "",
                            minWidth: '80px',
                            boxShadow: 'none',
                            '&:hover': {
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            },
                            textTransform: "none"
                          }}
                        >
                          Lưới
                        </Button>
                      </ButtonGroup>
                    </Box>
                  </Box>
                  {viewMode === "grid" ? (
                    <>
                      <Box className="grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                        {productsData?.data?.data?.length === 0 ? (
                          <Box className="flex items-center justify-center h-full col-span-3">
                            <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description={"Shop chưa có sản phẩm."}
                            />
                          </Box>
                        ) : (
                          productsData?.data?.data?.map((item) => {
                            const product = (item as any).product;
                            return (
                              <Box key={item.id} className={styles.productCard}>
                                <Box
                                  className={`${styles.card} !rounded-[8px] overflow-hidden`}
                                >
                                  <Box
                                    sx={{
                                      p: 2,
                                      display: "flex",
                                      flexDirection: "column",
                                      height: "100%",
                                    }}
                                  >
                                    <Box className={styles.imageContainer}>
                                      <Box className="h-6 bg-[#FEF5E5] text-[#FCAF17] font-semibold rounded-[4px] px-2 text-xs flex items-center justify-center absolute z-50 border-none -top-2 -right-2">
                                        Trong kho: {product.stock}
                                      </Box>
                                      <Image
                                        src={getFirstImage(product.imageUrls)}
                                        alt={product.name}
                                        className={`${styles.productImage}`}
                                        width={140}
                                        height={140}
                                        draggable={false}
                                      />
                                    </Box>
                                    <Box className={styles.productName}>
                                      Tên sản phẩm: {product.name.slice(0, 50)}
                                      {product.name.length > 50 && "..."}
                                    </Box>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.5,
                                      }}
                                    >
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        <span>Giá niêm yết:</span>
                                        <span className="!text-green-500">
                                          $
                                          {formatNumber(
                                            Number((item as any).salePrice)
                                          )}
                                        </span>
                                      </Box>
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        <span>Giá nhập:</span>
                                        <span className="!text-amber-500">
                                          $
                                          {formatNumber(
                                            Number((item as any).price)
                                          )}
                                        </span>
                                      </Box>
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        <span>Lợi nhuận:</span>
                                        <span className="!text-red-500 font-bold">
                                          $
                                          {formatNumber(
                                            Number((item as any).profit)
                                          )}
                                        </span>
                                      </Box>
                                    </Box>
                                    <Box
                                      className={styles.addButton}
                                      onClick={() => addProduct(item)}
                                    >
                                      <Box className={styles.overlay}></Box>
                                      <IconPlus className={styles.plusIcon} />
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            );
                          })
                        )}
                      </Box>
                      {(productsData?.data?.meta as any)?.itemCount >
                        (productsData?.data?.meta as any)?.take && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                            mb: 4,
                          }}
                        >
                          <Pagination
                            count={Math.ceil(
                              (productsData?.data?.meta as any)?.itemCount /
                                (productsData?.data?.meta as any)?.take
                            )}
                            page={currentPage}
                            onChange={handlePageChange}
                            variant="outlined"
                            color="primary"
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    <Paper elevation={1} sx={{ borderRadius: 1 }}>
                      <List sx={{ padding: 0 }} className="!px-0">
                        {/* Thêm header */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                            fontWeight: 600,
                          }}
                        >
                          <Box sx={{ width: "100px", mr: 2 }}>Hình ảnh</Box>
                          <Box sx={{ width: "200px" }}>Tên sản phẩm</Box>
                          <Box sx={{ width: "150px" }}>Giá niêm yết</Box>
                          <Box sx={{ width: "150px" }}>Giá nhập</Box>
                          <Box sx={{ width: "150px" }}>Lợi nhuận</Box>
                        </Box>
                        {productsData?.data?.data?.map((item, index) => {
                          const product = (item as any).product;
                          const isSelected = selectedProducts.some(
                            (p) => p.id === item.id
                          );
                          return (
                            <div key={item.id}>
                              <Collapse in={true} timeout="auto" unmountOnExit>
                                <ListItem
                                  sx={{
                                    borderBottom:
                                      "1px solid rgba(0, 0, 0, 0.08)",
                                    cursor: "pointer",
                                    "&:hover": { backgroundColor: "#f5f5f5" },
                                    backgroundColor:
                                      index % 2 === 0 ? "#f5f5f5" : "inherit",
                                  }}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => {
                                      if (isSelected) {
                                        const index =
                                          selectedProducts.findIndex(
                                            (p) => p.id === item.id
                                          );
                                        removeProduct(index);
                                      } else {
                                        addProduct(item);
                                      }
                                    }}
                                    sx={{ mr: 1 }}
                                    size="small"
                                  />
                                  {/* Thêm hình ảnh sản phẩm */}
                                  <Box sx={{ width: "100px", mr: 2 }}>
                                    <Image
                                      src={getFirstImage(
                                        (item as any).product.imageUrls
                                      )}
                                      alt={(item as any).product.name}
                                      width={80}
                                      height={80}
                                      style={{
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  </Box>
                                  <ListItemText
                                    primary={
                                      <Stack direction="row" spacing={2}>
                                        <div style={{ width: "200px" }}>
                                          <Typography
                                            fontWeight={500}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              color: "#FCAF17",
                                              fontSize: "16px",
                                            }}
                                          >
                                            {(item as any).product.name.slice(
                                              0,
                                              50
                                            )}
                                            {(item as any).product.name.length >
                                              50 && "..."}
                                          </Typography>
                                        </div>
                                        <div style={{ width: "150px" }}>
                                          <Box
                                            sx={{
                                              color: "text.secondary",
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            $
                                            {formatNumber(
                                              Number((item as any).salePrice)
                                            )}
                                          </Box>
                                        </div>
                                        <div style={{ width: "150px" }}>
                                          <Box
                                            sx={{
                                              color: "text.secondary",
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            $
                                            {formatNumber(
                                              Number((item as any).price)
                                            )}
                                          </Box>
                                        </div>
                                        <div style={{ width: "150px" }}>
                                          <Box
                                            sx={{
                                              color: "text.secondary",
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            $
                                            {formatNumber(
                                              Number((item as any).profit)
                                            )}
                                          </Box>
                                        </div>
                                      </Stack>
                                    }
                                  />
                                </ListItem>
                              </Collapse>
                            </div>
                          );
                        })}
                      </List>
                      <TablePagination
                        component="div"
                        count={productsData?.data?.meta?.itemCount || 0}
                        page={currentPage - 1}
                        onPageChange={(e, newPage) =>
                          setCurrentPage(newPage + 1)
                        }
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[]}
                        labelDisplayedRows={({ from, to, count }) =>
                          `${from}–${to} của ${count}`
                        }
                        sx={{
                          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                          "& .MuiTablePagination-toolbar": {
                            paddingLeft: 2,
                            paddingRight: 2,
                          },
                        }}
                      />
                    </Paper>
                  )}
                </Box>
              </Paper>
            )}
          </Box>
          {/* Cột bên trái */}
          <Box className="flex flex-col md:w-[400px]">
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                    backgroundColor: "#FDEDE8",
                    borderRadius: "4px",
                    color: "#FB9F87",
                    border: "1px solid #FB9F8750",
                  }}
                >
                  <IconAlertCircle className="w-4 h-4" />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#FB9F87" }}
                >
                  Vui lòng chọn khách ảo trước khi đặt hàng !
                </Typography>
              </Box>
              <Box className="flex items-center gap-2 mb-3">
                <FormControl fullWidth>
                  <Autocomplete
                    options={validUsers?.data.data || []}
                    getOptionLabel={(option) => option.fullName}
                    value={selectedUser}
                    onChange={(event, newValue) => {
                      if (newValue) handleSelectUser(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                      debouncedUserSearch(newInputValue);
                    }}
                    loading={isLoadingValidUsers}
                    filterOptions={(x) => x} // Disable client-side filtering as we're using backend search
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tìm kiếm người dùng"
                        variant="outlined"
                        size="small"
                        className="bg-white"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <IconSearch className="w-4 h-4" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                          endAdornment: (
                            <>
                              {isLoadingValidUsers ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 500,
                              fontSize: 14,
                              ...getCustomerColor(option),
                            }}
                          >
                            {option.fullName?.substring(0, 2).toUpperCase()}
                          </Box>
                          <Box>
                            <Typography>{option.fullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.phone || "Chưa có số điện thoại"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  />
                </FormControl>
                <IconButton
                  sx={{
                    height: "36px",
                    width: "36px",
                    backgroundColor: "#4570EA !important",
                    color: "#fff !important",
                  }}
                  size="small"
                  className="flex-shrink-0 !rounded-[4px]"
                  onClick={handleOpenDialog}
                >
                  <IconMapPinPin className="w-5 h-5" />
                </IconButton>
              </Box>
            </Box>
            <Paper className="p-4 mt-5 bg-white">
              {totalSelectedProducts > 0 && (
                <Box className="mb-4 text-center">
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#3F6AD8" }}
                  >
                    Tổng sản phẩm đã chọn ({totalSelectedProducts})
                  </Typography>
                </Box>
              )}
              <Box sx={{ padding: 0 }}>
                <Box className={styles.selectedProducts}>
                  {selectedProducts.length > 0 ? (
                    <>
                      <List>
                        {selectedProducts.map((item, index) => {
                          const product = (item as any).product;
                          return (
                            <ListItem
                              key={`${item.id}-${index}`}
                              sx={{
                                borderBottom: "1px solid #e0e0e0",
                                "&:last-child": { borderBottom: "none" },
                                "&:first-child": { paddingTop: "0px" },
                                display: "flex",
                                flexDirection: "column",
                                padding: "16px 0px",
                              }}
                            >
                              <Box className="flex items-start w-full gap-2">
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flexShrink: 0,
                                  }}
                                >
                                  <Image
                                    src={getFirstImage(product.imageUrls)}
                                    alt={product.name}
                                    className="w-24 h-24 object-cover rounded-[4px] border flex-shrink-0"
                                    width={200}
                                    height={200}
                                    draggable={false}
                                  />
                                </Box>
                                <Box>
                                  <Typography variant="body1">
                                    {product.name.slice(0, 100) +
                                      (product.name.length > 100 ? "..." : "")}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexDirection: "column",
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    sx={{
                                      border: "2px solid #FDEDE8",
                                      bgcolor: "#FDEDE8",
                                      mb: 1,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeProduct(index);
                                    }}
                                    color="error"
                                  >
                                    <IconTrash className="w-3 h-3" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(item.id, -1);
                                    }}
                                    sx={{ border: "1px solid #e0e0e0" }}
                                  >
                                    <IconMinus className="w-3 h-3" />
                                  </IconButton>
                                  <Box
                                    sx={{
                                      minWidth: "30px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {quantities[item.id] || 1}
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(item.id, 1);
                                    }}
                                    sx={{ border: "1px solid #e0e0e0" }}
                                  >
                                    <IconPlus className="w-3 h-3" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  mt: 2,
                                  width: "100%",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <span className="text-xs font-semibold text-main-gunmetal-blue">
                                    Giá niêm yết:
                                  </span>
                                  <span className="text-xs !text-green-500">
                                    ${formatNumber(Number(item.salePrice))}
                                  </span>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <span className="text-xs font-semibold text-main-gunmetal-blue">
                                    Giá nhập:
                                  </span>
                                  <span className="text-xs !text-amber-500">
                                    ${formatNumber(Number(item.price))}
                                  </span>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <span className="text-xs font-semibold text-main-gunmetal-blue">
                                    Lợi nhuận:
                                  </span>
                                  <span className="text-xs !text-red-500 font-bold">
                                    ${formatNumber(Number(item.profit))}
                                  </span>
                                </Box>
                              </Box>
                            </ListItem>
                          );
                        })}
                      </List>
                      <Box
                        sx={{
                          width: "100%",
                          pt: 2,
                          borderTop: "1px solid #e0e0e0",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            fontSize="14px"
                            sx={{ fontWeight: 600, color: "#2c3e50" }}
                          >
                            Tổng:
                          </Typography>
                          <span className="font-normal text-gray-400">
                            $
                            {formatNumber(
                              selectedProducts.reduce(
                                (sum, item) =>
                                  sum +
                                  Number(item.salePrice) *
                                    (quantities[item.id] || 1),
                                0
                              )
                            )}
                          </span>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            fontSize="14px"
                            sx={{ fontWeight: 600, color: "#2c3e50" }}
                          >
                            Thuế:
                          </Typography>
                          <span className="font-normal text-gray-400">
                            $0.00
                            {/* {(
                              selectedProducts.reduce(
                                (sum, item) => sum + Number(item.salePrice) * (quantities[item.id] || 1),
                                0,
                              ) * 0.08
                            )} */}
                          </span>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            fontSize="14px"
                            sx={{ fontWeight: 600, color: "#2c3e50" }}
                          >
                            Đang chuyển hàng:
                          </Typography>
                          <span className="font-normal text-gray-400">
                            $0.00
                          </span>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            fontSize="14px"
                            sx={{ fontWeight: 600, color: "#2c3e50" }}
                          >
                            Giảm giá:
                          </Typography>
                          <span className="font-normal text-gray-400">
                            $0.00
                          </span>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 2,
                            pt: 2,
                            borderTop: "1px solid #e0e0e0",
                          }}
                        >
                          <Typography
                            fontSize="14px"
                            sx={{ fontWeight: 700, color: "#2c3e50" }}
                          >
                            Toàn bộ:
                          </Typography>

                          <Box className="h-6 bg-[#E6F9FF] text-[#22E0BE] font-normal rounded-[4px] px-2 text-sm flex items-center justify-center border-none">
                            ${" "}
                            {formatNumber(
                              selectedProducts.reduce(
                                (sum, item) =>
                                  sum +
                                  Number(item.salePrice) *
                                    (quantities[item.id] || 1),
                                0
                              )
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <Box className="flex items-center justify-center h-[20%] col-span-3">
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={"Chưa có sản phẩm nào được chọn."}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 4, alignItems: 'center' }}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái đơn hàng</InputLabel>
                  <Select
                    size="small"
                    label="Trạng thái đơn hàng"
                    value={orderStatusUI}
                    onChange={(e) => setOrderStatusUI(e.target.value)}
                  >
                    <MenuItem value="pending">Đang chờ xử lý</MenuItem>
                    <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                    <MenuItem value="shipping">Đang trên đường đi</MenuItem>
                    <MenuItem value="delivered">Đã giao hàng</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Phạm vi giao hàng</InputLabel>
                  <Select
                    size="small"
                    label="Phạm vi giao hàng"
                    value={deliveryScope}
                    onChange={(e) => setDeliveryScope(e.target.value as 'domestic' | 'global')}
                  >
                    <MenuItem value="domestic">Nội địa</MenuItem>
                    <MenuItem value="global">Quốc tế</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ mt: 2, width: '100%' }}>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={handleCreateFakeOrder}
                  disabled={selectedProducts.length === 0 || !selectedUser}
                  sx={{
                    backgroundColor: selectedProducts.length === 0 || !selectedUser ? "#5D87FF90 !important" : "#5D87FF !important",
                    minWidth: '80px',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                    color: "white !important",
                    textTransform: "none"
                  }}
                >
                  Đặt hàng
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "60vw",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle fontSize={18}>Thêm địa chỉ mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ width: "100%" }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tên người nhận hàng"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    margin="normal"
                  />
                </Box>
                <Box sx={{ width: "calc(50% - 8px)" }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    type="email"
                  />
                </Box>
                <Box sx={{ width: "calc(50% - 8px)" }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    margin="normal"
                    type="tel"
                  />
                </Box>
                <Box sx={{ width: "calc(33.33% - 16px)" }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Quốc gia</InputLabel>
                    <Select
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      label="Quốc gia"
                    >
                      {countries?.data?.data.map((country) => (
                        <MenuItem key={country.id} value={country.id}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: "calc(33.33% - 16px)" }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Bang/Tỉnh</InputLabel>
                    <Select
                      value={selectedState}
                      onChange={handleStateChange}
                      label="Bang/Tỉnh"
                    >
                      {states?.data?.data.map((state) => (
                        <MenuItem key={state.id} value={state.id}>
                          {state.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: "calc(33.33% - 16px)" }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Thành phố</InputLabel>
                    <Select
                      value={selectedCity}
                      onChange={handleCityChange}
                      label="Thành phố"
                    >
                      {cities?.data?.data.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: "calc(33.33% - 16px)" }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mã bưu điện"
                    value={selectedPostalCode}
                    onChange={(e) => setSelectedPostalCode(e.target.value)}
                  />
                </Box>
                <Box sx={{ width: "100%" }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Địa chỉ chi tiết"
                    value={address}
                    onChange={handleAddressChange}
                    margin="normal"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className="mx-4 mb-4">
          <Button
            className="!normal-case"
            variant="outlined"
            onClick={handleCloseDialog}
          >
            Huỷ bỏ
          </Button>
          <Button
            className="!normal-case"
            onClick={handleSaveAddressAndCreateUser}
            variant="contained"
            disabled={!newUserName}
            sx={{
              backgroundColor: "#5D87FF",
              "&:hover": { backgroundColor: "#4570EA" },
            }}
          >
            Lưu địa chỉ và tạo người dùng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle fontSize={18}>Xác nhận đơn hàng</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "30px",
                  height: "30px",
                  backgroundColor: "#ECF2FF",
                  borderRadius: "4px",
                  color: "#5D87FF",
                  border: "1px solid #5D87FF50",
                }}
              >
                <IconAlertCircle className="w-4 h-4" />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#3F6AD8" }}
              >
                Chi tiết đơn hàng
              </Typography>
            </Box>

            <Paper elevation={1} sx={{ borderRadius: 1, p: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography sx={{ display: "flex", alignItems: "center" }}>
                  <IconUser
                    className="w-4 h-4 mr-2"
                    style={{ color: "#3F6AD8" }}
                  />
                  <span className="mr-1 font-bold">Khách hàng: </span>
                  <span>{selectedUser?.fullName}</span>
                </Typography>
                <Typography sx={{ display: "flex", alignItems: "center" }}>
                  <IconMail
                    className="w-4 h-4 mr-2"
                    style={{ color: "#3F6AD8" }}
                  />
                  <span className="mr-1 font-bold">Email: </span>
                  <span>{selectedUser?.email}</span>
                </Typography>
                <Typography sx={{ display: "flex", alignItems: "center" }}>
                  <IconPhone
                    className="w-4 h-4 mr-2"
                    style={{ color: "#3F6AD8" }}
                  />
                  <span className="mr-1 font-bold">Số điện thoại:</span>
                  <span>{selectedUser?.phone}</span>
                </Typography>
                <Typography sx={{ display: "flex", alignItems: "center" }}>
                  <IconMapPin
                    className="w-4 h-4 mr-2"
                    style={{ color: "#3F6AD8" }}
                  />
                  <span className="mr-1 font-bold">Địa chỉ:</span>
                  <span>{selectedUser?.address}</span>
                </Typography>
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <IconCalendar
                    className="w-4 h-4 mr-2"
                    style={{ color: "#3F6AD8" }}
                  />
                  <span className="mr-1 font-bold">Thời gian đặt hàng:</span>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      mt: 2,
                      width: "100%",
                    }}
                  >
                    <TextField
                      type="date"
                      size="small"
                      label="Ngày"
                      value={orderDateTime.format("YYYY-MM-DD")}
                      onChange={(e) => {
                        const [year, month, day] = e.target.value.split("-");
                        const newDate = orderDateTime
                          .year(parseInt(year))
                          .month(parseInt(month) - 1)
                          .date(parseInt(day));
                        setOrderDateTime(newDate);
                      }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "150px" }}
                    />

                    <TextField
                      type="number"
                      size="small"
                      label="Giờ"
                      value={hour}
                      onChange={(e) => {
                        setHour(parseInt(e.target.value));
                      }}
                      inputProps={{ min: 0, max: 23 }}
                      sx={{ width: "80px" }}
                    />

                    <TextField
                      type="number"
                      size="small"
                      label="Phút"
                      value={minute}
                      onChange={(e) => {
                        setMinute(parseInt(e.target.value));
                      }}
                      inputProps={{ min: 0, max: 59 }}
                      sx={{ width: "80px" }}
                    />

                    <TextField
                      type="number"
                      size="small"
                      label="Giây"
                      value={second}
                      onChange={(e) => {
                        setSecond(parseInt(e.target.value));
                      }}
                      inputProps={{ min: 0, max: 59 }}
                      sx={{ width: "80px" }}
                    />
                  </Box>
                </Typography>
              </Box>
            </Paper>
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                    backgroundColor: "#E6F9FF",
                    borderRadius: "4px",
                    color: "#33C4FF",
                    border: "1px solid #33C4FF50",
                  }}
                >
                  <IconBrandProducthunt className="w-4 h-4" />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#3F6AD8" }}
                >
                  Sản phẩm đã chọn
                </Typography>
              </Box>

              <Paper elevation={1} sx={{ borderRadius: 1 }}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      mb: 1,
                      fontWeight: 600,
                      p: 2,
                      pb: 1,
                    }}
                  >
                    <Box sx={{ width: "50%" }}>Tên sản phẩm</Box>
                    <Box sx={{ width: "20%" }}>Số lượng</Box>
                    <Box sx={{ width: "15%" }}>Đơn giá</Box>
                    <Box sx={{ width: "15%" }}>Thành tiền</Box>
                  </Box>
                  {selectedProducts.map((item, index) => {
                    const product = (item as any).product;
                    return (
                      <Box
                        key={item.id}
                        sx={{
                          display: "flex",
                          py: 1,
                          px: 2,
                          borderBottom: "1px solid #f0f0f0",
                          alignItems: "center",
                          backgroundColor:
                            index % 2 === 0 ? "#f5f5f5" : "inherit",
                        }}
                      >
                        <Box sx={{ width: "50%" }}>
                          <Typography className="font-semibold">
                            {product.name}
                          </Typography>
                        </Box>
                        <Box sx={{ width: "20%" }}>
                          <Typography>
                            {formatNumber(quantities[item.id] || 1)}
                          </Typography>
                        </Box>
                        <Box sx={{ width: "15%" }}>
                          <Typography>
                            ${formatNumber(Number(item.salePrice))}
                          </Typography>
                        </Box>
                        <Box sx={{ width: "15%" }}>
                          <Typography fontWeight={600}>
                            $
                            {formatNumber(
                              Number(item.salePrice) *
                                (quantities[item.id] || 1)
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Box>
            <Box
              sx={{
                mt: 3,
                pt: 2,
                borderTop: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#2c3e50" }}
              >
                Tổng cộng:
              </Typography>
              <Box className="h-6 bg-blue-50 text-blue-500 font-normal rounded-[4px] px-2 text-sm flex items-center justify-center border-none w-fit">
                $
                {formatNumber(
                  selectedProducts.reduce(
                    (sum, item) =>
                      sum + Number(item.salePrice) * (quantities[item.id] || 1),
                    0
                  )
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            className="!normal-case"
            variant="outlined"
            onClick={() => setConfirmOpen(false)}
            sx={{ color: "#5D87FF", borderColor: "#5D87FF" }}
            disabled={isCreatingOrder}
          >
            Hủy bỏ
          </Button>
          <Button
            className="!normal-case"
            onClick={handleConfirmOrder}
            variant="outlined"
            disabled={isCreatingOrder}
            sx={{
              backgroundColor: "#5D87FF",
              "&:hover": { backgroundColor: "#4570EA" },
              ...(isCreatingOrder && {
                backgroundColor: "#a0aec0",
                "&:hover": { backgroundColor: "#a0aec0" },
              }),
            }}
          >
            {isCreatingOrder ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                Đang xử lý...
              </Box>
            ) : (
              <span className="text-white">Xác nhận đặt hàng</span>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default AdminPosPage;
