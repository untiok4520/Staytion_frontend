// 選擇地點 -------------------------------------------------

const popularCities = ["台北", "台中", "台南", "花蓮", "宜蘭", "澎湖"];

const input = document.getElementById("destinationInput");
const suggestionBox = document.getElementById("suggestions");

function updateSuggestions(keyword = "") {
    // 清空現有建議
    suggestionBox.innerHTML = "";

    const header = document.createElement("li");
    header.textContent = "熱門城市";
    header.classList.add("suggestion-header");
    suggestionBox.appendChild(header);


    const filtered = popularCities.filter((city) =>
        city.includes(keyword)
    );

    // 若無輸入，顯示全部
    const results = keyword ? filtered : popularCities;


    results.forEach((city) => {
        const li = document.createElement("li");
        li.textContent = city;
        li.addEventListener("click", () => {
            input.value = city;
            suggestionBox.innerHTML = ""; // 清空選單
        });
        suggestionBox.appendChild(li);
    });
}

// 初始顯示預設城市
updateSuggestions();

input.addEventListener("focus", () => {
    updateSuggestions(); // 沒有輸入值，會顯示所有熱門城市
    suggestionBox.classList.add("show");
});

// 輸入時即時更新選項
input.addEventListener("input", (e) => {
    updateSuggestions(e.target.value.trim());
    suggestionBox.classList.add("show");
});

// 點擊外部時隱藏選單（可選）
document.addEventListener("click", (e) => {
    if (!e.target.closest("#destination-group")) {
        suggestionBox.innerHTML = "";
        suggestionBox.classList.remove("show");
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