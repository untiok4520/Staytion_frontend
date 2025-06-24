// review-management.js
$(document).ready(function () {
  const reviewList = $("#reviewList");
  const avgRating = $("#avgRating");
  const hotelSelect = $("select.form-select").first();
  const ownerId = 1; // TODO: 替換為登入者的 ID
  let hotelMap = {};

  // 載入飯店選單
  function loadHotels() {
    $.ajax({
      url: `http://localhost:8080/api/admin/hotels/owner/${ownerId}`,
      method: "GET",
      success: function (hotels) {
        hotelSelect.empty().append(`<option value="">全部</option>`);
        hotels.forEach(h => {
          hotelSelect.append(`<option value="${h.id}">${h.hotelname}</option>`);
          hotelMap[h.id] = h.hotelname;
        });
      },
      error: function () {
        console.error("載入飯店列表失敗");
      }
    });
  }

  // 查詢留言
  function fetchReviews() {
    const params = {};

    const keyword = $('input[placeholder="輸入姓名 / 評論內容"]').val().trim();
    const hotel = hotelSelect.val();
    const date = $('input[type="date"]').val();
    const scoreOption = $("select.form-select").eq(1).val();

    if (keyword) {
      params.firstName = keyword;
      params.comment = keyword;
    }
    if (hotel) params.hotelName = hotel;
    if (date) params.startDate = date;

    if (scoreOption === "8 分以上") {
      params.minScore = 8;
    } else if (scoreOption === "6~7 分") {
      params.minScore = 6;
      params.maxScore = 7;
    } else if (scoreOption === "5 分以下") {
      params.maxScore = 5;
    }

    params.page = 0;
    params.size = 10;

    $.ajax({
      url: "http://localhost:8080/api/host/reviews",
      method: "GET",
      data: params,
      success: function (data) {
        console.log("取得留言資料：", data);
        renderReviews(data.content);
        calculateAvg(data.content);
      },
      error: function () {
        console.error("載入留言失敗");
      }
    });
  }

  // 渲染留言卡片
  function renderReviews(list) {
    reviewList.empty();
    if (!list.length) {
      reviewList.append(`<p class="text-center text-muted">目前沒有符合條件的留言</p>`);
      avgRating.text("--");
      return;
    }

    list.forEach(r => {
      const createdDate = r.createdAt.split("T")[0];
      const replyHTML = r.reply
        ? `<div class="alert alert-secondary small"><strong>業者回覆：</strong>${r.reply}</div>`
        : "";
      const replyButton = r.reply
        ? `<button class="btn btn-sm btn-outline-success" disabled>已回覆</button>`
        : `<button class="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#replyBox${r.orderId}">回覆</button>`;

      const card = `
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <div>
                  <h6 class="mb-1">${r.firstName} · ${hotelMap[hotelSelect.val()] || "飯店"}</h6>
                  <small class="text-muted">留言時間：${createdDate}</small>
                </div>
                <div>
                  <span class="badge fs-6" style="background-color:#1f487e">${r.score}</span>
                </div>
              </div>
              <p>${r.comment}</p>
              ${replyHTML}
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-danger">修改</button>
                ${replyButton}
              </div>
              <div class="collapse mt-2" id="replyBox${r.orderId}">
                <textarea class="form-control mb-2" rows="2" placeholder="輸入回覆內容..."></textarea>
                <div class="text-end">
                  <button class="btn btn-primary btn-sm send-reply-btn" data-order-id="${r.orderId}">送出回覆</button>
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
  function calculateAvg(list) {
    const avg = list.reduce((sum, r) => sum + r.score, 0) / list.length;
    avgRating.text(avg.toFixed(1));
  }

  // 回覆留言 PATCH
  reviewList.on("click", ".send-reply-btn", function () {
    const orderId = $(this).data("orderId");
    const reply = $(this).closest(".collapse").find("textarea").val().trim();

    if (!reply) return;

    $.ajax({
      url: `http://localhost:8080/api/reviews/${orderId}/reply`,
      method: "PATCH",
      contentType: "application/json",
      data: JSON.stringify({ reply }),
      success: function () {
        fetchReviews();
        const toastEl = $("#replyToast");
        if (toastEl.length) new bootstrap.Toast(toastEl[0]).show();
      },
      error: function () {
        alert("送出回覆失敗，請稍後再試");
      }
    });
  });

  // 表單查詢事件
  $("form").on("submit", function (e) {
    e.preventDefault();
    fetchReviews();
  });

  // 初始化
  loadHotels();
  fetchReviews();
});
