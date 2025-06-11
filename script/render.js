

// 將一筆房型資料變成 HTML 結構
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
            ${[1, 2, 3].map(n => `<option>${n}間 - NT$ ${(room.price * n).toLocaleString()}</option>`).join("")}
          </select>
        </div>
      </div>
    `;
  }

  // 等頁面載入完成後，把房型資料插進去
  document.addEventListener("DOMContentLoaded", () => {
    const roomList = document.getElementById("room-list");
    roomList.innerHTML = rooms.map(renderRoom).join("");
  });