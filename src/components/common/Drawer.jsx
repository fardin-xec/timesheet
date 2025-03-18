import React, { useState } from 'react';
import { 
  Drawer, 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Button,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Tooltip
} from '@mui/material';
import { X, Search, Info } from 'lucide-react';

/**
 * Enhanced reusable drawer component that can be used across different pages
 * with filtering, selection capabilities, and improved UI/UX
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onClose - Function to call when drawer is closed
 * @param {Object[]} props.tabs - Array of tab objects with label and content
 * @param {number} props.activeTab - Index of the active tab
 * @param {Function} props.onTabChange - Function to call when tab is changed
 * @param {Object} props.footerActions - Footer actions configuration
 * @param {React.ReactNode} props.footerContent - Additional footer content
 * @param {number} props.width - Width of the drawer (default: 420)
 * @param {string} props.anchor - Anchor position of the drawer (default: 'right')
 * @param {Object} props.filterConfig - Configuration for filtering functionality
 * @param {boolean} props.selectionEnabled - Whether selection is enabled
 * @param {Function} props.onSelectionChange - Function to call when selection changes
 * @param {Object[]} props.items - Items to display and filter
 * @param {string} props.title - Optional title for the drawer when no tabs are present
 * @param {boolean} props.loading - Whether the drawer content is loading
 */
