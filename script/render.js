// ---- 全域變數 ----
let selectedRooms = [];
let guestCounts = { adults: 2, children: 0, rooms: 1 };

// ---- 取得 URL 參數工具 ----
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    destination: params.get("destination") || "",
    checkin: params.get("checkin") || "",
    checkout: params.get("checkout") || "",
    adults: parseInt(params.get("adults")) || 2,
    children: parseInt(params.get("children")) || 0,
    rooms: parseInt(params.get("rooms")) || 1,
  };
}

// ---- Google Maps KEY ----
const googleApiKey = "AIzaSyAyYG7ui9nP1G9dR_pwhjopUdcO_hLbHxM";

// ---- Google Maps 相關 ----
async function getCoordinatesFromAddress(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${googleApiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "OK" && data.results.length > 0) {
    return data.results[0].geometry.location;
  }
  return null;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function renderNearbyPlaces(address) {
  const coord = await getCoordinatesFromAddress(address);
  console.log("Geocoded coord:", coord);
  const listEl = document.getElementById("nearby-places");
  if (!coord || !listEl) {
    if (listEl) listEl.innerHTML = "找不到附近景點";
    return;
  }
  const map = new google.maps.Map(document.createElement("div"));
  const service = new google.maps.places.PlacesService(map);
  const request = {
    location: new google.maps.LatLng(coord.lat, coord.lng),
    radius: 2000,
    type: "tourist_attraction",
    language: "zh-TW",
  };
  service.nearbySearch(request, (results, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
      listEl.innerHTML = "找不到附近景點";
      return;
    }
    const html = results
      .slice(0, 5)
      .map((p) => {
        const dist = calculateDistance(
          coord.lat,
          coord.lng,
          p.geometry.location.lat(),
          p.geometry.location.lng()
        );
        return `<li>${p.name}（約 ${dist.toFixed(1)} 公里）</li>`;
      })
      .join("");
    listEl.innerHTML = `<ul>${html}</ul>`;
  });
}

// ---- 房型庫存控制 ----
async function updateRoomQuantitiesByAvailability(checkin, checkout) {
  const selects = document.querySelectorAll(".booking-select");
  for (const select of selects) {
    const roomTypeId = select.dataset.roomtypeid;
    const roomName = select.dataset.room;
    const price = parseInt(select.dataset.price, 10);

    const res = await fetch(
      `http://localhost:8080/api/rooms/${roomTypeId}/availability?start=${checkin}&end=${checkout}`
    );
    const data = await res.json();

    const remainingArr = data.map((d) => d.availableQuantity);
    const remaining = remainingArr.length > 0 ? Math.min(...remainingArr) : 0;
    select.innerHTML = Array.from({ length: remaining + 1 })
      .map((_, n) => {
        const optionData = {
          room: roomName,
          price,
          count: n,
          roomtypeid: parseInt(roomTypeId),
        };
        return `<option value='${JSON.stringify(optionData)}'>
        ${n === 0 ? "0 間" : `${n} 間 - NT$ ${(price * n).toLocaleString()}`}
      </option>`;
      })
      .join("");

    const roomStockEl = select
      .closest(".room-card")
      .querySelector(".price.stock");
    if (roomStockEl) roomStockEl.textContent = `剩餘${remaining}間房間`;
  }
}

// ---- 取得/渲染房型 ----
function fetchRooms() {
  const hotelId =
    new URLSearchParams(window.location.search).get("hotelId") || 1;
  return fetch(
    `http://localhost:8080/api/admin/roomTypes/hotel/${hotelId}`
  ).then((res) => res.json());
}

