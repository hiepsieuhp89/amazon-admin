"use client"

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material"
import { IconArrowLeft, IconUpload, IconX } from "@tabler/icons-react"
import { message } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { useCreateCategory, useGetAllCategories } from "@/hooks/category"
import { useUploadImage } from "@/hooks/image"

// Add NestedMenuItem and buildNestedCategories from products page
const NestedMenuItem = ({ category, level = 0 }: { category: any, level?: number }) => {
  const paddingLeft = level * 20;
  const isParent = category?.children?.length > 0;

  return (
    <>
      <MenuItem 
        value={category.id} 
        style={{ 
          paddingLeft: `${paddingLeft}px`,
          paddingRight: isParent ? '24px' : '16px',
          fontWeight: isParent ? '600' : '400',
          backgroundColor: isParent ? '#f5f5f5' : 'transparent'
        }}
        disabled={isParent}
      >
        {category.name}
      </MenuItem>
      {category?.children?.map((child: any) => (
        <NestedMenuItem key={child.id} category={child} level={level + 1} />
      ))}
    </>
  );
};

// Hàm tạo ID theo định dạng UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function CreateCategoryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    imageUrl: "",
  })
  const [errors, setErrors] = useState({
    name: "",
  })
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const createCategoryMutation = useCreateCategory()
  const uploadImageMutation = useUploadImage()
  const { data: categoriesData } = useGetAllCategories({
    page: 1,
    take: 1000,
    order: "ASC"
  })

  // Filter to get only parent categories (categories with no parent)
  const parentCategories = (categoriesData?.data?.data || []).filter(
    (category: any) => !category.parentId
  );

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      name: "",
    }

    // Validate name
    if (formData.name.trim().length < 2) {
      newErrors.name = "Tên danh mục phải có ít nhất 2 ký tự"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement
    
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      setFormData((prev) => ({
        ...prev,
        imageUrl: "image-url-placeholder",
      }))
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      message.error("Vui lòng kiểm tra lại thông tin nhập")
      return
    }
    
    try {
      let updatedFormData = { ...formData }
      
      if (imageFile) {
        message.loading({ content: "Đang tải hình ảnh lên...", key: "uploadImage" })
        
        const uploadResult = await uploadImageMutation.mutateAsync({
          file: imageFile,
          isPublic: true,
          description: `Hình ảnh cho danh mục: ${formData.name}`
        })
        
        message.success({ content: "Tải hình ảnh thành công!", key: "uploadImage" })
        
        // Cập nhật URL hình ảnh từ kết quả tải lên
        updatedFormData = {
          ...updatedFormData,
          imageUrl: uploadResult.data.url
        }
      }
      
      await createCategoryMutation.mutateAsync({
        ...updatedFormData,
        id: generateId(),
      })
      message.success("Danh mục đã được tạo thành công!")
      router.push("/admin/categories")
    } catch (error: any) {
      if (error?.response?.status === 400) {
        message.error("Tên danh mục này đã tồn tại")
      } else {
        message.error("Không thể tạo danh mục. Vui lòng thử lại.")
      }
      console.error(error)
    }
  }

  return (
    <div className="p-6">
      <Box className="flex items-center justify-between mb-4">
        <Button
          variant="text"
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push("/admin/categories")}
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
          Tạo danh mục mới
        </Typography>
      </Box>

      <Paper className="p-6 border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <TextField
                size="small"
                label="Tên danh mục"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                className="rounded"
                error={!!errors.name}
                helperText={errors.name}
              />
            </div>
            <div>
              <FormControl fullWidth size="small">
                <InputLabel id="parentId-label">Danh mục cha</InputLabel>
                <Select
                  required
                  labelId="parentId-label"
                  name="parentId"
                  value={formData.parentId}
                  label="Danh mục cha"
                  onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>)}
                >
                  <MenuItem value="">Không có</MenuItem>
                  {parentCategories.map((category) => (
                    <MenuItem 
                      key={category.id} 
                      value={category.id}
                    >
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <TextField
                size="small"
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                className="rounded"
              />
            </div>
            <div>
              <Typography fontSize={14} variant="subtitle1" className="!mb-2">
                Hình ảnh danh mục
              </Typography>
              {imagePreview ? (
                <div className="relative flex-1 w-full h-32 overflow-hidden border border-gray-600 rounded">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute p-1 transition-colors bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                  >
                    <IconX size={16} color="white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 transition-colors border border-gray-500 border-dashed !rounded-lg cursor-pointer">
                  <div className="flex flex-col items-center justify-center py-4">
                    <IconUpload size={24} className="mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400">Upload hình ảnh</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <Box className="flex justify-end gap-4">
            <Button
              className="!normal-case"
              type="button"
              variant="outlined"
              onClick={() => router.push("/admin/categories")}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createCategoryMutation.isPending}
              className="text-black !bg-main-golden-orange hover:bg-amber-600 !normal-case"
            >
              {createCategoryMutation.isPending ? (
                <CircularProgress size={16} className="text-white" />
              ) : (
                "Tạo danh mục"
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </div>
  )
} 