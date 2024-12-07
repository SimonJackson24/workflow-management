// core/frontend/src/components/billing/PaymentProcessing.tsx

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  Chip
} from '@mui/material';
import { usePayments } from '../../hooks/usePayments';
import { PaymentMethodForm } from './PaymentMethodForm';
import { PaymentHistory } from './PaymentHistory';
import { PaymentMethod, PaymentStatus } from '../../types/billing.types';

export const PaymentProcessing: React.FC = () => {
  const {
    paymentMethods,
    defaultMethod,
    loading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultMethod,
    processPayment
  } = usePayments();

  const [showAddMethod, setShowAddMethod] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleAddPaymentMethod = async (methodData: PaymentMethod) => {
    try {
      await addPaymentMethod(methodData);
      setShowAddMethod(false);
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Payment Methods
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Payment Methods List */}
        <Grid item xs={12} md={8}>
          {loading ? (
            <CircularProgress />
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.id} sx={{ mb: 2, p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">
                      {method.type === 'card' ? `•••• ${method.last4}` : method.name}
                    </Typography>
                    <Typography color="textSecondary">
                      Expires: {method.expiryMonth}/{method.expiryYear}
                    </Typography>
                  </Box>
                  <Box>
                    {method.isDefault && (
                      <Chip label="Default" color="primary" sx={{ mr: 1 }} />
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removePaymentMethod(method.id)}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))
          )}

          <Button
            variant="contained"
            onClick={() => setShowAddMethod(true)}
            sx={{ mt: 2 }}
          >
            Add Payment Method
          </Button>
        </Grid>

        {/* Payment History */}
        <Grid item xs={12} md={4}>
          <PaymentHistory />
        </Grid>
      </Grid>

      {/* Add Payment Method Dialog */}
      <Dialog
        open={showAddMethod}
        onClose={() => setShowAddMethod(false)}
        maxWidth="sm"
        fullWidth
      >
        <PaymentMethodForm
          onSubmit={handleAddPaymentMethod}
          onCancel={() => setShowAddMethod(false)}
        />
      </Dialog>
    </Box>
  );
};
