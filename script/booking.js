
const orderData = [
    {
        id: '#ORD123', hotel: '台北民宿一館', type: '雙人房', date: '2025/06/10',
        status: '已付款', method: '信用卡', amount: '$3,200',
        guest: '王小明', guestId: 'guest001'
    },
    {
        id: '#ORD124', hotel: '花蓮海景套房', type: '豪華房', date: '2025/06/12',
        status: '未付款', method: '現金', amount: '$2,000',
        guest: '李小華', guestId: 'guest002'
    }
];

const guestData = {
    guest001: {
        name: '王小明', email: 'ming@gmail.com', phone: '0912-345-678',
        orders: 3, amount: '$9,600', lastStay: '2025/06/10'
    },
    guest002: {
        name: '李小華', email: 'hua@gmail.com', phone: '0933-666-777',
        orders: 2, amount: '$4,000', lastStay: '2025/06/12'
    }
};

function showOrderDetail(orderId) {
    const order = orderData.find(o => o.id === orderId);
    if (!order) return;
    document.getElementById('modalOrderCode').textContent = order.id;
    document.getElementById('modalOrderDate').textContent = order.date;
    document.getElementById('modalHotelName').textContent = order.hotel;
    document.getElementById('modalRoomType').textContent = order.type;
    const badge = document.getElementById('modalPaymentStatus');
    badge.textContent = order.status;
    badge.className = `badge ${order.status === '已付款' ? 'bg-success' : 'bg-danger'}`;
    document.getElementById('modalPaymentMethod').textContent = order.method;
    document.getElementById('modalAmount').textContent = order.amount;
    document.getElementById('modalGuestName').textContent = order.guest;
    new bootstrap.Modal(document.getElementById('orderModal')).show();
}

function showGuest(guestId) {
    const guest = guestData[guestId];
    if (!guest) return;
    document.getElementById('modalName').textContent = guest.name;
    document.getElementById('modalEmail').textContent = guest.email;
    document.getElementById('modalPhone').textContent = guest.phone;
    document.getElementById('modalOrders').textContent = guest.orders;
    document.getElementById('modalAmountGuest').textContent = guest.amount;
    document.getElementById('modalLastStay').textContent = guest.lastStay;
    new bootstrap.Modal(document.getElementById('guestModal')).show();
}

const orderTable = document.querySelector('#orderTable tbody');
orderData.forEach(o => {
    orderTable.innerHTML += `
      <tr>
        <td>${o.id}</td>
        <td>${o.hotel}</td>
        <td>${o.type}</td>
        <td>${o.date}</td>
        <td><span class="text-${o.status === '已付款' ? 'success' : 'danger'}">${o.status}</span></td>
        <td>${o.method}</td>
        <td>${o.amount}</td>
        <td><button class="btn btn-sm btn-link p-0 text-decoration-none text-black" onclick="showGuest('${o.guestId}')">${o.guest}</button></td>
        <td><button class="btn btn-sm btn-outline-primary" onclick="showOrderDetail('${o.id}')">查看</button></td>
      </tr>
    `;
});

const guestTable = document.querySelector('#guestTable tbody');
Object.entries(guestData).forEach(([id, g]) => {
    guestTable.innerHTML += `
      <tr>
        <td>${g.name}</td>
        <td>${g.email}</td>
        <td>${g.phone}</td>
        <td>${g.orders}</td>
        <td>${g.amount}</td>
        <td>${g.lastStay}</td>
        <td><button class="btn btn-sm btn-outline-secondary" onclick="showGuest('${id}')">檢視</button></td>
      </tr>
    `;
});
