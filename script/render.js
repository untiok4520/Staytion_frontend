let selectedRooms = [];

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
        <small>每晚價格</small>
        <div class="price">NT$ ${room.price.toLocaleString()}</div>
        <select class="booking-select" data-room="${room.name}">
        ${[1, 2, 3].map(n => {
          const data = { room: room.name, price: room.price, count: n };
          return `<option value='${JSON.stringify(data)}'>
            ${n} 間 - NT$ ${(room.price * n).toLocaleString()}
          </option>`;
        }).join("")}
        
        </select>
      </div>
    </div>
  `;
}

function updateBookingSummary() {
  const checkinDateStr = document.getElementById("checkin-date").value;
  const checkoutDateStr = document.getElementById("checkout-date").value;

  const checkin = new Date(checkinDateStr);
  const checkout = new Date(checkoutDateStr);

  if (isNaN(checkin) || isNaN(checkout)) {
    document.getElementById("priceDetails").innerHTML = "<span>請先選擇有效日期</span>";
    document.querySelectorAll("#total").forEach(el => el.textContent = "0");
    return;
  }

  const nightCount = Math.max(1, (checkout - checkin) / (1000 * 60 * 60 * 24));

  let subtotal = 0;
  let summaryText = "";

  selectedRooms.forEach(item => {
    const amount = item.price * item.count * nightCount;
    subtotal += amount;
    summaryText += `${item.room}：${item.count} 間 × ${nightCount}晚<br>`;
  });

  const total = subtotal;

  document.querySelector("#priceDetails").innerHTML = summaryText || "<span>請選擇房型</span>";
  document.querySelectorAll("#total").forEach(el => el.textContent = total.toLocaleString());

  // ✅ 顯示已選房型清單
  const listEl = document.getElementById("selected-room-list");
  if (selectedRooms.length === 0) {
    listEl.innerHTML = "";
  } else {
    listEl.innerHTML = selectedRooms.map((item, index) => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
        <span>${item.room}（${item.count} 間）</span>
        <button class="remove-btn" data-index="${index}" style="
          background: none; border: none; color: #dc3545; cursor: pointer; font-size: 16px;">
          移除
        </button>
      </div>
    `).join("");

    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        selectedRooms.splice(index, 1);
        updateBookingSummary();
      });
    });
  }
}

function setupBookingEvents() {
  document.querySelectorAll('.booking-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const data = JSON.parse(e.target.value);
      const existingIndex = selectedRooms.findIndex(r => r.room === data.room);

      if (existingIndex !== -1) {
        if (data.count === 0) {
          selectedRooms.splice(existingIndex, 1);
        } else {
          selectedRooms[existingIndex].count = data.count;
          selectedRooms[existingIndex].price = data.price;
        }
      } else {
        if (data.count > 0) {
          selectedRooms.push(data);
        }
      }

      updateBookingSummary();
    });
  });

  ["checkin-date", "checkout-date"].forEach(id => {
    document.getElementById(id).addEventListener("change", updateBookingSummary);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const checkinInput = document.getElementById("checkin-date");
  const checkoutInput = document.getElementById("checkout-date");

  if (checkinInput && checkoutInput) {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const format = (d) => d.toISOString().split("T")[0];
    checkinInput.value = format(today);
    checkoutInput.value = format(tomorrow);

    //  限制不可選昨天
    checkinInput.min = format(today);
    checkoutInput.min = format(today);
  }

  const roomList = document.getElementById("room-list");
  roomList.innerHTML = rooms.map(renderRoom).join("");

  setupBookingEvents();
});
