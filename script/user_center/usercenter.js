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

//=====語言按鈕=====
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

//======排序方式下拉選單=======
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

//===========sidebar================
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

      //========住宿評論資料=============
      if (targetPage === "reviews") {
        const mockReviews = [
          {
            hotelName: "Hotel Name",
            date: "2025年5月26日",
            score: "8.0",
            scoreDesc: "非常好",
            text: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
          },
          {
            hotelName: "Another Hotel",
            date: "2025年5月20日",
            score: "9.2",
            scoreDesc: "超棒",
            text: "這間真的很乾淨，交通方便。",
          },
        ];
        renderReviews(mockReviews);
      }
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
        <button class="btn btn-secondary show-detail"
            data-id="F12345"
            data-name="台北大飯店"
            data-checkin="6月21日（週六）"
            data-checkout="6月23日（週一）"
            data-location="台北市"
            data-price="917.71"
            data-tax="142.06"
            data-total="1059.77"
            data-phone="+886 2 6619 8888"
            data-card="Visa"
            data-cardmask="•••• •••• •••• ••••"
          >訂單內容</button>
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
          <button class="btn btn-secondary show-detail"
            data-id="P67890"
            data-name="高雄大飯店"
            data-checkin="5月10日（週五）"
            data-checkout="5月12日（週日）"
            data-location="高雄市"
            data-price="800.00"
            data-tax="120.00"
            data-total="920.00"
            data-phone="+886 7 1234 5678"
            data-card="MasterCard"
            data-cardmask="•••• •••• •••• 1234"
          >訂單內容</button>
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
          <button class="btn btn-secondary show-detail"
            data-id="C00000"
            data-name="弘大青年旅館"
            data-checkin="9月24日（週三）"
            data-checkout="9月25日（週四）"
            data-location="首爾"
            data-price="500.00"
            data-tax="75.00"
            data-total="575.00"
            data-phone="+82 2 1234 5678"
            data-card="Amex"
            data-cardmask="•••• •••• •••• 5678"
          >訂單內容</button>
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

    // 新增 show-detail 按鈕點擊事件
    orderListEl.querySelectorAll(".show-detail").forEach((btn) => {
      btn.addEventListener("click", () => {
        const detail = {
          orderNumber: btn.dataset.id,
          hotelName: btn.dataset.name,
          checkinDate: btn.dataset.checkin,
          checkoutDate: btn.dataset.checkout,
          location: btn.dataset.location,
          price: parseFloat(btn.dataset.price),
          tax: parseFloat(btn.dataset.tax),
          total: parseFloat(btn.dataset.total),
          phone: btn.dataset.phone,
          cardType: btn.dataset.card,
          cardMasked: btn.dataset.cardmask,
        };
        showOrderDetail(detail);
      });
    });
  });
});
document.querySelector('.tab[data-type="future"]').click();

function showOrderDetail(detail) {
  const locationEl = document.querySelector(".location");
  const orderListEl = document.querySelector(".order-list");
  const detailPanel = document.querySelector(".order-detail-panel");

  locationEl.style.display = "none";
  orderListEl.style.display = "none";

  detailPanel.innerHTML = `
    <button class="btn btn-outline-secondary" id="backToList">返回訂單列表</button>
    <div class="order-header">
      <div class="left-section">
        <h2>${detail.hotelName}</h2>
        <div class="dates">
          <div class="checkin">
            <span>入住日期</span><br/>
            <span>${detail.checkinDate}</span>
          </div>
          <div class="checkout">
            <span>退房日期</span><br/>
            <span>${detail.checkoutDate}</span>
          </div>
        </div>
        <div class="room-info">地址：${detail.location}</div>
        <div class="contact">聯絡電話：${detail.phone}</div>
      </div>
      <div class="right-section">
        <p>訂單編號：${detail.orderNumber}</p>
        <a href="#" class="cancel-order-btn">取消訂單</a>
        <a href="#" class="change-date-btn">更改日期</a>
        <a href="#">更改房型</a>
        <a href="#">查看住宿規定</a>
     </div>
    </div>
    <div class="payment-info">
      <h3>付款資訊</h3>
      <div class="line-item">
        <span>房費：</span>
        <span>TWD ${detail.price.toFixed(2)}</span>
      </div>
      <div class="line-item">
        <span>稅金及其他費用：</span>
        <span>TWD ${detail.tax.toFixed(2)}</span>
      </div>
      <div class="total">
        <span>總金額：</span>
        <span>TWD ${detail.total.toFixed(2)}</span>
      </div>
      <div class="card_info">
        <div class="card-type">付款方式：${detail.cardType}</div>
        <div class="card-mask">卡號：${detail.cardMasked}</div>
      </div>
    </div>
  `;
  detailPanel.style.display = "block";

  document.getElementById("backToList").addEventListener("click", () => {
    detailPanel.style.display = "none";
    locationEl.style.display = "block";
    orderListEl.style.display = "block";
  });

  //取消訂單、更新日期、更改房型modal視窗
  // 顯示 取消訂單 modal
  document.querySelector(".cancel-order-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("cancelModal").style.display = "flex";
  });

  // 顯示 changeDateModal

  document.querySelector(".change-date-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("changeDateModal").style.display = "flex";
  });

  // 關閉 cancelModal（關閉按鈕 & 關閉區塊）
  document.getElementById("cancelModalClose").addEventListener("click", () => {
    document.getElementById("cancelModal").style.display = "none";
  });
  document.getElementById("closeCancelModal").addEventListener("click", () => {
    document.getElementById("cancelModal").style.display = "none";
  });

  // 點「繼續」處理邏輯
  document
    .getElementById("cancelModalConfirm")
    .addEventListener("click", () => {
      const reason = document.getElementById("cancelReason").value;
      if (!reason) {
        alert("請選擇取消原因");
        return;
      }
      alert("已送出取消申請，原因：" + reason);
      document.getElementById("cancelModal").style.display = "none";
    });

  // 關閉 changeDateModal（按鈕 & ✕）
  document
    .getElementById("changeDateModalClose")
    .addEventListener("click", () => {
      document.getElementById("changeDateModal").style.display = "none";
    });
  document
    .getElementById("closeChangeDateModal")
    .addEventListener("click", () => {
      document.getElementById("changeDateModal").style.display = "none";
    });

  // 點「確認」處理邏輯
  document
    .getElementById("changeDateModalConfirm")
    .addEventListener("click", () => {
      const checkin = document.getElementById("newCheckin").value;
      const checkout = document.getElementById("newCheckout").value;
      if (!checkin || !checkout) {
        alert("請選擇新的入住與退房日期");
        return;
      }
      alert("已送出更改申請：入住 " + checkin + "，退房 " + checkout);
      document.getElementById("changeDateModal").style.display = "none";
    });
}

