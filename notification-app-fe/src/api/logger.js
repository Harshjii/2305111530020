const CREDENTIALS = {
  email: 'harsh.gupta2023@glbajajgroup.org',
  name: 'harsh gupta',
  rollNo: '2305111530020',
  accessCode: 'xxkJnk',
  clientID: '4936cfce-8bf9-402f-94cb-4313f568f7d9',
  clientSecret: 'aUgpxRBfKcGWXQmQ' // Typo fixed from aUgpxRBf-cGWXQmQ
};

let cachedToken = null;

async function getAuthToken() {
  if (cachedToken) {
    try {
      const payload = JSON.parse(atob(cachedToken.split('.')[1]));
      if (payload.MapClaims.exp > Date.now() / 1000 + 60) {
        return cachedToken;
      }
    } catch (e) {
      cachedToken = null;
    }
  }

  try {
    const response = await fetch('http://4.224.186.213/evaluation-service/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CREDENTIALS)
    });
    if (response.ok) {
      const data = await response.json();
      cachedToken = data.access_token;
      return cachedToken;
    }
  } catch (err) {
    console.error("Authentication for logging failed", err);
  }
  return null;
}

export const Log = async (stack, level, pkg, message) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.warn("Skipping Log due to missing token");
      return;
    }
    await fetch("http://4.224.186.213/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message
      })
    });
  } catch (error) {
    console.error("Logging failed", error);
  }
};
