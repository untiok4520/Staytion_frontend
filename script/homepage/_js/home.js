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

// 點擊搜尋按鈕後顯示搜尋紀錄
searchBtn.addEventListener('click', (e) => {
    e.preventDefault();  // 防止表單提交
    searchHistory.style.display = 'block';  // 顯示搜尋紀錄
});

// 取得容器和箭頭按鈕
const historyCarousel = document.getElementById('history-carousel');
const nexthistoryBtn = document.getElementById('scroll-next-history');
const prevhistoryBtn = document.getElementById('scroll-prev-history');

// 使用實際卡片寬度加 margin 做為滾動距離
const getScrollAmount = () => {
    const card = document.querySelector('.city-carousel .card');
    return card ? card.offsetWidth + 16 : 260;
};
nexthistoryBtn.addEventListener('click', () => {
    historyCarousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
});

prevhistoryBtn.addEventListener('click', () => {
    historyCarousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
});

const historyData = [
    {
        city: "彰化",
        img: "../../assets/homepage/img/changhua.jpg",
        date: "2025-06-11 至 2025-06-19",
        people: "2位"
    },
    {
        city: "台中",
        img: "../../assets/homepage/img/taichung.jpg",
        date: "2025-06-05 至 2025-06-10",
        people: "3位"
    },
    {
        city: "彰化",
        img: "../../assets/homepage/img/changhua.jpg",
        date: "2025-06-11 至 2025-06-19",
        people: "2位"
    },
    {
        city: "台中",
        img: "../../assets/homepage/img/taichung.jpg",
        date: "2025-06-05 至 2025-06-10",
        people: "3位"
    },
    {
        city: "彰化",
        img: "../../assets/homepage/img/changhua.jpg",
        date: "2025-06-11 至 2025-06-19",
        people: "2位"
    },
    {
        city: "台中",
        img: "../../assets/homepage/img/taichung.jpg",
        date: "2025-06-05 至 2025-06-10",
        people: "3位"
    }
    // 可繼續加入更多紀錄
];

historyData.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("history-card", "d-flex", "border", "rounded", "p-2");
    card.style.minWidth = "250px"; // 卡片寬度可自訂
    card.innerHTML = `
        <div class="history-img me-3">
        <img src="${item.img}" alt="${item.city}" width="100px" class="rounded">
        </div>
        <div class="history-content">
        <div class="history-item fw-bold">${item.city}</div>
        <div class="history-item">${item.date}</div>
        <div class="history-item">${item.people}</div>
        </div>
          `;
    historyCarousel.appendChild(card);
});


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

// 初始化加入城市卡片
const allCities = [
    { name: '台中', img: '../../assets/homepage/img/taichung.jpg' },
    { name: '台北', img: '../../assets/homepage/img/taichung.jpg' },
    { name: '高雄', img: '../../assets/homepage/img/taichung.jpg' },
    { name: '台南', img: '../../assets/homepage/img/taichung.jpg' },
    { name: '花蓮', img: '../../assets/homepage/img/taichung.jpg' },
    { name: '澎湖', img: '../../assets/homepage/img/taichung.jpg' },
    { name: '宜蘭', img: '../../assets/homepage/img/taichung.jpg' },
    { name: '台東', img: '../../assets/homepage/img/taichung.jpg' }
];

allCities.forEach(city => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `<a href="#" class="text-decoration-none text-dark d-block position-relative">
    <img src="${city.img}" class="card-img-top" alt="${city.name}">
    <div class="card-body text-center">
    <h5 class="card-title fw-bold">${city.name}</h5>
    <p class="card-text text-muted small">X間住宿</p>
    </a>
    </div>
    `;
    carousel.appendChild(card);
});


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

// 初始化加入住宿推薦卡片
const allRecommendations = [
    { name: 'XX 飯店', img: 'https://taiwan.taiwanstay.net.tw/twpic/92202.jpg?v=20250529', city: '台中市', district: 'xx區', rating: '8.7', price: 'NT$2,500 / 晚起' },
    { name: 'YY 度假村', img: 'https://taiwan.taiwanstay.net.tw/twpic/92202.jpg?v=20250529', city: '台北市', district: 'xx區', rating: '9.1', price: 'NT$3,000 / 晚起' },
    { name: 'ZZ 民宿', img: 'https://taiwan.taiwanstay.net.tw/twpic/92202.jpg?v=20250529', city: '高雄市', district: 'xx區', rating: '8.3', price: 'NT$2,000 / 晚起' },
    { name: 'AA 酒店', img: 'https://taiwan.taiwanstay.net.tw/twpic/92202.jpg?v=20250529', city: '台南市', district: 'xx區', rating: '9.2', price: 'NT$2,800 / 晚起' },
    { name: 'BB 旅館', img: 'https://taiwan.taiwanstay.net.tw/twpic/92202.jpg?v=20250529', city: '花蓮市', district: 'xx區', rating: '8.5', price: 'NT$2,200 / 晚起' },
    { name: 'CC 度假村', img: 'https://taiwan.taiwanstay.net.tw/twpic/92202.jpg?v=20250529', city: '澎湖縣', district: 'xx區', rating: '9.0', price: 'NT$3,200 / 晚起' },
    { name: 'DD 酒店', img: 'https://taiwan.taiwanstay.net.tw/twpic/92202.jpg?v=20250529', city: '宜蘭市', district: 'xx區', rating: '8.8', price: 'NT$2,600 / 晚起' },
    { name: 'EE 旅館', img: 'https://taiwan.taiwanstay.net.tw/twpic/92202.jpg?v=20250529', city: '台東市', district: 'xx區', rating: '8.9', price: 'NT$2,700 / 晚起' }
];

allRecommendations.forEach(recommendation => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = ` <a href="#" class="text-decoration-none text-dark d-block position-relative">
                <img src="${recommendation.img}" class="card-img-top" alt="${recommendation.name}">
                <button class="btn btn-light heart-btn position-absolute top-0 end-0 m-2 rounded-circle shadow-sm">
                    <i class="bi bi-heart"></i>
                 </button>
                <div class="card-body">
                    <h5 class="card-title fw-bold">${recommendation.name}</h5>
                    <p class="card-text text-muted small"><i class="bi bi-geo-alt me-1"></i> ${recommendation.city}, ${recommendation.district}</p>                 <p class="mb-1">
                        <span class="badge rate">${recommendation.rating}</span>
                        <small class="text-muted ms-1">120 則評價</small>
                    </p>
                    <p class="fw-bold mt-2">${recommendation.price}</p>
                    </a>
                </div>
            `;
    recommendationCarousel.appendChild(card);
});

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