function renderRoom(room) {
  // 取得 template
  const tpl = document.getElementById("room-card-template");
  if (!tpl) return document.createElement("div");
  const node = tpl.content.cloneNode(true);

  // 填入圖片
  const img = node.querySelector(".room-image img");
  if (img) {
    img.src = room.imgUrl;
    img.alt = room.rname;
  }
  // 標題
  const h3 = node.querySelector(".room-info h3");
  if (h3) h3.textContent = room.rname;
  // 描述
  const desc = node.querySelector(".room-info .room-desc");
  if (desc) desc.textContent = room.description;
  // 房間特色
  const features = node.querySelector(".room-features");
  if (features) {
    features.innerHTML = "";
    [
      `${room.bedType} × ${room.bedCount}`,
      `${room.capacity}人`,
      `${room.size}平方公尺`,
      room.view,
    ].forEach((txt) => {
      const span = document.createElement("span");
      span.className = "feature-tag";
      span.textContent = txt;
      features.appendChild(span);
    });
  }
  // 設施
  const amenities = node.querySelector(".room-amenities");
  if (amenities) {
    amenities.innerHTML = "";
    if (room.amenities && room.amenities.length > 0) {
      room.amenities.forEach((a) => {
        const span = document.createElement("span");
        span.className = "feature-tag";
        span.textContent = a;
        amenities.appendChild(span);
      });
      amenities.classList.remove("d-none");
    } else {
      amenities.classList.add("d-none");
    }
  }
  // 取消政策
  const cancel = node.querySelector(".room-cancel");
  if (cancel) {
    cancel.textContent = room.isCanceled ? "✓ 可免費取消" : "⚠ 不可取消";
    cancel.classList.remove("cancel-allowed", "cancel-not-allowed");
    cancel.classList.add(
      room.isCanceled ? "cancel-allowed" : "cancel-not-allowed"
    );
  }
  // 剩餘數量
  const stock = node.querySelector(".price.stock");
  if (stock) stock.textContent = `剩餘${room.quantity}間房間`;
  // 價格
  const priceEl = node.querySelector(".room-booking .price:not(.stock)");
  if (priceEl) priceEl.textContent = `NT$ ${room.price.toLocaleString()}`;
  // select
  const select = node.querySelector(".booking-select");
  if (select) {
    select.dataset.room = room.rname;
    select.dataset.price = room.price;
    select.dataset.roomtypeid = room.id;
    // 初始 option
    select.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = JSON.stringify({
      room: room.rname,
      price: room.price,
      count: 0,
      roomtypeid: room.id,
    });
    opt.textContent = "0 間";
    select.appendChild(opt);
  }
  // 返回 DOM 元素
  const wrapper = document.createElement("div");
  wrapper.appendChild(node);
  // 返回內容為 .room-card 元素
  return wrapper.firstElementChild;
}

