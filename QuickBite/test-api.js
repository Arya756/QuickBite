const http = require('http');

async function test() {
  const req1 = await fetch('http://localhost:3000/orders', { method: 'POST' });
  const order = await req1.json();
  const id = order._id || order.id;
  console.log("Created:", id);

  const req2 = await fetch(`http://localhost:3000/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'PREPARING' })
  });
  const up1 = await req2.json();
  console.log("After PREPARING:", up1.notifications);
}
test().catch(console.error);
