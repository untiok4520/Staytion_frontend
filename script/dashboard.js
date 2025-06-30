let roomTypeChart = null;
let revenueChart = null;

$(function () {
    const token = localStorage.getItem("jwtToken") || "";
    const ownerId = 1; // TODO: 日後改為從 localStorage 拿值

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    loadSummary(ownerId, currentYear, currentMonth);

    const userName = localStorage.getItem('userName') || '使用者名稱'; // 可從登入回傳存userName
    const userId = localStorage.getItem('userId') || '使用者代號'; // 可從登入回傳存userName

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
        localStorage.removeItem('userId');
        location.reload();
    });
});

// 從後端取得統計摘要資料
function loadSummary(ownerId, year, month) {
    $.ajax({
        url: `http://localhost:8080/api/statistics/summary`,
        method: 'GET',
        data: { ownerId, year, month },
        success: function (data) {
            console.log("Summary data:", data);

            $('#yearRevenue').text(`$${(data.yearRevenue || 0).toLocaleString()}`);
            $('#monthRevenue').text(`$${(data.monthRevenue || 0).toLocaleString()}`);
            $('#totalRevenue').text(`$${(data.totalRevenue || 0).toLocaleString()}`);
            $('#occupancyRate').text(`${data.occupancyRate || 0}%`);
            $('#totalOrders').text(`${data.orderCount || 0} 筆`);
            $('#averagePrice').text(`$${data.averagePrice || 0}`);

            renderRoomTypeChart(data.roomTypeChart || []);
            renderRevenueTrendChart(data.trendChart || []);
        },
        error: function () {
            alert('載入統計資料失敗，請稍後再試');
        }
    });
}

// 房型分布圓餅圖
function renderRoomTypeChart(data) {
    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);

    if (roomTypeChart) roomTypeChart.destroy();

    const ctx = document.getElementById('roomTypeChart');
    if (!ctx) return;

    roomTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: ['#1F487E', '#376996', '#4BA3C3', '#78C2AD', '#FFD166'],
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 收入趨勢折線圖
function renderRevenueTrendChart(data) {
    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);

    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: '每日收入 (NT$)',
                data: values,
                borderColor: '#1F487E',
                backgroundColor: 'rgba(31,72,126,0.2)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
