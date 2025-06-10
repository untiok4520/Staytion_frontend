//貨幣切換按鈕
document
  .querySelectorAll("#currencyModal .modal-body.modal-grid a")
  .forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const html = this.innerHTML.trim();
      const parts = html.split("<br>");
      const code = parts[parts.length - 1].trim(); // 取最後一行的貨幣代碼
      const btn = document.querySelector(
        'button[data-bs-target="#currencyModal"]'
      );
      if (btn) {
        btn.textContent = code;
      }
      //關閉modal
      const modalEl = document.getElementById("currencyModal");
      const modalInstance =
        window.bootstrap && window.bootstrap.Modal
          ? window.bootstrap.Modal.getInstance(modalEl)
          : typeof bootstrap !== "undefined" && bootstrap.Modal
            ? bootstrap.Modal.getInstance(modalEl)
            : null;
      if (modalInstance) modalInstance.hide();
    });
  });

//語言切換按鈕
document
  .querySelectorAll("#languageModal .modal-body.modal-grid > div")
  .forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const span = this.querySelector("span.fi");
      const btn = document.querySelector(
        'button[data-bs-target="#languageModal"]'
      );
      if (span && btn) {
        // 將button的內容換成<span>
        btn.innerHTML = span.outerHTML;
      }
      // 關閉 modal
      const modalEl = document.getElementById("languageModal");
      const modalInstance =
        window.bootstrap && window.bootstrap.Modal
          ? window.bootstrap.Modal.getInstance(modalEl)
          : typeof bootstrap !== "undefined" && bootstrap.Modal
            ? bootstrap.Modal.getInstance(modalEl)
            : null;
      if (modalInstance) modalInstance.hide();
    });
  });


const filterState = {
  city: '', 
  area: '',
  checkin: '',
  checkout: '',
  adult: '',
  child: '',
  room: '',
  price: [],
  facility: [],
  score: [],
  recommend: [],
  facilities: []
};
//打開一個下拉,其他都會關閉
function closeAllDropdowns() {
  $('.dropdown-menu').removeClass('active');
  $('#guestDropdownMenu').removeClass('active');
}

// 日期選擇器初始化
flatpickr("#daterange", {
  locale: "zh_tw",
  mode: "range",
  minDate: "today",
  dateFormat: "Y-m-d",
  showMonths: 2
});

// 房客 popup 與數量控制
const guestBtn = document.getElementById("guest-btn");
const guestPopup = document.getElementById("guest-popup");

const guestCounts = {
  adults: 2,
  children: 0,
  rooms: 1
};

// 更新顯示文字
function updateGuestText() {
  guestBtn.value = `${guestCounts.adults} 位成人・${guestCounts.children} 位孩童・${guestCounts.rooms} 間房`;
}

// 顯示/隱藏 popup
guestBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (guestPopup.style.display === "block") {
    guestPopup.style.display = "none";
  } else {
    guestPopup.style.display = "block";
  }
});

// 點擊外部關閉 popup
document.addEventListener("click", (e) => {
  if (!guestPopup.contains(e.target) && e.target !== guestBtn) {
    guestPopup.style.display = "none";
  }
});

// 控制加減按鈕
guestPopup.querySelectorAll("button.qty-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    const action = btn.dataset.action;

    if (action === "increase") {
      guestCounts[type]++;
    } else if (action === "decrease") {
      if ((type === "adults" || type === "rooms") && guestCounts[type] > 1) {
        guestCounts[type]--;
      } else if (type === "children" && guestCounts[type] > 0) {
        guestCounts[type]--;
      }
    }

    // 更新 popup 顯示數字
    document.getElementById(type + "-count").textContent = guestCounts[type];
    // 更新輸入欄文字
    updateGuestText();
    document.querySelector('.btn-guest-done').addEventListener('click', function () {
      guestPopup.style.display = 'none';

      // 可選：印出目前選擇值（debug 用）
      console.log('目前條件：', guestCounts);

      // 也可以在這裡呼叫 fetchHotels(filterState);
    });
  });
});

// 初始化文字顯示
updateGuestText();

