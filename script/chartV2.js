$(document).ready(function () {
    const ownerId = 1; // 預設 ownerId，可從登入資訊取得
    let monthlyChart, bookingChart, roomTypeChart, hotelRevenueChart, occupancyRateChart;

    // 初始化
    loadYears();

    // 查詢按鈕事件
    $('#queryBtn').on('click', function () {
        const year = $('#yearSelect').val();
        const month = $('#monthSelect').val();
        loadSummary(ownerId, year, month);
        loadMonthlyRevenue(ownerId, year);
        loadOrderTrend(ownerId, year, month);
        loadOccupancyRate(ownerId, year, month);
    });

    // 載入可用年份
    function loadYears() {
        $.ajax({
            url: `http://localhost:8080/api/statistics/available-years`,
            data: { ownerId },
            method: 'GET',
            success: function (years) {
                $('#yearSelect').empty();
                $.each(years, function (i, year) {
                    $('#yearSelect').append(`<option value="${year}">${year}年</option>`);
                });
                loadMonths(years[0]);
            }
        });
    }

    // 載入該年份的可用月份
    function loadMonths(year) {
        $.ajax({
            url: `http://localhost:8080/api/statistics/available-months`,
            data: { ownerId, year },
            method: 'GET',
            success: function (months) {
                $('#monthSelect').empty();
                $.each(months, function (i, month) {
                    $('#monthSelect').append(`<option value="${month}">${month}月</option>`);
                });
                loadSummary(ownerId, year, months[0]);
                loadMonthlyRevenue(ownerId, year);
                loadOrderTrend(ownerId, year, months[0]);
            }
        });
    }

    // 載入統計摘要資料
    function loadSummary(ownerId, year, month) {
        $.ajax({
            url: `http://localhost:8080/api/statistics/summary`,
            data: { ownerId, year, month },
            method: 'GET',
            success: function (data) {
                console.log("summary data:", data);
                console.log("occupancyRate =", data.occupancyRate);
                console.log("averagePrice =", data.averagePrice);
                $('#yearRevenue').text(`$${(data.yearRevenue || 0).toLocaleString()}`);
                $('#monthRevenue').text(`$${(data.monthRevenue || 0).toLocaleString()}`);
                $('#totalRevenue').text(`$${(data.totalRevenue || 0).toLocaleString()}`);
                $('#occupancyRate').text(`${data.occupancyRate || 0}%`);
                $('#totalOrders').text(`${data.orderCount || 0} 筆`);
                $('#averagePrice').text(`$${data.averagePrice || 0}`);

                renderRoomTypeChart(data.roomTypeChart || []);
                renderHotelRevenueChart([]); // 若無此資料先空給
            }
        });
    }

    // 月營收折線圖
    function loadMonthlyRevenue(ownerId, year) {
        $.ajax({
            url: `http://localhost:8080/api/statistics/summary/monthly-revenue`,
            data: { ownerId, year },
            method: 'GET',
            success: function (data) {
                console.log('月營收API回傳資料', data);
                const labels = data.map(d => `${d.month}月`);
                const values = data.map(d => d.totalRevenue);
                console.log('labels:', labels, 'values:', values);

                if (monthlyChart) monthlyChart.destroy();
                monthlyChart = new Chart($('#monthlyIncomeChart'), {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '月營收',
                            data: values,
                            backgroundColor: 'rgba(55, 105, 150, 0.2)',
                            borderColor: '#376996',
                            borderWidth: 2,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true
                    }
                });
            }
        });
    }

    // 每日訂單柱狀圖
    function loadOrderTrend(ownerId, year, month) {
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
       const lastDay = getLastDayOfMonth(year, month);
const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        $.ajax({
            url: `http://localhost:8080/api/statistics/summary/order-trend`,
            data: { ownerId, start, end },
            method: 'GET',
            success: function (data) {
                console.log('每日訂單', data);
                const labels = data.map(d => d.date);
                const values = data.map(d => d.orderCount);

                if (bookingChart) bookingChart.destroy();
                bookingChart = new Chart($('#dailyBookingChart'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '每日訂單數',
                            data: values,
                            backgroundColor: '#1F487E88'
                        }]
                    },
                    options: {
                        responsive: true
                    }
                });
            }
        });
    }

    function loadOccupancyRate(ownerId, year, month) {
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = getLastDayOfMonth(year, month);
        const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
        $.ajax({
            url: `http://localhost:8080/api/statistics/summary/occupancy-rate-trend`,
            data: { ownerId, start, end },
            method: 'GET',
            success: function (data) {
                const labels = data.map(d => d.date);
                const values = data.map(d => d.occupancyRate);
    
                if (occupancyRateChart) occupancyRateChart.destroy();
                occupancyRateChart = new Chart($('#occupancyRateChart'), {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '每日入住率(%)',
                            data: values,
                            borderColor: '#4BA3C3',
                            backgroundColor: 'rgba(75,163,195,0.1)',
                            borderWidth: 2,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                min: 0,
                                max: 100,
                                ticks: {
                                    callback: value => value + '%'
                                }
                            }
                        }
                    }
                });
            }
        }); // <--- 這行很重要！
    }
    // 房型圓餅圖
    function renderRoomTypeChart(data) {
        const labels = data.map(d => d.label);
        const values = data.map(d => d.value);

        if (roomTypeChart) roomTypeChart.destroy();
        roomTypeChart = new Chart($('#roomTypeChart'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ['#1F487E', '#376996','#4BA3C3', '#78C2AD', '#FFD166'],
                    hoverOffset:10

                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // 各飯店營收長條圖
    function renderHotelRevenueChart(data) {
        console.log('各飯店營收', data);
        const labels = data.map(d => d.hotelName);
        const values = data.map(d => d.revenue);

        if (hotelRevenueChart) hotelRevenueChart.destroy();
        hotelRevenueChart = new Chart($('#hotelRevenueChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '營收',
                    data: values,
                    backgroundColor: '#17a2b8'
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    function getLastDayOfMonth(year, month) {
    return new Date(year, month, 0).getDate(); // month 是 1-based
}

});
