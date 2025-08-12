import { apiSlice } from './apiSlice';
import { ORDERS_URL } from '../../constants';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ... (getOrders, getOrderDetails, etc. remain the same)
    createStripePaymentIntent: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/create-stripe-intent`,
        method: 'POST',
      }),
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
    }),
    // The getPaypalClientId mutation is now removed.
  }),
});

export const {
  // ... (other hooks)
  useCreateStripePaymentIntentMutation,
  usePayOrderMutation,
} = orderApiSlice;