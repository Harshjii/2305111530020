const CREDENTIALS = {
  email: 'harsh.gupta2023@glbajajgroup.org',
  name: 'harsh gupta',
  rollNo: '2305111530020',
  accessCode: 'xxkJnk',
  clientID: '4936cfce-8bf9-402f-94cb-4313f568f7d9',
  clientSecret: 'aUgpxRBfKcGWXQmQ' // Typo corrected
};

const TOKEN_KEY = 'campus_eval_jwt_token';

export async function getAuthToken() {
  const cached = localStorage.getItem(TOKEN_KEY);
  if (cached) {
    try {
      const payload = JSON.parse(atob(cached.split('.')[1]));
      // Buffer of 1 minute (60s)
      if (payload.MapClaims.exp > Date.now() / 1000 + 60) {
        return cached;
      }
    } catch (e) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  try {
    const response = await fetch('http://4.224.186.213/evaluation-service/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CREDENTIALS)
    });
    if (!response.ok) {
      throw new Error(`Authentication endpoint returned ${response.status}`);
    }
    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    return data.access_token;
  } catch (err) {
    console.error("Dynamic token acquisition failed:", err);
    throw err;
  }
}
