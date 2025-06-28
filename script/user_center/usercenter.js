import {
  connectWebSocket,
  subscribeChatRoom,
  sendMessage,
  loadChatHistory,
} from "./chatService.js";
import {
  renderIncomingMessage,
  renderChatList,
  renderChatBox,
} from "./domUtils.js";
import {
  fetchAndClassifyOrders,
  renderOrderHTML,
  formatDateWithDay,
} from "./userOrderService.js";
import { setChatContext, getChatContext } from "./chatContext.js";

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
        loadReviewPage();
      }
    }
  });
});
const defaultItem = document.querySelector('.sidebar-item[data-page="orders"]');
if (defaultItem) {
  defaultItem.click();
} else {
  console.error('找不到 sidebar-item[data-page="orders"]');
}

//========== 評論管理 =================
// 將 reviews 資料取得邏輯抽出成 async function
async function loadReviewPage() {
  try {
    // 取得尚未評論的訂單資料
    const unreviewedRes = await fetch(`http://localhost:8080/api/unreviewed`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    });
    if (!unreviewedRes.ok) {
      throw new Error(`取得尚未評論資料失敗，狀態碼：${unreviewedRes.status}`);
    }
    const unreviewedList = await unreviewedRes.json();
    console.log("取得尚未評論資料：", unreviewedList);
    renderUnreviewedCards(unreviewedList);
  } catch (err) {
    console.error("取得尚未評論資料失敗:", err);
  }
  try {
    const reviewedRes = await fetch(
      `http://localhost:8080/api/users/me/reviews`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      }
    );
    console.log("Status:", reviewedRes.status);
    if (!reviewedRes.ok) throw new Error("未授權或伺服器錯誤");
    const reviewedList = await reviewedRes.json();
    console.log("取得已評論資料：", reviewedList);
    renderReviews(reviewedList);
  } catch (err) {
    console.error("取得評論失敗：", err);
  }
}

