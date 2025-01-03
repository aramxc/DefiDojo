import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { requestAccount } from '../services/web3/contract.service';
import { UserService } from '../services/api/user.service';

interface CreateUserFormProps {
  onSuccess: () => void;
  walletAddress?: string;
}

const userService = new UserService();

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess, walletAddress }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    walletAddress: walletAddress || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await userService.createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        walletAddress: formData.walletAddress || null,
      });

      toast.success('Profile created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const account = await requestAccount();
      setFormData(prev => ({ ...prev, walletAddress: account }));
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Create Your Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
            required
            minLength={8}
          />
        </div>

        {!formData.walletAddress && (
          <button
            type="button"
            onClick={handleConnectWallet}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Connect Wallet (Optional)
          </button>
        )}

        {formData.walletAddress && (
          <div className="p-2 bg-slate-700 rounded border border-slate-600">
            <p className="text-sm">Connected Wallet:</p>
            <p className="text-xs text-gray-400 truncate">{formData.walletAddress}</p>
          </div>
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