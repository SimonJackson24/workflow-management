// core/frontend/src/components/billing/BillingManagement.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CreditCard as CardIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useOrganization } from '../../contexts/OrganizationContext';

interface BillingDetails {
  plan: {
    id: string;
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    features: string[];
  };
  subscription: {
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  paymentMethod: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  invoices: Array<{
    id: string;
    number: string;
    date: string;
    amount: number;
    status: 'paid' | 'open' | 'void';
    downloadUrl: string;
  }>;
  usage: {
    current: {
      users: number;
      storage: number;
      apiCalls: number;
    };
    limits: {
      users: number;
      storage: number;
      apiCalls: number;
    };
  };
}

const BillingManagement: React.FC = () => {
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchBillingDetails();
  }, []);

  const fetchBillingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing');
      const data = await response.json();
      setBillingDetails(data);
    } catch (err) {
      setError('Failed to load billing details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async (formData: any) => {
    try {
      setProcessingPayment(true);
      await fetch('/api/billing/payment-method', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      await fetchBillingDetails();
      setPaymentDialogOpen(false);
    } catch (err) {
      setError('Failed to update payment method');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await fetch('/api/billing/subscription', {
          method: 'DELETE'
        });
        await fetchBillingDetails();
      } catch (err) {
        setError('Failed to cancel subscription');
      }
    }
  };

  const UsageMetric: React.FC<{
    label: string;
    current: number;
    limit: number;
    unit: string;
  }> = ({ label, current, limit, unit }) => {
    const percentage = (current / limit) * 100;
    const isWarning = percentage >= 80;

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2" color={isWarning ? 'error' : 'textSecondary'}>
            {current.toLocaleString()} / {limit.toLocaleString()} {unit}
          </Typography>
        </Box>
        <Box position="relative" height={4} bgcolor="background.default" borderRadius={2}>
          <Box
            position="absolute"
            height="100%"
            bgcolor={isWarning ? 'error.main' : 'primary.main'}
            borderRadius={2}
            width={`${Math.min(percentage, 100)}%`}
          />
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!billingDetails) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Billing & Subscription
      </Typography>

      <Grid container spacing={3}>
        {/* Current Plan */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Plan
              </Typography>
              <Typography variant="h4" gutterBottom>
                {billingDetails.plan.name}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                ${billingDetails.plan.price}/{billingDetails.plan.interval}
              </Typography>
              <Box mt={2}>
                {billingDetails.plan.features.map((feature, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {feature}
                  </Typography>
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancelSubscription}
                disabled={billingDetails.subscription.status !== 'active'}
              >
                Cancel Subscription
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Payment Method */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              {billingDetails.paymentMethod ? (
                <Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <CardIcon />
                    <Box>
                      <Typography>
                        {billingDetails.paymentMethod.brand} ending in {billingDetails.paymentMethod.last4}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Expires {billingDetails.paymentMethod.expiryMonth}/
                        {billingDetails.paymentMethod.expiryYear}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Typography color="error">
                  No payment method on file
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => setPaymentDialogOpen(true)}
              >
                {billingDetails.paymentMethod ? 'Update' : 'Add'} Payment Method
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Usage */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usage
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <UsageMetric
                  label="Users"
                  current={billingDetails.usage.current.users}
                  limit={billingDetails.usage.limits.users}
                  unit="users"
                />
                <UsageMetric
                  label="Storage"
                  current={billingDetails.usage.current.storage}
                  limit={billingDetails.usage.limits.storage}
                  unit="GB"
                />
                <UsageMetric
                  label="API Calls"
                  current={billingDetails.usage.current.apiCalls}
                  limit={billingDetails.usage.limits.apiCalls}
                  unit="calls"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoices */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Invoice History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice Number</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billingDetails.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.number}</TableCell>
                      <TableCell>
                        {new Date(invoice.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${invoice.amount}</TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status}
                          color={
                            invoice.status === 'paid'
                              ? 'success'
                              : invoice.status === 'open'
                              ? 'warning'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          href={invoice.downloadUrl}
                          download
                        >
                          <DownloadIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Method Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {billingDetails.paymentMethod ? 'Update' : 'Add'} Payment Method
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              label="Card Number"
              fullWidth
              margin="normal"
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Expiry Date"
                placeholder="MM/YY"
                margin="normal"
              />
              <TextField
                label="CVC"
                margin="normal"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPaymentDialogOpen(false)}
            disabled={processingPayment}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleUpdatePaymentMethod({})}
            disabled={processingPayment}
          >
            {processingPayment ? (
              <CircularProgress size={24} />
            ) : (
              'Save Payment Method'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingManagement;