//=======尚未評論卡片渲染=============
function renderUnreviewedCards(data) {
  const reviewsContainer = document.getElementById("reviews");
  const template = reviewsContainer.querySelector(".unreview-card.template");
  if (!template) return;

  reviewsContainer
    .querySelectorAll(".unreview-card:not(.template)")
    .forEach((el) => el.remove());

  const section = document.querySelector(".unreview-section");
  data.forEach((review) => {
    const card = template.cloneNode(true);
    card.classList.remove("template");
    card.style.display = "";
    const imgDiv = card.querySelector(".review-img");
    if (imgDiv) {
      imgDiv.style.backgroundImage = `url('${
        review.imgUrl || "/images/default-hotel.jpg"
      }')`;
    }
    card.querySelector(".review-hotel-name").textContent = review.hotelName;
    card.querySelector(".checkin-date").textContent = review.checkInDate;
    card.querySelector(".checkout-date").textContent = review.checkOutDate;

    // 使用 class 選擇 input 與 span
    const scoreInput = card.querySelector(".score-slider");
    const scoreValueSpan = card.querySelector(".score-value");
    if (scoreInput && scoreValueSpan) {
      // 初始化分數顯示
      scoreValueSpan.textContent = scoreInput.value;
      // 監聽 input 事件，及時更新分數
      scoreInput.addEventListener("input", () => {
        scoreValueSpan.textContent = scoreInput.value;
      });
    }
    const commentInput = card.querySelector(".review-comment");
    const submitBtn = card.querySelector(".submit-review-btn");
    submitBtn.addEventListener("click", () => {
      const score = scoreInput.value;
      const comment = commentInput.value;
      if (!score || !comment) {
        alert("請填寫評論與評分");
        return;
      }
      fetch(`http://localhost:8080/api/users/me/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({
          orderId: review.orderId,
          score: score,
          comment: comment,
        }),
      }).then((res) => {
        if (res.ok) {
          alert("評論送出成功！");
          card.remove();
        } else {
          alert("評論送出失敗！");
        }
      });
    });
    section.appendChild(card);
  });
}

//=======住宿評論渲染=============
function renderReviews(reviews) {
  const reviewsContainer = document.getElementById("reviews");
  // 移除現有的非 template 卡片
  reviewsContainer
    .querySelectorAll(".review-card:not(.template)")
    .forEach((el) => el.remove());

  const template = document.querySelector(".review-card.template");
  reviews.forEach((review) => {
    const card = template.cloneNode(true);
    card.classList.remove("template");
    card.style.display = "";
    // 設定 .review-img div 的背景圖
    const imgDiv = card.querySelector(".review-img");
    if (imgDiv) {
      imgDiv.style.backgroundImage = `url(${
        review.imgUrl || "/images/default-hotel.jpg"
      })`;
    }
    card.querySelector(".review-hotel-name").textContent = review.hotelName;
    // 格式化 createdAt 為 'YYYY-MM-DD'，若為空顯示 '-'
    let dateText = "-";
    if (review.createdAt) {
      const date = new Date(review.createdAt);
      dateText = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    }
    card.querySelector(".review-date").textContent = dateText;
    card.querySelector(".score").textContent = review.score;
    card.querySelector(".review-text").textContent = review.comment;
    const reviewSection = document.querySelector(".review-section");
    reviewSection.appendChild(card);
  });
}
//============= 訂單管理  ===============================
let ordersByType = {};

document.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.querySelector(".order-list");
  const ordersData = await fetchAndClassifyOrders();
  if (!ordersData) {
    listContainer.innerHTML = "<p>載入失敗，請稍後再試</p>";
    return;
  }
  ordersByType = ordersData;
  renderOrdersTab("future");

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const type = tab.dataset.type;
      renderOrdersTab(type);
    });
  });
});
function renderOrdersTab(type) {
  const ordersContainer = document.getElementById("orders");
  const detailPanel = document.querySelector(".order-detail-panel");

  console.log(
    "目前選擇的 tab 類型：",
    type,
    "，對應訂單數量：",
    ordersByType[type]?.length || 0
  );
  const orders = ordersByType[type] || [];
  const oldLocations = ordersContainer.querySelectorAll(
    ".location, .order-list"
  );
  oldLocations.forEach((el) => el.remove());

  if (orders.length === 0) {
    const emptyLocation = document.createElement("div");
    emptyLocation.className = "location";
    emptyLocation.innerHTML = "<div class='location-title'>無訂單</div>";
    ordersContainer.insertBefore(emptyLocation, detailPanel);
    return;
  }

  orders.forEach((order) => {
    const { locationHTML, orderHTML } = renderOrderHTML(order);

    const locationWrapper = document.createElement("div");
    locationWrapper.className = "location";
    locationWrapper.innerHTML = locationHTML;

    const orderListWrapper = document.createElement("div");
    orderListWrapper.className = "order-list";
    orderListWrapper.innerHTML = orderHTML;

    ordersContainer.insertBefore(locationWrapper, detailPanel);
    ordersContainer.insertBefore(orderListWrapper, detailPanel);

    orderListWrapper.querySelectorAll(".show-detail").forEach((btn) => {
      btn.addEventListener("click", () => {
        const detail = {
          orderNumber: btn.dataset.id,
          hotelName: btn.dataset.name,
          checkinDate: btn.dataset.checkin,
          checkoutDate: btn.dataset.checkout,
          roomType: btn.dataset.roomtype,
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
}

// ============ 訂單編號查詢功能 =============
function setActiveTab(type) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  const matchedTab = document.querySelector(`.tab[data-type="${type}"]`);
  if (matchedTab) matchedTab.classList.add("active");
}

const searchInput = document.querySelector("#orderSearchInput");
if (searchInput) {
  searchInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const orderId = searchInput.value.trim();
      if (orderId === "") {
        const all = await fetchAndClassifyOrders();
        ordersByType = all;
        // 設定 future tab 為 active
        setActiveTab("future");
        renderOrdersTab("future");
        searchInput.value = "";
        return;
      }
      try {
        const res = await fetch(
          `http://localhost:8080/api/bookings/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
        if (!res.ok) throw new Error("查詢失敗");
        const booking = await res.json();
        if (!booking || Object.keys(booking).length === 0) {
          alert("查無此訂單");
          return;
        }
        ordersByType = { future: [], past: [], cancelled: [], ongoing: [] };
        let determinedTab = "future";
        if (booking) {
          if (booking.status === "CONFIRMED") {
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            if (checkIn > now) {
              ordersByType.future.push(booking);
              determinedTab = "future";
            } else if (checkOut <= now) {
              ordersByType.past.push(booking);
              determinedTab = "past";
            } else {
              ordersByType.ongoing.push(booking);
              determinedTab = "ongoing";
            }
          } else if (booking.status === "CANCELED") {
            ordersByType.cancelled.push(booking);
            determinedTab = "cancelled";
          }
          // 切換 tab 樣式
          document
            .querySelectorAll(".tab")
            .forEach((t) => t.classList.remove("active"));
          const matchedTab = document.querySelector(
            `.tab[data-type="${determinedTab}"]`
          );
          if (matchedTab) matchedTab.classList.add("active");
          renderOrdersTab(determinedTab);
        }
      } catch (err) {
        alert("查無此訂單");
        console.error("搜尋訂單錯誤：", err);
      }
    }
  });
}

//======== tab clikck事件 ==============
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const detailPanel = document.querySelector(".order-detail-panel");
    if (detailPanel) {
      detailPanel.style.display = "none";
    }
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    renderOrdersTab(tab.dataset.type);
  });
});