const cityOptions = [
  { label: '台北', value: 'taipei' },
  { label: '台中', value: 'taichung' },
  { label: '高雄', value: 'kaohsiung' },
  { label: '新北', value: 'newtaipei' },
  { label: '桃園', value: 'taoyuan' },
  { label: '台南', value: 'tainan' },
];
function renderCityDropdown() {
  const $ul = $('#cityList');
  $ul.empty();
  cityOptions.forEach(city => {
    $('<li>')
      .text(city.label)
      .on('click', function () {
        $('#city').val(city.label);
        filterState.city = city.value;
        $ul.removeClass('active');

        const areas = cityToAreas[city.value] || [];
        updateAreaDropdown(areas);
      })
      .appendTo($ul);
  });
}
$('#city').on('click', function (e) {
  e.stopPropagation();
  closeAllDropdowns();
  renderCityDropdown();
  $('#cityList').toggleClass('active');
});
$(document).on('click', function (e) {
  if (!$(e.target).closest('#city, #cityDropdown').length) {
    $('#cityList').removeClass('active');
  }
});

function updateAreaDropdown(areaList) {
  const $ul = $('#areaDropdown');
  $ul.empty();
  areaList.forEach(area => {
    $('<li>')
      .text(area.label)
      .on('click', function () {
        $('#area span').text(area.label);
        $ul.removeClass('active');
        filterState.area = area.value;

        fetchHotels(filterState);
      })
      .appendTo($ul);
  });
}

//觸發搜尋
$('#search-btn').on('click', function (e) {
  e.preventDefault();

  const cityText = $('#city').val();
  const selectedCity = cityOptions.find(c => c.label === cityText);
  if (selectedCity) {
    filterState.city = selectedCity.value;
  }

  const dateRange = $('#daterange').val(); 
  if (dateRange) {
    const [checkin, checkout] = dateRange.split(' - ');
    filterState.checkin = checkin;
    filterState.checkout = checkout;
  }

  filterState.adult = guestCounts.adults;
  filterState.child = guestCounts.children;
  filterState.room = guestCounts.rooms;

  fetchHotels(filterState);
});

//通用funcation
function setupDropdown({
  buttonId,
  dropdownId,
  spanSelector,
  options,
  placeholder,
  onSelect = () => { }
}) {
  const $btn = $(`#${buttonId}`);
  const $dropdown = $(`#${dropdownId}`);
  const $span = $btn.find(spanSelector);

  function renderOptions() {
    $dropdown.empty();
    options.forEach(opt => {
      const label = typeof opt === 'string' ? opt : opt.label;
      $('<li>')
        .text(label)
        .on('click', function () {
          $span.text(label);
          $dropdown.removeClass('active');
          onSelect(opt);
        })
        .appendTo($dropdown);
    });
  }

  $btn.on('click', function (e) {
    e.stopPropagation();
    closeAllDropdowns();
    renderOptions();
    $dropdown.toggleClass('active');
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest(`#${buttonId}, #${dropdownId}`).length) {
      $dropdown.removeClass('active');
    }
  });
}

const cityToAreas = {
  taipei: [
    { label: '信義區', value: 'xinyi' },
    { label: '大安區', value: 'daan' },
    { label: '中正區', value: 'zhongzheng' },
    { label: '中山區', value: 'zhongshan' },
    { label: '松山區', value: 'songshan' },
    { label: '萬華區', value: 'wanhua' },
    { label: '文山區', value: 'wenshan' },
    { label: '內湖區', value: 'neihu' }
  ],
  taichung: [
    { label: '西屯區', value: 'xitun' },
    { label: '北區', value: 'north' },
    { label: '中區', value: 'central' },
    { label: '南屯區', value: 'nantun' },
    { label: '南區', value: 'south' },
    { label: '北屯區', value: 'beitun' },
    { label: '西區', value: 'west' },
    { label: '東區', value: 'east' }
  ],
  kaohsiung: [
    { label: '鼓山區', value: 'gushan' },
    { label: '苓雅區', value: 'lingya' },
    { label: '前鎮區', value: 'qianzhen' },
    { label: '新興區', value: 'xinxing' },
    { label: '左營區', value: 'zuoying' },
    { label: '三民區', value: 'sanmin' },
    { label: '鹽埕區', value: 'yancheng' },
    { label: '前金區', value: 'qianjin' }
  ],
  newtaipei: [
    { label: '板橋區', value: 'banqiao' },
    { label: '中和區', value: 'zhonghe' },
    { label: '永和區', value: 'yonghe' },
    { label: '新店區', value: 'xindian' },
    { label: '三重區', value: 'sanchong' },
    { label: '新莊區', value: 'xinzhuang' },
    { label: '蘆洲區', value: 'luzhou' },
    { label: '汐止區', value: 'xizhi' }
  ],
  taoyuan: [
    { label: '桃園區', value: 'taoyuan' },
    { label: '中壢區', value: 'zhongli' },
    { label: '平鎮區', value: 'pingzhen' },
    { label: '楊梅區', value: 'yangmei' },
    { label: '八德區', value: 'bade' },
    { label: '蘆竹區', value: 'luzhu' },
    { label: '龜山區', value: 'guishan' },
    { label: '大園區', value: 'dayuan' }
  ],
  tainan: [
    { label: '中西區', value: 'westcentral' },
    { label: '東區', value: 'east' },
    { label: '北區', value: 'north' },
    { label: '南區', value: 'south' },
    { label: '安平區', value: 'anping' },
    { label: '永康區', value: 'yongkang' },
    { label: '安南區', value: 'annan' },
    { label: '新營區', value: 'xinying' }
  ]
};

