import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Switch, message } from 'antd';
import { UserOutlined, SecurityScanOutlined, BellOutlined } from '@ant-design/icons';
import './SettingsPage.css'; // ✅ Ensure filename matches exactly

interface SettingsProps {
  currentUser?: {
    name: string;
    email: string;
    notifications: boolean;
  };
}

const SettingsPage: React.FC<SettingsProps> = ({ currentUser }) => {
  const [profileForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Centralized error handling
  const handleError = (error: any) => {
    console.error('Error:', error);
    message.error(error.message || 'Something went wrong');
  };

  // ✅ Profile Save
  const handleProfileSave = async (values: { name: string; email: string }) => {
    setIsLoading(true);
    try {
      await new Promise<void>((resolve, reject) => {
        if (values.name && values.email) {
          setTimeout(resolve, 1000);
        } else {
          reject(new Error('Invalid profile data'));
        }
      });
      message.success('Profile updated successfully');
      profileForm.setFieldsValue(values);
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Security Save
  const handleSecuritySave = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise<void>((resolve, reject) => {
        if (values.password.length >= 8) {
          setTimeout(resolve, 1000);
        } else {
          reject(new Error('Password too short'));
        }
      });
      message.success('Password updated successfully');
      securityForm.resetFields();
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Notifications Save
  const handleNotificationSave = async (values: { emailNotifications: boolean }) => {
    setIsLoading(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      message.success('Notification preferences updated successfully');
      notificationForm.setFieldsValue(values);
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Tabs (AntD v5 syntax)
  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined /> Profile
        </span>
      ),
      children: (
        <Form
          form={profileForm}
          layout="vertical"
          initialValues={currentUser}
          onFinish={handleProfileSave}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: 'Please input your name!' },
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <SecurityScanOutlined /> Security
        </span>
      ),
      children: (
        <Form form={securityForm} layout="vertical" onFinish={handleSecuritySave}>
          <Form.Item
            label="New Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                message: 'Password must contain letters and numbers',
              },
            ]}
          >
            <Input.Password maxLength={50} />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password maxLength={50} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Update Password
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> Notifications
        </span>
      ),
      children: (
        <Form
          form={notificationForm}
          layout="vertical"
          initialValues={{ emailNotifications: currentUser?.notifications }}
          onFinish={handleNotificationSave}
        >
          <Form.Item
            label="Email Notifications"
            name="emailNotifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Save Preferences
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="settings-page">
      <Card title="Settings" className="settings-card">
        <Tabs defaultActiveKey="profile" items={tabItems} />
      </Card>
    </div>
  );
};

export default SettingsPage;
