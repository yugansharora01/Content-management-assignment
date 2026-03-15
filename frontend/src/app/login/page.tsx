"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Input, Button, Checkbox, Link, Divider } from "@heroui/react";
import { useAuth } from '@/context/auth-context';
import { LayoutDashboard, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@cms.com');
  const [password, setPassword] = useState('admin123'); // Default for assignment testing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-[400px] w-full p-2">
        <CardHeader className="flex flex-col gap-2 items-center justify-center pb-6">
          <div className="bg-primary/10 p-3 rounded-full">
            <LayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">CMS Admin</h1>
          <p className="text-default-500 text-small text-center">
            Log in to manage your content and system reports
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              placeholder="Enter your email"
              variant="bordered"
              type="email"
              value={email}
              onValueChange={setEmail}
              startContent={<Mail className="text-default-400 w-4" />}
              isRequired
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              variant="bordered"
              type="password"
              value={password}
              onValueChange={setPassword}
              startContent={<Lock className="text-default-400 w-4" />}
              isRequired
            />
            <div className="flex justify-between items-center px-1">
              <Checkbox size="sm">Remember me</Checkbox>
              <Link size="sm" href="#" underline="hover">Forgot password?</Link>
            </div>
            {error && (
              <p className="text-danger text-small text-center font-medium bg-danger-50 p-2 rounded-md">
                {error}
              </p>
            )}
            <Button 
              type="submit" 
              color="primary" 
              isLoading={loading}
              className="mt-2 font-semibold"
              fullWidth
            >
              Log In
            </Button>
          </form>
          <div className="flex items-center gap-4 my-6">
            <Divider className="flex-1" />
            <span className="text-default-400 text-tiny uppercase font-bold">Assignment Mode</span>
            <Divider className="flex-1" />
          </div>
          <p className="text-center text-default-400 text-tiny">
            Use default admin credentials to proceed.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