const selectedCity = filterState.city;
const areas = cityToAreas[selectedCity] || [];
updateAreaDropdown(areas);

const areaOptions = [
  { label: '西屯區', value: 'xitun' },
  { label: '北區', value: 'north' },
  { label: '中區', value: 'central' },
  { label: '北屯區', value: 'beitun' },
  { label: '東區', value: 'east' },
  { label: '南屯區', value: 'nantun' },
  { label: '南區', value: 'south' }
];
setupDropdown({
  buttonId: 'area',
  dropdownId: 'areaDropdown',
  spanSelector: 'span',
  options: areaOptions,
  placeholder: 'Select Area',
  onSelect: createOnSelect('area')
});
const priceOptions = [
  { label: '500+', value: '500up' },
  { label: '500~1000', value: '500-1000' },
  { label: '1000~3000', value: '1000-3000' },
  { label: '3000~6000', value: '3000-6000' },
  { label: '6000~9000', value: '6000-9000' },
  { label: '9000+', value: '9000up' }
];
setupDropdown({
  buttonId: 'price',
  dropdownId: 'priceDropdown',
  spanSelector: 'span',
  options: priceOptions,
  placeholder: 'Select Price',
  onSelect: createOnSelect('price')
});

const facilityOptions = [
  { label: '免費Wi-Fi', value: 'wifi' },
  { label: '停車場', value: 'parking' },
  { label: '餐廳', value: 'restaurant' },
  { label: '洗衣設備', value: 'laundry' },
  { label: '可攜帶寵物', value: 'pet' },
  { label: '商店', value: 'store' },
  { label: '無障礙設施', value: 'accessible' }
];
setupDropdown({
  buttonId: 'facility',
  dropdownId: 'facilityDropdown',
  spanSelector: 'span',
  options: facilityOptions,
  placeholder: 'Select Facility',
  onSelect: createOnSelect('facility')
});
const scoreOptions = [
  { label: '1 分以上', value: '1' },
  { label: '2 分以上', value: '2' },
  { label: '3 分以上', value: '3' },
  { label: '4 分以上', value: '4' },
  { label: '5 分以上', value: '5' },
  { label: '6 分以上', value: '6' },
  { label: '7 分以上', value: '7' },
  { label: '8 分以上', value: '8' },
  { label: '9 分以上', value: '9' },
  { label: '10 分', value: '10' }
];
setupDropdown({
  buttonId: 'score',
  dropdownId: 'scoreDropdown',
  spanSelector: 'span',
  options: scoreOptions,
  placeholder: 'Select Score',
  onSelect: createOnSelect('score')
});

const sortOptions = [
  { label: '價格(高價優先)', value: 'price_highest' },
  { label: '評分(由高到低)', value: 'rating_highest' },
];
setupDropdown({
  buttonId: 'sort',
  dropdownId: 'sortDropdown',
  spanSelector: 'span',
  options: sortOptions,
  placeholder: 'Select Sort',
  onSelect: createOnSelect('sort')
});

function updateResultTitle(count = 0) {
  const cityLabel = cityOptions.find(c => c.value === filterState.city)?.label || '請選擇城市';
  $('#cityText').text(cityLabel);
  $('#hotelCount').text(count);
}
// filterState.city = 'taichung'; 
// updateResultTitle(8);         

