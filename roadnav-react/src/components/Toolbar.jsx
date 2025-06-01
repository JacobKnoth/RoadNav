import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

export default function Toolbar({ onAddresses, onRoad, setRoutingOption }) {
  const [addrA, setAddrA] = useState('');
  const [addrB, setAddrB] = useState('');
  const [road, setRoad] = useState('');

  return (
    <div className="mb-3">
      <h5>Enter Addresses</h5>

      <Form.Group className="mb-2">
        <Form.Control
          value={addrA}
          onChange={e => setAddrA(e.target.value)}
          placeholder="Start address"
        />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Control
          value={addrB}
          onChange={e => setAddrB(e.target.value)}
          placeholder="End address"
          disabled={!addrA.trim()} // disables if start address is empty
        />
      </Form.Group>

      <Button
        className="mb-3 w-100"
        onClick={() => onAddresses(addrA, addrB)}
        disabled={!addrA.trim() || !addrB.trim()} // optional: disable if either is empty
      >
        Show
      </Button>

      <h5  class="section-title" >Routing Options</h5>
      <Form.Select
        onChange={e => setRoutingOption(e.target.value)}
        defaultValue="motorcycle"
      >
        <option value="motorcycle">Curvy Nav</option>
        <option value="bicycle">Bicycle</option>
        <option value="auto">Default</option>
      </Form.Select>
    </div>
  );
}
