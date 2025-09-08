export const extractTokenFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    
    // Handle OAuth token format
    const accessToken = urlObj.hash ? new URLSearchParams(urlObj.hash.slice(1)).get('access_token') : null;
    if (accessToken) return accessToken;
    
    // Handle email sign-in code format
    const code = urlObj.searchParams.get('code');
    return code;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};
