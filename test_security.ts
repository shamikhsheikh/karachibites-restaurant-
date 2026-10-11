/**
 * Karachi Bites Security, Access Control & API Audit Test Suite
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- STARTING KARACHI BITES COMPREHENSIVE SECURITY AUDIT ---\n');
  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
      failCount++;
    }
  }

  // 1. Check Menu (original 12 items and prices)
  const menuRes = await fetch(`${BASE_URL}/api/menu`);
  const menu = await menuRes.json();
  assert(menuRes.status === 200, 'GET /api/menu returns 200 OK');
  assert(Array.isArray(menu) && menu.length === 12, 'Menu contains exact 12 original items');
  const boti = menu.find((m: any) => m.id === 1);
  const seekh = menu.find((m: any) => m.id === 2);
  const biryani = menu.find((m: any) => m.id === 5);
  assert(boti && boti.name === 'Chicken Malai Boti' && boti.price === 850, 'Item 1: Chicken Malai Boti is Rs. 850');
  assert(seekh && seekh.name === 'Beef Seekh Kebab' && seekh.price === 780, 'Item 2: Beef Seekh Kebab is Rs. 780');
  assert(biryani && biryani.name === 'Chicken Biryani' && biryani.price === 550, 'Item 5: Chicken Biryani is Rs. 550');

  // 2. Unauthenticated access to admin endpoints
  const anonAdminRes = await fetch(`${BASE_URL}/api/admin/orders`);
  assert(anonAdminRes.status === 401, 'Scenario 6: Logged-out visitor calling GET /api/admin/orders is rejected (401)');

  const anonPatchRes = await fetch(`${BASE_URL}/api/admin/orders/KB-1001/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Delivered' }),
  });
  assert(anonPatchRes.status === 401, 'Logged-out visitor calling PATCH /api/admin/orders/:id/status is rejected (401)');

  // 3. Admin login with valid credentials (Username: Karachi Bytes)
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Karachi Bytes',
      password: 'KarachiBites@2026!',
    }),
  });
  const adminData = await adminLoginRes.json();
  assert(adminLoginRes.status === 200, 'Scenario 1A: Authorized admin logs in with username "Karachi Bytes" (200 OK)');
  assert(adminData.token && adminData.user?.role === 'admin', 'Admin session token received with role "admin"');
  const adminToken = adminData.token;

  // 3b. Admin login with email
  const adminEmailLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'mshamikhsheikh2@gmail.com',
      password: 'KarachiBites@2026!',
    }),
  });
  assert(adminEmailLoginRes.status === 200, 'Scenario 1B: Authorized admin logs in with email address (200 OK)');

  // 4. Admin enters incorrect password
  const badPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Karachi Bytes',
      password: 'WrongPassword123!',
    }),
  });
  assert(badPassRes.status === 401, 'Scenario 2: Admin entering incorrect password is denied (401)');

  // 5. Unknown email/username login
  const unknownUserRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'stranger@unknown.com',
      password: 'somepassword',
    }),
  });
  assert(unknownUserRes.status === 401, 'Scenario 3: Unknown email login is denied (401)');

  // 6. Customer logs in with valid customer credentials
  const customerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'customer_ali',
      password: 'CustomerPass123!',
    }),
  });
  const customerData = await customerLoginRes.json();
  assert(customerLoginRes.status === 200, 'Scenario 4A: Normal customer logs in with valid credentials (200 OK)');
  assert(customerData.user?.role === 'customer', 'Customer role is explicitly "customer"');
  const customerToken = customerData.token;

  // 7. Customer calling GET /api/admin/orders
  const customerAdminGet = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(customerAdminGet.status === 403, 'Scenario 7: Customer calling GET /api/admin/orders is denied (403 Forbidden)');

  // 8. Customer calling PATCH /api/admin/orders/:id/status
  const customerPatch = await fetch(`${BASE_URL}/api/admin/orders/KB-1001/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ status: 'Delivered' }),
  });
  assert(customerPatch.status === 403, 'Scenario 8: Customer calling PATCH status is denied (403 Forbidden)');

  // 9. Customer attempting role escalation / forged admin payload
  const forgedRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: {
      Authorization: `Bearer ${customerToken}`,
      'X-User-Role': 'admin',
      'X-Admin': 'true',
    },
  });
  assert(forgedRes.status === 403, 'Scenario 9: Forged admin headers/flags are ignored and rejected (403 Forbidden)');

  // 10. Fake or invalid session token
  const fakeTokenRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { Authorization: 'Bearer fake_invalid_token_12345' },
  });
  assert(fakeTokenRes.status === 401, 'Scenario 10: Invalid/expired session token is denied (401)');

  // 11. Admin views orders and filters by branch
  const adminOrdersRes = await fetch(`${BASE_URL}/api/admin/orders?branch=Clifton`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminOrders = await adminOrdersRes.json();
  assert(adminOrdersRes.status === 200, 'Scenario 12A: Authorized admin can view orders filtered by branch (200 OK)');
  assert(Array.isArray(adminOrders), 'Orders returned as array');

  // 12. Customer creates order (POST /api/orders)
  const newOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        name: 'Saad Ahmed',
        phone: '0300-8765432',
        address: 'House 88, Block 6, Gulshan-e-Iqbal',
      },
      branch: 'Gulshan-e-Iqbal',
      items: [
        { id: 4, qty: 1 }, // Chicken Karahi half (1250)
        { id: 10, qty: 2 }, // Chai (150 * 2 = 300)
      ],
      notes: 'Less spicy please',
    }),
  });
  const newOrder = await newOrderRes.json();
  assert(newOrderRes.status === 201, 'Scenario 13A: Customer creates order (201 Created)');
  assert(newOrder.orderId && newOrder.status === 'Received', 'Order has ID and starts as "Received"');
  assert(newOrder.total === 1250 + 300 + 150, 'Order total accurately computed on server (Rs. 1700 including Rs. 150 delivery)');

  // 13. Customer tracks order
  const trackRes = await fetch(`${BASE_URL}/api/orders/${newOrder.orderId}?phone=03008765432`);
  const tracked = await trackRes.json();
  assert(trackRes.status === 200, 'Scenario 13B: Customer tracks order with matching phone (200 OK)');
  assert(tracked.orderId === newOrder.orderId && tracked.status === 'Received', 'Track returns matching order and status');

  // 14. Admin advances order status (Received -> Preparing)
  const advanceRes = await fetch(`${BASE_URL}/api/admin/orders/${newOrder.orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Preparing' }),
  });
  const advancedOrder = await advanceRes.json();
  assert(advanceRes.status === 200, 'Scenario 12B: Admin advances status from Received to Preparing (200 OK)');
  assert(advancedOrder.status === 'Preparing', 'Order status updated to Preparing');

  // 15. Admin rejects illegal skip (e.g. Preparing -> Delivered without Out for Delivery)
  const illegalSkipRes = await fetch(`${BASE_URL}/api/admin/orders/${newOrder.orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Delivered' }),
  });
  assert(illegalSkipRes.status === 400, 'Server strictly rejects skipping status steps (400 Bad Request)');

  // 16. Admin logout and reuse of revoked token
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(logoutRes.status === 200, 'Scenario 11A: Admin logs out successfully (200 OK)');

  const reusedRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(reusedRes.status === 401, 'Scenario 11B: Reusing revoked session token is rejected (401 Unauthorized)');

  console.log('\n--- AUDIT RESULTS ---');
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
