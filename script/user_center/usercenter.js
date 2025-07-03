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

// document.addEventListener('DOMContentLoaded', function () {
//   // 檢查 localStorage 有沒有 token 或 userId
//   const token = localStorage.getItem('token');
//   // 或用 userId 判斷也可以：const userId = localStorage.getItem('userId');

//   if (!token) {
//     // 沒有登入，導去登入頁
//     window.location.href = '/pages/homepage/login.html';
//     return;
//   }

//   // 通常可以這裡加載會員資料、渲染頁面內容...
// });

// document.addEventListener('DOMContentLoaded', function () {
//   // 檢查 localStorage 有沒有 token 或 userId
//   const token = localStorage.getItem('token');
//   // 或用 userId 判斷也可以：const userId = localStorage.getItem('userId');

//   if (!token) {
//     // 沒有登入，導去登入頁
//     window.location.href = '/pages/homepage/login.html';
//     return;
//   }

//   // 通常可以這裡加載會員資料、渲染頁面內容...
// });

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
      } else if (targetPage === "favorites") {
        loadFavorites("");
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
          // 再呼叫取得已評論資料
          loadReviewPage();
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
          hotelId: btn.dataset.hotelId,
          hotelName: btn.dataset.name,
          checkinDate: btn.dataset.checkin,
          checkinIso: btn.dataset.checkinIso,
          checkoutDate: btn.dataset.checkout,
          checkoutIso: btn.dataset.checkoutIso,
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
//顯示訂單詳情
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

  //=========== 取消訂單、更新日期、更改房型modal視窗 ==============

  //============== 取消訂單 ===============
  // 顯示 取消訂單 modal
  document.querySelector(".cancel-order-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("cancelModal").style.display = "flex";
  });
  // 關閉 取消訂單Modal
  document.getElementById("cancelModalClose").addEventListener("click", () => {
    document.getElementById("cancelModal").style.display = "none";
  });
  document.getElementById("closeCancelModal").addEventListener("click", () => {
    document.getElementById("cancelModal").style.display = "none";
  });

  // 點「繼續」處理取消訂單邏輯
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
            method: "POST",
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

  //=============== 更改日期 ================
  // 顯示 changeDateModal
  document.querySelector(".change-date-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("changeDateModal").style.display = "flex";
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

  // 點「確認」處理更改日期邏輯
  const confirmBtn = document.getElementById("changeDateModalConfirm");
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      const range = document.getElementById("daterange").value;
      if (!range) {
        alert("請選擇新的入住與退房日期");
        return;
      }
      const [checkin, checkout] = range.split(" 至 ");
      console.log("range value:", range);

      if (!checkin || !checkout) {
        alert("請選擇完整的日期範圍");
        return;
      }
      const bookingId = detail.orderNumber;

      try {
        const res = await fetch(
          `http://localhost:8080/api/bookings/${bookingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
            body: JSON.stringify({
              checkInDate: checkin,
              checkOutDate: checkout,
            }),
          }
        );

        if (!res.ok) throw new Error("更改訂單失敗");

        alert("更改成功！");
        // 加入指定的程式碼
        document.querySelector(".order-detail-panel").style.display = "none";
        document
          .querySelectorAll(".location")
          .forEach((el) => (el.style.display = "block"));
        document
          .querySelectorAll(".order-list")
          .forEach((el) => (el.style.display = "block"));
        document.getElementById("changeDateModal").style.display = "none";

        // 刷新訂單列表
        const updatedOrders = await fetchAndClassifyOrders();
        ordersByType = updatedOrders;
        setActiveTab("future");
        renderOrdersTab("future");
      } catch (err) {
        console.error(err);
        alert("更改失敗：" + err.message);
      }
    };
  }

  // ============== 更改房型 ======================

  const changeRoomBtn = document.querySelector(".change-room-btn");
  if (changeRoomBtn) {
    changeRoomBtn.onclick = async (e) => {
      e.preventDefault();

      const container = document.querySelector(".room-options");
      container
        .querySelectorAll(".room-card:not(.template)")
        .forEach((c) => c.remove());
      const checkInIso = detail.checkinIso;
      const checkOutIso = detail.checkoutIso;

      //查詢可用房型
      try {
        const res = await fetch(
          `http://localhost:8080/api/rooms/order/available?hotelId=${detail.hotelId}&checkInDate=${checkInIso}&checkOutDate=${checkOutIso}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
        if (!res.ok) {
          alert("取得可用房型失敗");
          return;
        }

        const rooms = await res.json();
        const template = container.querySelector(".room-card.template");
        rooms.forEach((r) => {
          const card = template.cloneNode(true);
          card.classList.remove("template");
          card.style.display = "";
          card.querySelector(".room-img").src = r.imgUrl;
          card.querySelector(".room-name").textContent = r.roomTypeName;
          card.querySelector(
            ".room-price"
          ).textContent = `TWD ${r.price.toLocaleString()}`;
          // 記錄房型 id 及價格在 dataset
          card.dataset.roomtypeId = r.roomTypeId;
          card.dataset.price = r.price;
          card.addEventListener("click", () => {
            container
              .querySelectorAll(".room-card:not(.template)")
              .forEach((c) => c.classList.remove("selected"));
            card.classList.add("selected");
          });
          container.appendChild(card);
        });

        document.getElementById("changeRoomModal").style.display = "flex";
      } catch (err) {
        console.error(err);
        alert("取得可用房型失敗：" + err.message);
      }

      // 確認後，呼叫更改房型api
      const confirmRoomBtn = document.getElementById("changeRoomModalConfirm");
      if (confirmRoomBtn) {
        confirmRoomBtn.onclick = async () => {
          const selectedCard = document.querySelector(".room-card.selected");
          if (!selectedCard) {
            alert("請選擇要更換的房型");
            return;
          }
          const roomTypeId = selectedCard.dataset.roomtypeId;
          const bookingId = detail.orderNumber;

          try {
            const res = await fetch(
              `http://localhost:8080/api/bookings/${bookingId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                },
                body: JSON.stringify({
                  items: [
                    {
                      roomTypeId: Number(roomTypeId),
                      quantity: 1,
                    },
                  ],
                }),
              }
            );
            if (!res.ok) throw new Error("更改房型失敗");
            alert("房型更改成功！");
            // 加入指定的程式碼
            document.querySelector(".order-detail-panel").style.display =
              "none";
            document
              .querySelectorAll(".location")
              .forEach((el) => (el.style.display = "block"));
            document
              .querySelectorAll(".order-list")
              .forEach((el) => (el.style.display = "block"));
            document.getElementById("changeRoomModal").style.display = "none";

            const updatedOrders = await fetchAndClassifyOrders();
            ordersByType = updatedOrders;
            setActiveTab("future");
            renderOrdersTab("future");
          } catch (err) {
            console.error(err);
            alert("更改房型失敗：" + err.message);
          }
        };
      }
    };

    // 關閉 changeRoomModal（按鈕 & ✕）
    document
      .getElementById("changeRoomModalClose")
      .addEventListener("click", () => {
        document.getElementById("changeRoomModal").style.display = "none";
      });
    document
      .getElementById("closeChangeRoomModal")
      .addEventListener("click", () => {
        document.getElementById("changeRoomModal").style.display = "none";
      });
  }
  //============= 查看住宿規定 ==================
  // 查看住宿規定按鈕
  const viewRulesBtn = document.querySelector(".view-rules-btn");
  if (viewRulesBtn) {
    viewRulesBtn.onclick = (e) => {
      e.preventDefault();
      document.getElementById("hotelRulesModal").style.display = "flex";
    };
  }

  // 關閉住宿規定 modal
  document
    .getElementById("closeHotelRulesModal")
    ?.addEventListener("click", () => {
      document.getElementById("hotelRulesModal").style.display = "none";
    });
  document
    .getElementById("hotelRulesModalClose")
    ?.addEventListener("click", () => {
      document.getElementById("hotelRulesModal").style.display = "none";
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

// ===================== 住宿訊息聊天室列表 =====================
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
  // 讀取dataset
  const chatRoomId = Number(item.dataset.chatRoomId);
  const receiverId = Number(item.dataset.receiverId);
  const hotelId = Number(item.dataset.hotelId);
  const displayName =
    item.dataset.displayName ||
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
  renderChatBox(displayName);

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
// ============ 個人資料 ===================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("http://localhost:8080/api/user/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    });
    if (!res.ok) throw new Error("取得個人資料失敗");

    const data = await res.json();

    // 直接顯示在頁面上
    document.querySelector(
      ".profile-field.name .profile-value .value"
    ).textContent = `${data.firstName} ${data.lastName}`;
    document.querySelector(".email").textContent = data.email || "";
    document.querySelector(
      ".profile-field.tel .profile-value .value"
    ).textContent = data.tel || "";
  } catch (err) {
    console.error(err);
  }
});

// ======= 個人資料 - 編輯切換 ==========
document.addEventListener("DOMContentLoaded", () => {
  const nameEditBtn = document.querySelector(".edit-btn.name");
  const field = document.querySelector(".profile-field.name");
  const displayArea = field?.querySelector(".profile-value");
  const editArea = field?.querySelector(".edit-passport-name");

  if (nameEditBtn && field && displayArea && editArea) {
    nameEditBtn.addEventListener("click", async () => {
      displayArea.style.display = "none";
      editArea.style.display = "block";

      try {
        const res = await fetch("http://localhost:8080/api/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });

        if (!res.ok) throw new Error("取得個人資料失敗");

        const data = await res.json();

        document.getElementById("passportFirstName").value =
          data.firstName || "";
        document.getElementById("passportLastName").value = data.lastName || "";

        console.log("從後端取得英文姓名：", data.firstName, data.lastName);
      } catch (err) {
        console.error(err);
        alert("無法取得使用者英文姓名");
      }
    });

    const cancelBtn = editArea.querySelector(".cancel-edit-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        editArea.style.display = "none";
        displayArea.style.display = "";
      });
    }

    const saveBtn = editArea.querySelector(".save-edit-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const newFirstName = document.getElementById("passportFirstName").value;
        const newLastName = document.getElementById("passportLastName").value;

        const newFullName = `${newFirstName} ${newLastName}`.trim();

        try {
          const res = await fetch(
            "http://localhost:8080/api/user/update-profile",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
              },
              body: JSON.stringify({
                firstName: newFirstName,
                lastName: newLastName,
              }),
            }
          );

          if (!res.ok) {
            throw new Error("更新個人資料失敗");
          }

          displayArea.querySelector(".value").textContent = newFullName;

          editArea.style.display = "none";
          displayArea.style.display = "flex";

          alert("更新成功！");
          console.log("已寫回後端：", newFullName);
        } catch (err) {
          console.error(err);
          alert("更新失敗：" + err.message);
        }
      });
    }
  }
});

//更改電話
document.addEventListener("DOMContentLoaded", () => {
  const telEditBtn = document.querySelector(".edit-btn.tel");
  const field = document.querySelector(".profile-field.tel");
  const displayArea = field ? field.querySelector(".profile-value") : null;
  const editArea = field ? field.querySelector(".edit-tel") : null;
  if (telEditBtn && field && displayArea && editArea) {
    telEditBtn.addEventListener("click", () => {
      displayArea.style.display = "none";
      editArea.style.display = "block";
    });
  }
  if (editArea && displayArea) {
    const cancelBtn = editArea.querySelector(".cancel-tel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        editArea.style.display = "none";
        displayArea.style.display = "";
      });
    }
    const saveBtn = editArea.querySelector(".save-tel-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const newTel = document.getElementById("newTel").value.trim();
        if (!/^09\d{8}$/.test(newTel)) {
          alert("請輸入正確的台灣手機號碼，例如 0912345678");
          return;
        }
        try {
          const res = await fetch(
            "http://localhost:8080/api/user/update-profile",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
              },
              body: JSON.stringify({ tel: newTel }),
            }
          );
          if (!res.ok) throw new Error("更新電話號碼失敗");
          displayArea.querySelector(".value").textContent = newTel;
          editArea.style.display = "none";
          displayArea.style.display = "flex";
          alert("電話號碼更新成功！");
        } catch (err) {
          console.error(err);
          alert("更新電話號碼失敗：" + err.message);
        }
      });
    }
  }
});

// 更改密碼
document.addEventListener("DOMContentLoaded", () => {
  const passwordEditBtn = document.querySelector(".edit-btn.password");
  const field = document.querySelector(".profile-field.password");
  const displayArea = field ? field.querySelector(".profile-value") : null;
  const editArea = field ? field.querySelector(".edit-password") : null;

  if (passwordEditBtn && field && displayArea && editArea) {
    passwordEditBtn.addEventListener("click", () => {
      displayArea.style.display = "none";
      editArea.style.display = "block";
    });
  }

  if (editArea && displayArea) {
    const cancelBtn = editArea.querySelector(".cancel-password-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        editArea.style.display = "none";
        displayArea.style.display = "";
      });
    }
    const saveBtn = editArea.querySelector(".save-password-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const newPassword = document.getElementById("newPassword").value.trim();
        if (!newPassword) {
          alert("請輸入新密碼！");
          return;
        }
        try {
          const res = await fetch(
            "http://localhost:8080/api/user/update-profile",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
              },
              body: JSON.stringify({ password: newPassword }),
            }
          );
          if (!res.ok) throw new Error("更新密碼失敗");
          field.querySelector(".profile-value .value").textContent =
            "••••••••••••";
          editArea.style.display = "none";
          displayArea.style.display = "";
          alert("密碼更新成功！");
        } catch (err) {
          console.error(err);
          alert("更新密碼失敗：" + err.message);
        }
      });
    }
  }
});

// ========== 收藏清單串接與渲染 ==========
// 收藏地區下拉選單切換事件
document.addEventListener("DOMContentLoaded", () => {
  const favSelect = document.getElementById("fav-location");
  if (favSelect) {
    favSelect.addEventListener("change", (e) => {
      const city = e.target.value;
      const favTitle = document.querySelector(".favlist-title");
      if (favTitle) {
        favTitle.textContent = city || "全部城市";
      }
      loadFavorites(city);
    });
  }
});

let allCities = [];
async function loadFavorites(city = "") {
  try {
    const res = await fetch(
      `http://localhost:8080/api/favorites/users${
        city ? "?city=" + encodeURIComponent(city) : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      }
    );
    if (!res.ok) {
      throw new Error("取得收藏清單失敗，狀態碼：" + res.status);
    }
    const favorites = await res.json();
    console.log("取得收藏清單：", favorites);

    // 提取所有 city 並更新下拉選單
    if (city === "") {
      // 第一次載入才更新城市選單
      allCities = [
        ...new Set(favorites.map((fav) => fav.city).filter(Boolean)),
      ];
      const favSelect = document.getElementById("fav-location");
      if (favSelect) {
        favSelect.innerHTML = '<option value="">全部城市</option>';
        allCities.forEach((cityName) => {
          const opt = document.createElement("option");
          opt.value = cityName;
          opt.textContent = cityName;
          favSelect.appendChild(opt);
        });
      }
    }
    renderFavorites(favorites);
  } catch (err) {
    console.error(err);
    alert("無法取得收藏清單");
  }
}

function renderFavorites(favList) {
  const grid = document.querySelector(".favlist-grid");
  const template = document.querySelector(".fav-card.template");
  if (!grid || !template) return;

  // 清空現有卡片
  grid
    .querySelectorAll(".fav-card:not(.template)")
    .forEach((el) => el.remove());

  favList.forEach((fav) => {
    const card = template.cloneNode(true);
    card.classList.remove("template");
    card.style.display = "";

    // 圖片
    const imgDiv = card.querySelector(".fav-img");
    if (imgDiv) {
      imgDiv.style.backgroundImage = `url(${
        fav.imgUrl || "/images/default-hotel.jpg"
      })`;
    }

    // 飯店名稱
    card.querySelector("h5").textContent = fav.name;

    // 分數
    card.querySelector(".score").textContent = fav.score?.toFixed(1) || "-";

    // 評論數
    card.querySelector(".count").textContent = `${fav.reviewCount || 0} 則評論`;

    // 地區
    const districtEl = card.querySelector(".fav-location .fav-district");
    if (districtEl) {
      districtEl.textContent = fav.district || "";
    }

    // 城市
    const cityEl = card.querySelector(".fav-location .fav-city");
    if (cityEl) {
      cityEl.textContent = fav.city || "";
    }

    // 價格
    card.querySelector(".fav-price").textContent = `TWD ${
      fav.price?.toLocaleString() || "-"
    }`;
    //收藏愛心功能（取消收藏）
    const heartBtn = card.querySelector(".fav-heart-btn");
    if (heartBtn) {
      heartBtn.addEventListener("click", () => {
        //先讓愛心變空心
        const icon = heartBtn.querySelector("i");
        if (icon) {
          icon.classList.remove("bi-heart-fill");
          icon.classList.add("bi-heart");
        }
        //呼叫刪除api
        fetch(`http://localhost:8080/api/favorites?hotelId=${fav.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        })
          .then((res) => {
            if (!res.ok) throw new Error("刪除失敗");
            card.remove();
          })
          .catch((err) => {
            console.error(err);
            alert("無法移除收藏");
            // 若失敗，把愛心改回亮紅色
            if (icon) {
              icon.classList.remove("bi-heart");
              icon.classList.add("bi-heart-fill");
            }
          });
      });
    }
    grid.appendChild(card);
  });
}
