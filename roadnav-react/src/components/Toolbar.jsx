import { useState } from 'react';
import { Button, Form, InputGroup, Row, Col } from 'react-bootstrap';

export default function Toolbar({ onAddresses, onRoad, setRoutingOption }) {
  const [addrA, setAddrA] = useState('');
  const [addrB, setAddrB] = useState('');
  const [road, setRoad]   = useState('');

  return (
    <div className="mb-3">
      <h5>Two addresses</h5>
      <Row className="g-2 mb-2">
        <Col md={5}><Form.Control value={addrA} onChange={e=>setAddrA(e.target.value)} placeholder="Start address" /></Col>
        <Col md={5}><Form.Control value={addrB} onChange={e=>setAddrB(e.target.value)} placeholder="End address" /></Col>
        <Col md={2}><Button className="w-100" onClick={() => onAddresses(addrA, addrB)}>Show</Button></Col>
      </Row>

      <h5 className="mt-3">Routing Options</h5>
      <Form.Select onChange={e => setRoutingOption(e.target.value)} defaultValue="motorcycle">
        <option value="motorcycle">Curvy Nav</option>
        <option value="bicycle">Bicycle</option>
        <option value="auto">Default</option>
      </Form.Select>
    </div>
  );
}
