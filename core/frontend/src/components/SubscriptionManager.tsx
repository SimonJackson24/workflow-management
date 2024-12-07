import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Dialog,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Paper,
  useTheme,
  Divider
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CreditCard as CreditCardIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { subscriptionActions } from '../store/subscription.slice';
import { RootState } from '../store/store';
import { SubscriptionPlan, SubscriptionStatus } from '../types/subscription.types';
import { useNotification } from '../hooks/useNotification';
import { ConfirmationDialog } from './ConfirmationDialog';
import { PaymentMethodForm } from './PaymentMethodForm';
import { UsageChart } from './UsageChart';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface PlanFeature {
  name: string;
  basic: boolean;
  professional: boolean;
  enterprise: boolean;
  description?: string;
}

const planFeatures: PlanFeature[] = [
  {
    name: 'Users',
    basic: true,
    professional: true,
    enterprise: true,
    description: 'Basic: 5 users, Pro: 20 users, Enterprise: Unlimited'
  },
  {
    name: 'Storage',
    basic: true,
    professional: true,
    enterprise: true,
    description: 'Basic: 10GB, Pro: 100GB, Enterprise: 1TB'
  },
  {
    name: 'API Access',
    basic: false,
    professional: true,
    enterprise: true,
    description: 'Access to our REST API'
  },
  {
    name: 'Custom Plugins',
    basic: false,
    professional: false,
    enterprise: true,
    description: 'Create and use custom plugins'
  },
  // Add more features as needed
];

export const SubscriptionManager: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const subscription = useSelector((state: RootState) => state.subscription.current);
  const usage = useSelector((state: RootState) => state.subscription.usage);

  useEffect(() => {
    dispatch(subscriptionActions.fetchSubscription());
    dispatch(subscriptionActions.fetchUsage());
  }, [dispatch]);

  const handlePlanSelect = async (planId: SubscriptionPlan) => {
    setSelectedPlan(planId);
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethodId
        }),
      });

      const { clientSecret } = await response.json();

      const { error } = await stripe.confirmCardPayment(clientSecret);

      if (error) {
        throw new Error(error.message);
      }

      dispatch(subscriptionActions.fetchSubscription());
      showNotification('success', 'Subscription updated successfully');
      setShowPaymentDialog(false);
    } catch (error) {
      showNotification('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await fetch(`/api/subscriptions/${subscription?.id}`, {
        method: 'DELETE',
      });

      dispatch(subscriptionActions.fetchSubscription());
      showNotification('success', 'Subscription cancelled successfully');
      setShowCancelDialog(false);
    } catch (error) {
      showNotification('error', 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrentPlan = subscription?.planId === plan;
    const price = {
      basic: 49,
      professional: 99,
      enterprise: 299
    }[plan];

    return (
      <Card
        elevation={isCurrentPlan ? 8 : 2}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: isCurrentPlan ? `2px solid ${theme.palette.primary.main}` : 'none'
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h5" gutterBottom>
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
            {isCurrentPlan && (
              <Chip
                label="Current Plan"
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          
          <Typography variant="h4" color="primary" gutterBottom>
            ${price}
            <Typography variant="caption" color="textSecondary">
              /month
            </Typography>
          </Typography>

          <List>
            {planFeatures.map((feature, index) => (
              <ListItem key={index} dense>
                <ListItemIcon>
                  {feature[plan] ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CloseIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={feature.name}
                  secondary={feature.description}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>

        <Box p={2}>
          <Button
            variant={isCurrentPlan ? "outlined" : "contained"}
            color="primary"
            fullWidth
            disabled={loading || (isCurrentPlan && subscription?.status === SubscriptionStatus.ACTIVE)}
            onClick={() => handlePlanSelect(plan)}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isCurrentPlan ? (
              'Current Plan'
            ) : (
              'Select Plan'
            )}
          </Button>
        </Box>
      </Card>
    );
  };

  const renderUsageSection = () => (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Current Usage
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <UsageChart
            title="API Calls"
            current={usage?.apiCalls?.current || 0}
            limit={usage?.apiCalls?.limit || 0}
            icon={<TimelineIcon />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <UsageChart
            title="Storage"
            current={usage?.storage?.current || 0}
            limit={usage?.storage?.limit || 0}
            icon={<CreditCardIcon />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <UsageChart
            title="Users"
            current={usage?.users?.current || 0}
            limit={usage?.users?.limit || 0}
            icon={<PeopleIcon />}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  if (!subscription) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Subscription Management
      </Typography>

      {subscription.status === SubscriptionStatus.PAST_DUE && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Your payment is past due. Please update your payment method to avoid service interruption.
        </Alert>
      )}

      {subscription.status === SubscriptionStatus.TRIALING && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your trial will end in {formatDistanceToNow(new Date(subscription.trialEnd!))}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Object.values(SubscriptionPlan).map((plan) => (
          <Grid item xs={12} md={4} key={plan}>
            {renderPlanCard(plan)}
          </Grid>
        ))}
      </Grid>

      {renderUsageSection()}

      {subscription.status === SubscriptionStatus.ACTIVE && (
        <Box mt={3}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel Subscription
          </Button>
        </Box>
      )}

      <Dialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <PaymentMethodForm
          onSubmit={handlePaymentSubmit}
          onCancel={() => setShowPaymentDialog(false)}
          loading={loading}
        />
      </Dialog>

      <ConfirmationDialog
        open={showCancelDialog}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? This action cannot be undone."
        onConfirm={handleCancelSubscription}
        onCancel={() => setShowCancelDialog(false)}
        loading={loading}
      />
    </Box>
  );
};

export default SubscriptionManager;
