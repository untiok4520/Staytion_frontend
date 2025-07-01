let selectedRooms = [];


document.addEventListener("DOMContentLoaded", () => {
  const checkin = document.getElementById("checkin-date").value;
  const checkout = document.getElementById("checkout-date").value;
  if (checkin && checkout) {
    updateRoomSelectOptionsByAvailability(checkin, checkout);
  }
});



// === 取得房型資料 ===

function fetchRooms() {
  const hotelId = new URLSearchParams(window.location.search).get("hotelId") || 1;
  return fetch(`http://localhost:8080/api/admin/roomTypes/hotel/${hotelId}`)
    .then(res => res.json());
}


// === 渲染房型卡片 ===

function renderRoom(room) {
  return `
    <div class="room-card">
      <div class="room-image">
        <img src="${room.imgUrl}" alt="${room.rname}" width="100%">
      </div>
      <div class="room-info">
        <h3>${room.rname}</h3>
        <p>${room.description}</p>
        <div class="room-features">
          <span class="feature-tag">${room.bedType} × ${room.bedCount}</span>
          <span class="feature-tag">${room.capacity}人</span>
          <span class="feature-tag">${room.size}平方公尺</span>
          <span class="feature-tag">${room.view}</span>
        </div>
        ${room.amenities && room.amenities.length > 0 ? `
        <div class="room-amenities" style="margin-top: 5px;">
          ${room.amenities.map(a => `<span class="feature-tag">${a}</span>`).join(" ")}
        </div>` : ""}
        <div style="margin-top: 10px;">
         <p style="color: ${room.isCanceled ? '#28a745' : '#dc3545'}; font-weight: bold; margin: 0;">
        <i class="bi ${room.isCanceled ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
        ${room.isCanceled ? " 可免費取消" : " 不可取消"}
        </p>

          </p>
        </div>
      </div>
      <div class="room-booking">
        <div class="price">剩餘${room.quantity}間房間</div>
        <small>每晚價格</small>
        <div class="price">NT$ ${room.price.toLocaleString()}</div>

        <select
        class="booking-select"
        data-roomtypeid="${room.id}"  
        data-room="${room.rname}"
        data-price="${room.price}">
        <option value='${JSON.stringify({ room: room.rname, price: room.price, count: 0 })}'>0 間</option>
        ${Array.from({ length: room.quantity }, (_, i) => `
          <option value='${JSON.stringify({ room: room.rname, price: room.price, count: i + 1 })}'>${i + 1} 間</option>
        `).join("")}
      </select>

      </div>
    </div>
  `;
}



// === 計算與更新預訂總計 ===

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

// === 計算與更新預訂總計 ===

        updateBookingSummary();
      });
    });
  }
}



// === 根據選擇日期更新下拉選單 ===

function watchDateAndUpdateRoomSelect() {
  const checkinInput = document.getElementById("checkin-date");
  const checkoutInput = document.getElementById("checkout-date");

  function updateIfBothDatesSelected() {
    const checkin = checkinInput.value;
    const checkout = checkoutInput.value;

    if (checkin && checkout) {
      updateRoomQuantitiesByAvailability(checkin, checkout);
    }
  }

  checkinInput.addEventListener("change", updateIfBothDatesSelected);
  checkoutInput.addEventListener("change", updateIfBothDatesSelected);
}



// === 房型選擇事件監聽 ===

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


// === 計算與更新預訂總計 ===

      updateBookingSummary();
    });
  });

  ["checkin-date", "checkout-date"].forEach(id => {

// === 計算與更新預訂總計 ===

    document.getElementById(id).addEventListener("change", updateBookingSummary);
  });
}


// === 取得與渲染評論 ===

function fetchReviews() {
  const hotelId = new URLSearchParams(window.location.search).get("hotelId") || 1;
  return fetch(`http://localhost:8080/api/rooms/${hotelId}/reviews`)
    .then(res => res.json())
    .then(data => {
      return data;
    });
}

function renderReviewsSection(data) {
  const container = document.querySelector(".reviews-list");
  const summary = document.querySelector(".rating-summary");
    const scoreBadge = document.querySelector(".review-score");
  if (scoreBadge && data?.averageScore) {
    scoreBadge.textContent = data.averageScore.toFixed(1);
  }
  container.innerHTML = "";

  if (!data || !data.reviews || data.reviews.length === 0) {
    container.innerHTML = "<p>目前尚無評論。</p>";
    return;
  }

  summary.querySelector(".rating-score").textContent = data.averageScore.toFixed(1);
  summary.querySelector("p").innerHTML = ` (${data.reviewCount} 則評價)`;

  const reviews = data.reviews;
  const maxToShow = 3;

  const firstFive = reviews.slice(0, maxToShow);
  container.innerHTML = firstFive.map(renderSingleReview).join("");

  if (reviews.length > maxToShow) {
    const btn = document.createElement("button");
    btn.textContent = "查看更多評價";
    btn.style = "margin-top: 10px; padding: 8px 12px; background:rgba(0, 123, 255, 0.97); color: white; border: none; border-radius: 4px; cursor: pointer;";
    btn.addEventListener("click", () => {
      container.innerHTML = reviews.map(renderSingleReview).join("");
      btn.remove();
    });
    container.appendChild(btn);
  }
}