// ---- 選擇房型 Summary ----
function updateBookingSummary() {
  const checkinDateStr = document.getElementById("checkin-date").value;
  const checkoutDateStr = document.getElementById("checkout-date").value;

  const checkin = new Date(checkinDateStr);
  const checkout = new Date(checkoutDateStr);

  if (isNaN(checkin) || isNaN(checkout)) {
    document.getElementById("priceDetails").innerHTML =
      "<span>請先選擇有效日期</span>";
    document.querySelectorAll("#total").forEach((el) => (el.textContent = "0"));
    return;
  }
  const nightCount = Math.max(1, (checkout - checkin) / (1000 * 60 * 60 * 24));
  let subtotal = 0;
  let summaryText = "";

  selectedRooms.forEach((item) => {
    const amount = item.price * item.count * nightCount;
    subtotal += amount;
    summaryText += `${item.room}：${item.count} 間 × ${nightCount}晚<br>`;
  });

  const total = subtotal;
  document.querySelector("#priceDetails").innerHTML =
    summaryText || "<span>請選擇房型</span>";
  document
    .querySelectorAll("#total")
    .forEach((el) => (el.textContent = total.toLocaleString()));

  const listEl = document.getElementById("selected-room-list");
  if (selectedRooms.length === 0) {
    listEl.innerHTML = "";
  } else {
    listEl.innerHTML = selectedRooms
      .map(
        (item, index) => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
        <span>${item.room}（${item.count} 間）</span>
        <button class="remove-btn" data-index="${index}" style="
          background: none; border: none; color: #dc3545; cursor: pointer; font-size: 16px;">
          移除
        </button>
      </div>
    `
      )
      .join("");
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        selectedRooms.splice(index, 1);
        updateBookingSummary();
      });
    });
  }
}

function setupBookingEvents() {
  document.querySelectorAll(".booking-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      const data = JSON.parse(e.target.value);
      const existingIndex = selectedRooms.findIndex(
        (r) => r.room === data.room
      );
      if (existingIndex !== -1) {
        if (data.count === 0) {
          selectedRooms.splice(existingIndex, 1);
        } else {
          selectedRooms[existingIndex].count = data.count;
          selectedRooms[existingIndex].price = data.price;
        }
      } else {
        if (data.count > 0) {
          selectedRooms.push({
            ...data,
            id: data.roomtypeid,
          });
        }
      }
      updateBookingSummary();
    });
  });
  ["checkin-date", "checkout-date"].forEach((id) => {
    document
      .getElementById(id)
      .addEventListener("change", updateBookingSummary);
  });
}

// ---- 評論 ----
function fetchReviews() {
  const hotelId =
    new URLSearchParams(window.location.search).get("hotelId") || 1;
  return fetch(`http://localhost:8080/api/rooms/${hotelId}/reviews`).then(
    (res) => res.json()
  );
}

function renderSingleReview(r) {
  const tpl = document.getElementById("review-item-template");
  if (!tpl) return document.createElement("div");
  const node = tpl.content.cloneNode(true);
  // 姓名
  const nameEl = node.querySelector(".reviewer-info strong");
  if (nameEl) nameEl.textContent = r.firstName;
  // 日期
  const dateEl = node.querySelector(".reviewer-info small");
  if (dateEl)
    dateEl.textContent = new Date(r.createdAt).toLocaleDateString("zh-TW");
  // 評分與內容
  const p = node.querySelector(".review-item p");
  if (p) p.textContent = `${r.score}｜${r.comment}`;
  // 管理員回覆
  const replyBox = node.querySelector(".reply-box");
  if (replyBox) {
    if (r.reply) {
      replyBox.textContent = `管理員回覆：${r.reply}`;
      replyBox.classList.remove("d-none");
    } else {
      replyBox.classList.add("d-none");
    }
  }
  // 返回
  const wrapper = document.createElement("div");
  wrapper.appendChild(node);
  return wrapper.firstElementChild;
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
  summary.querySelector(".rating-score").textContent =
    data.averageScore.toFixed(1);
  summary.querySelector("p").innerHTML = ` (${data.reviewCount} 則評價)`;
  const reviews = data.reviews;
  const maxToShow = 3;
  const firstFive = reviews.slice(0, maxToShow);
  // 使用 fragment 批量 append
  const frag = document.createDocumentFragment();
  firstFive.forEach((r) => frag.appendChild(renderSingleReview(r)));
  container.appendChild(frag);
  if (reviews.length > maxToShow) {
    const btn = document.createElement("button");
    btn.textContent = "查看更多評價";
    btn.className = "show-more-reviews-btn";
    btn.addEventListener("click", () => {
      container.innerHTML = "";
      const allFrag = document.createDocumentFragment();
      reviews.forEach((r) => allFrag.appendChild(renderSingleReview(r)));
      container.appendChild(allFrag);
      btn.remove();
    });
    container.appendChild(btn);
  }
}

// ---- 飯店資訊 ----
function fetchHotelDetail() {
  const hotelId =
    new URLSearchParams(window.location.search).get("hotelId") || 1;
  return fetch(`http://localhost:8080/api/hotels/${hotelId}`).then((res) =>
    res.json()
  );
}

function renderHotelDetail(hotel) {
  document.querySelector(".hotel-title").childNodes[0].textContent =
    hotel.hname;
  document.querySelector(".hotel-address").textContent = hotel.address;
  renderNearbyPlaces(hotel.address);

  const destinationInput = document.getElementById("destinationInput");
  if (destinationInput && hotel.address) {
    const cityMatch = hotel.address.match(/^[^\d]+?[市縣]/);
    if (cityMatch) {
      destinationInput.value = cityMatch[0];
    }
  }
  const introEl = document.querySelector("#hotel-description");
  if (introEl) introEl.textContent = hotel.description;

  const galleryGrid = document.querySelector(".photo-gallery-grid");
  if (galleryGrid && Array.isArray(hotel.images) && hotel.images.length > 0) {
    const mainPhotoEl = galleryGrid.querySelector(".main-photo img");
    if (mainPhotoEl) {
      mainPhotoEl.src = hotel.images[0].imgUrl;
      mainPhotoEl.alt = hotel.images[0].alt || "飯店主圖";
    }

    const subPhotosEl = galleryGrid.querySelector(".sub-photos");
    if (subPhotosEl) {
      subPhotosEl.innerHTML = "";
      hotel.images.slice(1, 5).forEach((img) => {
        const imgEl = document.createElement("img");
        imgEl.src = img.imgUrl;
        imgEl.alt = img.alt || "飯店圖片";
        subPhotosEl.appendChild(imgEl);
      });
    }
  }

  const mapFrame = document.getElementById("hotel-map");
  if (mapFrame && hotel.address) {
    const encodedAddress = encodeURIComponent(hotel.address);
    mapFrame.src = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  }
}

// ---- 頁面初始化 ----
document.addEventListener("DOMContentLoaded", () => {
  // ----------- 1. 先回填查詢欄位 ----------
  const urlParams = getUrlParams();

  if (urlParams.destination && document.getElementById("destinationInput"))
    document.getElementById("destinationInput").value = urlParams.destination;

  if (
    urlParams.checkin &&
    urlParams.checkout &&
    document.getElementById("daterange")
  ) {
    document.getElementById(
      "daterange"
    ).value = `${urlParams.checkin} - ${urlParams.checkout}`;
  }
  if (document.getElementById("checkin-date"))
    document.getElementById("checkin-date").value = urlParams.checkin;
  if (document.getElementById("checkout-date"))
    document.getElementById("checkout-date").value = urlParams.checkout;

  guestCounts.adults = urlParams.adults;
  guestCounts.children = urlParams.children;
  guestCounts.rooms = urlParams.rooms;
  if (typeof updateGuestText === "function") updateGuestText();

  // ---------- 2. 設定入住/退房預設值（沒帶查詢值時才會跑） ----------
  const checkinInput = document.getElementById("checkin-date");
  const checkoutInput = document.getElementById("checkout-date");
  if (checkinInput && checkoutInput) {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const format = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };
    if (!checkinInput.value) checkinInput.value = format(today);
    if (!checkoutInput.value) checkoutInput.value = format(tomorrow);
    checkinInput.min = format(today);
    checkoutInput.min = format(today);
  }

  // ---------- 3. 飯店主資料 ----------
  fetchHotelDetail().then(renderHotelDetail);

  // ---------- 4. 房型 ----------
  fetchRooms().then((rooms) => {
    const list = document.getElementById("room-list");
    list.innerHTML = "";
    rooms.forEach((room) => {
      const el = renderRoom(room);
      list.appendChild(el);
    });
    setupBookingEvents();
    // 頁面第一次載入時自動抓剩餘庫存
    const checkin = document.getElementById("checkin-date").value;
    const checkout = document.getElementById("checkout-date").value;
    if (checkin && checkout)
      updateRoomQuantitiesByAvailability(checkin, checkout);
  });

  // ---------- 5. 評論 ----------
  fetchReviews().then(renderReviewsSection);

  // ---------- 6. 監聽日期變動自動更新房型庫存與 summary ----------
  document.getElementById("checkin-date").addEventListener("change", () => {
    const checkin = document.getElementById("checkin-date").value;
    const checkout = document.getElementById("checkout-date").value;
    if (checkin && checkout)
      updateRoomQuantitiesByAvailability(checkin, checkout);
    updateBookingSummary();
  });
  document.getElementById("checkout-date").addEventListener("change", () => {
    const checkin = document.getElementById("checkin-date").value;
    const checkout = document.getElementById("checkout-date").value;
    if (checkin && checkout)
      updateRoomQuantitiesByAvailability(checkin, checkout);
    updateBookingSummary();
  });

  // ---------- 7. 跳轉付款流程 ----------
  document.querySelector(".booking-btn").addEventListener("click", async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      // 尚未登入，導向登入頁
      alert("請先登入才能進行訂房。");
      window.location.href = "/pages/login.html";
      return;
    }

    const checkin = document.getElementById("checkin-date").value;
    const checkout = document.getElementById("checkout-date").value;

    // 轉換 selectedRooms -> API 的 items 格式
    const items = selectedRooms.map((item) => ({
      roomTypeId: parseInt(item.id || item.roomtypeid),
      quantity: parseInt(item.count),
    }));

    if (items.length === 0) {
      alert("請先選擇房型！");
      return;
    }

    const requestBody = {
      userId: parseInt(userId),
      checkInDate: checkin,
      checkOutDate: checkout,
      items,
      paymentMethod: "CASH",
    };
    console.log("Request body:", JSON.stringify(requestBody, null, 2));
    try {
      const res = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify(requestBody),
      });
      console.log("API Status:", res.status);
      if (!res.ok) {
        const text = await res.text();
        console.log("API Error Response Text:", text);

        throw new Error("訂單建立失敗");
      }
      const result = await res.json();
      console.log("訂單建立成功:", result);
      // 保留原 bookingData
      const bookingData = {
        hotelId: new URLSearchParams(window.location.search).get("hotelId"),
        hotelName: document.querySelector(".hotel-title")?.innerText,
        checkin,
        checkout,
        rooms: selectedRooms,
        guests: guestCounts,
        order: result,
      };

      localStorage.setItem("bookingData", JSON.stringify(bookingData));
      window.location.href = "/pages/booking_process.html";
    } catch (error) {
      console.error(error);
      alert("建立訂單失敗，請稍後再試！");
    }
  });

  // ---------- 8. 訂單面板浮動 ----------
  document.addEventListener("scroll", () => {
    const bookingPanel = document.querySelector(".booking-panel");
    const roomSection = document.querySelector(".section-title");
    if (!bookingPanel || !roomSection) return;
    const triggerTop = roomSection.getBoundingClientRect().top;
    if (triggerTop < 100) {
      bookingPanel.style.display = "block";
    } else {
      bookingPanel.style.display = "none";
    }
  });
});