// ===================== 住宿訊息聊天室 =====================
// 預設載入每個聊天室項目的預覽訊息
document.querySelectorAll(".chat-list-item").forEach((item) => {
  const lastHotelMessage = "您好，入住時間為下午 3 點後。"; // 可換成從資料讀取
  const previewEl = item.querySelector(".chat-preview");
  if (previewEl) {
    previewEl.textContent = lastHotelMessage.slice(0, 10);
  }
});

document.querySelectorAll(".chat-list-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".chat-list-item").forEach((el) => {
      el.classList.remove("active");
    });
    // 為當前點擊項目加上 active
    item.classList.add("active");

    // 取得飯店名稱
    const hotelName = item.querySelector(".chat-hotel-name").textContent;

    // 更新右側聊天區塊內容
    const chatBox = document.querySelector(".chat-box");
    const lastHotelMessage = "您好，入住時間為下午 3 點後。";
    chatBox.innerHTML = `
      <div class="chat-header">
        <h4>${hotelName}</h4>
      </div>
      <div class="chat-messages">
        <div class="message from-user">請問入住時間是幾點？</div>
        <div class="message from-hotel">${lastHotelMessage}</div>
      </div>
      <div class="chat-input">
        <input type="text" placeholder="輸入訊息..." />
        <button class="btn btn-secondary">送出</button>
      </div>
    `;

    // 更新對應的 chat-preview 內容
    item.querySelector(".chat-preview").textContent = lastHotelMessage.slice(
      0,
      10
    );
  });
});

//=======住宿評論渲染=============
function renderReviews(reviews) {
  const reviewsContainer = document.getElementById("reviews");
  reviewsContainer.innerHTML = ""; // 清空舊資料

  reviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-img"></div>
      <div class="review-content">
        <h5>${review.hotelName}</h5>
        <p class="review-date">${review.date}</p>
        <div class="review-score">
          <span class="score">${review.score}</span>
          <span class="desc">${review.scoreDesc}</span>
        </div>
        <p class="review-text">${review.text}</p>
      </div>
    `;
    reviewsContainer.appendChild(card);
  });
}

// =======個人資料 - 編輯切換==========
document.querySelectorAll("#profile .edit-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Revised logic to select container and valueEl more robustly
    let container = btn.closest(".profile-value");
    if (!container) {
      // Handle the case where button is outside of .profile-value (e.g., in .profile-field.name)
      const profileField = btn.closest(".profile-field");
      container = profileField.querySelector(".profile-value") || profileField;
    }
    const valueEl = container.querySelector(".value");

    if (btn.textContent === "儲存") {
      const input = container.querySelector("input");
      if (input) {
        // 取得使用者輸入的值
        const newValue = input.value;
        const isPassword = input.type === "password";

        // 顯示的文字：密碼顯示固定長度的遮蔽符號，其他正常顯示
        if (valueEl) {
          valueEl.textContent = isPassword ? "••••••••••••" : newValue;
        }

        input.remove();
        if (valueEl) valueEl.style.display = "block";
        btn.textContent = "編輯";
      }
      return;
    }

    const input = document.createElement("input");
    // Find the label for the field (may be in ancestor)
    let labelText = "";
    let labelEl = container.closest(".profile-field")?.querySelector("label");
    if (labelEl) labelText = labelEl.textContent;
    input.type = labelText.includes("密碼") ? "password" : "text";
    // Use valueEl's text if present, otherwise empty
    input.value = valueEl ? valueEl.textContent : "";
    input.classList.add("edit-input");

    // Insert input after valueEl if found, otherwise append to container
    if (valueEl) {
      valueEl.style.display = "none";
      valueEl.insertAdjacentElement("afterend", input);
    } else {
      container.appendChild(input);
    }
    btn.textContent = "儲存";
  });
});