function renderSingleReview(r) {
  const date = new Date(r.createdAt).toLocaleDateString("zh-TW");
  return `
    <div class="review-item">
      <div class="reviewer-info">
        <strong>${r.firstName}</strong>
        <div><small>${date}</small></div>
      </div>
      <p>⭐ ${r.score}｜${r.comment}</p>
      ${r.reply ? `
        <div style="font-size: 14px; color: #555; background: #f6f6f6; padding: 8px; border-left: 3px solid #007bff;">
          管理員回覆：${r.reply}
        </div>` : ""}
    </div>
  `;
}


// === 取得與渲染飯店資訊 ===

function fetchHotelDetail() {
  const hotelId = new URLSearchParams(window.location.search).get("hotelId") || 1;
  return fetch(`http://localhost:8080/api/hotels/${hotelId}`)
    .then(res => res.json())
    .then(data => {
      // console.log("取得飯店資料：", data);
      return data;
    });
}

function renderHotelDetail(hotel) {
  document.querySelector(".hotel-title").childNodes[0].textContent = hotel.hname;
  document.querySelector(".hotel-address").textContent = hotel.address;
setTimeout(() => renderNearbyPlaces(hotel.address), 500);


    const destinationInput = document.getElementById("destinationInput");
  if (destinationInput && hotel.address) {
   const cityMatch = hotel.address.match(/^[^\d]+?[市縣]/); // 找第一個「市」或「縣」為止
if (cityMatch) {
  destinationInput.value = cityMatch[0];
}
  }
  const introEl = document.querySelector("#hotel-description");
  if (introEl) introEl.textContent = hotel.description;

  const gallery = document.querySelector(".photo-gallery");
  if (gallery && Array.isArray(hotel.images)) {
    gallery.innerHTML = hotel.images.map(img => `
      <div class="photo-placeholder">
        <img src="${img.imgUrl}" width="300" height="200" alt="飯店圖片">
      </div>
    `).join("");
  }

  const mapFrame = document.getElementById("hotel-map");
  if (mapFrame && hotel.address) {
    const encodedAddress = encodeURIComponent(hotel.address);
    mapFrame.src = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const checkinInput = document.getElementById("checkin-date");
  const checkoutInput = document.getElementById("checkout-date");

  if (checkinInput && checkoutInput) {
    const urlParams = new URLSearchParams(window.location.search);
    const checkinParam = urlParams.get("checkin");
    const checkoutParam = urlParams.get("checkout");

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const format = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    checkinInput.value = checkinParam || format(today);
    checkoutInput.value = checkoutParam || format(tomorrow);

    checkinInput.min = format(today);
    checkoutInput.min = format(today);
  }


// === 取得與渲染飯店資訊 ===

  fetchHotelDetail().then(renderHotelDetail);

// === 取得房型資料 ===

  fetchRooms().then(rooms => {

// === 渲染房型卡片 ===

    document.getElementById("room-list").innerHTML = rooms.map(renderRoom).join("");

// === 房型選擇事件監聽 ===

    setupBookingEvents();

    const checkin = document.getElementById("checkin-date").value;
  });

// === 取得與渲染評論 ===

  fetchReviews().then(renderReviewsSection);

// === 根據選擇日期更新下拉選單 ===

  watchDateAndUpdateRoomSelect();

  document.getElementById("checkin-date").addEventListener("change", () => {
    const checkin = document.getElementById("checkin-date").value;
  });
});
 
//跳轉到付款流程

document.querySelector(".booking-btn").addEventListener("click", () => {
  const bookingData = {
    checkin: document.getElementById("checkin-date").value,
    checkout: document.getElementById("checkout-date").value,
    rooms: selectedRooms,
    guests: guestCounts
  };

  // 儲存資料到 localStorage
  localStorage.setItem("bookingData", JSON.stringify(bookingData));

  // 跳轉先咧的 checkout 頁面
  window.location.href = "/booking_success.html"; 
});
//金鎖
const googleApiKey = "AIzaSyDEotZV3cny-APXikPJ_aJAmSo5NA3Far8";



function simplifyAddress(address) {
  // 移除「幾鄰」、「弄幾號」、「幾號」、還有「里、村、鄰」後面的太細地址
  let simplified = address
    .replace(/\d+鄰/g, "")
    .replace(/弄\d+號.*/, "")
    .replace(/\d+號/g, "")
    .replace(/(里|村)[^市區]+/, "") 
    .trim();
  return simplified || address;
}



async function getCoordinatesFromAddress(address) {
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleApiKey}`);
  const data = await res.json();
  return data.results[0]?.geometry.location || null;
}


// === 取得附近景點（Google API） ===
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


async function renderNearbyPlaces(address) {
  // console.log("開始抓附近景點，地址：", address);

  const simplified = simplifyAddress(address);
  // console.log("簡化後地址：", simplified);

  let coord = await getCoordinatesFromAddress(simplified);
  if (!coord) {
    coord = { lat: 23.9641, lng: 120.9745 };
  } else {
   
  }

  try {
    const res = await fetch(`http://localhost:8080/api/nearby?lat=${coord.lat}&lng=${coord.lng}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      document.getElementById("nearby-places").innerHTML = "<p>找不到附近景點</p>";
      return;
    }

    const html = data.slice(0, 5).map(p => {
      return `<li>${p.name} 約 ${p.distance.toFixed(1)} 公里</li>`;
    }).join("");

    const listEl = document.getElementById("nearby-places");
    if (listEl) listEl.innerHTML = `<ul>${html}</ul>`;
  } catch (err) {
    console.error("抓附近景點失敗：", err);
    document.getElementById("nearby-places").innerHTML = "<p>附近景點載入失敗</p>";
  }
}