import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { AuthMethod } from '../../../shared/src/types/user.types';
import { requestAccount } from '../services/web3/contract.service';

interface UserData {
  username: string;
  authMethod: AuthMethod;
  walletAddress?: string;
  email?: string;
  password?: string;
}

interface CreateUserFormProps {
  onSuccess: () => void;
  walletAddress: string;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess, walletAddress }) => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('wallet');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let userData: UserData = {
        username: formData.username,
        authMethod,
      };

      if (authMethod === 'wallet') {
        userData.walletAddress = walletAddress;
      } else {
        if (!formData.email || !formData.password) {
          throw new Error('Email and password required');
        }
        userData.email = formData.email;
        userData.password = formData.password;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      toast.success('Profile created successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Create Your Profile</h2>
      
      <div className="mb-4">
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setAuthMethod('wallet')}
            className={`flex-1 py-2 px-4 rounded ${
              authMethod === 'wallet' 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-700 text-gray-300'
            }`}
          >
            Use Wallet
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`flex-1 py-2 px-4 rounded ${
              authMethod === 'email' 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-700 text-gray-300'
            }`}
          >
            Use Email
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
            required
            minLength={3}
          />
        </div>

        {authMethod === 'email' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-2 rounded bg-slate-700 border border-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-2 rounded bg-slate-700 border border-slate-600"
                minLength={8}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
};

export default CreateUserForm;