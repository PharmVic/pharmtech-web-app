export default function Maintenance() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: '#f8f9fa'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
        Site Under Maintenance
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '600px', lineHeight: '1.6' }}>
        We are currently performing scheduled maintenance to improve our systems. 
        The site will be back online on April 17th. We apologize for any inconvenience.
      </p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <strong>Expected Return:</strong> April 17, 2026
      </div>
    </div>
  );
}
