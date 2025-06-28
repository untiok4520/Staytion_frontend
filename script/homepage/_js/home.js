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
const popularCities = ["台北市", "桃園市", "台中市", "台南市", "高雄市"];
const suggestionsEl = document.getElementById("suggestions");
const destinationInput = document.getElementById("destinationInput");

// 顯示建議清單
function showSuggestions(keyword = "") {
    let citiesToShow = [];
    if (keyword.trim() === "") {
        // 如果沒有輸入文字，顯示所有熱門城市
        citiesToShow = popularCities;
    } else {
        // 發送 API 請求
        fetch(`http://localhost:8080/api/locations/search?keyword=${encodeURIComponent(keyword)}`)
            .then(response => response.json()) // 解析返回的 JSON 數據
            .then(data => {
                // 根據 API 返回的資料來構建建議清單
                if (data.length === 0) {
                    suggestionsEl.style.display = "none";
                    return;
                }

                suggestionsEl.innerHTML = data
                    .map(item => {
                        // 構建每一條建議清單項目
                        return `<li class="list-group-item">
                                ${item.value}
                            </li>`;
                    })
                    .join("");

                suggestionsEl.style.display = "block";
            })
            .catch(error => {
                console.error("Error fetching locations:", error);
                suggestionsEl.style.display = "none";
            });
    }

    // 如果沒有匹配的項目，顯示熱門城市
    if (citiesToShow.length > 0) {
        suggestionsEl.innerHTML = citiesToShow
            .map(city => `<li class="list-group-item">${city}</li>`)
            .join("");
        suggestionsEl.style.display = "block";
    }
}

// 輸入時更新建議
destinationInput.addEventListener("input", () => {
    const keyword = destinationInput.value.trim();
    showSuggestions(keyword); // 即使 keyword 為空也要顯示熱門城市
});

// 點擊 input 時就顯示熱門城市
destinationInput.addEventListener("focus", () => {
    const keyword = destinationInput.value.trim();
    if (!keyword) {
        showSuggestions(); // 無輸入時預設顯示所有熱門城市
    }
});

// 點選建議
suggestionsEl.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
        const selectedValue = e.target.textContent.trim();
        const selectedType = e.target.getAttribute("data-type");
        const selectedCity = e.target.getAttribute("data-city");

        destinationInput.value = selectedValue;
        suggestionsEl.style.display = "none";

        // 根據選擇的類型（城市或區域）來處理選擇邏輯
        if (selectedType === "district") {
            console.log("選擇了區域:", selectedValue, "城市:", selectedCity);
        } else if (selectedType === "city") {
            console.log("選擇了城市:", selectedValue);
        }
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

// 地點類型API相關函數 -------------------------------------------------

// 獲取地點類型的API調用函數
async function getLocationTypeFromAPI(locationName) {
    try {
        // 替換為您的實際API端點
        const response = await fetch(`http://localhost:8080/api/locations/search?keyword=${encodeURIComponent(locationName)}`, {
            method: 'GET', // 根據實際API調整
            headers: {
                'Content-Type': 'application/json',
            },

        });

        if (!response.ok) {
            throw new Error(`獲取地點類型失敗: ${response.status}`);
        }

        const locationData = await response.json();

        // 根據您提供的API回應格式查找匹配的地點
        // API回應格式: [{"city": "台中市", "label": "南屯區（台中市）", "type": "district", "value": "南屯區"}]
        const matchedLocation = locationData.find(location =>
            location.value === locationName ||
            location.label.includes(locationName) ||
            location.city === locationName
        );

        if (!matchedLocation) {
            console.warn(`找不到地點類型，使用備用邏輯: ${locationName}`);
            // 如果找不到，使用備用的本地判斷邏輯
            return getLocationTypeLocal(locationName);
        }

        return matchedLocation;
    } catch (error) {
        console.error('獲取地點類型時發生錯誤:', error);
        // 發生錯誤時使用備用邏輯
        return getLocationTypeLocal(locationName);
    }
}

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

// 傳入 carousel 容器與卡片 class，自動計算滑動距離
function getScrollAmount(containerSelector, cardSelector) {
    const container = document.querySelector(containerSelector);
    const card = container?.querySelector(cardSelector);
    return card ? card.offsetWidth + 16 : 260;
}

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
    historyCarousel.scrollBy({
        left: getScrollAmount('#history-carousel', '.history-card'),
        behavior: 'smooth'
    });
});

