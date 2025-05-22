"use client"

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
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography
} from "@mui/material"
import {
  IconArrowLeft,
  IconEdit,
  IconPlus,
  IconTrash,
  IconUpload,
  IconX
} from "@tabler/icons-react"
import { message } from "antd"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

import { useGetAllCategories } from "@/hooks/category"
import { useUploadImage } from "@/hooks/image"
import { useDeleteProduct, useGetProductById, useUpdateProduct } from "@/hooks/product"
import { ICreateProduct } from "@/interface/request/product"

// Sử dụng dynamic import để tải ReactQuill chỉ ở phía client
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>, // Optional: Hiển thị loading state
});

const NestedMenuItem = ({ category, level = 0, onSelect }: { 
  category: any, 
  level?: number,
  onSelect: (categoryId: string, categoryName: string) => void 
}) => {
  const paddingLeft = level * 20;
  const isParent = category?.children?.length > 0;

  return (
    <>
      <MenuItem 
        value={category.id} 
        style={{ 
          paddingLeft: `${paddingLeft}px`,
          paddingRight: '16px',
          fontWeight: isParent ? '600' : '400',
          backgroundColor: isParent ? '#f5f5f5' : 'transparent'
        }}
        onClick={() => {
          if (!isParent) {
            onSelect(category.id, category.name);
          }
        }}
      >
        {category.name}
        {isParent && <span style={{ marginLeft: '8px', color: '#757575' }}>▼</span>}
      </MenuItem>
      {category?.children?.map((child: any) => (
        <NestedMenuItem 
          key={child.id} 
          category={child} 
          level={level + 1}
          onSelect={onSelect}
        />
      ))}
    </>
  );
};

