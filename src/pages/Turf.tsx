const Turf = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh',
    padding: '40px 20px',
    textAlign: 'center'
  }}>
    {/* Coming Soon Header */}
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '60px 40px',
      maxWidth: '600px',
      width: '100%',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3
      }} />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          fontSize: '36px'
        }}>
          🗺️
        </div>
        
        {/* Title */}
        <h1 style={{
          color: 'white',
          fontSize: '2.5rem',
          fontWeight: '700',
          margin: '0 0 16px 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Coming Soon
        </h1>
        
        {/* Subtitle */}
        <h2 style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '1.5rem',
          fontWeight: '400',
          margin: '0 0 20px 0',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          Turf Management
        </h2>
        
        {/* Description */}
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          margin: '0 0 30px 0',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Advanced walklist creation, territory management, and field organization tools are in development.
        </p>
        
        {/* Features Preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginTop: '30px',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {[
            { icon: '🚶', title: 'Walklists', desc: 'Create and manage voter walklists' },
            { icon: '📍', title: 'Territories', desc: 'Assign and track turf areas' },
            { icon: '📊', title: 'Analytics', desc: 'Field performance insights' },
            { icon: '👥', title: 'Teams', desc: 'Coordinate volunteer teams' }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px 15px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                {feature.icon}
              </div>
              <div style={{
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                {feature.title}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '12px',
                lineHeight: '1.4'
              }}>
                {feature.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    
  </div>
);

export default Turf;