prevhistoryBtn.addEventListener('click', () => {
    historyCarousel.scrollBy({
        left: -getScrollAmount('#history-carousel', '.history-card'),
        behavior: 'smooth'
    });
});

async function fetchSearchHistory() {
    const userId = localStorage.getItem('userId') // 取得 userId
    const searchHistory = document.querySelector('.search-history');
    if (!userId) return;

    try {
        const response = await fetch(`http://localhost:8080/api/histories/${userId}`);
        if (!response.ok) throw new Error('無法取得歷史紀錄');

        const data = await response.json();

        // 若沒有歷史紀錄，則不顯示搜尋歷史區塊
        if (!Array.isArray(data) || data.length === 0) {
            searchHistory.style.display = 'none';
            return;
        }

        historyCarousel.innerHTML = ""; // 清空內容

        data.forEach(item => {
            const city = item.locationName || '未知城市';
            const imgUrl = item.imgUrl || '../../assets/homepage/img/default.jpg';
            const startDate = item.checkInDate || '未知日期';
            const endDate = item.checkOutDate || '未知日期';
            const total = item.total || '未知人數';

            const link = document.createElement("a");
            link.href = "#";  // 設置目標鏈接
            link.classList.add("text-decoration-none", "text-dark");
            link.style.display = "block";  // 讓 <a> 標籤像區塊元素一樣，保持佈局不變

            const card = document.createElement("div");
            card.classList.add("history-card", "d-flex", "border", "rounded", "p-2");

            card.innerHTML = `
            <div class="history-img me-2">
                <img src="${imgUrl}" alt="${city}" class="rounded history-img">
            </div>
            <div class="history-content">
                <div class="history-item fw-bold">${city}</div>
                <div class="history-item">${startDate} 至 <br>${endDate}</div>
                <div class="history-item">${total} 位</div>
            </div>
        `;
            // 將 .history-card 放入 <a> 標籤中
            link.appendChild(card);

            // 將 <a> 標籤添加到容器中
            historyCarousel.appendChild(link);
        });
        // 有紀錄才顯示區塊
        searchHistory.style.display = 'block';
        updateArrowsVisibility();

    } catch (err) {
        console.error("取得搜尋紀錄失敗:", err);
    }
}

