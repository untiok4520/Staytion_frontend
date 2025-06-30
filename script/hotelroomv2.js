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

        console.log("圖片預覽更新", urls);
    });

    // ---------- 載入所有飯店
    function loadHotels() {
        $.ajax({
            url: `http://localhost:8080/api/admin/hotels/owner/${ownerId}`,
            method: "GET",
            headers,
            success(hotels) {
                console.log("載入飯店成功", hotels);

                const $hotelTable = $("#hotelTable tbody").empty();
                $("#hotelFilter").empty().append(`<option value="all">全部飯店</option>`);
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
            error(xhr) {
                console.error("載入飯店失敗", xhr.responseText);
                alert("載入飯店失敗");
            },
        });
    }

    function loadAmenities(selected) {
        $.get("http://localhost:8080/api/amenities", function (list) {
            const $container = $("#hotelAmenities");
            $container.empty();
            list.forEach(a => {
                const checked = selected && selected.includes(a.id) ? 'checked' : '';
                $container.append(`
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="amenity${a.id}" value="${a.id}" ${checked}>
                        <label class="form-check-label" for="amenity${a.id}">${a.aname}</label>
                    </div>
                    `)
            })
        })
    }

    // ---------- 新增/編輯 飯店
    $("#btnAddHotel").on("click", () => {
        hotelEditId = null;
        $hotelForm[0].reset();
        $hotelImageUrlInput.val('');
        $hotelImagePreview.empty();
        loadAmenities();
        hotelModal.show();
    });

    $hotelSave.on("click", () => {
        const urls = $hotelImageUrlInput.val().split(',').map(u => u.trim()).filter(u => u);
        const mainImgUrl = $('input[name="mainImg"]:checked').val();
        const images = urls.map(url => ({ imgUrl: url, isCover: url === mainImgUrl }));
        const amenities = [];
        $("#hotelAmenities input[type=checkbox]:checked").each(function () {
            amenities.push(+$(this).val());
        });

        const data = {
            hotelname: $hotelName.val(),
            address: $hotelAddr.val(),
            tel: $hotelTel.val(),
            description: $hotelDesc.val(),
            images: images,
            ownerId: ownerId,
            amenities: amenities
        };

        const method = hotelEditId ? "PUT" : "POST";
        const url = hotelEditId
            ? `http://localhost:8080/api/admin/hotels/${hotelEditId}`
            : `http://localhost:8080/api/admin/hotels`;

        console.log("送出飯店資料", data);

        $.ajax({
            url,
            method,
            headers,
            contentType: "application/json",
            data: JSON.stringify(data),
            success(response) {
                console.log("儲存飯店成功", response);
                hotelModal.hide();
                loadHotels();
            },
            error(xhr) {
                console.error("儲存飯店失敗", xhr.responseText);
                alert("儲存飯店失敗");
            },
        });
    });

    // ---------- 綁定飯店按鈕事件
    function attachHotelEvents() {
        $(".btn-edit-hotel").off("click").on("click", function () {
            hotelEditId = $(this).data("id");
            $.ajax({
                url: `http://localhost:8080/api/admin/hotels/${hotelEditId}`,
                method: "GET",
                headers,
                success(h) {
                    loadAmenities(h.amenityIds);
                    console.log("編輯飯店資料", h);
                    $hotelName.val(h.hotelname);
                    $hotelAddr.val(h.address);
                    $hotelTel.val(h.tel);
                    $hotelDesc.val(h.description);

                    if (h.images && h.images.length) {
                        const urls = h.images.map(img => img.imgUrl);
                        $hotelImageUrlInput.val(urls.join(', '));
                        $hotelImageUrlInput.trigger('input');
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
                error(xhr) {
                    console.error("載入編輯飯店失敗", xhr.responseText);
                    alert("載入飯店資料失敗");
                }
            });
        });

        $(".btn-del-hotel").off("click").on("click", function () {
            if (!confirm("刪除此飯店？")) return;
            $.ajax({
                url: `http://localhost:8080/api/admin/hotels/${$(this).data("id")}`,
                method: "DELETE",
                headers,
                success() {
                    console.log("飯店刪除成功");
                    loadHotels();
                },
                error(xhr) {
                    console.error("飯店刪除失敗", xhr.responseText);
                }
            });
        });
    }

    // ---------- 房型欄位與管理
    const $roomForm = $("#addRoomModal form");
    const $roomHotel = $roomForm.find("select").eq(0);
    const $roomName = $roomForm.find("input[type=text]").eq(0);
    const $roomDesc = $roomForm.find("textarea")
    const $roomCount = $roomForm.find("input[type=number]").eq(0);
    const $roomPrices = $roomForm.find("input[type=number]").eq(1);
    const $roomView = $roomForm.find("input[type=text]").eq(1);
    const $roomSize = $roomForm.find("input[type=number]").eq(2);
    const $roomBedType = $roomForm.find("input[type=text]").eq(2);
    const $roomBedCount = $roomForm.find("input[type=number]").eq(3);
    const $roomCapacity = $roomForm.find("input[type=number]").eq(4);
    const $roomRefund = $roomForm.find("select").eq(1);
    const $roomCancel = $roomForm.find("select").eq(2);
    const $roomImageUrlInput = $('#roomImageUrls');
    const $roomImagePreview = $('#roomImagePreview');
    const $roomSave = $("#addRoomModal .btn-primary");
    let roomEditId = null;

    // ---------- 載入房型 Modal preview 畫面
    $roomImageUrlInput.on('input', function () {
        $roomImagePreview.empty();
        const urls = $(this).val().split(',').map(u => u.trim()).filter(u => u);
        urls.forEach(u => {
            const img = $('<img>').attr('src', u).css({ width: '100px', height: 'auto', border: '1px solid #ccc' });
            $roomImagePreview.append(img);
        });
    });

    // ---------- 載入所有房型
    function loadRooms() {
        const hid = $("#hotelFilter").val() || "all";
        if (!hid || hid === "all") {
            $("#roomTableBody").empty().append(`<tr><td colspan="6">請選擇飯店</td></tr>`);
            return;
        }
        const url = `http://localhost:8080/api/admin/roomTypes/hotel/${hid}`;

        $.ajax({
            url,
            method: "GET",
            headers,
            success(rooms) {
                console.log("載入房型成功", rooms);

                const $body = $("#roomTableBody").empty();
                if (!rooms.length) {
                    return $body.append(`<tr><td colspan="6">沒有房型資料</td></tr>`);
                }
                rooms.forEach((r) => {
                    $body.append(`
                        <tr>
                          <td>${r.rname}</td>
                          <td>${r.quantity}</td>
                          <td>${r.available ?? 1}</td>
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
            error(xhr) {
                console.error("載入房型失敗", xhr.responseText);
            }
        });
    }

    // ---------- 綁定房型按鈕事件
    function attachRoomEvents() {
        $(".btn-edit-room").off("click").on("click", function () {
            roomEditId = $(this).data("id");
            $.ajax({
                url: `http://localhost:8080/api/admin/roomTypes/${roomEditId}`,
                method: "GET",
                headers,
                success(r) {
                    // 取得設施總表
                    $.get("http://localhost:8080/api/amenities", function (allAmenities) {
                        // 1. 名稱 -> id 對照表
                        const nameToId = {};
                        allAmenities.forEach(a => {
                            nameToId[a.aname] = a.id;
                        });

                        // 2. 將 amenities 名稱陣列轉 id 陣列
                        let selectedAmenityIds = [];
                        if (Array.isArray(r.amenities)) {
                            // 若拿到的是名稱陣列
                            if (typeof r.amenities[0] === "string") {
                                selectedAmenityIds = r.amenities.map(aname => nameToId[aname]).filter(Boolean);
                            }
                            // 若是 id 陣列
                            else if (typeof r.amenities[0] === "number") {
                                selectedAmenityIds = r.amenities;
                            }
                            // 若是物件陣列
                            else if (typeof r.amenities[0] === "object") {
                                selectedAmenityIds = r.amenities.map(a => a.id);
                            }
                        }

                        // 3. 其它欄位填充
                        $roomHotel.val(r.hotelId);
                        $roomName.val(r.rname);
                        $roomDesc.val(r.description);
                        $roomCount.val(r.quantity);
                        $roomPrices.val(r.price);
                        $roomView.val(r.view);
                        $roomSize.val(r.size);
                        $roomBedType.val(r.bedType);
                        $roomBedCount.val(r.bedCount);
                        $roomCapacity.val(r.capacity);
                        $roomRefund.val(r.refundable ? "可退款" : "不可退款");
                        $roomCancel.val(r.isCanceled ? "可取消" : "不可取消");
                        $roomImageUrlInput.val(r.imgUrl || '');
                        $roomImageUrlInput.trigger('input');
                        loadRoomAmenities(selectedAmenityIds);
                        roomModal.show();
                    });
                },
                error(xhr) {
                    console.error("載入房型資料失敗", xhr.responseText);
                }
            });
        });

        $(".btn-del-room").off("click").on("click", function () {
            if (!confirm("刪除此房型？")) return;
            $.ajax({
                url: `http://localhost:8080/api/admin/roomTypes/${$(this).data("id")}`,
                method: "DELETE",
                headers,
                success() {
                    console.log("房型刪除成功");
                    loadRooms();
                },
                error(xhr) {
                    console.error("房型刪除失敗", xhr.responseText);
                }
            });
        });
    }

    function loadRoomAmenities(selected) {
        $.get("http://localhost:8080/api/amenities", function (list) {
            const $container = $("#RoomAmenities");
            $container.empty();
            // 這裡要注意 selected 必須是 id 陣列
            list.forEach(a => {
                const checked = selected && selected.includes(a.id) ? 'checked' : '';
                $container.append(`
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="roomAmenity${a.id}" value="${a.id}" ${checked}>
                        <label class="form-check-label" for="roomAmenity${a.id}">${a.aname}</label>
                    </div>
                `)
            });
        });
    }

    // ---------- 新增/編輯 房型
    $("#btnAddRoom").on("click", () => {
        roomEditId = null;
        $roomForm[0].reset();
        roomModal.show();
        loadRoomAmenities();
    });

    $roomSave.on("click", () => {
        const amenities = [];
        $("#RoomAmenities input[type=checkbox]:checked").each(function () {
            amenities.push(+$(this).val());
        });
        const data = {
            hotelId: $roomHotel.val(),
            rname: $roomName.val(),
            description: $roomDesc.val(),
            quantity: +$roomCount.val(),
            price: +$roomPrices.val(),
            view: $roomView.val(),
            size: $roomSize.val(),
            bedType: $roomBedType.val(),
            bedCount: $roomBedCount.val(),
            capacity: $roomCapacity.val(),
            refundable: $roomRefund.val() === "可退款",
            isCanceled: $roomCancel.val() === "不可取消",
            imgUrl: $roomImageUrlInput.val().trim(),
            amenityIds: amenities
        };

        const method = roomEditId ? "PUT" : "POST";
        const url = roomEditId
            ? `http://localhost:8080/api/admin/roomTypes/${roomEditId}`
            : `http://localhost:8080/api/admin/roomTypes`;

        console.log("送出房型資料", data);

        $.ajax({
            url,
            method,
            headers,
            contentType: "application/json",
            data: JSON.stringify(data),
            success(response) {
                console.log("房型儲存成功", response);
                roomModal.hide();
                loadRooms();
            },
            error(xhr) {
                console.error("房型儲存失敗", xhr.responseText);
                alert("房型儲存失敗");
            },
        });
    });

    $("#hotelFilter").on("change", loadRooms);

    loadHotels();
});
// 使用者登入狀態檢查
$(function () {
  const token = localStorage.getItem('jwtToken');
  const userName = localStorage.getItem('userName') || '使用者名稱'; // 可從登入回傳存userName

  const $loginBtn = $('#loginBtn');
  const $userDropdown = $('#userDropdown');
  const $logoutBtn = $('#logoutBtn');
  const $userDropdownToggle = $('#userDropdownMenu');

  if (token) {
    $loginBtn.addClass('d-none');
    $userDropdown.removeClass('d-none');
    $userDropdownToggle.text(userName);
  } else {
    $loginBtn.removeClass('d-none');
    $userDropdown.addClass('d-none');
  }

  $logoutBtn.on('click', function () {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    location.reload();
  });
});