$(document).ready(function () {
    const apiUrl = "http://localhost:8080/api/admins/orders/filter";
    const hotelSelect = $("select.form-select").first();
    let currentPage = 0;
    let currentUserId = 1;

    let orderData = []; // 儲存當前訂單資料
    let guestData = {}; // 儲存客戶資料（如果有的話）

    // 載入飯店選單
    function loadHotels() {
        $.ajax({
            url: `http://localhost:8080/api/admin/hotels/owner/${currentUserId}`,
            method: "GET",
            success: function (hotels) {
                hotelSelect.empty().append(`<option value="">全部</option>`);
                hotels.forEach(h => {
                    hotelSelect.append(`<option value="${h.id}">${h.hotelname}</option>`);
                });
            },
            error: function () {
                console.error("載入飯店列表失敗");
            }
        });
    }

    // 綁定查詢按鈕事件
    $("form").on("submit", function (e) {
        e.preventDefault();
        currentPage = 0;
        fetchOrders(currentPage);
    });

    loadHotels();

    // 篩選參數並呼叫 API
    function fetchOrders(page) {
        const keyword = $("#keyword").val().trim();
        const hotelId = $("select").eq(0).val();
        const createdAt = $("input[type='date']").val();
        const paymentStatus = $("select").eq(1).val();

        $.ajax({
            url: apiUrl,
            type: "GET",
            data: {
                currentUserId,
                keyword: keyword !== "" ? keyword : null,
                hotelId: hotelId !== "" ? hotelId : null,
                start: createdAt !== "" ? createdAt : null,
                end: createdAt !== "" ? createdAt : null,
                paymentStatus: paymentStatus !== "" ? paymentStatus : null,
                page: page,
                size: 10
            },
            success: function (response) {
                console.log("載入訂單成功", response);
                orderData = response.content;
                renderOrderTable(orderData);
                renderPagination(response.pageable.pageNumber, response.totalPages);
            },
            error: function (xhr) {
                alert("查詢失敗：" + xhr.responseText);
            }
        });
    }

    // 渲染訂單表格
    function renderOrderTable(data) {
        const $tbody = $("#orderTable tbody");
        $tbody.empty();

        guestData = {}

        if (data.length === 0) {
            $tbody.append("<tr><td colspan='9' class='text-center'>查無資料</td></tr>");
            return;
        }

        data.forEach(order => {
            const statusInfo = getPaymentStatusInfo(order.paymentStatus);
            const methodInfo = getPaymentMethodInfo(order.paymentMethod);
             
            // 儲存 guest 資料
            guestData[order.userId] = {
                name: order.userName,
                email: order.userEmail,
                phone: order.userTel,
                orders: guestData[order.userId]?.orders + 1 || 1,
                amount: (guestData[order.userId]?.amount || 0) + order.totalPrice
            };
        
            const row = `
                <tr>
                    <td># ${order.id}</td>
                    <td><button class="btn btn-link p-0 text-decoration-none text-dark" onclick="showGuest(${order.userId})">${order.userName}</button></td>
                    <td>${order.hotelName}</td>
                    <td>${order.items.map(i => `${i.roomTypeName} x${i.quantity}`).join(", ")}</td>
                    <td>${order.createdAt.split("T")[0]}</td>
                    <td><span class="text-${statusInfo.className} fw-bold">${statusInfo.text}</span></td>
                    <td><span class="text-${methodInfo.className}">${methodInfo.text}</span></td>
                    <td>$ ${order.totalPrice}</td>
                    <td><button class="btn btn-sm btn-outline-primary" onclick="showOrderDetail(${order.id})">查看</button></td>
                </tr>`;
            $tbody.append(row);
        });
    }

    // 付款狀態轉換
    function getPaymentStatusInfo(status) {
        switch (status) {
            case 'PAID':
                return { text: '已付款', className: 'success' };
            case 'UNPAID':
                return { text: '未付款', className: 'danger' };
            case 'CANCELED':
                return { text: '已取消', className: 'secondary' };
            default:
                return { text: '未知狀態', className: 'dark' };
        }
    }

    // 付款方法轉換
    function getPaymentMethodInfo(method) {
        switch (method) {
            case 'CASH':
                return { text: '現金', className: 'warning' };
            case 'CREDIT_CARD':
                return { text: '信用卡', className: 'primary' };
            case 'ECPAY':
                return { text: '綠界', className: 'success' };
            default:
                return { text: '未知狀態', className: 'dark' };
        }
    }

    // 分頁渲染
    function renderPagination(current, total) {
        const $pagination = $("#pagination");
        $pagination.empty();

        let html = "";

        html += `<li class="page-item ${current === 0 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${current - 1}">上一頁</a>
                </li>`;

        for (let i = 0; i < total; i++) {
            html += `<li class="page-item ${i === current ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                    </li>`;
        }

        html += `<li class="page-item ${current + 1 >= total ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${current + 1}">下一頁</a>
                </li>`;

        $pagination.html(html);
    }

    // 點擊分頁
    $(document).on("click", ".pagination .page-link", function (e) {
        e.preventDefault();
        const page = parseInt($(this).data("page"));
        if (!isNaN(page)) {
            currentPage = page;
            fetchOrders(currentPage);
        }
    });

    // 顯示訂單詳情（使用 jQuery）
    window.showOrderDetail = function (orderId) {
        const order = orderData.find(o => o.id === orderId);
        if (!order) return;

        $('#modalOrderCode').text(order.id);
        $('#modalOrderDate').text(order.createdAt.split("T")[0]);
        $('#modalGuestName').text(order.userName);
        $('#modalStayDate').text(order.checkInDate + " 至 " + order.checkOutDate);
        $('#modalHotelName').text(order.hotelName);
        $('#modalRoomType').text(order.items.map(i => `${i.roomTypeName} x${i.quantity}`).join(", "));

        const $badge = $('#modalPaymentStatus');
        const statusInfo = getPaymentStatusInfo(order.paymentStatus);
        $badge
            .text(statusInfo.text)
            .removeClass('bg-success bg-danger bg-secondary bg-dark')
            .addClass('badge bg-' + statusInfo.className);

        $('#modalPaymentMethod').text(getPaymentMethodInfo(order.paymentMethod).text);
        $('#modalAmount').text("$ " + order.totalPrice);

        new bootstrap.Modal($('#orderModal')[0]).show();
    };

    // 顯示客戶資料（使用 jQuery）
    window.showGuest = function (guestId) {
        const guest = guestData[guestId];
        if (!guest) {
            alert("暫無客戶資料");
            return;
        }

        $('#modalName').text(guest.name);
        $('#modalEmail').text(guest.email);
        $('#modalPhone').text(guest.phone);
        $('#modalOrders').text(guest.orders);
        $('#modalAmountGuest').text(`$ ${guest.amount}`);

        new bootstrap.Modal($('#guestModal')[0]).show();
    };

    // 預設自動載入一次
    fetchOrders(currentPage);
});
