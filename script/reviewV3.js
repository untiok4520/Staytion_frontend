$(document).ready(function () {
  const reviewList = $("#reviewList");
  const avgRating = $("#avgRating");
  const hotelSelect = $("select.form-select").first();
  const ownerId = localStorage.getItem("userId") || "";
  // const ownerId = 1; // TODO: 替換為登入者的 ID
  let hotelMap = {};

  const token = localStorage.getItem("jwtToken") || "";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  let currentPage = 0;
  let totalPages = 0;

  // 載入飯店選單
  function loadHotels() {
    $.ajax({
      url: `http://localhost:8080/api/admin/hotels/owner/${ownerId}`,
      method: "GET",
      success: function (hotels) {
        hotelSelect.empty().append(`<option value="">全部</option>`);
        hotels.forEach((h) => {
          hotelSelect.append(`<option value="${h.id}">${h.hotelname}</option>`);
          hotelMap[h.id] = h.hotelname;
        });
      },
      error: function () {
        console.error("載入飯店列表失敗");
      },
    });
  }

  // 查詢留言
  function fetchReviews(page = 0) {
    currentPage = page;
    const params = {};

    const keyword = $('input[placeholder="輸入姓名 / 評論內容"]').val().trim();
    const hotelId = hotelSelect.val();
    const hotel = hotelMap[hotelId];
    const date = $('input[type="date"]').val();
    const scoreOption = $("select.form-select").eq(1).val();

    if (keyword) {
      params.firstName = keyword;
      params.comment = keyword;
    }
    if (hotel) params.hotelName = hotel;
    if (date) {
      const startDate = date;
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const endDate = nextDate.toISOString().split("T")[0]; // 取YYYY-MM-dd

      params.startDate = startDate;
      params.endDate = endDate;
    }

    if (scoreOption === "8 分以上") {
      params.minScore = 8;
    } else if (scoreOption === "6~7 分") {
      params.minScore = 6;
      params.maxScore = 7;
    } else if (scoreOption === "5 分以下") {
      params.maxScore = 5;
    }

    params.page = page;
    params.size = 10;

    // 平均分數
    if (hotelId) {
      calculateAvg(hotelId); // 傳入選到的 hotelId
    } else {
      avgRating.text("--"); // 沒選飯店就清除平均分數
    }

    $.ajax({
      url: "http://localhost:8080/api/host/reviews",
      method: "GET",
      headers,
      data: params,
      success: function (data) {
        console.log("載入留言成功", data);
        totalPages = data.totalPages;
        renderReviews(data.content);
        renderPagination(currentPage, totalPages);
      },
      error: function () {
        console.error("載入留言失敗");
      },
    });
  }

  // 渲染留言卡片
  function renderReviews(list) {
    reviewList.empty();
    if (!list.length) {
      reviewList.append(
        `<p class="text-center text-muted">目前沒有符合條件的留言</p>`
      );
      avgRating.text("--");
      return;
    }

    list.forEach((r) => {
      const createdDate = r.createdAt.split("T")[0];
      // Updated: Add an editable textarea for replies
      const replyHTML = r.reply
        ? `<div class="alert alert-secondary small reply-content"><strong>業者回覆：</strong><span class="reply-text">${r.reply}</span><textarea class="form-control reply-edit-textarea mt-2" style="display:none;">${r.reply}</textarea></div>`
        : "";
      const replyButton = r.reply
        ? `<button class="btn btn-sm btn-outline-success" disabled>已回覆</button>`
        : `<button class="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#replyBox${r.orderId}">回覆</button>`;

      const editSaveButtons = r.reply
        ? `
        <button class="btn btn-sm btn-outline-danger edit-reply-btn" data-order-id="${r.orderId}">修改</button>
        <button class="btn btn-sm btn-success save-reply-btn" data-order-id="${r.orderId}" style="display:none;">儲存</button>
        <button class="btn btn-sm btn-secondary cancel-edit-btn" data-order-id="${r.orderId}" style="display:none;">取消</button>
      `
        : "";

      const card = `
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <div>
                  <h6 class="mb-1">${r.firstName} · ${
        r.hotelName || "飯店"
      }</h6>
                  <small class="text-muted">留言時間：${createdDate}</small>
                </div>
                <div>
                  <span class="badge fs-6" style="background-color:#1f487e">${
                    r.score
                  }</span>
                </div>
              </div>
              <p>${r.comment}</p>
              ${replyHTML}
              <div class="d-flex justify-content-end gap-2">
                ${editSaveButtons}
                ${replyButton}
              </div>
              <div class="collapse mt-2" id="replyBox${r.orderId}">
                <textarea class="form-control mb-2" rows="2" placeholder="輸入回覆內容..."></textarea>
                <div class="text-end">
                  <button class="btn btn-primary btn-sm send-reply-btn" data-order-id="${
                    r.orderId
                  }">送出回覆</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      reviewList.append(card);
    });
  }

  // 平均分數計算
  function calculateAvg(hotelId) {
    if (!hotelId) {
      avgRating.text("--");
      return;
    }

    $.ajax({
      url: `http://localhost:8080/api/rooms/${hotelId}/reviews/average-score`,
      method: "GET",
      success: function (data) {
        if (data && typeof data === "number") {
          avgRating.text(data.toFixed(1));
        } else {
          avgRating.text("--");
        }
      },
      error: function () {
        avgRating.text("--");
        console.error("取得平均分數失敗");
      },
    });
  }

  // 回覆留言 PATCH
  reviewList.on("click", ".send-reply-btn", function () {
    const orderId = $(this).data("orderId");
    const reply = $(this).closest(".collapse").find("textarea").val().trim();
    if (!reply) return;

    $.ajax({
      url: `http://localhost:8080/api/reviews/${orderId}/reply`,
      method: "PATCH",
      headers,
      contentType: "application/json",
      data: JSON.stringify({ reply }),
      success: function () {
        fetchReviews(currentPage);
        const toastEl = $("#replyToast");
        const toastBody = toastEl.find(".toast-body");
        toastBody.text("回覆已送出！");
        if (toastEl.length) new bootstrap.Toast(toastEl[0]).show();
      },
      error: function () {
        alert("送出回覆失敗，請稍後再試");
      },
    });
  });

  // Edited: 編輯回覆 - 顯示 textarea 並隱藏文字
  reviewList.on("click", ".edit-reply-btn", function () {
    const $cardBody = $(this).closest(".card-body");
    $cardBody.find(".reply-text").hide();
    $cardBody.find(".reply-edit-textarea").show();
    $cardBody.find(".edit-reply-btn").hide();
    $cardBody.find(".save-reply-btn, .cancel-edit-btn").show();
  });

  // Edited: 儲存回覆 - 提交 PATCH 請求
  reviewList.on("click", ".save-reply-btn", function () {
    const orderId = $(this).data("orderId");
    const $cardBody = $(this).closest(".card-body");
    const newReply = $cardBody.find(".reply-edit-textarea").val().trim();

    if (newReply.trim() === "") {
      alert("回覆內容不能為空。");
      return;
    }

    $.ajax({
      url: `http://localhost:8080/api/reviews/${orderId}/reply`,
      method: "PATCH",
      headers,
      contentType: "application/json",
      data: JSON.stringify({ reply: newReply }),
      success: function () {
        fetchReviews(currentPage); // Refresh the reviews to show updated content
        const toastEl = $("#replyToast");
        // 為了區分回覆和修改，可以修改 Toast 內容
        const toastBody = toastEl.find(".toast-body");
        toastBody.text("回覆已更新！");
        if (toastEl.length) new bootstrap.Toast(toastEl[0]).show();
      },
      error: function () {
        alert("更新回覆失敗，請稍後再試");
      },
    });
  });

  // Edited: 取消編輯 - 隱藏 textarea 並顯示文字
  reviewList.on("click", ".cancel-edit-btn", function () {
    const $cardBody = $(this).closest(".card-body");
    $cardBody.find(".reply-text").show();
    $cardBody.find(".reply-edit-textarea").hide();
    $cardBody.find(".edit-reply-btn").show();
    $cardBody.find(".save-reply-btn, .cancel-edit-btn").hide();
  });

  // 表單查詢事件
  $("form").on("submit", function (e) {
    e.preventDefault();
    fetchReviews(0);
  });

  // 分頁渲染（滾動式）
  function renderPagination(current, total) {
    const maxVisible = 5;
    const $pagination = $("#pagination");
    $pagination.empty();
    let html = "";

    html += `<li class="page-item ${current === 0 ? "disabled" : ""}">
                  <a class="page-link" href="#" data-page="${
                    current - 1
                  }">上一頁</a>
              </li>`;

    let start = Math.max(0, current - Math.floor(maxVisible / 2));
    let end = Math.min(total - 1, current + Math.floor(maxVisible / 2));

    if (start > 1) {
      html += `<li class="page-item"><a class="page-link" href="#" data-page="0">1</a></li>`;
      if (start > 2) {
        html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
    }

    for (let i = start; i <= end; i++) {
      html += `<li class="page-item ${i === current ? "active" : ""}">
                    <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                </li>`;
    }

    if (end < total - 1) {
      if (end < total - 2) {
        html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
      html += `<li class="page-item"><a class="page-link" href="#" data-page="${
        total - 1
      }">${total}</a></li>`;
    }

    html += `<li class="page-item ${current + 1 >= total ? "disabled" : ""}">
                  <a class="page-link" href="#" data-page="${
                    current + 1
                  }">下一頁</a>
              </li>`;

    $pagination.append(html);
  }

  // 點擊分頁事件
  $(document).on("click", ".pagination .page-link", function (e) {
    e.preventDefault();
    const page = parseInt($(this).data("page"));
    if (!isNaN(page) && page >= 0 && page < totalPages) {
      fetchReviews(page);
    }
  });

  // 初始化
  loadHotels();
  fetchReviews(0);
});
// 使用者登入狀態檢查
$(function () {
  const token = localStorage.getItem("jwtToken");
  const userName = localStorage.getItem("userName") || "使用者名稱"; // 可從登入回傳存userName

  const $loginBtn = $("#loginBtn");
  const $userDropdown = $("#userDropdown");
  const $logoutBtn = $("#logoutBtn");
  const $userDropdownToggle = $("#userDropdownMenu");

  if (token) {
    $loginBtn.addClass("d-none");
    $userDropdown.removeClass("d-none");
    $userDropdownToggle.text(userName);
  } else {
    $loginBtn.removeClass("d-none");
    $userDropdown.addClass("d-none");
  }

  $logoutBtn.on("click", function () {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userName");
    location.reload();
  });
});
