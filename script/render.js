function renderRoom(room) {
  return `
    <div class="room-card">
      <div class="room-image">
        <img src="${room.image}" alt="${room.name}" width="100%">
      </div>
      <div class="room-info">
        <h3>${room.name}</h3>
        <p>${room.description}</p>
        <div class="room-features">
          ${room.features.map(f => `<span class="feature-tag">${f}</span>`).join("")}
        </div>
        <p style="color: ${room.cancelPolicy.includes('✓') ? '#28a745' : '#dc3545'}; font-weight: bold;">
          ${room.cancelPolicy}
        </p>
      </div>
      <div class="room-booking">
        <div class="price">剩餘${room.remaining}間房間</div>
        <small>每晚含稅</small>
        <div class="price">NT$ ${room.price.toLocaleString()}</div>
       <select class="booking-select">
  <option disabled selected>請選擇房型數量</option>
  ${[1, 2, 3].map(n => {
    const data = {
      room: room.name,
      price: room.price,
      count: n
    };
    return `<option value='${JSON.stringify(data)}'>
      ${n}間 - NT$ ${(room.price * n).toLocaleString()}
    </option>`;
  }).join("")}
</select>

      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const roomList = document.getElementById("room-list");
  roomList.innerHTML = rooms.map(renderRoom).join("");

  // 插入新的事件監聽器（總金額更新）
  setupBookingEvents();
});
 function setupBookingEvents() {
  document.querySelectorAll('.booking-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const data = JSON.parse(e.target.value);
      const { room: roomName, price: unitPrice, count } = data;

      const checkinInput = document.querySelector('.booking-panel input[type="date"]');
      const checkoutInput = document.querySelectorAll('.booking-panel input[type="date"]')[1];
      const checkin = new Date(checkinInput.value);
      const checkout = new Date(checkoutInput.value);

      const nightCount = Math.max(1, (checkout - checkin) / (1000 * 60 * 60 * 24));
      const subtotal = unitPrice * count * nightCount;
      const serviceFee = Math.round(subtotal * 0.1);
      const total = subtotal + serviceFee;

      // 更新右側價格資訊
      document.querySelector("#priceDetails span:nth-child(1)").textContent =
        `${nightCount}晚 × NT$ ${(unitPrice * count).toLocaleString()}`;
      document.querySelector("#priceDetails span:nth-child(2)").textContent =
        `NT$ ${subtotal.toLocaleString()}`;
      document.getElementById("tax").textContent = serviceFee.toLocaleString();
      document.getElementById("total").textContent = total.toLocaleString();

      // 顯示選擇的房型名稱
      let titleEl = document.getElementById("selected-room-name");
      if (!titleEl) {
        titleEl = document.createElement("div");
        titleEl.id = "selected-room-name";
        titleEl.style.marginBottom = "10px";
        titleEl.style.fontWeight = "bold";
        titleEl.style.color = "#1F487E";
        document.querySelector('.booking-panel').insertBefore(titleEl, document.querySelector('.form-group'));
      }
      titleEl.textContent = `已選擇房型：${roomName}`;
    });
  });
}