function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<ICreateProduct>({
    name: '',
    description: '',
    imageUrls: [],
    categoryId: '',
    salePrice: '',
    price: '',
    stock: 0,
    isHot: false
  })
  const [selectOpen, setSelectOpen] = useState(false)
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('')

  const { data: productData, isLoading, error } = useGetProductById(id)
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategories({ take: 1000 })
  const deleteProductMutation = useDeleteProduct()
  const updateProductMutation = useUpdateProduct()
  const uploadImageMutation = useUploadImage()
  const buildNestedCategories = (categories: any[]) => {
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    categories.forEach(category => {
      categoryMap.set(category.id, { 
        ...category, 
        children: category.children || [] 
      });

      // Add parent category if it exists and not already in map
      if (category.parent && !categoryMap.has(category.parent.id)) {
        categoryMap.set(category.parent.id, {
          ...category.parent,
          children: []
        });
      }
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          // Only add if not already in children array
          if (!parent.children.some((child: any) => child.id === category.id)) {
            parent.children.push(categoryMap.get(category.id));
          }
        }
      } else {
        // Add to root categories if it's a root category
        if (!rootCategories.some(rootCat => rootCat.id === category.id)) {
          rootCategories.push(categoryMap.get(category.id));
        }
      }
    });

    // Add any remaining parent categories that weren't in the original list
    categoryMap.forEach(category => {
      if (!category.parentId && !rootCategories.some(rootCat => rootCat.id === category.id)) {
        rootCategories.push(category);
      }
    });
    return rootCategories;
  };

  const nestedCategories = categoriesData?.data?.data ? buildNestedCategories(categoriesData.data.data) : [];

  useEffect(() => {
    if (productData?.data && categoriesData?.data?.data) {
      const product = productData.data;
      const categories = categoriesData.data.data;
      
      // Find the category name if it exists
      let categoryName = '';
      if (product.category?.id) {
        const foundCategory = categories.find(cat => cat.id === product.category.id);
        if (foundCategory) {
          categoryName = foundCategory.name;
        }
      }
      
      setFormData({
        name: product.name,
        description: product.description || "",
        imageUrls: product.imageUrls || [],
        categoryId: product.category?.id || "",
        salePrice: product.salePrice?.toString() || "",
        price: product.price?.toString() || "",
        stock: product.stock || 0,
        isHot: product.isHot || false
      });
      setImagePreviews(product.imageUrls || []);
      setSelectedCategoryName(categoryName);
    }
  }, [productData, categoriesData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setImageFiles(prev => [...prev, ...files])

      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          setImagePreviews(prev => [...prev, event.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    
    // If we're removing an existing image (not a new file)
    if (index < (formData.imageUrls?.length || 0) && !imageFiles[index]) {
      setFormData(prev => ({
        ...prev,
        imageUrls: (prev.imageUrls || []).filter((_, i) => i !== index)
      }))
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteProductMutation.mutateAsync(id)
      message.success("Sản phẩm đã được xóa thành công!")
      router.push("/admin/products")
    } catch (error) {
      message.error("Không thể xóa sản phẩm. Vui lòng thử lại.")
      console.error("Delete error:", error)
    }
  }

  const handleBack = () => {
    router.push("/admin/products")
  }

  const handleViewReviews = () => {
    router.push(`/admin/products/${id}/reviews`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Start with current imageUrls
      let imageUrls = [...(formData.imageUrls || [])]
      
      // Upload new images if available
      if (imageFiles.length > 0) {
        message.loading({ content: "Đang tải hình ảnh lên...", key: "uploadImage" })
        
        try {
          // Upload each new image
          for (const file of imageFiles) {
            if (!file.name) continue // Skip if not a real file (might be a preview)
            
            const uploadResult = await uploadImageMutation.mutateAsync({
              file: file,
              isPublic: true,
              description: `Hình ảnh cho sản phẩm: ${formData.name}`
            })
            
            imageUrls.push(uploadResult.data.url)
          }
          
          message.success({ content: "Tải hình ảnh thành công!", key: "uploadImage" })
        } catch (error) {
          message.error({ content: "Lỗi khi tải hình ảnh!", key: "uploadImage" })
          console.error("Image upload error:", error)
          return // Stop if image upload fails
        }
      }
      
      // Prepare the payload with updated imageUrls
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price.toString()) : 0,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice.toString()) : 0,
        stock: typeof formData.stock === 'string' ? parseInt(formData.stock, 10) : formData.stock,
        categoryId: formData.categoryId || undefined,
        imageUrls: imageUrls,
        isHot: formData.isHot,
      }

      // Update the product
      message.loading({ content: "Đang cập nhật sản phẩm...", key: "updateProduct" })
      await updateProductMutation.mutateAsync({
        id,
        payload
      })

      message.success({ content: "Sản phẩm đã được cập nhật thành công!", key: "updateProduct" })
      setIsEditing(false)
      setImageFiles([]) // Reset the image files after successful upload
    } catch (error) {
      message.error({ content: "Không thể cập nhật sản phẩm. Vui lòng thử lại.", key: "updateProduct" })
      console.error("Product update error:", error)
    }
  }

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center p-6 py-12">
        <CircularProgress className="text-main-golden-orange" />
      </Box>
    )
  }

  if (error || !productData) {
    return (
      <Box className="p-8 text-center">
        <Typography variant="h6" className="mb-2 text-red-400">
          Lỗi khi tải thông tin sản phẩm
        </Typography>
        <Typography className="mb-4 text-gray-400">
          {error?.message || "Sản phẩm không tồn tại hoặc đã bị xóa"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft size={18} />}
          onClick={handleBack}
          className="text-gray-300 border-gray-500 hover:bg-gray-700"
        >
          Trở về danh sách sản phẩm
        </Button>
      </Box>
    )
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
          Chi tiết sản phẩm
        </Typography>
      </Box>

      <Paper className="p-6 border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Box className="flex flex-col gap-6">
            <Box>
              <TextField
                size="small"
                label="Tên sản phẩm"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                className="rounded"
                disabled={!isEditing}
              />
            </Box>

            <Box className="flex gap-6">
              <Box className="flex-1">
                <TextField
                  size="small"
                  label="Giá gốc"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </Box>
              <Box className="flex-1">
                <TextField
                  size="small"
                  label="Giá khuyến mãi"
                  name="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </Box>
            </Box>

            <Box className="flex gap-6">
              <Box className="flex-1">
                <TextField
                  size="small"
                  label="Số lượng"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  className="rounded"
                  disabled={!isEditing}
                />
              </Box>
              <Box className="flex-1">
                <FormControl fullWidth size="small">
                  <InputLabel id="categoryId-label">Danh mục</InputLabel>
                  <Select
                    labelId="categoryId-label"
                    name="categoryId"
                    value={formData.categoryId}
                    label="Danh mục"
                    open={selectOpen}
                    onOpen={() => setSelectOpen(true)}
                    onClose={() => setSelectOpen(false)}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        categoryId: e.target.value as string
                      }));
                    }}
                    renderValue={() => selectedCategoryName || 'Chọn danh mục'}
                    disabled={!isEditing || isCategoriesLoading}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    {nestedCategories.map((category) => (
                      <NestedMenuItem 
                        key={category.id} 
                        category={category} 
                        onSelect={(categoryId, categoryName) => {
                          setFormData(prev => ({
                            ...prev,
                            categoryId
                          }));
                          setSelectedCategoryName(categoryName);
                          setSelectOpen(false);
                        }}
                      />
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box className="flex gap-6">
              <Box className="flex-1">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isHot}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        isHot: e.target.checked
                      }))}
                      disabled={!isEditing}
                    />
                  }
                  label="Sản phẩm nổi bật"
                />
              </Box>
            </Box>

            <Box>
              <Typography fontSize={14} variant="subtitle1" className="!mb-4">
                Mô tả chi tiết
              </Typography>
              <ReactQuill
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                readOnly={!isEditing}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
                formats={[
                  'header',
                  'bold', 'italic', 'underline', 'strike',
                  'color', 'background',
                  'list', 'bullet',
                  'link', 'image'
                ]}
                className="border border-gray-300 rounded"
              />
            </Box>

            <Box>
              <Typography fontSize={14} variant="subtitle1" className="mb-4">
                Hình ảnh sản phẩm
              </Typography>
              
              {imagePreviews.length > 0 ? (
                <Box >
                  {imagePreviews.map((preview, index) => (
                    <Box key={index}>
                      <Box className="relative overflow-hidden border border-gray-600 rounded aspect-square">
                        <img
                          src={preview}
                          alt={`Product preview ${index}`}
                          className="object-cover w-full h-full"
                        />
                        {isEditing && (
                          <IconButton
                            onClick={() => removeImage(index)}
                            className="absolute p-1 transition-colors bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                            size="small"
                          >
                            <IconX size={16} color="white" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  ))}
                  
                  {isEditing && (
                    <Box>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md border-gray-300 h-full min-h-[150px] cursor-pointer">
                        <Box className="flex flex-col items-center justify-center p-4">
                          <IconPlus size={24} className="mb-2 text-gray-400" />
                          <Typography className="text-sm text-gray-400">
                            Thêm ảnh
                          </Typography>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </Box>
                      </label>
                    </Box>
                  )}
                </Box>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-32 transition-colors border border-gray-500 border-dashed !rounded-lg ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}>
                  <div className="flex flex-col items-center justify-center py-4">
                    <IconUpload size={24} className="mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400">Upload hình ảnh</p>
                  </div>
                  {isEditing && (
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageChange} 
                    />
                  )}
                </label>
              )}
            </Box>
          </Box>
        </form>

        <Box className="flex gap-2 mt-6">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="contained"
                className="text-black !bg-main-golden-orange hover:bg-amber-600"
                disabled={updateProductMutation.isPending}
                onClick={handleSubmit}
              >
                {updateProductMutation.isPending ? (
                  <CircularProgress size={24} className="text-gray-800" />
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                Hủy
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                className="text-black !bg-main-golden-orange hover:bg-amber-600"
                startIcon={<IconEdit size={18} />}
                onClick={() => setIsEditing(true)}
                type="button"
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleViewReviews}
                type="button"
              >
                Xem đánh giá
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<IconTrash size={18} />}
                onClick={() => setDeleteDialogOpen(true)}
                type="button"
              >
                Xóa sản phẩm
              </Button>
            </>
          )}
        </Box>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          className: "!rounded-[6px] shadow-xl",
        }}
      >
        <DialogTitle fontSize={18}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-400">
            Bạn có chắc chắn muốn xóa sản phẩm &quot;{formData.name}&quot;? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="!p-4 !pb-6">
          <Button
            variant="outlined"
            onClick={() => setDeleteDialogOpen(false)}
            className="!normal-case"
          >
            Hủy bỏ
          </Button>
          <Button
            variant="outlined"
            onClick={handleDeleteConfirm}
            className="!text-white transition-colors !bg-red-500 !normal-case"
            disabled={deleteProductMutation.isPending}
          >
            {deleteProductMutation.isPending ? (
              <div className="flex items-center gap-2 !text-white">
                <CircularProgress size={16} className="!text-white" />
                Đang xóa...
              </div>
            ) : (
              <span className="!text-white">Xóa</span>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ProductDetailPage 