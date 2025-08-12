import { useEffect, useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { usePayOrderMutation } from '../features/api/orderApiSlice';
import Message from './Message';
import Loader from './Loader';

const CheckoutForm = ({ orderId, refetch }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // No return_url needed if we handle the result here
      },
      redirect: 'if_required', // Prevents immediate redirection
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await payOrder({ orderId, details: { id: paymentIntent.id, status: paymentIntent.status } });
        refetch();
        toast.success('Payment successful');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }

    setIsLoading(false);
  };

  return (
    <Form id='payment-form' onSubmit={handleSubmit}>
      <PaymentElement id='payment-element' />
      <Button type='submit' disabled={isLoading || !stripe || !elements} className='my-3'>
        <span>{isLoading ? <Loader /> : 'Pay now'}</span>
      </Button>
      {message && <Message variant='danger'>{message}</Message>}
    </Form>
  );
};

export default CheckoutForm;