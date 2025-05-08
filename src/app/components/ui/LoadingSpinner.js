const LoadingSpinner = ({ fullPage = false, size = 'medium' }) => {
  // Define sizes
  const sizes = {
    small: { width: '2rem', height: '2rem', borderWidth: '0.2rem' },
    medium: { width: '3rem', height: '3rem', borderWidth: '0.3rem' },
    large: { width: '4rem', height: '4rem', borderWidth: '0.4rem' }
  };
  
  const selectedSize = sizes[size] || sizes.medium;
  
  const spinnerStyle = {
    width: selectedSize.width,
    height: selectedSize.height,
    borderRadius: '50%',
    position: 'relative',
    background: 'conic-gradient(transparent, var(--color-primary))',
    animation: 'spinner-rotation 1.2s linear infinite',
    filter: 'drop-shadow(0 0 10px rgba(67, 97, 238, 0.3))',
  };
  
  const spinnerInnerStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'calc(100% - 12px)',
    height: 'calc(100% - 12px)',
    borderRadius: '50%',
    background: 'var(--color-white)',
  };

  const containerStyle = fullPage
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      };
      
  const textStyle = {
    marginTop: '1rem',
    fontWeight: 500,
    color: 'var(--color-gray-700)',
    background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  return (
    <div style={containerStyle}>
      <style jsx>{`
        @keyframes spinner-rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
      <div style={spinnerStyle}>
        <div style={spinnerInnerStyle}></div>
      </div>
      {fullPage && <div style={textStyle}>Loading...</div>}
    </div>
  );
};

export default LoadingSpinner; 