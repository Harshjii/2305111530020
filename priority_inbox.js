const CREDENTIALS = {
  email: 'harsh.gupta2023@glbajajgroup.org',
  name: 'harsh gupta',
  rollNo: '2305111530020',
  accessCode: 'xxkJnk',
  clientID: '4936cfce-8bf9-402f-94cb-4313f568f7d9',
  clientSecret: 'aUgpxRBfKcGWXQmQ'
};

async function getAuthToken() {
  const response = await fetch('http://4.224.186.213/evaluation-service/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS)
  });
  if (!response.ok) {
    throw new Error('Authentication failed');
  }
  const data = await response.json();
  return data.access_token;
}

async function fetchAllNotifications(token) {
  let all = [];
  const limit = 10;
  for (let page = 1; page <= 5; page++) {
    const response = await fetch(`http://4.224.186.213/evaluation-service/notifications?limit=${limit}&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      break;
    }
    const data = await response.json();
    const list = data.notifications || [];
    all = all.concat(list);
    if (list.length < limit) {
      break;
    }
  }
  return all;
}

const WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function getPriorityScore(notification) {
  const weight = WEIGHTS[notification.Type] || 0;
  const time = new Date(notification.Timestamp).getTime();
  return { weight, time };
}

function compare(a, b) {
  const pA = getPriorityScore(a);
  const pB = getPriorityScore(b);

  if (pA.weight !== pB.weight) {
    return pB.weight - pA.weight; // Higher weight first
  }
  return pB.time - pA.time; // Newer timestamp first
}

function getTopNNotifications(notifications, n = 10) {
  const sorted = [...notifications].sort(compare);
  return sorted.slice(0, n);
}

async function main() {
  console.log('--- Campus Notifications Stage 1: Priority Inbox ---');
  try {
    console.log('1. Authenticating...');
    const token = await getAuthToken();
    console.log('Authentication successful!\n');

    console.log('2. Fetching notifications from microservice (paginated pages 1-5)...');
    const allNotifications = await fetchAllNotifications(token);
    console.log(`Fetched ${allNotifications.length} notifications in total.\n`);

    console.log(`3. Computing top 10 priority notifications...`);
    const top10 = getTopNNotifications(allNotifications, 10);

    console.log('\n====================================== TOP 10 PRIORITY INBOX ======================================');
    console.table(top10.map((n, idx) => ({
      Rank: idx + 1,
      ID: n.ID,
      Type: n.Type,
      Message: n.Message,
      Timestamp: n.Timestamp,
      Weight: WEIGHTS[n.Type] || 0
    })));
    console.log('===================================================================================================');

    console.log('\n4. Simulating new streaming notification arrival...');
    const dummyNewNotification = {
      ID: "streamed-new-id-999",
      Type: "Placement",
      Message: "Google Inc. hiring (Streamed Alert)",
      Timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    console.log('New Notification:');
    console.log(dummyNewNotification);

    const currentWorstInTop10 = top10[top10.length - 1];
    const comparison = compare(dummyNewNotification, currentWorstInTop10);
    if (comparison < 0) {
      console.log('Result: This new notification has higher priority than the lowest priority item in top 10!');
      console.log(`Replacing ID ${currentWorstInTop10.ID} (${currentWorstInTop10.Type}) with new Placement notification.`);
      const newTop10 = getTopNNotifications([...top10.slice(0, 9), dummyNewNotification], 10);
      console.table(newTop10.map((n, idx) => ({
        Rank: idx + 1,
        ID: n.ID,
        Type: n.Type,
        Message: n.Message,
        Timestamp: n.Timestamp
      })));
    } else {
      console.log('Result: New notification does not qualify for top 10 (lower priority). Discarding from priority inbox.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
