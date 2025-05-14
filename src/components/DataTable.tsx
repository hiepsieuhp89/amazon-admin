import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from "@mui/material";
import { IconPlus } from "@tabler/icons-react";
import { ReactNode, useRef, useState } from "react";

interface DataTableProps {
  columns: { 
    key: string; 
    label: string; 
    width?: string | number 
  }[];
  data: any[];
  isLoading: boolean;
  pagination?: {  
    page: number;
    take: number;
    itemCount: number;
    pageCount?: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
  };
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  renderRow: (row: any, index: number) => ReactNode;
  emptyMessage: string;
  createNewButton?: {
    label: string;
    onClick: () => void;
  };
  searchComponent?: ReactNode;
}

export default function DataTable({
  columns,
  data,
  isLoading,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  renderRow,
  emptyMessage,
  createNewButton,
  searchComponent,
}: DataTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tableContainerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - tableContainerRef.current.offsetLeft);
      setScrollLeftStart(tableContainerRef.current.scrollLeft);
      tableContainerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed if necessary
    tableContainerRef.current.scrollLeft = scrollLeftStart - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (tableContainerRef.current) {
      setIsDragging(false);
      tableContainerRef.current.style.cursor = 'grab';
    }
  };

  return (
    <div className="flex-1 h-full p-6 pt-0 space-y-6">
      <div className="flex flex-col items-start justify-end gap-4 sm:flex-row sm:items-center">
        {searchComponent}
        {createNewButton && (
          <Button
            variant="outlined"
            startIcon={<IconPlus size={18} />}
            onClick={createNewButton.onClick}
            className="!text-white !normal-case !bg-main-golden-orange hover:!bg-main-golden-orange/80 !border-main-golden-orange transition-all shadow-md"
          >
            {createNewButton.label}
          </Button>
        )}
      </div>

      {isLoading ? (
        <Box className="flex items-center justify-center py-12">
          <CircularProgress className="text-main-golden-orange" />
        </Box>
      ) : data.length === 0 ? (
        <Box className="flex flex-col items-center justify-center gap-4 py-8 text-center border border-gray-700 border-dashed rounded-lg backdrop-blur-sm">
          <Typography fontWeight={400} variant="h6" className="mb-2 text-gray-400">
            {emptyMessage}
          </Typography>
          {createNewButton && (
            <Button
              variant="outlined"
              startIcon={<IconPlus size={18} />}
              onClick={createNewButton.onClick}
              className="transition-all w-fit !normal-case"
            >
              {createNewButton.label}
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          <Box sx={{ 
             overflowX: 'auto',
             cursor: 'grab',
          }}
          ref={tableContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          >
            <Paper sx={{ 
              width: 'max-content',
              minWidth: '100%',
              border: '1px solid #E0E0E0',
              borderRadius: 0
            }}>
              <TableContainer sx={{ 
                maxHeight: 'calc(100vh - 400px)',
                width: '100%',
              }}>
                <Table stickyHeader sx={{ 
                  minWidth: 650,
                }}>
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell 
                          key={column.key} 
                          sx={{ 
                            fontSize: "14px", 
                            fontWeight: 600,
                            width: column.width,
                          }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row, index) => renderRow(row, index))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
          {pagination && (
            <Box sx={{ border: 'none !important', backgroundColor: 'white' }}>
              <TablePagination
                rowsPerPageOptions={[]}
                component="div"
                count={pagination.itemCount}
                rowsPerPage={pagination.take}
                page={pagination.page - 1}
                onPageChange={(_, newPage) => onPageChange?.(newPage + 1)}
                onRowsPerPageChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
                sx={{
                  border: '1px solid #E0E0E0',
                  borderTop: 'none',
                  '& .MuiTablePagination-toolbar': {
                    padding: '0 16px'
                  },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    margin: 0,
                  },
                }}
                nextIconButtonProps={{
                  disabled: pagination.hasNextPage === undefined ? false : !pagination.hasNextPage
                }}
                backIconButtonProps={{
                  disabled: pagination.hasPreviousPage === undefined ? false : !pagination.hasPreviousPage
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </div>
  );
} 