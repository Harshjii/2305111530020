# Notification System Design

## Stage 1

### Approach & Algorithm

The **Campus Notifications Priority Inbox** manages and displays the most critical notifications first. The priority of any notification is determined by two factors:
1. **Weight (Primary Criteria)**:
   - Placements (`Placement`) are the highest priority (Weight = 3).
   - Results (`Result`) are medium priority (Weight = 2).
   - Events (`Event`) are the lowest priority (Weight = 1).
2. **Recency (Secondary Criteria)**:
   - For notifications with the same weight, the one with the newer timestamp (more recent) is prioritized.

#### Comparison Comparator Logic
We define a comparator function `compare(A, B)` that returns:
- A negative value if `A` has higher priority than `B` (so `A` should appear before `B`).
- A positive value if `B` has higher priority than `A`.
- Zero if they have identical weight and timestamp.

```javascript
const WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

function compare(a, b) {
  const wA = WEIGHTS[a.Type] || 0;
  const wB = WEIGHTS[b.Type] || 0;
  if (wA !== wB) return wB - wA; // Higher weight first
  return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime(); // Newer first
}
```

---

### Efficient Streaming Maintenance for Top $n$ Notifications

In a real-time system, notifications stream in continuously. Re-sorting the entire history for every new notification is highly inefficient ($O(M \log M)$ where $M$ is total history size). 

To maintain the **Top $n$ (e.g., Top 10)** notifications efficiently:
1. **Data Structure**: We use a **Min-Heap** (or priority queue) of capacity $n$.
2. **Dynamic Streaming Logic**:
   - The root of the Min-Heap always represents the *lowest priority* notification currently in our Top $n$.
   - **Insertion ($O(\log n)$)**: When a new notification $x$ arrives:
     - If the heap has fewer than $n$ elements, we simply push $x$ into the heap.
     - If the heap is full ($n$ elements), we compare $x$ with the root element $R$:
       - If $x$ has **higher priority** than $R$ (i.e. `compare(x, R) < 0`), we extract $R$ from the heap and insert $x$. This takes $O(\log n)$ time.
       - If $x$ has **lower or equal priority** than $R$, we discard it. This is a fast $O(1)$ check.
   - Using this heap approach, processing $M$ incoming streaming notifications takes $O(M \log n)$ time, which is extremely efficient and scale-invariant to the total number of campus notifications.

---

### Execution Output & Verified Priority Inbox

The CLI script `priority_inbox.js` was run against the actual live Campus Notifications Microservice. Below is the verified output displaying the Top 10 notifications:

#### Top 10 Priority Notifications (Historical Pool)
| Rank | ID | Type | Message | Timestamp | Weight |
|---|---|---|---|---|---|
| **1** | `3891e0ef-fbce-45b8-8228-9386b7fe621c` | Placement | TSMC hiring | 2026-06-26 03:56:40 | 3 |
| **2** | `3de720e9-4c46-4285-a566-e7ea645659ff` | Placement | Tesla Inc. hiring | 2026-06-26 03:29:13 | 3 |
| **3** | `4eedbf9b-3e2b-4a07-b211-c888a2843657` | Placement | Visa Inc. hiring | 2026-06-26 03:28:01 | 3 |
| **4** | `ce4ec4da-8510-4f45-a705-37e266072105` | Placement | Visa Inc. hiring | 2026-06-26 02:57:52 | 3 |
| **5** | `f6dd9981-3916-4a98-bbae-f623dee5eac4` | Placement | TSMC hiring | 2026-06-26 01:55:37 | 3 |
| **6** | `74790236-e38e-46b7-8714-5019c4077983` | Placement | Amazon.com Inc. hiring | 2026-06-26 00:59:40 | 3 |
| **7** | `f1cbf660-c08c-4ac6-bff7-8f1c3eb6f7c4` | Placement | Amazon.com Inc. hiring | 2026-06-26 00:58:37 | 3 |
| **8** | `e56353da-39cf-481e-973f-0c9b2cc18657` | Placement | Meta Platforms Inc. hiring | 2026-06-26 00:25:19 | 3 |
| **9** | `c4a2bd93-d37c-4a0d-9536-6f68a1c5dbe3` | Placement | Meta Platforms Inc. hiring | 2026-06-25 22:00:07 | 3 |
| **10** | `2ae2c4bd-53e5-4d99-80c8-2c9f5e287213` | Placement | Alphabet Inc. Class C hiring | 2026-06-25 21:55:55 | 3 |

#### Streamed Notification Insertion Result
When a new streamed notification arrives:
```json
{
  "ID": "streamed-new-id-999",
  "Type": "Placement",
  "Message": "Google Inc. hiring (Streamed Alert)",
  "Timestamp": "2026-06-26 06:31:55"
}
```
The streaming heap controller compares it to Rank 10 (`Alphabet Inc. Class C hiring`, Timestamp: `2026-06-25 21:55:55`). Because the new notification is newer, it replaces the Rank 10 item, keeping the priority inbox perfectly sorted in $O(\log 10)$ operations:

| Rank | ID | Type | Message | Timestamp |
|---|---|---|---|---|
| **1** | `streamed-new-id-999` | Placement | Google Inc. hiring (Streamed Alert) | 2026-06-26 06:31:55 |
| **2** | `3891e0ef-fbce-45b8-8228-9386b7fe621c` | Placement | TSMC hiring | 2026-06-26 03:56:40 |
| **3** | `3de720e9-4c46-4285-a566-e7ea645659ff` | Placement | Tesla Inc. hiring | 2026-06-26 03:29:13 |
| **4** | `4eedbf9b-3e2b-4a07-b211-c888a2843657` | Placement | Visa Inc. hiring | 2026-06-26 03:28:01 |
| **5** | `ce4ec4da-8510-4f45-a705-37e266072105` | Placement | Visa Inc. hiring | 2026-06-26 02:57:52 |
| **6** | `f6dd9981-3916-4a98-bbae-f623dee5eac4` | Placement | TSMC hiring | 2026-06-26 01:55:37 |
| **7** | `74790236-e38e-46b7-8714-5019c4077983` | Placement | Amazon.com Inc. hiring | 2026-06-26 00:59:40 |
| **8** | `f1cbf660-c08c-4ac6-bff7-8f1c3eb6f7c4` | Placement | Amazon.com Inc. hiring | 2026-06-26 00:58:37 |
| **9** | `e56353da-39cf-481e-973f-0c9b2cc18657` | Placement | Meta Platforms Inc. hiring | 2026-06-26 00:25:19 |
| **10** | `c4a2bd93-d37c-4a0d-9536-6f68a1c5dbe3` | Placement | Meta Platforms Inc. hiring | 2026-06-25 22:00:07 |
