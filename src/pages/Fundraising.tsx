import React from 'react';
import { getUserConfig } from '../users';

interface User {
  username: string;
  password: string;
  portal: string;
}

interface FundraisingProps {
  user: User;
}

const Fundraising: React.FC<FundraisingProps> = ({ user }) => {
  const userConfig = getUserConfig(user.portal);
  
  if (!userConfig) {
    return (
      <div>
        <h2>Fundraising</h2>
        <p>User configuration not found.</p>
      </div>
    );
  }

  const hasFundraisingLinks = userConfig.fundraising && (
    userConfig.fundraising.winred || 
    userConfig.fundraising.anedot || 
    userConfig.fundraising.stripe || 
    userConfig.fundraising.custom
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2>Fundraising</h2>
      
      {hasFundraisingLinks ? (
        <div>
          <p>Access your fundraising tools and donation links below.</p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 16, 
            marginTop: 24 
          }}>
            {userConfig.fundraising?.winred && (
              <div style={{ 
                background: 'white', 
                border: '1px solid #e0e0e0', 
                borderRadius: 8, 
                padding: 20,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#253874' }}>WinRed</h3>
                <p style={{ margin: '0 0 16px 0', color: '#666' }}>Republican fundraising platform</p>
                <a 
                  href={userConfig.fundraising.winred} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block',
                    background: '#e60012', 
                    color: 'white', 
                    padding: '10px 20px', 
                    borderRadius: 6, 
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Open WinRed
                </a>
              </div>
            )}

            {userConfig.fundraising?.anedot && (
              <div style={{ 
                background: 'white', 
                border: '1px solid #e0e0e0', 
                borderRadius: 8, 
                padding: 20,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#253874' }}>Anedot</h3>
                <p style={{ margin: '0 0 16px 0', color: '#666' }}>Political fundraising platform</p>
                <a 
                  href={userConfig.fundraising.anedot} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block',
                    background: '#1a73e8', 
                    color: 'white', 
                    padding: '10px 20px', 
                    borderRadius: 6, 
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Open Anedot
                </a>
              </div>
            )}

            {userConfig.fundraising?.stripe && (
              <div style={{ 
                background: 'white', 
                border: '1px solid #e0e0e0', 
                borderRadius: 8, 
                padding: 20,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#253874' }}>Stripe</h3>
                <p style={{ margin: '0 0 16px 0', color: '#666' }}>Payment processing platform</p>
                <a 
                  href={userConfig.fundraising.stripe} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block',
                    background: '#635bff', 
                    color: 'white', 
                    padding: '10px 20px', 
                    borderRadius: 6, 
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Open Stripe
                </a>
              </div>
            )}

            {userConfig.fundraising?.custom && (
              <div style={{ 
                background: 'white', 
                border: '1px solid #e0e0e0', 
                borderRadius: 8, 
                padding: 20,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#253874' }}>Custom Platform</h3>
                <p style={{ margin: '0 0 16px 0', color: '#666' }}>Custom fundraising solution</p>
                <a 
                  href={userConfig.fundraising.custom} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block',
                    background: '#253874', 
                    color: 'white', 
                    padding: '10px 20px', 
                    borderRadius: 6, 
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Open Platform
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ 
          background: 'white', 
          border: '1px solid #e0e0e0', 
          borderRadius: 8, 
          padding: 32, 
          marginTop: 24,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#253874' }}>Fundraising Setup Required</h3>
          <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: 16, lineHeight: 1.5 }}>
            You need to sign up for a fundraising platform to accept donations. 
            We recommend WinRed, Anedot, or Stripe for political campaigns.
          </p>
          
          <div style={{ 
            background: '#e3f2fd', 
            border: '1px solid #bbdefb', 
            borderRadius: 8, 
            padding: 20,
            marginBottom: 24
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#1565c0' }}>Next Steps:</h4>
            <ol style={{ 
              textAlign: 'left', 
              margin: 0, 
              paddingLeft: 20, 
              color: '#1565c0',
              lineHeight: 1.6
            }}>
              <li>Sign up for WinRed, Anedot, or Stripe</li>
              <li>Set up your fundraising page</li>
              <li>Contact your administrator to add the link</li>
            </ol>
          </div>
          
          <div style={{ 
            background: '#f8f9fa', 
            border: '1px solid #dee2e6', 
            borderRadius: 6, 
            padding: 16,
            color: '#666'
          }}>
            <strong>Need help?</strong> Contact your administrator at{' '}
            <a 
              href={`mailto:${userConfig.adminInfo?.email || userConfig.contactInfo?.email || 'support@sunbelt.com'}`}
              style={{ color: '#1565c0', textDecoration: 'underline' }}
            >
              {userConfig.adminInfo?.email || userConfig.contactInfo?.email || 'support@sunbelt.com'}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fundraising;
