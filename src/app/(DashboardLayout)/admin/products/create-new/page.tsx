"use client"

import React, { useState } from 'react';
import { Box, Button, CircularProgress, Paper, TextField, Typography, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { IconUpload, IconX, IconPlus, IconCubePlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { message } from "antd"
import { useCreateProduct } from '@/hooks/product';
import { useUploadImage } from '@/hooks/image';
import { ICreateProduct } from '@/interface/request/product';
import { useGetAllCategories } from "@/hooks/category";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import styles for the editor

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
          paddingLeft: `${Math.max(paddingLeft, 24)}px`,
          paddingRight: '24px',
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

const buildNestedCategories = (categories: any[]) => {
  const categoryMap = new Map();
  const rootCategories: any[] = [];

  // First pass: create map of all categories including parents
  categories.forEach(category => {
    // Add current category
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

export default function CreateProductPage() {
  const router = useRouter();
  const createProductMutation = useCreateProduct();
  const uploadImageMutation = useUploadImage();
  const { data: categoriesData } = useGetAllCategories({ take: 1000 });

  const [formData, setFormData] = useState<ICreateProduct>({
    name: '',
    description: '',
    imageUrls: [],
    categoryId: '',
    salePrice: '',
    price: '',
    stock: 0
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  const [selectOpen, setSelectOpen] = useState(false);

  // Build nested categories structure
  const nestedCategories = buildNestedCategories(categoriesData?.data?.data || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreviews(prev => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare the payload
      let payload: ICreateProduct = {
        name: formData.name,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price.toString()) : 0,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice.toString()) : 0,
        stock: typeof formData.stock === 'string' ? parseInt(formData.stock, 10) : formData.stock,
        categoryId: formData.categoryId || undefined,
        imageUrls: []
      };

      // Upload images if available
      if (imageFiles.length > 0) {
        message.loading({ content: "Đang tải hình ảnh lên...", key: "uploadImage" });

        try {
          const uploadedUrls: string[] = [];

          // Upload each image
          for (const file of imageFiles) {
            const uploadResult = await uploadImageMutation.mutateAsync({
              file: file,
              isPublic: true,
              description: `Hình ảnh cho sản phẩm: ${formData.name}`
            });

            uploadedUrls.push(uploadResult.data.url);
          }

          message.success({ content: "Tải hình ảnh thành công!", key: "uploadImage" });

          // Add the image URLs to the payload
          payload.imageUrls = uploadedUrls;
        } catch (error) {
          message.error({ content: "Lỗi khi tải hình ảnh!", key: "uploadImage" });
          console.error("Image upload error:", error);
          return; // Stop if image upload fails
        }
      }

      // Create the product
      message.loading({ content: "Đang tạo sản phẩm...", key: "createProduct" });
      await createProductMutation.mutateAsync(payload);

      message.success({ content: "Sản phẩm đã được tạo thành công!", key: "createProduct" });
      router.push("/admin/products");
    } catch (error) {
      message.error({ content: "Không thể tạo sản phẩm. Vui lòng thử lại.", key: "createProduct" });
      console.error("Product creation error:", error);
    }
  };

  return (
    <div className='flex flex-col h-full min-h-screen'>
      <Box className="py-8">
        <Box className="relative" />
        <Box className="relative flex flex-col items-center gap-2">
          <Box className="p-4 mb-3 rounded-full shadow-lg bg-gradient-to-r from-amber-100 to-orange-100">
            <IconCubePlus size={36} className="text-main-golden-orange" />
          </Box>
          <Typography variant="h3" className="font-semibold tracking-wide text-center uppercase text-main-charcoal-blue">
            Thêm sản phẩm mới
          </Typography>
        </Box>
      </Box>
      <Box className='flex flex-col flex-1 p-6'>
        <Paper className="flex flex-col flex-1 h-full p-6">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full space-y-4">
            <Box className="flex gap-6">
              {/* Left Column */}
              <Box className="w-2/3">
                <Typography fontSize={14} variant="subtitle1" className="!mb-4">
                  Thông tin sản phẩm
                </Typography>
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
                    />
                  </Box>

                  <Box className="flex gap-6">
                    <Box className="flex-1">
                      <TextField
                        size="small"
                        label="Giá"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        fullWidth
                        variant="outlined"
                        className="rounded"
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
                      />
                    </Box>
                  </Box>

                  <Box className="flex gap-6">
                    <Box className="flex-1">
                      <FormControl fullWidth size="small">
                        <InputLabel id="categoryId-label">Danh mục</InputLabel>
                        <Select
                          labelId="categoryId-label"
                          name="categoryId"
                          value={formData.categoryId}
                          label="Danh mục"
                          displayEmpty
                          open={selectOpen}
                          onOpen={() => setSelectOpen(true)}
                          onClose={() => setSelectOpen(false)}
                          renderValue={() => selectedCategoryName}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                          }}
                          required
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
                                setSelectOpen(false); // Close the dropdown after selection
                              }}
                            />
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

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
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
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
                </Box>
              </Box>

              {/* Right Column - Image Upload */}
              <Box className="w-1/3">
                <Box>
                  <Typography fontSize={14} variant="subtitle1" className="!mb-4">
                    Hình ảnh sản phẩm
                  </Typography>

                  {imagePreviews.length > 0 ? (
                    <Box>
                      <Box className="flex justify-end mb-2">
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          startIcon={<IconX size={16} />}
                          onClick={() => {
                            setImagePreviews([]);
                            setImageFiles([]);
                          }}
                          className="!normal-case"
                        >
                          Xoá tất cả
                        </Button>
                      </Box>
                      <Box >
                        {imagePreviews.map((preview, index) => (
                          <Box key={index}>
                            <Box className="relative overflow-hidden border border-gray-600 rounded aspect-square">
                              <img
                                src={preview}
                                alt={`Product preview ${index}`}
                                className="object-cover w-full h-full"
                              />
                              <IconButton
                                onClick={() => removeImage(index)}
                                className="absolute z-10 p-1 transition-colors rounded-full top-2 right-2 hover:bg-red-600"
                                size="small"
                              >
                                <IconX size={16} color="white" />
                              </IconButton>
                            </Box>
                          </Box>
                        ))}
                        <Box>
                          <label className="flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-md cursor-pointer aspect-square">
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
                      </Box>
                    </Box>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 transition-colors border border-gray-500 border-dashed !rounded-lg cursor-pointer">
                      <div className="flex flex-col items-center justify-center py-4">
                        <IconUpload size={24} className="mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">Upload hình ảnh</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                    </label>
                  )}
                </Box>
              </Box>
            </Box>

            <Box className="flex flex-col items-end justify-end flex-1 gap-4">
         <Box className="flex items-end justify-end gap-4">
              <Button
                className="!normal-case"
                type="button"
                variant="outlined"
                onClick={() => router.push("/admin/products")}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createProductMutation.isPending}
                className="text-black !bg-main-golden-orange hover:bg-amber-600 !normal-case"
              >
                {createProductMutation.isPending ? (
                  <CircularProgress size={24} className="text-gray-800" />
                ) : (
                  "Tạo sản phẩm"
                )}
              </Button>
            </Box>
         </Box>
          </form>
        </Paper>
      </Box>
    </div>
  );
}