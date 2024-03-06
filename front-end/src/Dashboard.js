// Dashboard.js
import {React, useState, useEffect} from 'react';
import { Container, Button,Table, Modal, Form, Row,Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from 'react-bootstrap/Navbar';
import axios from 'axios';
const Dashboard = ({ handleLogout }) => {
  const [show, setShow] = useState(false);
  const [file, setFile] = useState(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    value: '',
    ttl: ''
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewDomains = async (e) => {
    e.preventDefault();
    try {
     const response =  await axios.post('http://localhost:5000/api/add', formData);
      toast.success(response.data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.error);
    }
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(response.data.message);
      
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
    }
  };

  const [dnsRecords, setDNSRecords] = useState([]);

  const fetchDNSRecords = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/domains');
      setDNSRecords(response.data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  useEffect(() => {
    fetchDNSRecords(); // Call the async function inside useEffect
  }, []); // Empty dependency array ensures useEffect runs only once after initial render

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/delete/${id}`);

      // After successful deletion, fetch DNS records again to update the list
      fetchDNSRecords();
      toast.success('DNS record deleted successfully');
    } catch (error) {
      console.error('Error deleting DNS record:', error);
      toast.error('Error deleting DNS record');
    }
  };
  return (
   <>
   <ToastContainer position="top-center" autoClose={3000} />
      <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Dashboard</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
          <Button variant="danger" size="sm" onClick={handleLogout}>
        Logout
      </Button>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
     <Container>
      <h4 className='text-center underline'>DNS List</h4>

      <Button variant="success sm" onClick={handleShow} className="justify-content-end"  size="sm">
        Add New Domain
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>New Domain</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
        <Form.Label column sm="2" size="sm">
          File (CSV/JSON)
        </Form.Label>
        <Col sm="10">
          <Form.Control type="file"  size="sm" onChange={handleFileChange} required/>
        </Col>
      </Form.Group>
      <Modal.Footer>
          
          <Button variant="primary" type='submit' size="sm">
            Upload
          </Button>
        </Modal.Footer>
    
          </Form>
        <h4 className='text-center'>Or</h4>
        <Form onSubmit={handleNewDomains}>
      <Form.Group as={Row} className="mb-3" controlId="name">
        <Form.Label column sm="2" size="sm">
          Name
        </Form.Label>
        <Col sm="10">
          <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} size="sm" />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="type">
        <Form.Label column sm="2" size="sm">
          Type
        </Form.Label>
        <Col sm="10">
          <Form.Control type="text" name="type" value={formData.type} onChange={handleChange} size="sm" />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="value">
        <Form.Label column sm="2" size="sm">
          Value
        </Form.Label>
        <Col sm="10">
          <Form.Control type="text" name="value" value={formData.value} onChange={handleChange} size="sm" />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3" controlId="ttl">
        <Form.Label column sm="2" size="sm">
          TTL
        </Form.Label>
        <Col sm="10">
          <Form.Control type="number" name="ttl" value={formData.ttl} onChange={handleChange} size="sm" />
        </Col>
      </Form.Group>
      <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" type='submit' size="sm">
            Add
          </Button>
        </Modal.Footer>
    </Form>

        </Modal.Body>
        
      </Modal>
      <Table className='table table-striped'>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Type</th>
          <th>Value</th>
          <th>TTL</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
      {dnsRecords.map((record, index) => (
        <tr>
          <td>{index + 1}</td>
          <td>{record.name}</td>
          <td>{record.type}</td>
          <td>{record.value}</td>
          <td>{record.ttl}</td>
          <td><Button variant="dark sm" size="sm">
        Edit
      </Button> <Button variant="danger sm" onClick={() => handleDelete(record._id)} size="sm">
        Delete
      </Button></td>
        </tr>
       ))}
      </tbody>
    </Table>
    </Container>
    </>
  );
};

export default Dashboard;
