$(document).ready(function () {
    const ownerId = 1; // TODO: 替換成登入後取得的 ownerId
    let reviews = [];
    let currentPage = 0;
    let totalPages = 0;
    const pageSize = 6;

    // 初始化
    loadHotels();
    loadReviews();

    // 載入飯店選單
    function loadHotels() {
        $.ajax({
            url: `http://localhost:8080/api/admin/hotels/owner/${ownerId}`,
            method: "GET",
            // data: { ownerId },
            success: function (hotels) {
                const hotelSelect = $("#hotelSelect");
                hotelSelect.empty().append(`<option value="">全部</option>`);
                hotels.forEach(hotel => {
                    hotelSelect.append(`<option value="${hotel.id}">${hotel.name}</option>`);
                });
            }
        });
    }

    // 查詢評論（分頁 + 篩選）
    function loadReviews(filters = {}) {
        filters.page = currentPage;
        filters.size = pageSize;

        $.ajax({
            url: "http://localhost:8080/api/host/reviews",
            method: "GET",
            data: filters,
            success: function (res) {
                reviews = res.content || [];
                totalPages = res.totalPages || 0;
                renderReviews();
                renderAvgScore();
                renderPagination();
            },
            error: function () {
                alert("評論載入失敗！");
            }
        });
    }

    // 顯示平均分數
    function renderAvgScore() {
        if (reviews.length === 0) {
            $("#avgRating").text("--");
            return;
        }
        const total = reviews.reduce((sum, r) => sum + r.score, 0);
        const avg = (total / reviews.length).toFixed(1);
        $("#avgRating").text(avg);
    }

    // 顯示評論
    function renderReviews() {
        const reviewList = $("#reviewList");
        reviewList.empty();

        if (reviews.length === 0) {
            reviewList.append(`<div class="text-muted">目前沒有評論資料。</div>`);
            return;
        }

        reviews.forEach(r => {
            const card = $(`
                <div class="col-md-6">
                    <div class="border rounded p-3 position-relative">
                        <div class="d-flex justify-content-between">
                            <h6 class="fw-bold mb-1">${r.firstName || "匿名"}</h6>
                            <small class="text-muted">${new Date(r.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div class="mb-2">⭐ 評分：${r.score}</div>
                        <div class="mb-2">💬 留言：${r.comment}</div>
                        <div class="mb-2">📩 回覆：${r.reply || "<em class='text-muted'>尚未回覆</em>"}</div>
                        <div class="input-group mt-2">
                            <input type="text" class="form-control reply-input" placeholder="輸入回覆內容..." />
                            <button class="btn btn-primary btn-reply" data-orderid="${r.orderId}">回覆</button>
                        </div>
                    </div>
                </div>
            `);
            reviewList.append(card);
        });
    }

    // 顯示分頁
    function renderPagination() {
        const pagination = $(".pagination");
        pagination.empty();

        // 上一頁
        const prevDisabled = currentPage === 0 ? "disabled" : "";
        pagination.append(`<li class="page-item ${prevDisabled}"><a class="page-link" href="#" data-page="${currentPage - 1}">上一頁</a></li>`);

        // 頁碼
        for (let i = 0; i < totalPages; i++) {
            const active = i === currentPage ? "active" : "";
            pagination.append(`<li class="page-item ${active}"><a class="page-link" href="#" data-page="${i}">${i + 1}</a></li>`);
        }

        // 下一頁
        const nextDisabled = currentPage >= totalPages - 1 ? "disabled" : "";
        pagination.append(`<li class="page-item ${nextDisabled}"><a class="page-link" href="#" data-page="${currentPage + 1}">下一頁</a></li>`);
    }

    // 點擊分頁按鈕
    $(document).on("click", ".pagination .page-link", function (e) {
        e.preventDefault();
        const page = parseInt($(this).data("page"));
        if (!isNaN(page) && page >= 0 && page < totalPages) {
            currentPage = page;
            loadReviews(getFilterData());
        }
    });

    // 取得目前篩選條件
    function getFilterData() {
        const keyword = $("#keyword").val().trim();
        const hotelId = $("#hotelSelect").val();
        const date = $("#dateFilter").val();
        const scoreRange = $("#scoreFilter").val();

        const filters = {};
        if (keyword) filters.keyword = keyword;
        if (hotelId) filters.hotelId = hotelId;
        if (date) filters.date = date;

        if (scoreRange) {
            switch (scoreRange) {
                case "8": filters.minScore = 8; break;
                case "6": filters.minScore = 6; filters.maxScore = 7; break;
                case "5": filters.maxScore = 5; break;
            }
        }
        return filters;
    }

    // 查詢按鈕
    $("#filterForm").on("submit", function (e) {
        e.preventDefault();
        currentPage = 0;
        loadReviews(getFilterData());
    });

    // 回覆送出
    $(document).on("click", ".btn-reply", function () {
        const orderId = $(this).data("orderid");
        const replyText = $(this).siblings("input").val().trim();

        if (!replyText) {
            alert("請輸入回覆內容！");
            return;
        }

        $.ajax({
            url: `http://localhost:8080/api/reviews/${orderId}/reply`,
            method: "PATCH",
            contentType: "application/json",
            data: JSON.stringify({ reply: replyText }),
            success: function () {
                $("#replyToast").toast("show");
                loadReviews(getFilterData()); // 維持目前篩選條件與頁碼
            },
            error: function () {
                alert("回覆失敗！");
            }
        });
    });
});