function showOrderDetail(detail) {
  const locationEls = document.querySelectorAll(".location");
  const orderListEls = document.querySelectorAll(".order-list");
  const detailPanel = document.querySelector(".order-detail-panel");

  locationEls.forEach((el) => (el.style.display = "none"));
  orderListEls.forEach((el) => (el.style.display = "none"));

  // 填入資料到 detailPanel 的各欄位
  document.getElementById("detail-hotelName").textContent = detail.hotelName;
  document.getElementById("detail-checkinDate").textContent =
    detail.checkinDate;
  document.getElementById("detail-checkoutDate").textContent =
    detail.checkoutDate;
  document.getElementById("detail-roomtype").textContent = detail.roomType;
  document.getElementById("detail-location").textContent = detail.location;
  document.getElementById("detail-phone").textContent = detail.phone;
  document.getElementById("detail-orderNumber").textContent =
    detail.orderNumber;
  document.getElementById(
    "detail-price"
  ).textContent = `TWD ${detail.price.toFixed(2)}`;
  document.getElementById("detail-tax").textContent = `TWD ${detail.tax.toFixed(
    2
  )}`;
  document.getElementById(
    "detail-total"
  ).textContent = `TWD ${detail.total.toFixed(2)}`;
  document.getElementById("detail-cardType").textContent = detail.cardType;
  document.getElementById("detail-cardMasked").textContent = detail.cardMasked;

  detailPanel.style.display = "block";

  document.getElementById("backToList").addEventListener("click", () => {
    detailPanel.style.display = "none";
    document.querySelectorAll(".location").forEach((el) => {
      el.style.display = "block";
    });
    orderListEls.forEach((el) => (el.style.display = "block"));
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
    .addEventListener("click", async () => {
      const reason = document.getElementById("cancelReason").value;
      if (!reason) {
        alert("請選擇取消原因");
        return;
      }
      const bookingId =
        document.getElementById("detail-orderNumber").textContent;

      try {
        const res = await fetch(
          `http://localhost:8080/api/bookings/${bookingId}/cancel`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
        if (!res.ok) {
          throw new Error("取消失敗，請稍後再試");
        }

        alert("已送出取消申請");

        // 關閉 modal 與訂單詳情，顯示列表
        document.getElementById("cancelModal").style.display = "none";
        document.querySelector(".order-detail-panel").style.display = "none";
        document.querySelectorAll(".location").forEach((el) => {
          el.style.display = "block";
        });
        document.querySelectorAll(".order-list").forEach((el) => {
          el.style.display = "block";
        });

        // 重新分類與渲染取消後的訂單狀態
        const updatedOrders = await fetchAndClassifyOrders();
        ordersByType = updatedOrders;
        // 設定 cancelled tab 為 active
        document
          .querySelectorAll(".tab")
          .forEach((t) => t.classList.remove("active"));
        document
          .querySelector('.tab[data-type="cancelled"]')
          .classList.add("active");
        renderOrdersTab("cancelled");
      } catch (err) {
        console.error("取消訂單錯誤：", err);
        alert("取消失敗：" + err.message);
      }
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
document.addEventListener("DOMContentLoaded", () => {
  connectWebSocket();
  fetch("http://localhost:8080/api/chatrooms/my", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("未授權或伺服器錯誤");
      }
      return res.json();
    })
    .then((chatList) => {
      console.log("後端傳來的chatList：", chatList);
      renderChatList(chatList, handleChatListItemClick);
    })
    .catch((err) => {
      console.error("無法取得聊天室列表：", err);
    });
});

// ==================== 點聊天室項目 =====================

async function handleChatListItemClick(item) {
  // 更新全域變數
  const chatRoomId = Number(item.dataset.chatRoomId);
  const receiverId = Number(item.dataset.receiverId);
  const hotelId = Number(item.dataset.hotelId);
  const hotelName =
    item.dataset.hotelName ||
    item.querySelector(".chat-hotel-name").textContent;
  console.log("點擊聊天室：", {
    chatRoomId,
    receiverId,
    hotelId,
  });
  //存好 context
  setChatContext(chatRoomId, receiverId, hotelId);

  // 訂閱該聊天室
  subscribeChatRoom(chatRoomId);

  //渲染聊天室頁面
  renderChatBox(hotelName);

  //載入歷史訊息
  const history = await loadChatHistory(chatRoomId);
  const container = document.querySelector(".chat-messages");
  container.innerHTML = "";
  history.forEach((msg) => renderIncomingMessage(msg));

  // 修改：只綁定一次發送按鈕事件
  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn && !sendBtn._bound) {
    sendBtn.addEventListener("click", () => {
      const input = document.getElementById("messageInput");
      const content = input.value.trim();
      if (content) {
        sendMessage(content);
        input.value = "";
      }
    });
    sendBtn._bound = true;
  }
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
