import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';

const CreateProblem = () => {
  const [formData, setFormData] = useState({
    title: '',
    statement: '',
    tags: '',
    difficulty_level: '',
    score: '',
  });
  const { token } = useAuth();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/problems', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
      });
      console.log('Problem created:', res.data);
      // Optionally, redirect to the problem details page or display a success message
    } catch (error) {
      console.error('Error creating problem:', error);
      // Handle error, display error message, etc.
    }
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '400px',
    margin: 'auto',
  };

  const labelStyle = {
    marginBottom: '8px',
    fontWeight: 'bold',
  };

  const inputStyle = {
    marginBottom: '16px',
    padding: '8px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  };

  const buttonStyle = {
    padding: '10px 15px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Problem</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label style={labelStyle}>Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Statement:</label>
          <textarea name="statement" value={formData.statement} onChange={handleChange} style={{ ...inputStyle, height: '100px' }} />
        </div>
        <div>
          <label style={labelStyle}>Tags:</label>
          <input type="text" name="tags" value={formData.tags} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Difficulty Level:</label>
          <input type="text" name="difficulty_level" value={formData.difficulty_level} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Score:</label>
          <input type="text" name="score" value={formData.score} onChange={handleChange} style={inputStyle} />
        </div>
        <button type="submit" style={buttonStyle}>Create Problem</button>
      </form>
    </div>
  );
};

export default CreateProblem;
