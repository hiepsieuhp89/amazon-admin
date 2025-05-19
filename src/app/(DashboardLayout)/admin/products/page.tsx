"use client"
import {
  Box,
  Button,
  ButtonGroup,
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
  Select,
  Switch,
  TableCell,
  TableRow,
  TextField,
  Typography
} from "@mui/material"
import {
  IconEye,
  IconList,
  IconPlus,
  IconSearch,
  IconTable,
  IconTrash,
  IconMoodSadDizzy,
  IconArchive,
  IconStar
} from "@tabler/icons-react"
import { message } from "antd"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
import { Lightbox } from "yet-another-react-lightbox"
import Download from "yet-another-react-lightbox/plugins/download"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"

import DataTable from "@/components/DataTable"
import { useGetAllCategories } from "@/hooks/category"
import { useDeleteProduct, useGetAllProducts, useUpdateProduct } from "@/hooks/product"

function ProductsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState("")
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [filters, setFilters] = useState({
    order: 'DESC',
    isNew: '',
    isHot: '',
    // isFeature: '',
    categoryId: '',
  });
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectOpen, setSelectOpen] = useState(false);

  const { data: categoriesData } = useGetAllCategories({ take: 1000 });
  const { data: productData, isLoading, error } = useGetAllProducts({
    page,
    take: rowsPerPage,
    search: searchTerm,
    ...filters
  })
  const deleteProductMutation = useDeleteProduct()
  const updateProductMutation = useUpdateProduct()

  const handleCreateNew = () => {
    router.push("/admin/products/create-new")
  }

  const handleView = (id: string) => {
    router.push(`/admin/products/${id}`)
  }

  const handleViewReviews = (id: string) => {
    router.push(`/admin/products/${id}/reviews`)
  }

  const openDeleteDialog = (id: string) => {
    setProductToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    try {
      await deleteProductMutation.mutateAsync(productToDelete)
      message.success("Sản phẩm đã được xóa thành công!")
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error: any) {
      if (error?.response?.status === 400) {
        message.error("Sản phẩm này đã tồn tại trong cửa hàng hoặc đơn hàng")
      } else {
        message.error("Không thể xóa sản phẩm. Vui lòng thử lại.")
      }
      console.error(error)
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(1)
  }

  const handleImageClick = (imageUrl: string) => {
    setCurrentImage(imageUrl)
    setLightboxOpen(true)
  }

  const handleToggleHot = async (id: string, isHot: boolean) => {
    try {
      await updateProductMutation.mutateAsync({
        id,
        payload: { isHot }
      })
      message.success(`Sản phẩm đã được ${isHot ? 'đánh dấu' : 'bỏ đánh dấu'} nổi bật!`)
    } catch (error) {
      message.error("Không thể cập nhật trạng thái nổi bật. Vui lòng thử lại.")
      console.error(error)
    }
  }

  const buildNestedCategories = (categories: any[]) => {
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: category.children || []
      });

      if (category.parent && !categoryMap.has(category.parent.id)) {
        categoryMap.set(category.parent.id, {
          ...category.parent,
          children: []
        });
      }
    });

    categories.forEach(category => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          if (!parent.children.some((child: any) => child.id === category.id)) {
            parent.children.push(categoryMap.get(category.id));
          }
        }
      } else {
        if (!rootCategories.some(rootCat => rootCat.id === category.id)) {
          rootCategories.push(categoryMap.get(category.id));
        }
      }
    });

    categoryMap.forEach(category => {
      if (!category.parentId && !rootCategories.some(rootCat => rootCat.id === category.id)) {
        rootCategories.push(category);
      }
    });
    return rootCategories;
  };

  const nestedCategories = buildNestedCategories(categoriesData?.data?.data || []);

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

  const filteredProducts = productData?.data?.data || []
  const pagination = productData?.data?.meta || {
    page: 1,
    take: 8,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false
  }

  const columns = [
    { key: 'name', label: 'Tên sản phẩm' },
    { key: 'price', label: 'Giá (USD)' },
    { key: 'salePrice', label: 'Giá khuyến mãi' },
    { key: 'imageUrl', label: 'Hình ảnh' },
    { key: 'stock', label: 'Số lượng' },
    { key: 'isHot', label: 'Nổi bật' },
    { key: 'category', label: 'Danh mục' },
    { key: 'actions', label: 'Thao tác' },
  ];

  const renderRow = (product: any, index: number) => (
    <TableRow
      key={product.id}
      sx={{
        "&:first-child td, &:first-child th": { borderTop: "1px solid #E0E0E0" },
        "& td": { borderBottom: "1px solid #E0E0E0" },
        backgroundColor: index % 2 !== 1 ? '#F5F5F5' : '#FFFFFF'
      }}
    >
      <TableCell sx={{ maxWidth: '200px', wordWrap: 'break-word' }}>
        <Typography
          variant="body2"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {product.name}
        </Typography>
      </TableCell>
      <TableCell>{product.price}</TableCell>
      <TableCell>{product.salePrice || '-'}</TableCell>
      <TableCell>
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <Box
            component="img"
            src={product.imageUrls[0]}
            alt={product.name}
            sx={{
              width: 50,
              height: 50,
              objectFit: 'cover',
              borderRadius: '4px',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            }}
            onClick={() => handleImageClick(product.imageUrls[0])}
          />
        ) : (
          <Box sx={{ color: 'text.secondary' }}>N/A</Box>
        )}
      </TableCell>
      <TableCell>{product.stock}</TableCell>
      <TableCell>
        <Switch
          checked={product.isHot}
          onChange={() => handleToggleHot(product.id, !product.isHot)}
          color="primary"
        />
      </TableCell>
      <TableCell>{product.category?.name || '-'}</TableCell>
      <TableCell>
        <Box className="flex items-center gap-2">
          <IconButton
            onClick={() => handleView(product.id)}
            size="medium"
            className="!bg-blue-100"
          >
            <IconEye size={18} className="text-blue-400" />
          </IconButton>
          <IconButton
            onClick={() => handleViewReviews(product.id)}
            size="medium"
            className="!bg-amber-100"
          >
            <IconStar size={18} className="text-amber-400" />
          </IconButton>
          <IconButton
            onClick={() => openDeleteDialog(product.id)}
            size="medium"
            className="!bg-red-100"
          >
            <IconTrash size={18} className="text-red-400" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );

  if (error) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen gap-2 p-8 text-center">
        <IconMoodSadDizzy size={48} className="text-gray-400" />
        <Typography variant="h6" className="mb-2 text-red-400">
          Lỗi khi tải danh sách sản phẩm
        </Typography>
        <Typography className="text-gray-400">{error.message || "Vui lòng thử lại sau"}</Typography>
      </Box>
    )
  }
  return (
    <>
     <Box className="relative flex flex-col items-center justify-center py-8">
                <Box className="absolute" />
                <Box className="relative flex flex-col items-center gap-2">
                    <Box className="p-4 mb-3 rounded-full shadow-lg bg-gradient-to-r from-amber-100 to-orange-100">
                        <IconArchive size={36} className="text-main-golden-orange" />
                    </Box>
                    <Typography variant="h3" className="font-semibold tracking-wide text-center uppercase text-main-charcoal-blue">
                        Quản lý sản phẩm
                    </Typography>
                </Box>
            </Box>
      <Box>
        <Box sx={{
          padding: 3,
          paddingBottom: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Box sx={{
            paddingBottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ flex: 1, mr: 2 }}>
              <TextField
                size="small"
                className="bg-white"
                placeholder="Tìm kiếm sản phẩm..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                className="!bg-main-golden-orange !border-main-golden-orange !text-white"
                endIcon={<IconPlus size={18} />}
                onClick={handleCreateNew}
              >
                Tạo sản phẩm mới
              </Button>
              <ButtonGroup variant="contained" aria-label="outlined button group">
                <Button
                  className={viewMode === 'table' ? '!bg-main-golden-orange !border-main-golden-orange !text-white' : 'border-main-golden-orange !bg-white !text-main-golden-orange'}
                  onClick={() => setViewMode('table')}
                  startIcon={<IconList />}
                >
                  Bảng
                </Button>
                <Button
                  className={viewMode === 'grid' ? '!bg-main-golden-orange !border-main-golden-orange !text-white' : 'border-main-golden-orange !bg-white !text-main-golden-orange'}
                  onClick={() => setViewMode('grid')}
                  startIcon={<IconTable />}
                >
                  Lưới
                </Button>
              </ButtonGroup>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                className="bg-white"
                value={filters.order}
                label="Sắp xếp"
                onChange={(e) => setFilters(prev => ({ ...prev, order: e.target.value }))}
              >
                <MenuItem value="DESC">Mới nhất</MenuItem>
                <MenuItem value="ASC">Cũ nhất</MenuItem>
              </Select>
            </FormControl>

            <FormControl  size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Sản phẩm mới</InputLabel>
              <Select
                className="bg-white"
                value={filters.isNew}
                label="Sản phẩm mới"
                onChange={(e) => setFilters(prev => ({ ...prev, isNew: e.target.value }))}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="true">Có</MenuItem>
                <MenuItem value="false">Không</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Nổi bật</InputLabel>
              <Select
                className="bg-white"
                value={filters.isHot}
                label="Nổi bật"
                onChange={(e) => setFilters(prev => ({ ...prev, isHot: e.target.value }))}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="true">Có</MenuItem>
                <MenuItem value="false">Không</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                className="bg-white"
                value={filters.categoryId}
                label="Danh mục"
                open={selectOpen}
                onOpen={() => setSelectOpen(true)}
                onClose={() => setSelectOpen(false)}
                renderValue={() => selectedCategoryName || 'Tất cả'}
              >
                <MenuItem value="" onClick={() => {
                  setFilters(prev => ({ ...prev, categoryId: '' }));
                  setSelectedCategoryName('');
                  setSelectOpen(false);
                }}>
                  Tất cả
                </MenuItem>
                {nestedCategories.map((category) => (
                  <NestedMenuItem
                    key={category.id}
                    category={category}
                    onSelect={(categoryId, categoryName) => {
                      setFilters(prev => ({ ...prev, categoryId }));
                      setSelectedCategoryName(categoryName);
                      setSelectOpen(false);
                    }}
                  />
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {viewMode === 'table' ? (
          <DataTable
            columns={columns}
            data={filteredProducts}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={setPage}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage)
              setPage(1)
            }}
            renderRow={renderRow}
            emptyMessage="Không tìm thấy sản phẩm nào"
          />
        ) : (
          <Box className="grid grid-cols-2 gap-4 p-6 pt-12 mb-10 overflow-y-auto md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.length === 0 ? (
              <Box className="flex items-center justify-center h-full col-span-3">
                <Typography variant="h6">Không tìm thấy sản phẩm nào</Typography>
              </Box>
            ) : (
              filteredProducts.map((product: any) => (
                <Box key={product.id} className="overflow-hidden transition-shadow border !rounded-[8px] shadow-sm hover:shadow-md">
                  <Box sx={{ p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      {product.imageUrls && product.imageUrls.length > 0 && (
                        <Box
                          component="img"
                          src={product.imageUrls[0]}
                          alt={product.name}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleImageClick(product.imageUrls[0])}
                        />
                      )}
                      <Box sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: '#FEF5E5',
                        color: '#FCAF17',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        px: 1,
                        py: 0.5,
                        borderRadius: '4px'
                      }}>
                        Trong kho: {product.stock}
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {product.name.slice(0, 50)}
                      {product.name.length > 50 && "..."}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <span>Giá:</span>
                        <span className="!text-green-500">${product.price}</span>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <span>Giá khuyến mãi:</span>
                        <span className="!text-amber-500">${product.salePrice || '-'}</span>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleView(product.id)}
                        startIcon={<IconEye size={16} />}
                      >
                        Xem
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        onClick={() => handleViewReviews(product.id)}
                        startIcon={<IconStar size={16} />}
                      >
                        Đánh giá
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => openDeleteDialog(product.id)}
                        startIcon={<IconTrash size={16} />}
                      >
                        Xóa
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          className: "!rounded-[6px] shadow-xl",
        }}
      >
        <DialogTitle fontSize={18}>
          Xác nhận xóa sản phẩm
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-gray-400">
            Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="!p-4 !pb-6">
          <Button
            variant="outlined"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="outlined"
            onClick={handleDeleteConfirm}
            className="text-white transition-colors !bg-red-500"
            disabled={deleteProductMutation.isPending}
          >
            {deleteProductMutation.isPending ?
              <div className="flex items-center gap-2 !text-white">
                <CircularProgress size={16} className="!text-white" />
                Đang xóa...
              </div> : <span className="!text-white">Xóa</span>}
          </Button>
        </DialogActions>
      </Dialog>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: currentImage }]}
        plugins={[Zoom, Download]}
      />
    </>
  )
}

export default ProductsPage; 