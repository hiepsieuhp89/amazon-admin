"use client"
import React, { useState } from 'react';
import {
  Paper,
  Card,
  ListItem,
  ListItemText,
  Stack,
  Checkbox,
  TablePagination,
  ButtonGroup,
  Button,
  List,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  InputBase,
  Collapse
} from '@mui/material';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  DeleteOutline as DeleteOutlineIcon,
  LabelOutlined as LabelOutlinedIcon,
  Search as SearchIcon,
  List as ListIcon,
  ViewComfy as ViewComfyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreHoriz as MoreHorizIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';

interface Contact {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  balance: string;
  shopName: string;
  shopAddress: string;
  sellerPackageExpiry: string | null;
  spreadPackageExpiry: string | null;
}

const Table: React.FC = () => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const contacts: Contact[] = [
    {
      id: "0d2c8a75-1253-47c1-8570-b28779be7493",
      email: "seller19@gmail.com",
      username: "shop19",
      fullName: "LatteLover",
      phone: "0123456782",
      role: "shop",
      isActive: true,
      balance: "300.00",
      shopName: "Shop15",
      shopAddress: "202 Latte Lane",
      sellerPackageExpiry: null,
      spreadPackageExpiry: null
    },
    {
      id: "9a711035-865c-461d-aace-d54a9d6c7446",
      email: "seller18@gmail.com",
      username: "shop18",
      fullName: "EspressoExpert",
      phone: "0123456781",
      role: "shop",
      isActive: true,
      balance: "150.00",
      shopName: "Shop14",
      shopAddress: "101 Coffee Road",
      sellerPackageExpiry: null,
      spreadPackageExpiry: null
    },
  ];

  const rowsPerPage = 10;
  const displayedContacts = contacts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = contacts.map(contact => contact.id);
      setSelectedContacts(newSelected);
      return;
    }
    setSelectedContacts([]);
  };

  const handleSelectClick = (id: string) => {
    const selectedIndex = selectedContacts.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedContacts, id];
    } else {
      newSelected = selectedContacts.filter(contactId => contactId !== id);
    }

    setSelectedContacts(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleToggleViewMode = (mode: 'list' | 'grid') => {
    setViewMode(mode);
  };
  const isSelected = (id: string) => selectedContacts.indexOf(id) !== -1;
  const allSelected = displayedContacts.length > 0 && selectedContacts.length === displayedContacts.length;

  return (
    <Paper elevation={1} sx={{ borderRadius: 1 }}>
      <Card sx={{ boxShadow: 'none' }}>
        <ListItem sx={{ padding: 2 }}>
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center" spacing={2}>
                <div>
                  <Checkbox
                    checked={allSelected}
                    onChange={handleSelectAllClick}
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
                  />
                </div>
                <div style={{ transform: selectedContacts.length > 0 ? 'none' : 'none', transition: 'transform 225ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  {selectedContacts.length > 0 ? (
                    <Stack direction="row" spacing={1}>
                      <IconButton aria-label="Delete">
                        <DeleteOutlineIcon />
                      </IconButton>
                      <IconButton>
                        <LabelOutlinedIcon aria-label="Labels" />
                      </IconButton>
                    </Stack>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '4px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <SearchIcon />
                      </div>
                      <InputBase
                        placeholder="Search anything"
                        aria-label="search"
                        name="search-globally"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ ml: 1 }}
                      />
                    </div>
                  )}
                </div>
              </Stack>
            }
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <TablePagination
              component="div"
              count={contacts.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
            />
            <div>
              <ButtonGroup disableElevation variant="outlined" color="primary">
                <Button
                  variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  onClick={() => handleToggleViewMode('list')}
                >
                  <ListIcon />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  onClick={() => handleToggleViewMode('grid')}
                >
                  <ViewComfyIcon />
                </Button>
              </ButtonGroup>
            </div>
          </Stack>
        </ListItem>
      </Card>
      <List sx={{ padding: 0 }}>
        {displayedContacts.map((contact) => {
          const isItemSelected = isSelected(contact.id);

          return (
            <div key={contact.id}>
              <Collapse in={true} timeout="auto" unmountOnExit>
                <ListItem sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <Checkbox
                    checked={isItemSelected}
                    onChange={() => handleSelectClick(contact.id)}
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
                  />
                  <ListItemIcon sx={{ minWidth: 'auto', marginRight: 1 }}>
                    {contact.role === 'shop' ? (
                      <StarIcon 
                        fontSize="small" 
                        sx={{ color: '#f9a825' }} 
                        aria-label="Starred"
                      />
                    ) : (
                      <StarBorderIcon 
                        fontSize="small" 
                        aria-label="Not starred"
                      />
                    )}
                  </ListItemIcon>
                  {/* <ListItemAvatar>
                    <Avatar src={contact.avatar} alt={contact.name} />
                  </ListItemAvatar> */}
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={2}>
                        <div style={{ width: '200px' }}>
                          <Typography variant="h5" noWrap sx={{ fontSize: '1rem', fontWeight: 500 }}>
                            {contact.shopName}
                          </Typography>
                          <Typography variant="body1" noWrap sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                            {contact.fullName}
                          </Typography>
                        </div>
                        <div style={{ width: '200px' }}>
                          <Typography variant="body1" noWrap sx={{ color: 'text.secondary' }}>
                            {contact.email}
                          </Typography>
                        </div>
                        <div style={{ width: '150px' }}>
                          <Typography variant="body1" noWrap sx={{ color: 'text.secondary' }}>
                            {contact.phone}
                          </Typography>
                        </div>
                        <div style={{ width: '200px' }}>
                          <Stack direction="row" spacing={0.5}>
                            <Chip
                              label={`Balance: ${contact.balance}`}
                              size="small"
                              sx={{ 
                                backgroundColor: '#e8f5e9', 
                                color: '#4caf50',
                                height: '24px',
                                fontSize: '0.75rem'
                              }}
                            />
                            <Chip
                              label={contact.role}
                              size="small"
                              sx={{ 
                                backgroundColor: '#e3f2fd', 
                                color: '#2196f3',
                                height: '24px',
                                fontSize: '0.75rem'
                              }}
                            />
                          </Stack>
                        </div>
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="more options">
                      <MoreHorizIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Collapse>
            </div>
          );
        })}
      </List>
    </Paper>
  );
};

export default Table;