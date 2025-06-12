
  // 愛心收藏功能
  const favoriteBtn = document.getElementById("favoriteBtn");
  const favoriteIcon = document.getElementById("favoriteIcon");

  let isFavorited = false;

  favoriteBtn.addEventListener("click", () => {
    isFavorited = !isFavorited;
    if (isFavorited) {
      favoriteIcon.classList.remove("bi-heart");
      favoriteIcon.classList.add("bi-heart-fill");
    } else {
      favoriteIcon.classList.remove("bi-heart-fill");
      favoriteIcon.classList.add("bi-heart");
    }
  });

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



  
  //貨幣切換按鈕
  document.querySelectorAll("#currencyModal .modal-body.modal-grid a").forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const html = this.innerHTML.trim();
      const parts = html.split("<br>");
      const code = parts[parts.length - 1].trim();
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
  document.querySelectorAll("#languageModal .modal-body.modal-grid > div").forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const span = this.querySelector("span.fi");
      const btn = document.querySelector('button[data-bs-target="#languageModal"]');
      if (span && btn) {
        btn.innerHTML = span.outerHTML;
      }
      const modalEl = document.getElementById("languageModal");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    });
  });

 