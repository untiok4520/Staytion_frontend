// Data for hotels
const hotelData = [
    {
        name: '台北民宿一館',
        address: '台北市中正區民生北路一段26號',
        phone: '0912-345-566',
        id: 'taipei' // Adding an ID for linking to room data
    },
    {
        name: '台中青年旅店',
        address: '台中市中正區民生北路一段26號',
        phone: '0912-345-566',
        id: 'taichung'
    },
    {
        name: '花蓮海景套房',
        address: '花蓮縣中正區民生北路一段26號',
        phone: '0912-345-566',
        id: 'hualien'
    }
];

// Data for rooms, categorized by hotel ID
const roomData = {
    taipei: [
        { type: '雙人房', total: 10, available: 6, status: '上架中', price: 2200 },
        { type: '四人房', total: 5, available: 2, status: '上架中', price: 2800 },
        { type: '單人房', total: 8, available: 5, status: '上架中', price: 1800 }
    ],
    taichung: [
        { type: '背包床位', total: 20, available: 12, status: '上架中', price: 1200 },
        { type: '單人房', total: 8, available: 5, status: '上架中', price: 1800 }
    ],
    hualien: [
        { type: '海景豪華房', total: 4, available: 0, status: '已售完', price: 3200 }
    ]
};

document.addEventListener("DOMContentLoaded", function () {
    const hotelFilter = document.getElementById("hotelFilter");
    const roomTableBody = document.getElementById("roomTableBody"); // This will be the main room table
    const summaryTbody = document.getElementById("summary-rooms"); // This is for the "all" summary

    // Populate the hotel filter dropdown dynamically
    hotelData.forEach(hotel => {
        const option = document.createElement('option');
        option.value = hotel.id;
        option.textContent = hotel.name;
        hotelFilter.appendChild(option);
    });

    // Function to display rooms based on hotelId
    function displayRoomsForHotel(hotelId) {
        roomTableBody.innerHTML = ''; // Clear previous room data
        summaryTbody.classList.add("d-none"); // Hide summary table when a specific hotel is selected

        const rooms = roomData[hotelId];

        if (rooms) {
            rooms.forEach(room => {
                let actionButtons = '';
                if (room.status === '上架中') {
                    actionButtons = `
                        <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addRoomModal">編輯</button>
                        <button class="btn btn-sm btn-outline-danger">下架</button>
                    `;
                } else if (room.status === '已售完') {
                    actionButtons = `
                        <button class="btn btn-sm btn-primary">查看報表</button>
                    `;
                }

                roomTableBody.innerHTML += `
                    <tr>
                        <td>${room.type}</td>
                        <td>${room.total}</td>
                        <td>${room.available}</td>
                        <td>${room.status}</td>
                        <td>$${room.price}</td>
                        <td>${actionButtons}</td>
                    </tr>
                `;
            });
        } else {
            roomTableBody.innerHTML = `<tr><td colspan="6">無房型資料</td></tr>`;
        }
    }

    // Function to display the aggregated summary of all rooms
    function displayAllRoomsSummary() {
        roomTableBody.innerHTML = ''; // Clear specific hotel rooms
        summaryTbody.classList.remove("d-none"); // Show summary table

        const roomSummary = {};

        // Iterate through all hotels and their rooms to aggregate data
        for (const hotelId in roomData) {
            roomData[hotelId].forEach(room => {
                if (!roomSummary[room.type]) {
                    roomSummary[room.type] = {
                        total: 0,
                        available: 0,
                        priceSum: 0,
                        count: 0, // To calculate average price
                        hasAvailable: false // Track if any room of this type is available
                    };
                }
                roomSummary[room.type].total += room.total;
                roomSummary[room.type].available += room.available;
                roomSummary[room.type].priceSum += room.price;
                roomSummary[room.type].count++;
                if (room.available > 0) {
                    roomSummary[room.type].hasAvailable = true;
                }
            });
        }

        summaryTbody.innerHTML = ""; // Clear existing summary rows

        for (const [roomType, data] of Object.entries(roomSummary)) {
            const avgPrice = Math.round(data.priceSum / data.count);
            let status = data.hasAvailable ? '上架中' : '已售完'; // Determine status based on availability

            let actionButtons = '';
            if (status === '上架中') {
                actionButtons = `
                    <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addRoomModal">編輯</button>
                    <button class="btn btn-sm btn-outline-danger">下架</button>
                `;
            } else if (status === '已售完') {
                actionButtons = `
                    <button class="btn btn-sm btn-primary">查看報表</button>
                `;
            }

            summaryTbody.innerHTML += `
                <tr style="background-color: #f9f9f9;">
                    <td>${roomType} (加總)</td>
                    <td>${data.total}</td>
                    <td>${data.available}</td>
                    <td>${status}</td>
                    <td>$${avgPrice}</td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        }
    }

    // Event listener for the hotel filter dropdown
    hotelFilter.addEventListener("change", function () {
        const selected = this.value;

        if (selected === "all") {
            displayAllRoomsSummary();
        } else {
            displayRoomsForHotel(selected);
        }
    });

    // --- Hotel Information Display ---
    const hotelTableBody = document.querySelector('#hotelTable tbody');

    hotelData.forEach(hotel => {
        hotelTableBody.innerHTML += `
            <tr>
                <td>${hotel.name}</td>
                <td>${hotel.address}</td>
                <td>${hotel.phone}</td>
                <td>
                    <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addHotelModal">編輯</button>
                </td>
            </tr>
        `;
    });

    // Default: Display summary on page load
    displayAllRoomsSummary();
});




// ============================================================

// // Data for hotels (now will be fetched from backend)
// let hotelData = [];

// // Data for rooms, categorized by hotel ID (now will be fetched from backend)
// // This will still be populated on the fly when fetching rooms for a specific hotel.
// let roomData = {};

// $(document).ready(function () { // 使用 jQuery 的 ready 方法
//     const hotelFilter = $("#hotelFilter"); // 使用 jQuery 選擇器
//     const roomTableBody = $("#roomTableBody");
//     const summaryTbody = $("#summary-rooms");
//     const hotelTableBody = $('#hotelTable tbody');

//     // --- Backend Endpoints (Examples) ---
//     const API_BASE_URL = 'YOUR_BACKEND_API_URL'; // Replace with your actual backend URL

//     const ENDPOINTS = {
//         hotels: `${API_BASE_URL}/hotels`,
//         rooms: `${API_BASE_URL}/rooms`,
//         allRoomsSummary: `${API_BASE_URL}/rooms/summary`
//     };

//     // --- Function to fetch all hotels and populate the filter/table ---
//     function fetchHotels() {
//         // 顯示載入狀態
//         hotelTableBody.html('<tr><td colspan="4">載入飯店資料中...</td></tr>');
//         hotelFilter.html('<option value="all">載入中...</option>');

//         $.ajax({
//             url: ENDPOINTS.hotels,
//             method: 'GET', // 或 'type': 'GET'
//             dataType: 'json', // 期望的資料格式是 JSON
//             success: function (data) {
//                 hotelData = data; // Assign fetched data to hotelData

//                 // Clear existing options and add "全部" option
//                 hotelFilter.html('<option value="all">全部</option>');

//                 // Populate the hotel filter dropdown dynamically
//                 hotelData.forEach(hotel => {
//                     const option = $('<option></option>') // 使用 jQuery 建立元素
//                         .val(hotel.id)
//                         .text(hotel.name);
//                     hotelFilter.append(option);
//                 });

//                 // Populate the hotel information table
//                 hotelTableBody.empty(); // Clear previous hotel data
//                 hotelData.forEach(hotel => {
//                     hotelTableBody.append(`
//                         <tr>
//                             <td>${hotel.name}</td>
//                             <td>${hotel.address}</td>
//                             <td>${hotel.phone}</td>
//                             <td>
//                                 <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addHotelModal">編輯</button>
//                             </td>
//                         </tr>
//                     `);
//                 });

//                 // After fetching hotels, display the initial room summary
//                 displayAllRoomsSummary();
//             },
//             error: function (jqXHR, textStatus, errorThrown) {
//                 console.error("Error fetching hotels:", textStatus, errorThrown);
//                 // Optionally display an error message to the user
//                 hotelTableBody.html(`<tr><td colspan="4">載入飯店資料失敗。</td></tr>`);
//                 hotelFilter.html('<option value="all">載入失敗</option>');
//             }
//         });
//     }

//     // --- Function to display rooms based on hotelId (fetches from backend) ---
//     function displayRoomsForHotel(hotelId) {
//         roomTableBody.html('<tr><td colspan="6">載入中...</td></tr>'); // Loading state
//         summaryTbody.addClass("d-none"); // Hide summary table

//         $.ajax({
//             url: `${ENDPOINTS.hotels}/${hotelId}/rooms`,
//             method: 'GET',
//             dataType: 'json',
//             success: function (rooms) {
//                 roomTableBody.empty(); // Clear loading state

//                 if (rooms && rooms.length > 0) {
//                     rooms.forEach(room => {
//                         let actionButtons = '';
//                         if (room.status === '上架中') {
//                             actionButtons = `
//                                 <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addRoomModal">編輯</button>
//                                 <button class="btn btn-sm btn-outline-danger">下架</button>
//                             `;
//                         } else if (room.status === '已售完') {
//                             actionButtons = `
//                                 <button class="btn btn-sm btn-primary">查看報表</button>
//                             `;
//                         }

//                         roomTableBody.append(`
//                             <tr>
//                                 <td>${room.type}</td>
//                                 <td>${room.total}</td>
//                                 <td>${room.available}</td>
//                                 <td>${room.status}</td>
//                                 <td>$${room.price}</td>
//                                 <td>${actionButtons}</td>
//                             </tr>
//                         `);
//                     });
//                 } else {
//                     roomTableBody.html(`<tr><td colspan="6">無房型資料</td></tr>`);
//                 }
//             },
//             error: function (jqXHR, textStatus, errorThrown) {
//                 console.error(`Error fetching rooms for hotel ${hotelId}:`, textStatus, errorThrown);
//                 roomTableBody.html(`<tr><td colspan="6">載入房型資料失敗。</td></tr>`);
//             }
//         });
//     }

//     // --- Function to display the aggregated summary of all rooms (fetches from backend) ---
//     function displayAllRoomsSummary() {
//         roomTableBody.empty(); // Clear specific hotel rooms
//         summaryTbody.removeClass("d-none"); // Show summary table
//         summaryTbody.html('<tr><td colspan="6">載入中...</td></tr>'); // Loading state

//         $.ajax({
//             url: ENDPOINTS.allRoomsSummary,
//             method: 'GET',
//             dataType: 'json',
//             success: function (roomSummary) {
//                 summaryTbody.empty(); // Clear loading state

//                 if (Object.keys(roomSummary).length > 0) {
//                     for (const [roomType, data] of Object.entries(roomSummary)) {
//                         let actionButtons = '';
//                         if (data.status === '上架中') {
//                             actionButtons = `
//                                 <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#addRoomModal">編輯</button>
//                                 <button class="btn btn-sm btn-outline-danger">下架</button>
//                             `;
//                         } else if (data.status === '已售完') {
//                             actionButtons = `
//                                 <button class="btn btn-sm btn-primary">查看報表</button>
//                             `;
//                         }

//                         summaryTbody.append(`
//                             <tr style="background-color: #f9f9f9;">
//                                 <td>${roomType} (加總)</td>
//                                 <td>${data.total}</td>
//                                 <td>${data.available}</td>
//                                 <td>${data.status}</td>
//                                 <td>$${Math.round(data.avgPrice)}</td>
//                                 <td>${actionButtons}</td>
//                             </tr>
//                         `);
//                     }
//                 } else {
//                     summaryTbody.html(`<tr><td colspan="6">無房型加總資料。</td></tr>`);
//                 }
//             },
//             error: function (jqXHR, textStatus, errorThrown) {
//                 console.error("Error fetching all rooms summary:", textStatus, errorThrown);
//                 summaryTbody.html(`<tr><td colspan="6">載入房型加總資料失敗。</td></tr>`);
//             }
//         });
//     }

//     // Event listener for the hotel filter dropdown
//     hotelFilter.on("change", function () { // 使用 jQuery 的 .on() 方法綁定事件
//         const selected = $(this).val(); // 使用 $(this).val() 取得選中的值

//         if (selected === "all") {
//             displayAllRoomsSummary();
//         } else {
//             displayRoomsForHotel(selected);
//         }
//     });

//     // Initial data fetch on page load
//     fetchHotels(); // This will also trigger the initial displayAllRoomsSummary()
// });