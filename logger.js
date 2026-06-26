const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoYXJzaC5ndXB0YTIwMjNAZ2xiYWphamdyb3VwLm9yZyIsImV4cCI6MTc4MjQ1Mzg1NiwiaWF0IjoxNzgyNDUyOTU2LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZDJlNGIxYzUtZmUxZC00MjgzLTliNTUtNjIzNzg0ODM1Y2ZhIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2ggZ3VwdGEiLCJzdWIiOiI0OTM2Y2ZjZS04YmY5LTQwMmYtOTRjYi00MzEzZjU2OGY3ZDkifSwiZW1haWwiOiJoYXJzaC5ndXB0YTIwMjNAZ2xiYWphamdyb3VwLm9yZyIsIm5hbWUiOiJoYXJzaCBndXB0YSIsInJvbGxObyI6IjIzMDUxMTE1MzAwMjAiLCJhY2Nlc3NDb2RlIjoieHhrSm5rIiwiY2xpZW50SUQiOiI0OTM2Y2ZjZS04YmY5LTQwMmYtOTRjYi00MzEzZjU2OGY3ZDkiLCJjbGllbnRTZWNyZXQiOiJhVWdweFJCZktjR1dYUW1RIn0.4qHwQBgEWlSKQxR3Kn8Nuuf5-Fr6LEcZLpLP2JJgpQk";

export const Log = async (stack, level, pkg, message) => {
  try {
    await fetch("http://4.224.186.213/evaluation-service/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`
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