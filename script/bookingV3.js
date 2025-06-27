$(document).ready(function () {
    const apiUrl = "http://localhost:8080/api/admins/orders/filter";
    const hotelSelect = $("#filterForm #hotelSelect");
    const orderModal = $('#orderModal'); // 取得 Modal 本身
    const editOrderBtn = $('#editOrderBtn'); // 新增的編輯按鈕
    const saveOrderChangesBtn = $('#saveOrderChangesBtn');
    const cancelEditBtn = $('#cancelEditBtn');
    const modalPaymentStatusText = $('#modalPaymentStatusText'); // 用於顯示文字狀態
    const modalPaymentStatusSelect = $('#modalPaymentStatusSelect'); // 用於顯示下拉選單
    const closeModalBtn = $('#closeModalBtn'); // 取得關閉按鈕
    const successToast = $('#successToast'); // 取得 Toast 元素

    const token = localStorage.getItem("token") || ""; // 從 localStorage 獲取 token
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 將 token 加入 Authorization header
    };

    let currentPage = 0;
    let currentUserId = 201; // TODO: 請替換為實際登入者的 ID

    let orderData = []; // 儲存當前訂單資料
    let guestData = {}; // 儲存客戶資料（如果有的話）
    let currentEditingOrderId = null; // 用於追蹤當前正在編輯的訂單 ID
    let originalPaymentStatus = ''; // 用於儲存編輯前的付款狀態，方便取消時還原

    // 載入飯店選單
    function loadHotels() {
        $.ajax({
            url: `http://localhost:8080/api/admin/hotels/owner/${currentUserId}`,
            method: "GET",
            headers: headers, // 確保這裡也帶上 headers
            success: function (hotels) {
                hotelSelect.empty().append(`<option value="">全部</option>`);
                hotels.forEach(h => {
                    hotelSelect.append(`<option value="${h.id}">${h.hotelname}</option>`);
                });
            },
            error: function (xhr) {
                console.error("載入飯店列表失敗:", xhr);
                // 處理錯誤，例如顯示錯誤訊息給使用者
            }
        });
    }

    // 綁定查詢表單事件 (使用 ID 篩選表單)
    $("#filterForm").on("submit", function (e) {
        e.preventDefault();
        currentPage = 0;
        fetchOrders(currentPage);
    });

    loadHotels();
    fetchOrders(currentPage); // 預設自動載入一次

    // 篩選參數並呼叫 API
    function fetchOrders(page) {
        const keyword = $("#keyword").val().trim();
        const hotelId = $("#hotelSelect").val(); // 使用正確的 ID
        const createdAt = $("#createdAt").val(); // 使用正確的 ID
        const paymentStatus = $("#paymentStatusFilter").val(); // 使用正確的 ID

        $.ajax({
            url: apiUrl,
            type: "GET",
            headers: headers,
            data: {
                currentUserId,
                keyword: keyword !== "" ? keyword : null,
                hotelId: hotelId !== "" ? hotelId : null,
                start: createdAt !== "" ? createdAt : null,
                end: createdAt !== "" ? createdAt : null, // 如果只需要查詢單日，start 和 end 設為相同
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
                alert("查詢失敗：" + (xhr.responseJSON ? xhr.responseJSON.message : xhr.responseText));
                console.error("查詢失敗", xhr);
            }
        });
    }

    // 渲染訂單表格
    function renderOrderTable(data) {
        const $tbody = $("#orderTable tbody");
        $tbody.empty();

        guestData = {} // 重置客戶資料

        if (data.length === 0) {
            $tbody.append("<tr><td colspan='9' class='text-center'>查無資料</td></tr>");
            return;
        }

        data.forEach(order => {
            const statusInfo = getPaymentStatusInfo(order.paymentStatus);
            const methodInfo = getPaymentMethodInfo(order.paymentMethod);

            // 儲存 guest 資料，以便 showGuest 函數使用
            if (!guestData[order.userId]) {
                guestData[order.userId] = {
                    name: order.userName,
                    email: order.userEmail,
                    phone: order.userTel,
                    orders: 0,
                    amount: 0
                };
            }
            guestData[order.userId].orders += 1;
            guestData[order.userId].amount += order.totalPrice;

            const row = `
                <tr>
                    <td># ${order.id}</td>
                    <td><button class="btn btn-link p-0 text-decoration-none text-dark" onclick="showGuest(${order.userId})">${order.userName}</button></td>
                    <td>${order.hotelName}</td>
                    <td>${order.items.map(i => `${i.roomTypeName} x${i.quantity}`).join(", ")}</td>
                    <td>${order.createdAt.split("T")[0]}</td>
                    <td><span class="text-${statusInfo.className} fw-bold">${statusInfo.text}</span></td>
                    <td><span class="text-${methodInfo.className} fw-bold">${methodInfo.text}</span></td>
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

    // 顯示訂單詳情
    window.showOrderDetail = function (orderId) {
        const order = orderData.find(o => o.id === orderId);
        if (!order) {
            console.error("找不到訂單 ID:", orderId);
            return;
        }

        currentEditingOrderId = orderId; // 設置當前編輯的訂單 ID
        originalPaymentStatus = order.paymentStatus; // 儲存原始狀態

        $('#modalOrderCode').text(order.id);
        $('#modalOrderDate').text(order.createdAt.split("T")[0]);
        $('#modalGuestName').text(order.userName);
        $('#modalStayDate').text(order.checkInDate + " 至 " + order.checkOutDate);
        $('#modalHotelName').text(order.hotelName);
        $('#modalRoomType').text(order.items.map(i => `${i.roomTypeName} x${i.quantity}`).join(", "));

        // 確保在查看模式下，下拉選單是隱藏的，只顯示文字狀態
        modalPaymentStatusText.text(getPaymentStatusInfo(order.paymentStatus).text).show();
        modalPaymentStatusSelect.hide(); // 這裡確保了初始隱藏

        $('#modalPaymentMethod').text(getPaymentMethodInfo(order.paymentMethod).text);
        $('#modalAmount').text("$ " + order.totalPrice);

        // 初始狀態：顯示編輯和關閉按鈕，隱藏儲存和取消按鈕
        editOrderBtn.show();
        saveOrderChangesBtn.hide();
        cancelEditBtn.hide();
        closeModalBtn.show();

        new bootstrap.Modal(orderModal[0]).show();
    };

    // 點擊編輯按鈕
    editOrderBtn.on("click", function() {
        // 隱藏編輯和關閉按鈕
        editOrderBtn.hide();
        closeModalBtn.hide();

        // 顯示儲存和取消按鈕
        saveOrderChangesBtn.show();
        cancelEditBtn.show();

        // 隱藏付款狀態文字，顯示下拉選單並設定為原始狀態
        modalPaymentStatusText.hide();
        modalPaymentStatusSelect.val(originalPaymentStatus).show(); // 這裡使下拉選單顯示
    });

    // 點擊取消編輯按鈕
    cancelEditBtn.on("click", function() {
        // 還原為初始顯示狀態
        editOrderBtn.show();
        closeModalBtn.show();
        saveOrderChangesBtn.hide();
        cancelEditBtn.hide();

        // 還原付款狀態為原始文字顯示，並隱藏下拉選單
        modalPaymentStatusText.text(getPaymentStatusInfo(originalPaymentStatus).text).show();
        modalPaymentStatusSelect.hide(); // 這裡使下拉選單隱藏
    });

    // 儲存訂單詳情修改（付款狀態
    saveOrderChangesBtn.on("click", function () {
        if (!currentEditingOrderId) {
            alert("沒有選定的訂單可供修改。");
            return;
        }

        const newPaymentStatus = modalPaymentStatusSelect.val();

        // 如果新舊狀態相同，不發送請求，直接回到查看模式
        if (newPaymentStatus === originalPaymentStatus) {
            // alert("付款狀態沒有改變。"); // 可以選擇是否顯示這個提示
            cancelEditBtn.click(); // 執行取消操作，還原介面
            return;
        }

        // 修改 Toast 內容並顯示
        successToast.find('.toast-body').text('訂單付款狀態已更新！');
        const toast = new bootstrap.Toast(successToast[0]);

        $.ajax({
            url: `http://localhost:8080/api/admins/orders/${currentEditingOrderId}/payment-status`, // 確保這是您的後端 API 路徑
            method: "PUT",
            headers: headers,
            contentType: "application/json",
            data: JSON.stringify({ paymentStatus: newPaymentStatus }),
            success: function (response) {
                toast.show(); // 顯示成功 Toast
                cancelEditBtn.click(); // 執行取消操作，還原介面並更新文字顯示
                fetchOrders(currentPage); // 重新載入訂單列表以顯示更新後的狀態
            },
            error: function (xhr) {
                // 如果失敗，修改 Toast 內容為錯誤訊息
                successToast.removeClass('text-bg-success').addClass('text-bg-danger');
                successToast.find('.toast-body').text('更新失敗：' + (xhr.responseJSON ? xhr.responseJSON.message : xhr.responseText));
                toast.show(); // 顯示錯誤 Toast
                console.error("更新訂單付款狀態失敗", xhr);
            }
        });
    });

    // 顯示客戶資料（使用 jQuery）
    window.showGuest = function (userId) {
        const guest = guestData[userId];
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

    // 當訂單 Modal 關閉時，確保介面回到初始查看狀態
    orderModal.on('hidden.bs.modal', function () {
        // 重置為預設顯示狀態 (文字狀態、編輯按鈕、關閉按鈕，隱藏下拉選單、儲存、取消)
        modalPaymentStatusText.show();
        modalPaymentStatusSelect.hide(); // 這裡也確保了關閉時隱藏下拉選單
        editOrderBtn.show();
        saveOrderChangesBtn.hide();
        cancelEditBtn.hide();
        closeModalBtn.show();

        // 重置 Toast 樣式和內容，以備下次使用
        successToast.removeClass('text-bg-danger').addClass('text-bg-success');
        successToast.find('.toast-body').text('操作成功！');
    });

});