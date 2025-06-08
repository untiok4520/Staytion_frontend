//貨幣按鈕
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

//語言按鈕
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

// 排序方式下拉選單
document
  .querySelectorAll("#dropdownMenuLink + .dropdown-menu .dropdown-item")
  .forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const text = this.textContent.trim();
      const btn = document.getElementById("dropdownMenuLink");
      if (btn) {
        btn.textContent = "排序方式：" + text;
      }
    });
  });

//sidebar
// 側邊欄點擊切換 active 樣式
document.querySelectorAll(".sidebar-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".sidebar-item").forEach((div) => {
      div.classList.remove("active");
    });
    // 給當前 .sidebar-item 加上 active
    item.classList.add("active");
    // 切換對應 content-page
    document.querySelectorAll(".content-page").forEach((p) => {
      p.style.display = "none";
    });
    const targetPage = item.dataset.page;
    const targetEl = document.getElementById(targetPage);
    if (targetEl) {
      targetEl.style.display = "block";
    }
  });
});
document.querySelector('.sidebar-item[data-page="orders"]').click();

//訂單管理區塊更新
//假資料
const mockOrders = {
  future: {
    location: `
      <div class="location-title">台北市</div>
      <div class="location-date">6月20日（週五）</div>
    `,
    order: `
      <div class="order-number">編號：F12345</div>
      <div class="order-content">
        <div class="hotel-image"></div>
        <div class="hotel-info">
          <div class="hotel-name">台北大飯店</div>
          <div class="hotel-dates">
            <div class="checkin-date">
              <span>入住日期</span><br />
              <span>6月21日（週六）</span>
            </div>
            <div class="checkout-date">
              <span>退房日期</span><br />
              <span>6月23日（週一）</span>
            </div>
          </div>
        </div>
        <div class="order-detail">
          <button class="btn btn-secondary">訂單內容</button>
        </div>
      </div>
    `,
  },
  past: {
    location: `
      <div class="location-title">高雄市</div>
      <div class="location-date">5月12日（週日）</div>
    `,
    order: `
      <div class="order-number">編號：P67890</div>
      <div class="order-content">
        <div class="hotel-image"></div>
        <div class="hotel-info">
          <div class="hotel-name">高雄大飯店</div>
          <div class="hotel-dates">
            <div class="checkin-date">
              <span>入住日期</span><br />
              <span>5月10日（週五）</span>
            </div>
            <div class="checkout-date">
              <span>退房日期</span><br />
              <span>5月12日（週日）</span>
            </div>
          </div>
        </div>
        <div class="order-detail">
          <button class="btn btn-secondary">訂單內容</button>
        </div>
      </div>
    `,
  },
  cancelled: {
    location: `
      <div class="location-title">首爾</div>
      <div class="location-date">9月24日（週三）</div>
    `,
    order: `
      <div class="order-number">編號：C00000</div>
      <div class="order-content">
        <div class="hotel-image"></div>
        <div class="hotel-info">
          <div class="hotel-name">弘大青年旅館</div>
          <div class="hotel-dates">
            <div class="checkin-date">
              <span>入住日期</span><br />
              <span>9月24日（週三）</span>
            </div>
            <div class="checkout-date">
              <span>退房日期</span><br />
              <span>9月25日（週四）</span>
            </div>
          </div>
        </div>
        <div class="order-detail">
          <button class="btn btn-secondary">訂單內容</button>
        </div>
      </div>
    `,
  },
};

// 切換 tab 時更新內容
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    // tab 樣式切換
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // 根據 data-type 取得資料
    const type = tab.dataset.type;
    const locationEl = document.querySelector(".location");
    const orderListEl = document.querySelector(".order-list");

    // 更新 HTML
    locationEl.innerHTML = mockOrders[type].location;
    orderListEl.innerHTML = mockOrders[type].order;
  });
});
document.querySelector('.tab[data-type="future"]').click();