function renderHotelList(hotels) {
  const $list = $('#hotelList');
  $list.empty(); // 清空舊的列表

  hotels.forEach(hotel => {
    const $card = $(`
      <article class="hotel-card">
        <div class="hotel-image">
          <img src="${hotel.imageUrl}" alt="${hotel.name}">
        </div>
        <div class="hotel-info">
          <h2 class="hotel-name">
            <a href="hotel-detail.html?id=${hotel.id}">${hotel.name}</a>
          </h2>
          <div class="hotel-location">
            ${hotel.district}, ${hotel.city}
            <a href="${hotel.mapUrl}" target="_blank">在地圖上顯示</a>
            距市中心${hotel.distance}公里
          </div>
          <div class="hotel-type">${hotel.roomType}</div>
        </div>
        <div class="hotel-extra">
          <div class="hotel-rating">
            <span class="rating-text">${hotel.ratingText}</span>
            <span class="rating-score">${hotel.rating}</span>
          </div>
          <div class="hotel-date">
            ${hotel.nights} 晚，${hotel.adults} 成人
            <br><strong>TWD ${hotel.price}</strong><br>
            含稅及其他費用
          </div>
          <button class="btn btn-booking" onclick="location.href='hotel-detail.html?id=${hotel.id}'">
            查詢客房詳情
          </button>
        </div>
      </article>
    `);
    $list.append($card);
  });
}

const $hotelList = $('#hotelList');
let page = 1;
let loading = false;
let finished = false;

async function fetchHotels() {
  if (loading || finished) return;
  loading = true;
  try {
    // 你自己的 API 路徑
    const res = await fetch(`/api/hotels?page=${page}&size=10`);
    const data = await res.json();

    // 假設 data.hotels 是飯店陣列, data.hasNextPage 判斷還有沒有下一頁
    if (!data.hotels || data.hotels.length === 0) {
      finished = true;
      return;
    }

    data.hotels.forEach(hotel => {
      const $card = $(`
        <article class="hotel-card">
          <div class="hotel-image">
            <img src="${hotel.imageUrl || 'https://fakeimg.pl/200x200/?text=No+Image'}" alt="Picture">
          </div>
          <div class="hotel-info">
            <h2 class="hotel-name">${hotel.name}</h2>
            <div class="hotel-location">${hotel.location}</div>
            <div class="hotel-type">${hotel.roomType}</div>
          </div>
          <div class="hotel-extra">
            <div class="hotel-rating">
              <span class="rating-text">${hotel.ratingText || ''}</span>
              <span class="rating-score">${hotel.rating || ''}</span>
            </div>
            <div class="hotel-date">
              1 晚上, 2 成人<br>
              <strong>${hotel.price}</strong><br>
              含稅及其他費用
            </div>
            <button class="btn btn-booking" onclick="location.href='hotel-detail.html?id=${hotel.id}'">
              查詢客房詳情
            </button>
          </div>
        </article>
      `);
      $hotelList.append($card);
    });

    // 判斷有沒有資料，沒資料就不再繼續 fetch
    if (!data.hasNextPage) {
      finished = true;
    } else {
      page += 1;
    }
  } finally {
    loading = false;
  }
}

// 第一次自動載入
fetchHotels();

// 無限滾動事件
$(window).on('scroll', function () {
  if ($(window).scrollTop() + $(window).height() >= $(document).height() - 200) {
    fetchHotels();
  }
});

//測試有無跑版(假資料)
renderHotelList([
  {
    id: 1,
    name: '測試飯店',
    imageUrl: 'assets/img/hotel1.png',
    district: '西區',
    city: '台中',
    mapUrl: '#',
    distance: 2.5,
    roomType: '標準雙人房',
    ratingText: '非常好',
    rating: 8.2,
    nights: 1,
    adults: 2,
    price: 1980
  }
]);



//取後端的通用
function fetchHotelsMain(filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else if (value !== '') {
      params.append(key, value);
    }
  });
  //後端使用  渲染飯店列表
  fetch(`/api/hotels?${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      renderHotelList(data.hotels);
      updateResultTitle(data.hotels.length);
    })
    .catch(err => {
      console.error('查詢失敗：', err);
    });
}
//帶入每個OnSelect的資料去呼叫後端
function createOnSelect(key) {
  return (opt) => {
    filterState[key] = opt.value;
    fetchHotelsMain(filterState); // 發送更新查詢
  };
}



function openMapMode() {
  document.getElementById('mapMode').classList.add('active');
}
function closeMapMode() {
  document.getElementById('mapMode').classList.remove('active');
}