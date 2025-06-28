// admin/index.html 裡面一進來先驗證
// const token = localStorage.getItem("adminToken"); // 看你後台存的 key 叫什麼
// if (!token) {
//   // 沒有 token 直接跳轉
//   window.location.href = "/pages/homepage/login.html";
// }
// 收入趨勢圖
const ctx = document.getElementById('revenueChart').getContext('2d');
const revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['6/1', '6/5', '6/10', '6/15', '6/20', '6/25', '6/30'],
        datasets: [{
            label: '收益 (NT$)',
            data: [10500, 12000, 14800, 15600, 17900, 15200, 16000],
            backgroundColor: 'rgba(31, 72, 126, 0.2)',
            borderColor: '#1F487E',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    },
    options: {
        scales: {
            y: { beginAtZero: true }
        },
        plugins: {
            legend: { display: false }
        }
    }
});

// 房型圓餅圖
const roomTypeCtx = document.getElementById('roomTypeChart').getContext('2d');
const roomTypeChart = new Chart(roomTypeCtx, {
    type: 'doughnut',
    data: {
        labels: ['雙人房', '單人房', '家庭房', '豪華套房'],
        datasets: [{
            label: '訂單數量',
            data: [45, 20, 25, 10],
            backgroundColor: ['#1F487E', '#4BA3C3', '#78C2AD', '#FFD166'],
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            legend: {
                position: 'bottom',
            }
        }
    }
});

// KPI 假資料即時更新模擬
// function getRandomInt(min, max) {
//     return Math.floor(Math.random() * (max - min + 1) + min);
// }

// setInterval(() => {
//     const revenue = document.querySelectorAll('.card-body p')[0];
//     const orders = document.querySelectorAll('.card-body p')[1];
//     const occupancy = document.querySelectorAll('.card-body p')[2];
//     const comments = document.querySelectorAll('.card-body p')[3];

//     revenue.textContent = 'NT$ ' + getRandomInt(100000, 150000).toLocaleString();
//     orders.textContent = getRandomInt(20, 40) + ' 筆';
//     occupancy.textContent = getRandomInt(60, 90) + '%';
//     comments.textContent = getRandomInt(2, 10) + ' 則';
// }, 5000);
