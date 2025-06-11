const themeColor = '#376996';
const buttonColor = '#1F487E';

// 月收入折線圖
const incomeCtx = document.getElementById('monthlyIncomeChart').getContext('2d');
const incomeChart = new Chart(incomeCtx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: '月收入 (元)',
      data: [42000, 51000, 48000, 55000, 61000, 64000],
      backgroundColor: 'rgba(55, 105, 150, 0.1)',
      borderColor: themeColor,
      borderWidth: 3,
      fill: true,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// 房型比例圓餅圖
const pieCtx = document.getElementById('roomTypeChart').getContext('2d');
const roomTypeChart = new Chart(pieCtx, {
  type: 'pie',
  data: {
    labels: ['家庭房', '雙人房', '背包床位'],
    datasets: [{
      label: '房型比例',
      data: [60, 30, 10],
      backgroundColor: ['#4BA3C3', '#78C2AD', '#FFD166'],
      hoverOffset: 10
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: { display: false }
    }
  }
});


// 每日訂單數柱狀圖
const dailyBookingCtx = document.getElementById('dailyBookingChart').getContext('2d');
new Chart(dailyBookingCtx, {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: '每日訂單數',
      data: [12, 19, 8, 15, 20, 25, 22],
      backgroundColor: themeColor
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// 入住率折線圖
const occupancyRateCtx = document.getElementById('occupancyRateChart').getContext('2d');
new Chart(occupancyRateCtx, {
  type: 'line',
  data: {
    labels: ['1號', '2號', '3號', '4號', '5號', '6號', '7號'],
    datasets: [{
      label: '入住率 (%)',
      data: [70, 75, 68, 80, 85, 90, 88],
      borderColor: buttonColor,
      backgroundColor: 'rgba(31, 72, 126, 0.1)',
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  }
});

// 平均房價雷達圖
// const adrCtx = document.getElementById('adrChart').getContext('2d');
// new Chart(adrCtx, {
//   type: 'radar',
//   data: {
//     labels: ['單人房', '雙人房', '家庭房', '背包床位'],
//     datasets: [{
//       label: '平均房價（ADR）',
//       data: [1800, 2800, 4000, 900],
//       backgroundColor: 'rgba(55, 105, 150, 0.2)',
//       borderColor: themeColor,
//       pointBackgroundColor: themeColor
//     }]
//   },
//   options: {
//     responsive: true,
//     scales: {
//       r: {
//         beginAtZero: true
//       }
//     }
//   }
// });

// 各飯店營收排行
new Chart(document.getElementById('hotelRevenueChart'), {
  type: 'bar',
  data: {
    labels: ['台北民宿一館', '台中青年旅店', '花蓮海景套房'],
    datasets: [{
      label: '營收 (NTD)',
      data: [520000, 430000, 300000],
      backgroundColor: ['#4BA3C3', '#78C2AD', '#FFD166']
    }]
  },
  options: {
    responsive: true,
    indexAxis: 'y'
  }
});

// 顧客來源地
// new Chart(document.getElementById('customerOriginChart'), {
//   type: 'bar',
//   data: {
//     labels: ['台灣', '日本', '美國', '香港', '新加坡'],
//     datasets: [{
//       label: '訪客人數',
//       data: [200, 85, 70, 60, 55],
//       backgroundColor: '#376996'
//     }]
//   },
//   options: {
//     responsive: true
//   }
// });
