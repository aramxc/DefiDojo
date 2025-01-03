import React from 'react';
import CreateUserForm from '../components/CreateUserForm';
import { useNavigate } from 'react-router-dom';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>
      <CreateUserForm onSuccess={handleSuccess} />
    </div>
  );
};

export default SignUpPage;