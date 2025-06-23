let selectedRooms = []; // 使用者已選擇的房型清單
let guestCounts = {
  adults: 2,     // 預設成人人數
  children: 0,   // 預設孩童人數
  rooms: 1       // 預設房間數
};

// 從網址中取得 hotelId（1）
function getHotelIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("hotelId") || "1";
}

// 根據 hotelId 向後端撈取飯店資訊（名稱、介紹、地址、照片）
function fetchHotelInfo(hotelId) {
  $.ajax({
    url: `/api/hotels/${hotelId}`,
    method: 'GET',
    success: function(data) {
      $('#hotel-name').text(data.name);
      $('#hotel-description').text(data.description);
      $('#hotel-address').text(data.address);
      $('#hotel-images').html(
        data.images.map(src => `<img src="${src}" width="200">`).join("")
      );
    },
    error: function() {
      alert("無法載入飯店資料");
    }
  });
}

// 根據 hotelId 和入住日期撈取對應房型資料
function fetchRooms(hotelId, checkinDate) {
  return $.ajax({
    url: '/api/rooms',
    method: 'GET',
    data: { hotelId, checkin: checkinDate },
    success: function(rooms) {
      $('#room-list').html(rooms.map(renderRoom).join("")); // 顯示房型清單
      setupBookingEvents(); // 啟用選擇房型功能
    },
    error: function() {
      alert("無法載入房型資料");
    }
  });
}

// 渲染單一房型卡片的 HTML 結構
function renderRoom(room) {
  return `
    <div class="room-card">
      <div class="room-image">
        <img src="${room.image}" alt="${room.name}" width="100%">
      </div>
      <div class="room-info">
        <h3>${room.name}</h3>
        <p>${room.description || ''}</p>
        <p>坪數：${room.size}</p>
        <p style="color: ${room.remaining > 0 ? '#28a745' : '#dc3545'}; font-weight: bold;">
          ${room.remaining > 0 ? '剩餘 ' + room.remaining + ' 間' : '已售完'}
        </p>
      </div>
      <div class="room-booking">
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

// 更新房型選擇摘要與總價計算
function updateBookingSummary() {
  const checkin = new Date($('#checkin-date').val());
  const checkout = new Date($('#checkout-date').val());

  if (isNaN(checkin) || isNaN(checkout)) {
    $("#priceDetails").html("<span>請先選擇有效日期</span>");
    $("#total").text("0");
    return;
  }

  const nightCount = Math.max(1, (checkout - checkin) / (1000 * 60 * 60 * 24)); // 至少 1 晚
  let subtotal = 0;
  let summaryText = "";

  // 每個選擇的房型計算金額
  selectedRooms.forEach(item => {
    const amount = item.price * item.count * nightCount;
    subtotal += amount;
    summaryText += `${item.room}：${item.count} 間 × ${nightCount}晚<br>`;
  });

  $("#priceDetails").html(summaryText || "<span>請選擇房型</span>");
  $("#total").text(subtotal.toLocaleString());

  // 顯示可移除的房型清單
  const listEl = $("#selected-room-list");
  listEl.html(selectedRooms.length === 0 ? "" : selectedRooms.map((item, index) => `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
      <span>${item.room}（${item.count} 間）</span>
      <button class="remove-btn" data-index="${index}" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 16px;">
        移除
      </button>
    </div>
  `).join(""));

  // 點擊移除房型按鈕時，從選擇清單中移除
  $(".remove-btn").click(function () {
    const index = parseInt($(this).data("index"));
    selectedRooms.splice(index, 1);
    updateBookingSummary();
  });
}

// 綁定選擇房型與日期變更的事件
function setupBookingEvents() {
  $(".booking-select").change(function () {
    const data = JSON.parse($(this).val());
    const existingIndex = selectedRooms.findIndex(r => r.room === data.room);

    if (existingIndex !== -1) {
      selectedRooms[existingIndex].count = data.count;
      selectedRooms[existingIndex].price = data.price;
    } else {
      selectedRooms.push(data);
    }

    updateBookingSummary();
  });

  // 日期變更也要更新總金額與摘要
  $("#checkin-date, #checkout-date").change(updateBookingSummary);
}

// 頁面載入後初始化
$(document).ready(function () {
  const hotelId = getHotelIdFromURL();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const format = (d) => d.toISOString().split("T")[0];
  $("#checkin-date").val(format(today)).attr("min", format(today));
  $("#checkout-date").val(format(tomorrow)).attr("min", format(today));

  fetchHotelInfo(hotelId);          // 載入飯店資料
  fetchRooms(hotelId, format(today)); // 載入房型資料
  fetchReviews(hotelId);// 載入評論資料

  // 改入住日期時，重新撈資料
  $("#checkin-date").change(function () {
    const checkin = $(this).val();
    fetchRooms(hotelId, checkin);
  });

  // 點擊預訂按鈕，送出資料到後端 API
  $(".booking-btn").click(function () {
    const bookingData = {
      hotelId: hotelId,
      checkin: $("#checkin-date").val(),
      checkout: $("#checkout-date").val(),
      rooms: selectedRooms,
      guests: guestCounts
    };

    $.ajax({
      url: '/api/book',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(bookingData),
      success: function () {
        alert("預訂成功！");
      },
      error: function (xhr, status, error) {
        alert("預訂失敗：" + error);
      }
    });
  });
});
//  取得住客評價
function fetchReviews(hotelId) {
  $.ajax({
    url: `/api/rooms/{hotelId}reviews`,
    method: "GET",
    data: { hotelId },
    success: function (reviews) {
      const reviewHtml = `
        <div class="rating-summary">
          <div class="rating-score">${calcAvgScore(reviews)}</div>
          <p>超棒 (${reviews.length} 則評價)</p>
          <hr style="margin: 15px 0;">
        </div>
        <div class="reviews-list">
          ${reviews.map(r => `
            <div class="review-item">
              <div class="reviewer-info">
                <strong>${r.name}</strong>
                <div><small>${r.date}</small></div>
              </div>
              <p>${r.comment}</p>
            </div>
          `).join("")}
        </div>
      `;
      $("#review-area").html(reviewHtml);
    },
    error: function () {
      $("#review-area").html("<p>目前暫無評價</p>");
    }
  });
}

//  計算平均分數用的函式
function calcAvgScore(reviews) {
  if (!reviews.length) return "0.0";
  const total = reviews.reduce((sum, r) => sum + (r.score || 8), 0); // 如果沒分數就假設8分
  return (total / reviews.length).toFixed(1);
}
