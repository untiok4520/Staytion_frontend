// admin.js
$(function () {
    const token = localStorage.getItem("token") || "";
    const ownerId = 1;

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    // Modal 變數
    const hotelModal = new bootstrap.Modal($("#addHotelModal")[0]);
    const roomModal = new bootstrap.Modal($("#addRoomModal")[0]);

    // ---------- 飯店欄位
    const $hotelForm = $("#addHotelModal form");
    const $hotelName = $hotelForm.find("input").eq(0);
    const $hotelAddr = $hotelForm.find("input").eq(1);
    const $hotelTel = $hotelForm.find("input").eq(2);
    const $hotelDesc = $hotelForm.find("textarea").eq(0);
    const $hotelImageUrlInput = $('#hotelImageUrls');
    const $hotelImagePreview = $('#hotelImagePreview');
    const $wifi = $("#wifiModal");
    const $parking = $("#parkingModal");
    const $hotelSave = $("#addHotelModal .btn-primary");
    let hotelEditId = null;

    // ---------- 載入飯店 Modal preview 畫面
    $hotelImageUrlInput.on('input', function () {
        $hotelImagePreview.empty();

        // 取得輸入框的值，切割成陣列並去除空白與空字串
        const urls = $(this).val().split(',').map(u => u.trim()).filter(u => u);

        urls.forEach((u, i) => {
            const wrapper = $('<div>').css({ display: 'inline-block', marginRight: '10px', textAlign: 'center' });

            const img = $('<img>').attr('src', u).css({
                width: '100px',
                height: 'auto',
                border: '1px solid #ccc',
                display: 'block'
            });

            const radio = $(`
            <div>
                <input type="radio" name="mainImg" value="${u}" ${i === 0 ? 'checked' : ''} />
                <label style="font-size: 12px">主圖</label>
            </div>
            `);

            wrapper.append(img).append(radio);
            $hotelImagePreview.append(wrapper);
        });
    });

    // ---------- 載入所有飯店
    function loadHotels() {
        $.ajax({
            url: `http://localhost:8080/api/admin/hotels/owner/${ownerId}`,
            method: "GET",
            headers,
            success(hotels) {
                const $hotelTable = $("#hotelTable tbody").empty();
                $("#hotelFilter").empty().append(`<option value="all">全部飯店</option>`);
                // 房型飯店下拉
                const $roomHotel = $("#addRoomModal form").find("select").eq(0);
                $roomHotel.empty().append(`<option disabled selected>請選擇飯店</option>`);

                hotels.forEach((h) => {
                    $hotelTable.append(`
            <tr>
              <td>${h.hotelname}</td>
              <td>${h.address}</td>
              <td>${h.tel}</td>
              <td>
                <button class="btn btn-sm btn-primary btn-edit-hotel" data-id="${h.id}">編輯</button>
                <button class="btn btn-sm btn-outline-danger btn-del-hotel" data-id="${h.id}">刪除</button>
              </td>
            </tr>`);
                    $("#hotelFilter").append(`<option value="${h.id}">${h.hotelname}</option>`);
                    $roomHotel.append(`<option value="${h.id}">${h.hotelname}</option>`);
                });

                attachHotelEvents();
                loadRooms(); //載入房型
            },
            error() {
                alert("載入飯店失敗");
            },
        });
    }

    // ---------- 新增/編輯 飯店
    $("#btnAddHotel").on("click", () => {
        hotelEditId = null;
        $hotelForm[0].reset();
        $wifi.prop("checked", false);
        $parking.prop("checked", false);
        $hotelImageUrlInput.val('');
        $hotelImagePreview.empty();
        hotelModal.show();
    });

    $hotelSave.on("click", () => {
        const urls = $hotelImageUrlInput.val().split(',').map(u => u.trim()).filter(u => u);
        const mainImgUrl = $('input[name="mainImg"]:checked').val();

        // 組成 ImageDTO 陣列
        const images = urls.map(url => ({
            imgUrl: url,
            isCover: url === mainImgUrl
        }));

        const data = {
            hotelname: $hotelName.val(),
            address: $hotelAddr.val(),
            tel: $hotelTel.val(),
            description: $hotelDesc.val(),
            facilities: { wifi: $wifi.prop("checked"), parking: $parking.prop("checked") },
            images: images,
            ownerId:ownerId
        };

        const method = hotelEditId ? "PUT" : "POST";
        const url = hotelEditId
            ? `http://localhost:8080/api/admin/hotels/${hotelEditId}`
            : `http://localhost:8080/api/admin/hotels`;

        $.ajax({
            url,
            method,
            headers,
            contentType: "application/json",
            data: JSON.stringify(data),
            success() {
                hotelModal.hide();
                loadHotels();
            },
            error() {
                alert("儲存飯店失敗");
            },
        });
    });

    // ---------- 綁定飯店按鈕事件
    function attachHotelEvents() {
        $(".btn-edit-hotel")
            .off("click")
            .on("click", function () {
                hotelEditId = $(this).data("id");
                $.ajax({
                    url: `http://localhost:8080/api/admin/hotels/${hotelEditId}`,
                    method: "GET",
                    headers,
                    success(h) {
                        $hotelName.val(h.hotelname);
                        $hotelAddr.val(h.address);
                        $hotelTel.val(h.tel);
                        $hotelDesc.val(h.description);
                        $wifi.prop("checked", h.facilities?.wifi);
                        $parking.prop("checked", h.facilities?.parking);

                        // images 陣列還原回輸入框與preview
                        if (h.images && h.images.length) {
                            const urls = h.images.map(img => img.imgUrl);
                            $hotelImageUrlInput.val(urls.join(', '));
                            $hotelImageUrlInput.trigger('input');

                            // 設定主圖 radio
                            setTimeout(() => {
                                const coverImg = h.images.find(img => img.isCover);
                                if (coverImg) {
                                    $(`input[name="mainImg"][value="${coverImg.imgUrl}"]`).prop('checked', true);
                                }
                            }, 100);
                        } else {
                            $hotelImageUrlInput.val('');
                            $hotelImagePreview.empty();
                        }

                        hotelModal.show();
                    },
                    error() {
                        alert("載入飯店資料失敗");
                    }
                });
            });

        $(".btn-del-hotel")
            .off("click")
            .on("click", function () {
                if (!confirm("刪除此飯店？")) return;
                $.ajax({
                    url: `http://localhost:8080/api/admin/hotels/${$(this).data("id")}`,
                    method: "DELETE",
                    headers,
                    success() {
                        loadHotels();
                    },
                });
            });
    }

    // ---------- 房型欄位與函數維持不變
    const $roomForm = $("#addRoomModal form");
    const $roomHotel = $roomForm.find("select").eq(0);
    const $roomName = $roomForm.find("input[type=text]");
    const $roomCount = $roomForm.find("input[type=number]").eq(0);
    const $roomPrices = $roomForm.find("input[type=number]").slice(1);
    const $roomRefund = $roomForm.find("select").eq(1);
    const $roomCancel = $roomForm.find("textarea").eq(0);
    const $roomImageUrlInput = $('#roomImageUrls');
    const $roomImagePreview = $('#roomImagePreview');
    const $roomSave = $("#addRoomModal .btn-primary");
    let roomEditId = null;

    $roomImageUrlInput.on('input', function () {
        $roomImagePreview.empty();
        const urls = $(this).val().split(',').map(u => u.trim()).filter(u => u);
        urls.forEach(u => {
            const img = $('<img>').attr('src', u).css({ width: '100px', height: 'auto', border: '1px solid #ccc' });
            $roomImagePreview.append(img);
        });
    });

    function loadRooms() {
        const hid = $("#hotelFilter").val() || "all";
        const url =
            hid === "all"
                ? `http://localhost:8080/api/admin/roomTypes`
                : `http://localhost:8080/api/admin/roomTypes/hotel/${hid}`;

        $.ajax({
            url,
            method: "GET",
            headers,
            success(rooms) {
                const $body = $("#roomTableBody").empty();
                if (!rooms.length) {
                    return $body.append(`<tr><td colspan="6">沒有房型資料</td></tr>`);
                }
                rooms.forEach((r) => {
                    $body.append(`
            <tr>
              <td>${r.rname}</td>
              <td>${r.quantity}</td>
              <td>${r.available ?? 0}</td>
              <td>${r.status ?? "上架中"}</td>
              <td>${r.price ?? 0}</td>
              <td>
                <button class="btn btn-sm btn-primary btn-edit-room" data-id="${r.id}">編輯</button>
                <button class="btn btn-sm btn-outline-danger btn-del-room" data-id="${r.id}">刪除</button>
              </td>
            </tr>`);
                });
                attachRoomEvents();
            },
        });
    }

    function attachRoomEvents() {
        $(".btn-edit-room")
            .off("click")
            .on("click", function () {
                roomEditId = $(this).data("id");
                $.ajax({
                    url: `http://localhost:8080/api/admin/roomTypes/${roomEditId}`,
                    method: "GET",
                    headers,
                    success(r) {
                        $roomHotel.val(r.hotelId);
                        $roomName.val(r.rname);
                        $roomCount.val(r.quantity);
                        $roomPrices.eq(0).val(r.price.weekday);
                        $roomPrices.eq(1).val(r.price.holiday);
                        $roomPrices.eq(2).val(r.price.specialDay);
                        $roomRefund.val(r.refundable ? "可退款" : "不可退款");
                        $roomCancel.val(r.cancelPolicy);
                        $roomImageUrlInput.val(r.imgUrl || '');
                        $roomImageUrlInput.trigger('input');
                        roomModal.show();
                    },
                });
            });

        $(".btn-del-room")
            .off("click")
            .on("click", function () {
                if (!confirm("刪除此房型？")) return;
                $.ajax({
                    url: `http://localhost:8080/api/admin/roomTypes/${$(this).data("id")}`,
                    method: "DELETE",
                    headers,
                    success() {
                        loadRooms();
                    },
                });
            });
    }

    $("#btnAddRoom").on("click", () => {
        roomEditId = null;
        $roomForm[0].reset();
        roomModal.show();
    });

    $roomSave.on("click", () => {
        const data = {
            hotelId: $roomHotel.val(),
            rname: $roomName.val(),
            quantity: +$roomCount.val(),
            price: {
                weekday: +$roomPrices.eq(0).val(),
                holiday: +$roomPrices.eq(1).val(),
                specialDay: +$roomPrices.eq(2).val(),
            },
            refundable: $roomRefund.val() === "可退款",
            cancelPolicy: $roomCancel.val(),
            imgUrl: $roomImageUrlInput.val().trim()
        };
        const method = roomEditId ? "PUT" : "POST";
        const url = roomEditId
            ? `http://localhost:8080/api/admin/roomTypes/${roomEditId}`
            : `http://localhost:8080/api/admin/roomTypes`;

        $.ajax({
            url,
            method,
            headers,
            contentType: "application/json",
            data: JSON.stringify(data),
            success() {
                roomModal.hide();
                loadRooms();
            },
            error() {
                alert("房型儲存失敗");
            },
        });
    });

    $("#hotelFilter").on("change", loadRooms);

    loadHotels();

});
