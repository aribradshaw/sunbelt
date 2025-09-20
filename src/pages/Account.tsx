import React from 'react';
import { getUserConfig } from '../users';

interface User {
  username: string;
  password: string;
  portal: string;
}

interface AccountProps {
  user: User;
}

const Account: React.FC<AccountProps> = ({ user }) => {
  // Get user configuration
  const userConfig = getUserConfig(user.portal);
  
  if (!userConfig) {
    return (
      <div>
        <h2>Account Settings</h2>
        <p>User configuration not found.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2>Account Settings</h2>
      
      {/* Username Section */}
      <div style={{ 
        background: 'white', 
        border: '1px solid #e0e0e0', 
        borderRadius: 8, 
        padding: 24, 
        marginBottom: 24,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#253874' }}>Username</h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: 12, 
          borderRadius: 6, 
          border: '1px solid #dee2e6',
          fontFamily: 'monospace',
          fontSize: 16
        }}>
          {userConfig.username}
        </div>
      </div>

      {/* Password Section */}
      <div style={{ 
        background: 'white', 
        border: '1px solid #e0e0e0', 
        borderRadius: 8, 
        padding: 24, 
        marginBottom: 24,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#253874' }}>Password</h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: 12, 
          borderRadius: 6, 
          border: '1px solid #dee2e6',
          marginBottom: 16
        }}>
          ••••••••••••
        </div>
        <div style={{ 
          background: '#e3f2fd', 
          border: '1px solid #bbdefb', 
          borderRadius: 6, 
          padding: 16,
          color: '#1565c0'
        }}>
          <strong>Need to update your password?</strong><br />
          Please email <a href={`mailto:${userConfig.adminInfo?.email || userConfig.contactInfo?.email || 'support@sunbelt.com'}`} style={{ color: '#1565c0', textDecoration: 'underline' }}>
            {userConfig.adminInfo?.email || userConfig.contactInfo?.email || 'support@sunbelt.com'}
          </a> to request a password change.
        </div>
      </div>

      {/* Location Section */}
      <div style={{ 
        background: 'white', 
        border: '1px solid #e0e0e0', 
        borderRadius: 8, 
        padding: 24, 
        marginBottom: 24,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#253874' }}>Location</h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: 12, 
          borderRadius: 6, 
          border: '1px solid #dee2e6',
          fontSize: 16,
          fontWeight: 500
        }}>
          {userConfig.location}
        </div>
      </div>

      {/* About This User Section */}
      <div style={{ 
        background: 'white', 
        border: '1px solid #e0e0e0', 
        borderRadius: 8, 
        padding: 24, 
        marginBottom: 24,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: '#253874' }}>User Description</h3>
          {userConfig.socialLinks?.facebook && (
            <a 
              href={userConfig.socialLinks.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                color: '#1877f2',
                fontSize: 14,
                fontWeight: 500,
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #e0e0e0',
                background: '#f8f9fa',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e3f2fd';
                e.currentTarget.style.borderColor = '#1877f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                style={{ marginRight: 6 }}
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
          )}
        </div>
        <div style={{ 
          background: '#f8f9fa', 
          padding: 16, 
          borderRadius: 6, 
          border: '1px solid #dee2e6',
          fontSize: 16,
          lineHeight: 1.5
        }}>
          {userConfig.campaignDescription}
        </div>
      </div>
    </div>
  );
};

export default Account;
