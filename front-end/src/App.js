import React, { useState,useEffect } from 'react';
import { Container, Row, Col, Form,Card, Button, Toast } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes, Navigate,Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Dashboard from './Dashboard';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

function App() {
  const [name, setName] = useState('');
  const [dob, setdob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    toast.success('Logout Successfully !');
  };
 

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      setLoggedIn(true);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  return (
    <div>
       <ToastContainer position="top-center" autoClose={3000} />
      <div>
      <Router>
      <Container>
        <Row className="mt-5">
          <Col md={{ span: 12, offset: 0 }}>
            <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
         
            <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/" element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <>
                  <ToastContainer position="top-center" autoClose={3000} />
<div class="bg-light py-1 py-md-12">
  <div class="container">
    <div class="row justify-content-md-center">
      <div class="col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6">
        <div class="bg-white p-4 p-md-5 rounded shadow-sm">
          <div class="row">
            <div class="col-12">
              <div class="text-center mb-5">
                  <h2>Login</h2>
              </div>
            </div>
          </div>
          <form action="#!">
            <div class="row gy-3 gy-md-4 overflow-hidden">
              <div class="col-12">
                <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                    </svg>
                  </span>
                  <input type="email" class="form-control" placeholder="Username" onChange={(e) => setEmail(e.target.value)}  />
                </div>
              </div>
              <div class="col-12">
                <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-key" viewBox="0 0 16 16">
                      <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8zm4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5z" />
                      <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                    </svg>
                  </span>
                  <input type="password" className='form-control' placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
                </div>
              </div>
              <div class="col-12">
                <div class="d-grid">
                  <button class="btn btn-primary btn-lg" onClick={handleLogin}>Log In</button>
                </div>
              </div>
            </div>
          </form>
          <div class="row">
            <div class="col-12">
              <hr class="mt-5 mb-4 border-secondary-subtle" />
              <div class="d-flex gap-2 gap-md-4 flex-column flex-md-row justify-content-md-center">
              <Link to="/register" className="link-secondary text-decoration-none">
  Create new account
</Link>
<Link to="/forgot-password" className="link-secondary text-decoration-none">
Forgot password
</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
       
                  </>
                )
              } />
              <Route path="/dashboard" element={
                isLoggedIn ? (
                  <Dashboard handleLogout={handleLogout} />
                ) : (
                  <Navigate to="/" />
                )
              } />
            </Routes>

            
          </Col>
        </Row>
      </Container>
    </Router>
        
     
        
      </div>

    </div>
  );
}

export default App;
