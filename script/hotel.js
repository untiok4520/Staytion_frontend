
// 愛心收藏功能

const favoriteBtn = document.getElementById("favoriteBtn");
const favoriteIcon = document.getElementById("favoriteIcon");
let isFavorited = false;

const userId = localStorage.getItem("userId");
const hotelId = new URLSearchParams(window.location.search).get("hotelId");




function updateFavoriteIcon() {
  favoriteIcon.classList.toggle("bi-heart", !isFavorited);
  favoriteIcon.classList.toggle("bi-heart-fill", isFavorited);
}

async function checkIfFavorited() {
  if (!userId || !hotelId) return;
  const res = await fetch(`http://localhost:8080/api/favorites/check?userId=${userId}&hotelId=${hotelId}`);
  const data = await res.json();
  isFavorited = data === true;
  updateFavoriteIcon();
}

favoriteBtn.addEventListener("click", async () => {
  if (!userId) {
    alert("請先登入");
    return;
  }

  const nextState = !isFavorited;
  const url = "http://localhost:8080/api/favorites";
  const body = JSON.stringify({ userId: parseInt(userId), hotelId: parseInt(hotelId) });

  try {
    const res = await fetch(url, {
      method: nextState ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body
    });

    if (!res.ok) throw new Error("收藏更新失敗");

    isFavorited = nextState;
    updateFavoriteIcon();
  } catch (err) {
    console.error(err);
    alert("更新收藏狀態時發生錯誤，請稍後再試");
  }
});

// 初始執行
checkIfFavorited();


// 地點自動完成

const destinationInput = document.getElementById("destinationInput");
const suggestionsEl = document.getElementById("suggestions");

let cityList = [];
let cityDistrictList = [];

fetch("http://localhost:8080/api/areas/all")
  .then(res => res.json())
  .then(data => {
    cityDistrictList = data.map(d => `${d.city} ${d.label}`);
    const uniqueCities = [...new Set(data.map(d => d.city))];
    cityList = uniqueCities;
  });

function showSuggestions(keyword = "") {
  let results = [];

  if (keyword === "") {
    results = cityList;
  } else {
    results = cityDistrictList.filter(item =>
      item.includes(keyword) || item.replace(/\s/g, "").includes(keyword)
    );
  }

  if (results.length === 0) {
    suggestionsEl.style.display = "none";
    return;
  }

  suggestionsEl.innerHTML = results
    .map(r => `<li class="list-group-item">${r}</li>`)
    .join("");
  suggestionsEl.style.display = "block";
}

destinationInput.addEventListener("input", () => {
  showSuggestions(destinationInput.value.trim());
});

destinationInput.addEventListener("focus", () => {
  showSuggestions(destinationInput.value.trim());
});

suggestionsEl.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    destinationInput.value = e.target.textContent;
    suggestionsEl.style.display = "none";
  }
});

document.addEventListener("click", (e) => {
  if (!suggestionsEl.contains(e.target) && e.target !== destinationInput) {
    suggestionsEl.style.display = "none";
  }
});


// 日期選擇器

flatpickr("#daterange", {
  locale: "zh_tw",
  mode: "range",
  minDate: "today",
  dateFormat: "Y-m-d",
  showMonths: 2,
  onChange: function(selectedDates) {
    if (selectedDates.length === 2) {
      const format = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const checkin = format(selectedDates[0]);
      const checkout = format(selectedDates[1]);
      updateRoomQuantitiesByAvailability(checkin, checkout);

      document.getElementById("checkin-date").value = checkin;
      document.getElementById("checkout-date").value = checkout;

      checkinPicker.setDate(checkin, true);
      checkoutPicker.set("minDate", checkin);
      checkoutPicker.setDate(checkout, true);
    }
  }
});

// 入住退房 picker
const checkinPicker = flatpickr("#checkin-date", {
  locale: "zh_tw",
  minDate: "today",
  dateFormat: "Y-m-d",
  onChange: function (_, dateStr) {
    checkoutPicker.set("minDate", dateStr);
  },
});

const checkoutPicker = flatpickr("#checkout-date", {
  locale: "zh_tw",
  minDate: "today",
  dateFormat: "Y-m-d",
});


// 人數 popup
const guestBtn = document.getElementById("guest-btn");
const guestPopup = document.getElementById("guest-popup");
const guestCounts = { adults: 2, children: 0, rooms: 1 };

function updateGuestText() {
  guestBtn.value = `${guestCounts.adults} 位成人・${guestCounts.children} 位孩童・${guestCounts.rooms} 間房`;
}

guestBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  guestPopup.style.display = guestPopup.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
  if (!guestPopup.contains(e.target) && e.target !== guestBtn) {
    guestPopup.style.display = "none";
  }
});

guestPopup.querySelectorAll("button.qty-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    const action = btn.dataset.action;

    if (action === "increase") {
      guestCounts[type]++;
    } else if (action === "decrease") {
      if ((type === "adults" || type === "rooms") && guestCounts[type] > 1) {
        guestCounts[type]--;
      } else if (type === "children" && guestCounts[type] > 0) {
        guestCounts[type]--;
      }
    }

    document.getElementById(type + "-count").textContent = guestCounts[type];
    updateGuestText();
  });
});

updateGuestText();

// 搜尋跳轉

document.getElementById("search-btn").addEventListener("click", () => {
  const destination = encodeURIComponent(document.getElementById("destinationInput").value.trim());
  const daterange = document.getElementById("daterange").value.trim();
  const { adults, children, rooms } = guestCounts;

  if (!destination || !daterange) {
    alert("請輸入目的地與選擇日期！");
    return;
  }

  const [checkin, checkout] = daterange.split(" to ");
  const searchParams = new URLSearchParams({
    destination,
    checkin,
    checkout,
    adults,
    children,
    rooms
  });

  window.location.href = `/SearchPageV2.html?${searchParams.toString()}`;
});


// 房型庫存更新

async function updateRoomQuantitiesByAvailability(checkin, checkout) {
  const selects = document.querySelectorAll(".booking-select");

  for (const select of selects) {
    const roomTypeId = select.dataset.roomtypeid;
    const roomName = select.dataset.room;
    const price = parseInt(select.dataset.price, 10) || 0;

    const res = await fetch(`http://localhost:8080/api/rooms/${roomTypeId}/availability?start=${checkin}&end=${checkout}`);
    const data = await res.json();

    const remaining = Math.min(...data.map(d => d.availableQuantity));
    const safeRemaining = isFinite(remaining) ? remaining : 0;

    const stockText = select.closest(".room-booking").querySelector(".price");
    if (stockText) {
      stockText.textContent = `剩餘${safeRemaining}間房間`;
    }

    select.innerHTML = Array.from({ length: safeRemaining + 1 }).map((_, n) => {
      const total = n * price;
      const optionData = { room: roomName, price: price, count: n };
      return `<option value='${JSON.stringify(optionData)}'>${n} 間（NT$ ${total}）</option>`;
    }).join("");
  }
}
