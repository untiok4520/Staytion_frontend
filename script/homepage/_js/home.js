// 導覽列 -------------------------------------------------

//貨幣切換按鈕
document
    .querySelectorAll("#currencyModal .modal-body.modal-grid a")
    .forEach(function (item) {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            const html = this.innerHTML.trim();
            const parts = html.split("<br>");
            const code = parts[parts.length - 1].trim(); // 取最後一行的貨幣代碼
            const btn = document.querySelector(
                'button[data-bs-target="#currencyModal"]'
            );
            if (btn) {
                btn.textContent = code;
            }
            //關閉modal
            const modalEl = document.getElementById("currencyModal");
            const modalInstance =
                window.bootstrap && window.bootstrap.Modal
                    ? window.bootstrap.Modal.getInstance(modalEl)
                    : typeof bootstrap !== "undefined" && bootstrap.Modal
                        ? bootstrap.Modal.getInstance(modalEl)
                        : null;
            if (modalInstance) modalInstance.hide();
        });
    });

//語言切換按鈕
document
    .querySelectorAll("#languageModal .modal-body.modal-grid > div")
    .forEach(function (item) {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            const span = this.querySelector("span.fi");
            const btn = document.querySelector(
                'button[data-bs-target="#languageModal"]'
            );
            if (span && btn) {
                // 將button的內容換成<span>
                btn.innerHTML = span.outerHTML;
            }
            // 關閉 modal
            const modalEl = document.getElementById("languageModal");
            const modalInstance =
                window.bootstrap && window.bootstrap.Modal
                    ? window.bootstrap.Modal.getInstance(modalEl)
                    : typeof bootstrap !== "undefined" && bootstrap.Modal
                        ? bootstrap.Modal.getInstance(modalEl)
                        : null;
            if (modalInstance) modalInstance.hide();
        });
    });

// 選擇地點 -------------------------------------------------

const suggestionsEl = document.getElementById("suggestions");
const destinationInput = document.getElementById("destinationInput");

const popularCities = ["台北", "台中", "台南", "宜蘭", "花蓮"];

// 顯示建議清單
function showSuggestions(keyword = "") {
    const filtered = popularCities.filter(city =>
        city.toLowerCase().includes(keyword.toLowerCase())
    );

    if (filtered.length === 0) {
        suggestionsEl.style.display = "none";
        return;
    }

    suggestionsEl.innerHTML = filtered
        .map(city => `<li class="list-group-item">${city}</li>`)
        .join("");

    suggestionsEl.style.display = "block";
}

// 輸入時更新建議
destinationInput.addEventListener("input", () => {
    const keyword = destinationInput.value.trim();
    showSuggestions(keyword); // 即使 keyword 為空也要顯示熱門城市
});

// 點擊 input 時就顯示熱門城市
destinationInput.addEventListener("focus", () => {
    showSuggestions(); // 無輸入時預設顯示所有熱門城市
});

// 點選建議
suggestionsEl.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
        destinationInput.value = e.target.textContent;
        suggestionsEl.style.display = "none";
    }
});

// 點擊外部隱藏清單
document.addEventListener("click", (e) => {
    if (!suggestionsEl.contains(e.target) && e.target !== destinationInput) {
        suggestionsEl.style.display = "none";
    }
});

// 選擇日期 -------------------------------------------------

flatpickr("#daterange", {
    locale: "zh_tw",
    mode: "range",
    minDate: "today",
    dateFormat: "Y-m-d",
    showMonths: 2
});

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

// 近期搜尋紀錄 -------------------------------------------------
const searchBtn = document.getElementById('search-btn');
const searchHistory = document.querySelector('.search-history');

// 取得容器和箭頭按鈕
const historyCarousel = document.getElementById('history-carousel');
const nexthistoryBtn = document.getElementById('scroll-next-history');
const prevhistoryBtn = document.getElementById('scroll-prev-history');

