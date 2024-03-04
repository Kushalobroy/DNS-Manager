// Dashboard.js
import React from 'react';
import { Container, Button,Table } from 'react-bootstrap';

const Dashboard = ({ handleLogout }) => {
  
  return (
    <Container>
      <h2 className="mt-5" variant="danger">Dashboard</h2>
      <p>Welcome to the dashboard!</p>
      <Button variant="danger" onClick={handleLogout} className="mt-3">
        Logout
      </Button>
      <Table className='table table-striped'>
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan={2}>Larry the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>
    </Container>
  );
};

export default Dashboard;
