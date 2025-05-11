"use client";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { IconArrowLeft, IconEdit, IconTrash, IconMessage } from "@tabler/icons-react";
import { message } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetAllSellerPackages } from "@/hooks/seller-package";
import { useGetAllSpreadPackages } from "@/hooks/spread-package";
import { useDeleteUser, useGetUserById, useUpdateUser } from "@/hooks/user";
import { ISellerPackage } from "@/interface/response/seller-package";
import { ISpreadPackage } from "@/interface/response/spread-package";
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  return `${dateString}T00:00`;
};
function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    phone: "",
    role: "user",
    isActive: false,
    balance: 0,
    fedexBalance: 0,
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankBranch: "",
    bankNumber: "",
    bankCode: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    stars: 0,
    reputationPoints: 0,
    shopName: "",
    shopAddress: "",
    sellerPackageExpiry: "",
    spreadPackageExpiry: "",
    invitationCode: "",
    referralCode: "",
    sellerPackageId: "",
    spreadPackageId: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });
  const [sellerPackages, setSellerPackages] = useState<ISellerPackage[]>([]);
  const [spreadPackages, setSpreadPackages] = useState<ISpreadPackage[]>([]);

  const { data: userData, isLoading, error } = useGetUserById(id);
  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useUpdateUser();
  const { data: sellerPackageData } = useGetAllSellerPackages();
  const { data: spreadPackageData } = useGetAllSpreadPackages();

  useEffect(() => {
    if (userData?.data) {
      setFormData({
        email: userData?.data.email || "",
        username: userData.data.username,
        fullName: userData.data.fullName || "",
        phone: userData.data.phone || "",
        role: userData.data.role || "user",
        isActive: userData.data.isActive || false,
        balance: Number(userData.data.balance),
        fedexBalance: Number(userData.data.fedexBalance),
        bankName: userData.data.bankName || "",
        bankAccountNumber: userData.data.bankAccountNumber || "",
        bankAccountName: userData.data.bankAccountName || "",
        bankBranch: userData.data.bankBranch || "",
        bankNumber: userData.data.bankNumber || "",
        bankCode: userData.data.bankCode || "",
        address: userData.data.address || "",
        city: userData.data.city || "",
        district: userData.data.district || "",
        ward: userData.data.ward || "",
        stars: Number(userData.data.stars),
        reputationPoints: Number(userData.data.reputationPoints),
        shopName: userData.data.shopName || "",
        shopAddress: userData.data.shopAddress || "",
        sellerPackageExpiry: formatDateForInput(
          userData.data.sellerPackageExpiry || ""
        ),
        spreadPackageExpiry: formatDateForInput(
          userData.data.spreadPackageExpiry || ""
        ),
        invitationCode: userData.data.invitationCode || "",
        referralCode: userData.data.referralCode || "",
        sellerPackageId: userData.data.sellerPackageId || "",
        spreadPackageId: userData.data.spreadPackageId || "",
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Vui lòng kiểm tra lại thông tin nhập");
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id,
        payload: {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          fullName: formData.fullName,
          role: formData.role,
          shopName: formData.shopName,
          shopAddress: formData.shopAddress,
          balance: formData.balance.toString(),
          fedexBalance: formData.fedexBalance.toString(),
          invitationCode: formData.invitationCode,
          sellerPackageId: formData.sellerPackageId,
          sellerPackageExpiry: formData.sellerPackageExpiry,
          spreadPackageId: formData.spreadPackageId,
          spreadPackageExpiry: formData.spreadPackageExpiry,
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
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
            </div>
            <div>
              <TextField
                size="small"
                label="Tên đăng nhập"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                className="rounded"
                disabled={true} // Không cho phép thay đổi username
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <TextField
                size="small"
                label="Họ tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                className="rounded"
                disabled={!isEditing}
              />
            </div>
            <div>
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
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <FormControl fullWidth size="small" disabled={!isEditing}>
                <InputLabel id="role-label">Vai trò</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  label="Vai trò"
                  onChange={(e) =>
                    handleChange(
                      e as React.ChangeEvent<
                        HTMLInputElement | { name?: string; value: unknown }
                      >
                    )
                  }
                >
                  <MenuItem value="user">Người dùng</MenuItem>
                  <MenuItem value="shop">Người bán</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div>
              <TextField
                size="small"
                label="Số dư"
                name="balance"
                type="number"
                value={formData.balance}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                className="rounded"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Typography fontSize={14} variant="subtitle1">
              Trạng thái tài khoản
            </Typography>
            <FormControlLabel
              label={formData.isActive ? "Đang hoạt động" : "Đã khóa"}
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleChange}
                  name="isActive"
                  color="primary"
                  disabled={!isEditing}
                />
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <TextField
                size="small"
                label="Fedex Balance"
                name="fedexBalance"
                type="number"
                value={formData.fedexBalance}
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
                label="Bank Account Number"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
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
              <TextField
                size="small"
                label="Address"
                name="address"
                value={formData.address}
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
                label="City"
                name="city"
                value={formData.city}
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
              <FormControl fullWidth size="small" disabled={!isEditing}>
                <InputLabel>Gói Seller</InputLabel>
                <Select
                  name="sellerPackageId"
                  value={formData.sellerPackageId || ""}
                  label="Gói Seller"
                  onChange={(e) => handleChange(e as any)}
                >
                  {sellerPackages.map((pkg) => (
                    <MenuItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <TextField
                size="small"
                label="Ngày hết hạn Seller Package"
                name="sellerPackageExpiry"
                type="datetime-local"
                value={formData.sellerPackageExpiry}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                className="rounded"
                disabled={!isEditing}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <FormControl fullWidth size="small" disabled={!isEditing}>
                <InputLabel>Gói Spread</InputLabel>
                <Select
                  name="spreadPackageId"
                  value={formData.spreadPackageId || ""}
                  label="Gói Spread"
                  onChange={(e) => handleChange(e as any)}
                >
                  {spreadPackages.map((pkg) => (
                    <MenuItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <TextField
                size="small"
                label="Ngày hết hạn Spread Package"
                name="spreadPackageExpiry"
                type="datetime-local"
                value={formData.spreadPackageExpiry}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                className="rounded"
                disabled={!isEditing}
                InputLabelProps={{
                  shrink: true,
                }}
              />
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
                  // Open chat with this user
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
            {formData.fullName || formData.username}&quot;? Hành động này không
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
    </div>
  );
}

export default UserDetailPage;
