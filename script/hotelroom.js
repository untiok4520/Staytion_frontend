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