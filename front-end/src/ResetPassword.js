import React, { useState } from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
function ResetPassword() {
 
    const [newPassword, setNewPassword] = useState('');
   
    const token = window.location.pathname.split('/').pop();
    console.log(token);
    const handleResetPassword = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/reset-password', { token, newPassword });
        toast.success(response.data.message);
        // Redirect or perform any other action upon successful password reset
      } catch (error) {
        toast.error(error.response.data.error);
      }
    };
    
  return (
    <div>
       <h2>Reset Password</h2>
     
      <div>
        <label>New Password:</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      <button onClick={handleResetPassword}>Reset Password</button>
      
    </div>

  )
}

export default ResetPassword
