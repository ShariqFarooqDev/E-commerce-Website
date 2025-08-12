// FILE: frontend/src/components/FormContainer.jsx
// UPDATED to ensure responsive centering on all screen sizes.
import { Container, Row, Col } from 'react-bootstrap';

const FormContainer = ({ children }) => {
  return (
    <Container>
      {/* The 'justify-content-center' class now applies to all screen sizes */}
      <Row className='justify-content-center'>
        <Col xs={12} md={6}>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default FormContainer;
