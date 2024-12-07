// core/frontend/src/components/billing/InvoiceManagement.tsx

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useInvoices } from '../../hooks/useInvoices';
import { InvoiceDetails } from './InvoiceDetails';
import { Invoice, InvoiceStatus } from '../../types/billing.types';

export const InvoiceManagement: React.FC = () => {
  const {
    invoices,
    loading,
    error,
    downloadInvoice,
    markAsPaid,
    sendReminder
  } = useInvoices();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Invoices</Typography>
        <Box>
          <TextField
            size="small"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mr: 2 }}
          />
          <Button
            startIcon={<FilterIcon />}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Filter
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.number}</TableCell>
                <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status}
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleActionClick(e, invoice)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={() => {
          selectedInvoice && downloadInvoice(selectedInvoice.id);
          handleActionClose();
        }}>
          <DownloadIcon sx={{ mr: 1 }} /> Download
        </MenuItem>
        {selectedInvoice?.status === 'pending' && (
          <MenuItem onClick={() => {
            selectedInvoice && markAsPaid(selectedInvoice.id);
            handleActionClose();
          }}>
            Mark as Paid
          </MenuItem>
        )}
        {selectedInvoice?.status === 'overdue' && (
          <MenuItem onClick={() => {
            selectedInvoice && sendReminder(selectedInvoice.id);
            handleActionClose();
          }}>
            Send Reminder
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};
