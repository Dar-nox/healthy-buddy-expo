export const generateAccessCode = (length: number = 8): string => {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  const values = new Uint32Array(length);
  
  // Use crypto.getRandomValues for better randomness
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(values);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      values[i] = Math.floor(Math.random() * charset.length);
    }
  }
  
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  
  // Format as XXXX-XXXX for better readability
  return `${result.substring(0, 4)}-${result.substring(4)}`;
};
