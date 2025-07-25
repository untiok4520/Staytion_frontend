
// 愛心收藏功能

// === 愛心收藏功能 ===

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
    alert("請先登入！");
    return;
  }

  isFavorited = !isFavorited;
  updateFavoriteIcon();

  const url = "http://localhost:8080/api/favorites";
  const body = JSON.stringify({ userId: parseInt(userId), hotelId: parseInt(hotelId) });

  await fetch(url, {
    method: isFavorited ? "POST" : "DELETE",
    headers: { "Content-Type": "application/json" },
    body
  });
});

// 初始執行
checkIfFavorited();
// 愛心收藏功能 



// 地點自動完成功能 

const destinationInput = document.getElementById("destinationInput");
const suggestionsEl = document.getElementById("suggestions");

let cityList = [];
let cityDistrictList = [];

// 取得城市,區資料
fetch("http://localhost:8080/api/areas/all")
  .then(res => res.json())
  .then(data => {
    cityDistrictList = data.map(d => `${d.city} ${d.label}`);
    const uniqueCities = [...new Set(data.map(d => d.city))];
    cityList = uniqueCities;
  });

// 顯示建議
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

// 綁定事件

//  地點自動完成功能 

destinationInput.addEventListener("input", () => {

  // 地點自動完成功能 

  showSuggestions(destinationInput.value.trim());
});


//  地點自動完成功能 

destinationInput.addEventListener("focus", () => {

  //  地點自動完成功能 

  showSuggestions(destinationInput.value.trim());
});

suggestionsEl.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {

    // === 地點自動完成功能 ===

    destinationInput.value = e.target.textContent;
    suggestionsEl.style.display = "none";
  }
});

document.addEventListener("click", (e) => {

  // === 地點自動完成功能 ===

  if (!suggestionsEl.contains(e.target) && e.target !== destinationInput) {
    suggestionsEl.style.display = "none";
  }
});


// 點擊外部隱藏清單
document.addEventListener("click", (e) => {

  // === 地點自動完成功能 ===

  if (!suggestionsEl.contains(e.target) && e.target !== destinationInput) {
    suggestionsEl.style.display = "none";
  }
});

// 選擇日期 搜尋欄位日期選擇

flatpickr("#daterange", {
  locale: "zh_tw",
  mode: "range",
  minDate: "today",
  dateFormat: "Y-m-d",
  showMonths: 2,
  onChange: function (selectedDates) {
    if (selectedDates.length === 2) {
      const format = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const checkin = format(selectedDates[0]);
      const checkout = format(selectedDates[1]);

      // 這兩行就是同步到預訂面板
      document.getElementById("checkin-date").value = checkin;
      document.getElementById("checkout-date").value = checkout;

      // 讓右側 date picker UI 也同步變動（不一定需要，但體驗更好）
      checkinPicker.setDate(checkin, true);
      checkoutPicker.set("minDate", checkin);
      checkoutPicker.setDate(checkout, true);

      // 若要下拉選單即時更新房型庫存
      updateRoomQuantitiesByAvailability(checkin, checkout);
    }
  }
});


// 預定區塊 入住日、退房日分開

// 入住退房日期選擇 

const checkinPicker = flatpickr("#checkin-date", {
  locale: "zh_tw",
  minDate: "today",
  dateFormat: "Y-m-d",
  onChange: function (_, dateStr) {
    checkoutPicker.set("minDate", dateStr); // 退房日不能早於入住日
  },
});

const checkoutPicker = flatpickr("#checkout-date", {
  locale: "zh_tw",
  minDate: "today",
  dateFormat: "Y-m-d",
});

function syncToSearchBar() {
  const checkin = document.getElementById('checkin-date').value;
  const checkout = document.getElementById('checkout-date').value;
  if (checkin && checkout) {
    document.getElementById('daterange').value = `${checkin} - ${checkout}`;
  }
}

document.getElementById('checkin-date').addEventListener('change', syncToSearchBar);
document.getElementById('checkout-date').addEventListener('change', syncToSearchBar);

// 選擇數量 -------------------------------------------------
// 房客 popup 與數量控制

const guestBtn = document.getElementById("guest-btn");
const guestPopup = document.getElementById("guest-popup");

const guestCounts = {
  adults: 2,
  children: 0,
  rooms: 1
};

// 更新顯示文字
function updateGuestText() {
  guestBtn.value = `${guestCounts.adults} 位成人・${guestCounts.children} 位孩童・${guestCounts.rooms} 間房`;
}

// 顯示/隱藏 popup
guestBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (guestPopup.style.display === "block") {
    guestPopup.style.display = "none";
  } else {
    guestPopup.style.display = "block";
  }
});

// 點擊外部關閉 popup
document.addEventListener("click", (e) => {
  if (!guestPopup.contains(e.target) && e.target !== guestBtn) {
    guestPopup.style.display = "none";
  }
});

// 控制加減按鈕
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

    // 更新 popup 顯示數字
    document.getElementById(type + "-count").textContent = guestCounts[type];
    // 更新輸入欄文字
    updateGuestText();
  });
});

// 初始化文字顯示
updateGuestText();




//貨幣切換按鈕

// === 貨幣切換 ===

document.querySelectorAll("#currencyModal .modal-body.modal-grid a").forEach(function (item) {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const html = this.innerHTML.trim();
    const parts = html.split("<br>");
    const code = parts[parts.length - 1].trim();

    // === 貨幣切換 ===

    const btn = document.querySelector('button[data-bs-target="#currencyModal"]');
    if (btn) {
      btn.textContent = code;
    }
    const modalEl = document.getElementById("currencyModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
  });
});

//語言切換按鈕

// === 語言切換 ===

document.querySelectorAll("#languageModal .modal-body.modal-grid > div").forEach(function (item) {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const span = this.querySelector("span.fi");

    // === 語言切換 ===

    const btn = document.querySelector('button[data-bs-target="#languageModal"]');
    if (span && btn) {
      btn.innerHTML = span.outerHTML;
    }
    const modalEl = document.getElementById("languageModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
  });
});

// 跳轉搜尋結果頁
document.getElementById("search-btn").addEventListener("click", () => {
  const destination = document.getElementById("destinationInput").value.trim();
  const daterange = document.getElementById("daterange").value.trim();
  const { adults, children, rooms } = guestCounts;

  if (!destination || !daterange) {
    alert("請輸入目的地與選擇日期！");
    return;
  }

  // 支援兩種分隔符：「 - 」與「 to 」
  let checkin = '';
  let checkout = '';
  if (daterange.includes(" - ")) {
    [checkin, checkout] = daterange.split(" - ");
  } else if (daterange.includes(" to ")) {
    [checkin, checkout] = daterange.split(" to ");
  } else if (daterange.includes("至")) {
    [checkin, checkout] = daterange.split("至").map(s => s.trim());
  }

  // 防呆：日期沒選完整
  if (!checkin || !checkout) {
    alert("請完整選擇入住與退房日期！");
    return;
  }

  const searchParams = new URLSearchParams({
    destination,
    checkin,
    checkout,
    adults,
    children,
    rooms
  });
  window.location.href = `/pages/SearchPageV2.html?${searchParams.toString()}`;
});