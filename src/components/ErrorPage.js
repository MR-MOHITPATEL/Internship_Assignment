import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';

const ErrorPage = ({ message = "Something went wrong.", status = 500 }) => {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <h1>Error {status}</h1>
      <p>{message}</p>
      <button onClick={() => navigate('/')}>Go to Dashboard</button>
    </div>
  );
};

export default ErrorPage;