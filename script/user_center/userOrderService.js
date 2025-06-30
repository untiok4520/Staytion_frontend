export async function fetchAndClassifyOrders() {
  try {
    // const res = await fetch("http://localhost:8080/api/bookings/me", {
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    //   },
    // });
    const userId = localStorage.getItem("userId");
    const res = await fetch(
      `http://localhost:8080/api/bookings/me?userId=${userId}`
    );

    const bookings = await res.json();
    const ordersData = classifyBookings(bookings);
    return ordersData;
  } catch (err) {
    console.error("取得使用者訂單資料失敗", err);
    return null;
  }
}

// 日期格式轉換：「2025年7月1日 星期二」或「7月1日（週二）」可選擇
export function formatDateWithDay(dateStr) {
  const date = new Date(dateStr);
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  return `${date.getMonth() + 1}月${date.getDate()}日（週${
    days[date.getDay()]
  }）`;
}

// 將每筆訂單轉成包含 locationHTML 與 orderHTML 的物件
export function renderOrderHTML(b) {
  if (!b || !b.items || !Array.isArray(b.items)) {
    return {
      locationHTML: `<div class="location-title">未知地點</div><div class="location-date">未知日期</div>`,
      orderHTML: `<div class="order-number">訂單資料錯誤</div>`,
    };
  }
  const item = b.items?.[0] || {};
  const hotelCity = item.hotelCity || "未知地點";
  const address = item.address || "未提供地址";
  const hotelName = item.hotelName || "未命名飯店";
  const checkIn = formatDateWithDay(b.checkInDate);
  const checkOut = formatDateWithDay(b.checkOutDate);
  const roomTypeName = item.roomTypeName || "未提供";
  const tel = item.tel || "未提供電話";

  const locationHTML = `<div class="location-title">${hotelCity}</div><div class="location-date">${checkIn}</div>`;

  const orderHTML = `
    <div class="order-number">編號：${b.orderId}</div>
    <div class="order-content">
      <div class="hotel-image">
        <img src="${
          item.roomImgUrl || "https://via.placeholder.com/150"
        }" alt="hotel image" />
      </div>
      <div class="hotel-info">
        <div class="hotel-name">${hotelName}</div>
        <div class="hotel-dates">
          <div class="checkin-date">
            <span>入住日期</span><br />
            <span>${checkIn}</span>
          </div>
          <div class="checkout-date">
            <span>退房日期</span><br />
            <span>${checkOut}</span>
          </div>
        </div>
      </div>
      <div class="order-detail">
        <button class="btn btn-secondary show-detail"
          data-id="${b.orderId}"
          data-hotel-id="${item.hotelId}"
          data-name="${hotelName}"
          data-roomtype="${roomTypeName}"
          data-checkin="${checkIn}"
          data-checkin-iso="${b.checkInDate}"
          data-checkout="${checkOut}"
          data-checkout-iso="${b.checkOutDate}"
          data-location="${address}"
          data-price="${b.totalPrice}"
          data-total="${b.totalPrice}"
          data-phone="${tel}"
          data-card="未提供"
          data-cardmask="•••• •••• •••• ••••"
        >訂單內容</button>
      </div>
    </div>
  `;

  return { locationHTML, orderHTML };
}

// 根據時間與狀態分類訂單
function classifyBookings(bookings) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); //把今天的時間歸零，代表當日 00:00:00

  const future = [];
  const past = [];
  const cancelled = [];
  const ongoing = [];

  bookings.forEach((b) => {
    const checkIn = new Date(b.checkInDate);
    const checkOut = new Date(b.checkOutDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    // 新增 log 追蹤分類判斷
    if (b.status === "CANCELED") {
      cancelled.push(b);
    } else if (b.status === "CONFIRMED") {
      if (checkIn > today) {
        future.push(b);
      } else if (checkIn <= today && checkOut > today) {
        ongoing.push(b);
      } else if (checkOut <= today) {
        past.push(b);
      }
    }
  });

  console.log("分類結果：", { future, past, cancelled, ongoing });

  return { future, past, cancelled, ongoing };
}
