import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useCreateStripePaymentIntentMutation,
} from '../features/api/orderApiSlice';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm'; // We will create this new component

// You need to add your Stripe Publishable Key to a .env file in the frontend folder
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const OrderPage = () => {
  const { id: orderId } = useParams();
  const [clientSecret, setClientSecret] = useState('');

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [createStripeIntent, { isLoading: loadingIntent }] = useCreateStripePaymentIntentMutation();

  useEffect(() => {
    if (order && !order.isPaid && !clientSecret) {
      createStripeIntent(orderId)
        .unwrap()
        .then((res) => setClientSecret(res.clientSecret))
        .catch((err) => toast.error(err?.data?.message || err.error));
    }
  }, [order, orderId, clientSecret, createStripeIntent]);

  // ... (rest of the component logic for displaying order details)

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error.data.message}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>
      {/* ... (Order details rendering) ... */}
      <Col md={4}>
        <Card>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Order Summary</h2>
            </ListGroup.Item>
            {/* ... (Price summary rendering) ... */}
            {!order.isPaid && (
              <ListGroup.Item>
                {loadingPay && <Loader />}
                {loadingIntent && <Loader />}
                
                {clientSecret ? (
                  <Elements options={{ clientSecret }} stripe={stripePromise}>
                    <CheckoutForm orderId={orderId} refetch={refetch} />
                  </Elements>
                ) : (
                  <Loader />
                )}
              </ListGroup.Item>
            )}
            {/* ... (Admin deliver button logic) ... */}
          </ListGroup>
        </Card>
      </Col>
    </>
  );
};

export default OrderPage;