// 修改後的 addSearchHistory 函數
async function addSearchHistory(locationName, checkInDate, checkOutDate, adults, kids) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        // 先獲取地點類型
        const location = await getLocationTypeFromAPI(locationName);
        if (!location) {
            throw new Error('無法獲取有效的地點類型');
        }
        // 準備符合後端期望格式的請求資料
        const requestData = {
            locationName: location.value,    // 後端期望的欄位名稱
            locationType: location.type,    // 動態獲取的地點類型
            checkInDate,
            checkOutDate,
            searchTime: new Date().toISOString(),
            adults,
            kids
        };

        console.log('發送給後端的資料:', requestData); // 除錯用

        const response = await fetch(`http://localhost:8080/api/histories/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`新增搜尋紀錄失敗: ${response.status}`);
        }

        await fetchSearchHistory(); // 成功後更新搜尋歷史
        searchHistory.style.display = 'block';
    } catch (err) {
        console.error('新增搜尋紀錄失敗:', err);
    }
}

// 搜尋功能 - 整合地點類型API
async function performSearch() {
    const locationName = document.getElementById('destinationInput').value || '台北市';
    const dateInput = document.getElementById('daterange');
    const dateRange = dateInput.value.split(' 至 ');
    const startDate = dateRange[0]?.trim() || null;
    const endDate = dateRange[1]?.trim() || null;

    const adults = guestCounts?.adults ?? 1;
    const kids = guestCounts?.children ?? 0;

    try {
        // 獲取地點類型
        const locationType = await getLocationTypeFromAPI(locationName);

        // 準備主要搜尋API的請求資料
        const searchRequestData = {
            locationName: locationName,
            locationType: locationType,
            checkInDate: startDate,
            checkOutDate: endDate,
            searchTime: new Date().toISOString(),
            kids: kids,
            adults: adults
        };

        console.log('搜尋請求資料:', searchRequestData);

        // 同時新增到搜尋歷史
        await addSearchHistory(locationName, startDate, endDate, adults, kids);

    } catch (error) {
        console.error('搜尋過程中發生錯誤:', error);
    }
}

// 修改搜尋按鈕事件監聽器
// searchBtn.addEventListener('click', async (e) => {
//     e.preventDefault();
//     await performSearch();
// });

// 假設搜尋頁為 search.html
searchBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const locationName = document.getElementById('destinationInput').value || '台北市';
    const dateInput = document.getElementById('daterange');
    const dateRange = dateInput.value.split(' 至 ');
    const checkin = dateRange[0]?.trim() || '';
    const checkout = dateRange[1]?.trim() || '';
    const adults = guestCounts?.adults ?? 1;
    const children = guestCounts?.children ?? 0;
    const rooms = guestCounts?.rooms ?? 1;

    // 這裡可以呼叫你的API或紀錄歷史的函式
    await performSearch();

    // 組合查詢參數
    const params = new URLSearchParams({
        destination: locationName,
        checkin,
        checkout,
        adults,
        children,
        rooms,
    });

    // 跳轉
    window.location.href = `/pages/SearchPageV2.html?${params.toString()}`;
});

// 更新箭頭顯示狀態
updateArrowsVisibility();

// 熱門城市 -------------------------------------------------
const cityCarousel = document.getElementById('city-carousel');
const nextcityBtn = document.getElementById('scroll-next-city');
const prevcityBtn = document.getElementById('scroll-prev-city');

nextcityBtn.addEventListener('click', () => {
    cityCarousel.scrollBy({
        left: getScrollAmount('#city-carousel', '.city-card'),
        behavior: 'smooth'
    });
});
prevcityBtn.addEventListener('click', () => {
    cityCarousel.scrollBy({
        left: -getScrollAmount('#city-carousel', '.city-card'),
        behavior: 'smooth'
    });
});
// 發送多次請求並渲染城市資料
const cityIds = [3, 4, 5, 6, 7, 8, 9, 10, 11, 14];
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

    // 組查詢參數
    const params = new URLSearchParams({
        destination: city.city,
        checkin: '',   // 也可以預設今天
        checkout: '',  // 也可以預設明天
        adults: 2,
        children: 0,
        rooms: 1,
    });

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
    recommendationCarousel.scrollBy({
        left: getScrollAmount('#recommendation-carousel', '.card'),
        behavior: 'smooth'
    });
});
prevRecommendationBtn.addEventListener('click', () => {
    recommendationCarousel.scrollBy({
        left: -getScrollAmount('#recommendation-carousel', '.card'),
        behavior: 'smooth'
    });
});

async function loadTopHotels() {
    try {
        const response = await fetch('http://localhost:8080/api/top-hotels');
        if (!response.ok) {
            throw new Error('網路錯誤');
        }
        const hotels = await response.json();

        for (const hotel of hotels) {
            const card = document.createElement('div');
            card.classList.add('card');

            card.innerHTML = `
                <a href="#" class="text-decoration-none text-dark d-block position-relative">
                    <img src="${hotel.coverImageUrl}" class="card-img-top" alt="${hotel.hotelName}">
                    <button class="btn btn-light heart-btn position-absolute top-0 end-0 m-2 rounded-circle shadow-sm" data-hotel-id="${hotel.hotelId}">
                        <i class="bi bi-heart"></i>
                    </button>
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${hotel.hotelName}</h5>
                        <p class="card-text text-muted small"><i class="bi bi-geo-alt me-1"></i>${hotel.districtName}, ${hotel.cityName}</p>
                        <p class="mb-1">
                            <span class="badge rate">${hotel.averageRating.toFixed(1)}</span>
                            <small class="text-muted ms-1">${hotel.reviewCount} 則評價</small>
                        </p>
                        <p class="fw-bold mt-2">NT$ ${hotel.lowestPrice} / 晚起</p>
                    </div>
                </a>
            `;
            recommendationCarousel.appendChild(card);

            // 檢查是否已收藏
            const userId = localStorage.getItem('userId');
            if (userId) {
                // 發送 GET 請求檢查是否已收藏
                const isFavoriteResponse = await fetch(`http://localhost:8080/api/favorites/check?userId=${userId}&hotelId=${hotel.hotelId}`);
                if (!isFavoriteResponse.ok) {
                    console.error('檢查收藏狀態失敗');
                    return;
                }

                const isFavorite = await isFavoriteResponse.json();
                const heartBtn = card.querySelector('.heart-btn');
                const icon = heartBtn.querySelector('i');

                if (isFavorite) {
                    // 如果已收藏，顯示填滿的愛心
                    icon.classList.remove('bi-heart');
                    icon.classList.add('bi-heart-fill', 'text-danger');
                } else {
                    // 否則顯示空心愛心
                    icon.classList.add('bi-heart');
                    icon.classList.remove('bi-heart-fill', 'text-danger');
                }
            }
        }
    } catch (error) {
        console.error('取得精選飯店失敗:', error);
    }
}

