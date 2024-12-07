// core/frontend/src/components/search/AdvancedSearch.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  InputAdornment,
  Popover,
  Typography,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Collapse,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';
import { DateRangePicker } from '@mui/lab';

interface SearchFilter {
  field: string;
  operator: string;
  value: any;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilter[];
  query: string;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'boolean';
    options?: Array<{ value: any; label: string }>;
  }>;
  savedSearches?: SavedSearch[];
  onSaveSearch?: (search: Omit<SavedSearch, 'id'>) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  fields,
  savedSearches = [],
  onSaveSearch
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  const debouncedSearch = debounce((newQuery: string, newFilters: SearchFilter[]) => {
    onSearch(newQuery, newFilters);
  }, 300);

  useEffect(() => {
    debouncedSearch(query, filters);
    return () => debouncedSearch.cancel();
  }, [query, filters]);

  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: '=', value: '' }]);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
  };

  const handleFilterChange = (index: number, field: string, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const handleSaveSearch = () => {
    if (onSaveSearch && searchName) {
      onSaveSearch({
        name: searchName,
        filters,
        query
      });
      setSaveDialogOpen(false);
      setSearchName('');
    }
  };

  const handleLoadSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    setAnchorEl(null);
  };

  const renderFilterInput = (filter: SearchFilter, index: number) => {
    const field = fields.find(f => f.name === filter.field);
    
    if (!field) return null;

    switch (field.type) {
      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>Value</InputLabel>
            <Select
              value={filter.value}
              onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
            >
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select