// 預設隱藏箭頭按鈕
nexthistoryBtn.style.display = 'none';
prevhistoryBtn.style.display = 'none';

// 使用實際卡片寬度加 margin 做為滾動距離
const getScrollAmount = () => {
    const card = document.querySelector('.city-carousel .card');
    return card ? card.offsetWidth + 16 : 260;
};

// 根據卡片數量來顯示箭頭按鈕
function updateArrowsVisibility() {
    const totalCards = historyCarousel.children.length;

    // 超過 5 張卡片時顯示箭頭按鈕
    if (totalCards >= 5) {
        nexthistoryBtn.style.display = 'block';
        prevhistoryBtn.style.display = 'block';
    } else {
        nexthistoryBtn.style.display = 'none';
        prevhistoryBtn.style.display = 'none';
    }
}

nexthistoryBtn.addEventListener('click', () => {
    historyCarousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
});

prevhistoryBtn.addEventListener('click', () => {
    historyCarousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
});

// 假設登入使用者 ID 為 1
const userId = 1;

async function fetchSearchHistory(userId) {
    try {
        const response = await fetch(`http://localhost:8080/api/histories/${userId}`);
        if (!response.ok) throw new Error('無法取得歷史紀錄');

        const data = await response.json();

        historyCarousel.innerHTML = ""; // 清空內容

        data.forEach(item => {
            // 這裡的欄位名稱請根據你的 API 回傳格式調整
            const city = item.cname || '未知城市';
            const imgUrl = item.imgUrl || '../../assets/homepage/img/default.jpg';
            const startDate = item.checkInDate || '未知日期';
            const endDate = item.checkOutDate || '未知日期';
            const total = item.total || '未知人數';

            const card = document.createElement("div");
            card.classList.add("history-card", "d-flex", "border", "rounded", "p-2");
            card.style.minWidth = "250px";

            card.innerHTML = `
        <div class="history-img me-3">
          <img src="${imgUrl}" alt="${city}" width="100px" class="rounded">
        </div>
        <div class="history-content">
          <div class="history-item fw-bold">${city}</div>
          <div class="history-item">${startDate} 至 <br>${endDate}</div>
          <div class="history-item">${total} 位</div>
        </div>
      `;

            historyCarousel.appendChild(card);
        });

        updateArrowsVisibility();

    } catch (err) {
        console.error("取得搜尋紀錄失敗:", err);
    }
}


async function addSearchHistory(userId, city, checkInDate, checkOutDate, adults, kids) {
    try {
        await fetch(`http://localhost:8080/api/histories/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cityName: city,
                checkInDate,
                checkOutDate,
                searchTime: new Date().toISOString(), // 自動產生時間
                adults,
                kids
            })
        });

        await fetchSearchHistory(userId); // 成功後更新搜尋歷史
        searchHistory.style.display = 'block';
    } catch (err) {
        console.error('新增搜尋紀錄失敗:', err);
    }
}


searchBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const city = document.getElementById('destinationInput').value || '台北市';
    const dateInput = document.getElementById('daterange');
    const dateRange = dateInput.value.split(' 至 ');
    const startDate = dateRange[0]?.trim() || null;
    const endDate = dateRange[1]?.trim() || null;

    const adults = guestCounts?.adults ?? 1;
    const kids = guestCounts?.children ?? 0;

    await addSearchHistory(userId, city, startDate, endDate, adults, kids);
});

// 更新箭頭顯示狀態
updateArrowsVisibility();

// 熱門城市 -------------------------------------------------

const carousel = document.getElementById('city-carousel');
const nextBtn = document.getElementById('scroll-next');
const prevBtn = document.getElementById('scroll-prev');

nextBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
});

prevBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
});

// 發送多次請求並渲染城市資料
const cityIds = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const citiesData = [];  // 存放城市資料

// 用 Promise.all 來等所有的請求完成後再渲染
async function loadCitiesData() {
    try {
        const promises = cityIds.map(id =>
            axios.get(`http://localhost:8080/api/city/${id}/hotel-count`)
        );

        // 等待所有請求都完成
        const responses = await Promise.all(promises);

        // 處理每一個回應的數據
        responses.forEach(response => {
            const city = response.data;

            // 把城市資料加入到 citiesData 中
            citiesData.push(city);

            // 渲染城市卡片
            renderCityCard(city);
        });
    } catch (error) {
        console.error('獲取城市資料出錯:', error);
    }
}