// 精選飯店卡片點擊（hotelId + cityName 帶到搜尋頁，highlight_hotel_id 強制排最上面）
document.addEventListener('click', function (e) {
    // 假設你卡片裡的 <a> 會加 data-hotel-id, data-city
    const link = e.target.closest('#recommendation-carousel .card a'); if (link) {
        e.preventDefault();
        const hotelId = link.closest('.card').querySelector('button.heart-btn').dataset.hotelId;
        // 注意：你要確定 cityName 正確掛在 a 或其他元素上（這裡 demo 用 data-city）
        const cityName = link.closest('.card').querySelector('.card-text').textContent.split(',')[1]?.trim() || '';
        // 組參數
        const params = new URLSearchParams({
            destination: cityName,
            checkin: '',
            checkout: '',
            adults: 2,
            children: 0,
            rooms: 1,
            highlight_hotel_id: hotelId
        });
        window.location.href = `/pages/SearchPageV2.html?${params.toString()}`;
    }
});


document.addEventListener('click', function (e) {
    const heartBtn = e.target.closest('.heart-btn');
    if (heartBtn) {
        e.stopPropagation(); // 阻止冒泡
        e.preventDefault();  // 防止誤觸 <a>

        const icon = heartBtn.querySelector('i');
        const hotelId = heartBtn.dataset.hotelId;  // 從按鈕中獲取 hotelId
        const userId = localStorage.getItem('userId');

        if (icon.classList.contains('bi-heart')) {
            // 調用 addFavorite 接口
            addFavorite(userId, hotelId)
                .then(response => {
                    icon.classList.toggle('bi-heart');
                    icon.classList.toggle('bi-heart-fill');
                    icon.classList.toggle('text-danger');
                    console.log('添加收藏成功');
                })
                .catch(error => console.error('添加收藏失敗:', error));
        } else {
            // 調用 removeFavorite 接口
            removeFavorite(userId, hotelId)
                .then(() => {
                    icon.classList.toggle('bi-heart');
                    icon.classList.toggle('bi-heart-fill');
                    icon.classList.toggle('text-danger');
                    console.log('移除收藏成功');
                })
                .catch(error => console.error('移除收藏失敗:', error));
        }
    }
});

// 添加收藏 API
function addFavorite(userId, hotelId) {
    return fetch('http://localhost:8080/api/favorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userId,
            hotelId: hotelId,
        }),
    }).then(response => response.json());

}

// 移除收藏 API
function removeFavorite(userId, hotelId) {
    return fetch(`http://localhost:8080/api/favorites?userId=${userId}&hotelId=${hotelId}`, {
        method: 'DELETE',
    }).then(response => {
        if (!response.ok) {
            throw new Error('移除收藏失敗');
        }
    });
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', () => {
    loadCitiesData();
    loadTopHotels();
    fetchSearchHistory(); // 載入搜尋歷史
});

// 使用者登入狀態檢查
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
        localStorage.removeItem('userId');
        location.reload(); // 重新整理頁面回到未登入狀態
    });
});

// 熱門城市卡片點擊跳轉
document.addEventListener('click', function (e) {
    const link = e.target.closest('.city-card a');
    if (link) {
        e.preventDefault();
        // 從卡片 DOM 取 city 名稱
        const city = link.querySelector('.ccard-title').textContent.trim();
        // 你也可以取得其他預設查詢條件
        const params = new URLSearchParams({
            destination: city,
            checkin: '', // 你也可以預設今天
            checkout: '',
            adults: 2,
            children: 0,
            rooms: 1,
        });
        window.location.href = `/pages/SearchPageV2.html?${params.toString()}`;
    }
});