const CommonDrawer = ({
  open,
  onClose,
  tabs,
  activeTab = 0,
  onTabChange,
  footerActions = {},
  footerContent,
  width = 420,
  anchor = 'right',
  filterConfig,
  selectionEnabled = false,
  onSelectionChange,
  items = [],
  title,
  loading = false
}) => {
  // State for filter functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [tabValue, setTabValue] = useState(activeTab);

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (onTabChange) {
      onTabChange(event, newValue);
    }
  };

  // Default primary button handler
  const handlePrimaryAction = () => {
    if (footerActions.primaryAction) {
      footerActions.primaryAction(selectedItems);
    } else {
      onClose();
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    if (filterConfig?.onSearch) {
      filterConfig.onSearch(event.target.value);
    }
  };

  // Handle filter criteria change
  const handleFilterChange = (field, value) => {
    const newFilterCriteria = { ...filterCriteria, [field]: value };
    setFilterCriteria(newFilterCriteria);
    
    if (filterConfig?.onFilterChange) {
      filterConfig.onFilterChange(newFilterCriteria);
    }
  };

  // Handle item selection
  // const handleItemSelection = (item, isSelected) => {
  //   let newSelectedItems;
    
  //   if (isSelected) {
  //     newSelectedItems = [...selectedItems, item];
  //   } else {
  //     newSelectedItems = selectedItems.filter(i => i.id !== item.id);
  //   }
    
  //   setSelectedItems(newSelectedItems);
    
  //   if (onSelectionChange) {
  //     onSelectionChange(newSelectedItems);
  //   }
  // };

  // Handle select all
  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    
    if (isChecked) {
      setSelectedItems([...items]);
    } else {
      setSelectedItems([]);
    }
    
    if (onSelectionChange) {
      onSelectionChange(isChecked ? [...items] : []);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterCriteria({});
    setSearchTerm('');
    if (filterConfig?.onResetFilters) {
      filterConfig.onResetFilters();
    }
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': { 
          width: '100%',
          maxWidth: width,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Close button */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
          <IconButton onClick={onClose} aria-label="close" size="small">
            <X size={20} />
          </IconButton>
        </Box>

        {/* Drawer header */}
        {title && !tabs?.length && (
          <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">{title}</Typography>
          </Box>
        )}

        {/* Drawer header with tabs */}
        {tabs && tabs.length > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant={tabs.length > 3 ? "scrollable" : "standard"}
              scrollButtons={tabs.length > 3 ? "auto" : "false"}
              sx={{ 
                minHeight: '48px',
                '& .MuiTab-root': { minHeight: '48px' }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab 
                  key={index} 
                  label={tab.label} 
                  icon={tab.icon} 
                  iconPosition={tab.iconPosition || "start"}
                  disabled={tab.disabled}
                  sx={{ textTransform: 'none' }}
                />
              ))}
            </Tabs>
          </Box>
        )}
        
        {/* Filter section if enabled */}
        {filterConfig && (
          <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder={filterConfig.searchPlaceholder || "Search..."}
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {filterConfig.filters && filterConfig.filters.map((filter, index) => (
                <FormControl 
                  key={index} 
                  size="small" 
                  sx={{ minWidth: 120, flexGrow: 1, maxWidth: filter.fullWidth ? '100%' : '45%' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ mr: 0.5 }}>
                      {filter.label}
                    </Typography>
                    {filter.tooltip && (
                      <Tooltip title={filter.tooltip} arrow>
                        <Info size={14} color="#9e9e9e" />
                      </Tooltip>
                    )}
                  </Box>
                  <Select
                    displayEmpty
                    value={filterCriteria[filter.field] || (filter.multiple ? [] : '')}
                    onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                    multiple={filter.multiple}
                    renderValue={(selected) => {
                      if (filter.multiple) {
                        if (selected.length === 0) return filter.emptyText || "Any";
                        return selected.length > 1 
                          ? `${selected.length} selected` 
                          : filter.options.find(o => o.value === selected[0])?.label || selected[0];
                      }
                      if (!selected) return filter.emptyText || "Any";
                      return filter.options.find(o => o.value === selected)?.label || selected;
                    }}
                    size="small"
                    sx={{ 
                      '& .MuiSelect-select': { 
                        p: '6px 14px',
                        fontSize: '0.875rem'
                      }
                    }}
                  >
                    {filter.showEmptyOption && (
                      <MenuItem value="">
                        <em>{filter.emptyText || "Any"}</em>
                      </MenuItem>
                    )}
                    {filter.options.map((option) => (
                      <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                        {filter.multiple && (
                          <Checkbox 
                            checked={
                              Array.isArray(filterCriteria[filter.field]) && 
                              filterCriteria[filter.field]?.includes(option.value)
                            } 
                            size="small"
                          />
                        )}
                        <ListItemText 
                          primary={option.label} 
                          secondary={option.description}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Box>
            
            {filterConfig.showFilterActions && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="outlined"
                  size="small"
                  onClick={resetFilters}
                  sx={{ mr: 1 }}
                  disabled={Object.keys(filterCriteria).length === 0 && !searchTerm}
                >
                  Clear Filters
                </Button>
                <Button 
                  variant="contained"
                  size="small"
                  onClick={() => {
                    if (filterConfig.onApplyFilters) {
                      filterConfig.onApplyFilters(filterCriteria, searchTerm);
                    }
                  }}
                  disabled={loading}
                >
                  Apply Filters
                </Button>
              </Box>
            )}
          </Box>
        )}
        
        {/* Selection header if enabled */}
        {selectionEnabled && items.length > 0 && (
          <Box sx={{ 
            px: 3, 
            py: 1, 
            borderBottom: 1, 
            borderColor: 'divider', 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: selectedItems.length > 0 ? 'action.selected' : 'transparent',
            transition: 'background-color 0.3s'
          }}>
            <Checkbox
              checked={selectAll || (items.length > 0 && selectedItems.length === items.length)}
              onChange={handleSelectAll}
              indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
              size="small"
              sx={{ p: 0.5, mr: 1 }}
            />
            <Typography variant="body2">
              {selectedItems.length > 0 
                ? `${selectedItems.length} selected` 
                : `Select All (${items.length})`}
            </Typography>
            {selectedItems.length > 0 && footerActions.bulkActionLabel && (
              <Box sx={{ ml: 'auto' }}>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => {
                    if (footerActions.bulkAction) {
                      footerActions.bulkAction(selectedItems);
                    }
                  }}
                  variant="text"
                >
                  {footerActions.bulkActionLabel}
                </Button>
              </Box>
            )}
          </Box>
        )}
        
        {/* Loading state */}
        {loading && (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <Typography>Loading...</Typography>
          </Box>
        )}
        
        {/* Drawer content */}
        {!loading && (
          <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
            {tabs && tabs.length > 0 
              ? tabs[tabValue]?.content 
              : null
            }
          </Box>
        )}
        
        {/* Footer buttons */}
        {(footerActions.primaryLabel || footerActions.secondaryLabel || footerContent) && (
          <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: 'background.paper'
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {footerActions.secondaryLabel && (
                <Button
                  variant="outlined"
                  onClick={footerActions.secondaryAction || onClose}
                  size="medium"
                  sx={{ minWidth: '100px' }}
                >
                  {footerActions.secondaryLabel}
                </Button>
              )}
              
              {footerActions.primaryLabel && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePrimaryAction}
                  disabled={
                    (footerActions.requireSelection && selectedItems.length === 0) || 
                    footerActions.disablePrimary || 
                    loading
                  }
                  size="medium"
                  sx={{ minWidth: '100px' }}
                >
                  {footerActions.primaryLabel}
                </Button>
              )}
            </Box>
            
            {footerContent && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {footerContent}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CommonDrawer;