// 渲染城市卡片的函數
function renderCityCard(city) {
    const cityCarousel = document.getElementById('city-carousel');
    const cityCard = document.createElement('div');
    cityCard.classList.add('city-card');

    cityCard.innerHTML = `
        <div class="card">
            <a href="#" class="text-decoration-none text-dark d-block position-relative">
            <img src="${city.img_url}" class="card-img-top" alt="${city.city}">
            <div class="card-body text-center">
                <h5 class="ccard-title fw-bold">${city.city}</h5>
                <p class="card-text text-muted small">${city.hotelCount}間住宿</p>
            </div>
            </a>
        </div>
    `;
    cityCarousel.appendChild(cityCard);
}


// 精選飯店 -------------------------------------------------

// 取得容器和箭頭按鈕
const recommendationCarousel = document.getElementById('recommendation-carousel');
const nextRecommendationBtn = document.getElementById('scroll-next-recommendation');
const prevRecommendationBtn = document.getElementById('scroll-prev-recommendation');

nextRecommendationBtn.addEventListener('click', () => {
    recommendationCarousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
});

prevRecommendationBtn.addEventListener('click', () => {
    recommendationCarousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
});

async function loadTopHotels() {
    try {
        const response = await fetch('http://localhost:8080/api/top-hotels');
        if (!response.ok) {
            throw new Error('網路錯誤');
        }
        const hotels = await response.json();

        hotels.forEach(hotel => {
            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <a href="#" class="text-decoration-none text-dark d-block position-relative">
                    <img src="${hotel.coverImageUrl}" class="card-img-top" alt="${hotel.hotelName}">
                    <button class="btn btn-light heart-btn position-absolute top-0 end-0 m-2 rounded-circle shadow-sm">
                        <i class="bi bi-heart"></i>
                    </button>
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${hotel.hotelName}</h5>
                        <p class="card-text text-muted small"><i class="bi bi-geo-alt me-1"></i> ${hotel.districtName}, ${hotel.cityName}</p>
                        <p class="mb-1">
                            <span class="badge rate">${hotel.averageRating.toFixed(1)}</span>
                            <small class="text-muted ms-1">${hotel.reviewCount} 則評價</small>
                        </p>
                        <p class="fw-bold mt-2">NT$${hotel.lowestPrice} / 晚起</p>
                    </div>
                </a>
            `;
            recommendationCarousel.appendChild(card);
        });
    } catch (error) {
        console.error('取得精選飯店失敗:', error);
    }
}



// 收藏功能
document.addEventListener('click', function (e) {
    if (e.target.closest('.heart-btn')) {
        e.stopPropagation(); // 阻止冒泡
        e.preventDefault();  // 防止誤觸 <a>

        const icon = e.target.closest('.heart-btn').querySelector('i');
        icon.classList.toggle('bi-heart');
        icon.classList.toggle('bi-heart-fill');
        icon.classList.toggle('text-danger');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadCitiesData();
    loadTopHotels();
    fetchSearchHistory(1);
});

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('jwtToken');
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (token) {
        // 使用者已登入，顯示 dropdown
        loginBtn.classList.add('d-none');
        userDropdown.classList.remove('d-none');
    } else {
        // 使用者未登入，顯示登入按鈕
        loginBtn.classList.remove('d-none');
        userDropdown.classList.add('d-none');
    }

    // 登出邏輯
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', function () {
        localStorage.removeItem('jwtToken');
        location.reload(); // 重新整理頁面回到未登入狀態
    });
});