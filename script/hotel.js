  
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

  // 日期選擇器初始化
  flatpickr("#daterange", {
    locale: "zh_tw",
    mode: "range",
    minDate: "today",
    dateFormat: "Y-m-d",
    showMonths: 2
  });


  // 立即預訂ㄉ日期
  flatpickr(".booking-panel input[type='date']", {
    locale: "zh_tw",
    minDate: "today",
    dateFormat: "Y-m-d"
  });


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

  document.querySelectorAll('.booking-select').forEach(button => {
    button.addEventListener('click', () => {
      const roomName = button.dataset.room;
      const unitPrice = parseInt(button.dataset.price, 10);

      const checkinInput = document.querySelector('.booking-panel input[type="date"]');
      const checkoutInput = document.querySelectorAll('.booking-panel input[type="date"]')[1];

      const checkin = new Date(checkinInput.value);
      const checkout = new Date(checkoutInput.value);
      const nightCount = Math.max(1, (checkout - checkin) / (1000 * 60 * 60 * 24));

      const subtotal = unitPrice * nightCount;
      const serviceFee = Math.round(subtotal * 0.1);
      const total = subtotal + serviceFee;

      document.getElementById('night-price-label').textContent = `${nightCount}晚 × NT$ ${unitPrice.toLocaleString()}`;
      document.getElementById('subtotal-amount').textContent = `NT$ ${subtotal.toLocaleString()}`;
      document.getElementById('service-fee').textContent = `NT$ ${serviceFee.toLocaleString()}`;
      document.getElementById('total-amount').textContent = `NT$ ${total.toLocaleString()}`;

      // 顯示選擇的房型名稱（可選）
      let titleEl = document.getElementById("selected-room-name");
      if (!titleEl) {
        titleEl = document.createElement("div");
        titleEl.id = "selected-room-name";
        titleEl.style.marginBottom = "10px";
        titleEl.style.fontWeight = "bold";
        titleEl.style.color = "#1F487E";
        document.querySelector('.booking-panel').insertBefore(titleEl, document.querySelector('.form-group'));
      }
      titleEl.textContent = `已選擇房型：${roomName}`;
    });
  });




  function updateTotal() {
    const roomSelect = document.getElementById("roomCount");
    const roomCount = parseInt(roomSelect.value);
    const pricePerNight = 3200;
    const nights = 2;
    const taxRate = 0.1;

    const subtotal = pricePerNight * roomCount * nights;
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;

    document.querySelector("#priceDetails span:nth-child(1)").textContent =
      `${nights}晚 × NT$ ${pricePerNight}`;
    document.querySelector("#priceDetails span:nth-child(2)").textContent =
      `NT$ ${subtotal}`;
    document.getElementById("tax").textContent = tax;
    document.getElementById("total").textContent = total;
  }


  

  