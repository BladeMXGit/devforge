/**
 * DevForge - JWT Inspector & Debugger
 * Decodes JSON Web Tokens completely client-side without sending secrets to any server.
 */

function b64DecodeUnicode(str) {
  // Add padding if missing
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function decodeJWT(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Please enter a JWT string.');
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format. A token must consist of 3 parts separated by dots.');
  }

  let header, payload;
  try {
    header = JSON.parse(b64DecodeUnicode(parts[0]));
  } catch (err) {
    throw new Error(`Failed to decode JWT Header: ${err.message}`);
  }

  try {
    payload = JSON.parse(b64DecodeUnicode(parts[1]));
  } catch (err) {
    throw new Error(`Failed to decode JWT Payload: ${err.message}`);
  }

  const signature = parts[2];

  // Expiration analysis
  let expStatus = 'No expiration claim (exp)';
  let expBadge = 'info';
  let isExpired = null;

  if (payload.exp) {
    const expDate = new Date(payload.exp * 1000);
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();

    if (diffMs > 0) {
      isExpired = false;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      expStatus = `Active (expires in ${hours}h ${mins}m ${secs}s)`;
      expBadge = 'success';
    } else {
      isExpired = true;
      const pastMs = Math.abs(diffMs);
      const days = Math.floor(pastMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((pastMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      expStatus = `Expired ${days > 0 ? `${days}d ` : ''}${hours}h ago (${expDate.toLocaleString()})`;
      expBadge = 'danger';
    }
  }

  // Format standard timestamps
  const timestamps = {};
  if (payload.iat) timestamps.iat = `${new Date(payload.iat * 1000).toLocaleString()} (UTC: ${new Date(payload.iat * 1000).toISOString()})`;
  if (payload.exp) timestamps.exp = `${new Date(payload.exp * 1000).toLocaleString()} (UTC: ${new Date(payload.exp * 1000).toISOString()})`;
  if (payload.nbf) timestamps.nbf = `${new Date(payload.nbf * 1000).toLocaleString()} (UTC: ${new Date(payload.nbf * 1000).toISOString()})`;

  return {
    header,
    payload,
    signature,
    expStatus,
    expBadge,
    isExpired,
    timestamps,
    algorithm: header.alg || 'Unknown',
    type: header.typ || 'JWT'
  };
}
