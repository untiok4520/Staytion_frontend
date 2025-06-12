// /script/V3.js

// 使用 jQuery 的 $(function() { ... }) 確保所有程式碼在 DOM 載入完成後才執行
$(function () {
  'use strict'; // 建議使用嚴格模式

  // ----------------------- 狀態區 -----------------------
  const filterState = {
    city: '',
    area: '',
    checkin: '',
    checkout: '',
    adult: 2,
    child: 0,
    room: 1,
    price: [],
    facility: [],
    score: [],
    recommend: [],
    facilities: []
  };

  const cityOptions = [
    { label: '台北', value: 'taipei' },
    { label: '台中', value: 'taichung' },
    { label: '高雄', value: 'kaohsiung' },
    { label: '新北', value: 'newtaipei' },
    { label: '桃園', value: 'taoyuan' },
    { label: '台南', value: 'tainan' },
  ];

  const cityToAreas = {
    taipei: [ { label: '信義區', value: 'xinyi' }, { label: '大安區', value: 'daan' }, { label: '中正區', value: 'zhongzheng' }, { label: '中山區', value: 'zhongshan' }, { label: '松山區', value: 'songshan' }, { label: '萬華區', value: 'wanhua' }, { label: '文山區', value: 'wenshan' }, { label: '內湖區', value: 'neihu' } ],
    taichung: [ { label: '西屯區', value: 'xitun' }, { label: '北區', value: 'north' }, { label: '中區', value: 'central' }, { label: '南屯區', value: 'nantun' }, { label: '南區', value: 'south' }, { label: '北屯區', value: 'beitun' }, { label: '西區', value: 'west' }, { label: '東區', value: 'east' } ],
    kaohsiung: [ { label: '鼓山區', value: 'gushan' }, { label: '苓雅區', value: 'lingya' }, { label: '前鎮區', value: 'qianzhen' }, { label: '新興區', value: 'xinxing' }, { label: '左營區', value: 'zuoying' }, { label: '三民區', value: 'sanmin' }, { label: '鹽埕區', value: 'yancheng' }, { label: '前金區', value: 'qianjin' } ],
    newtaipei: [ { label: '板橋區', value: 'banqiao' }, { label: '中和區', value: 'zhonghe' }, { label: '永和區', value: 'yonghe' }, { label: '新店區', value: 'xindian' }, { label: '三重區', value: 'sanchong' }, { label: '新莊區', value: 'xinzhuang' }, { label: '蘆洲區', value: 'luzhou' }, { label: '汐止區', value: 'xizhi' } ],
    taoyuan: [ { label: '桃園區', value: 'taoyuan' }, { label: '中壢區', value: 'zhongli' }, { label: '平鎮區', value: 'pingzhen' }, { label: '楊梅區', value: 'yangmei' }, { label: '八德區', value: 'bade' }, { label: '蘆竹區', value: 'luzhu' }, { label: '龜山區', value: 'guishan' }, { label: '大園區', value: 'dayuan' } ],
    tainan: [ { label: '中西區', value: 'westcentral' }, { label: '東區', value: 'east' }, { label: '北區', value: 'north' }, { label: '南區', value: 'south' }, { label: '安平區', value: 'anping' }, { label: '永康區', value: 'yongkang' }, { label: '安南區', value: 'annan' }, { label: '新營區', value: 'xinying' } ]
  };

  // -------------------- 城市建議功能 --------------------
  const suggestionsEl = $("#suggestions");
  const destinationInput = $("#destinationInput");

  function showSuggestions(keyword = "") {
    const filtered = cityOptions.filter(city => city.label.includes(keyword)).map(city => city.label);
    suggestionsEl.html(filtered.map(cityLabel => `<li class="list-group-item">${cityLabel}</li>`).join(""));
    suggestionsEl.css('display', filtered.length ? "block" : "none");
  }

  destinationInput.on("input", () => { showSuggestions(destinationInput.val().trim()); });
  destinationInput.on("focus", () => { showSuggestions(); });
  suggestionsEl.on("click", "li", function() {
      const cityLabel = $(this).text();
      destinationInput.val(cityLabel);
      suggestionsEl.hide();
      const cityObj = cityOptions.find(c => c.label === cityLabel);
      filterState.city = cityObj ? cityObj.value : "";
      filterState.area = '';
      updateAreaDropdown(cityToAreas[filterState.city] || []);
      $('#area span').text('區域');
      $('#areaDropdown').removeClass('active');
  });
  $(document).on("click", (e) => {
    if (!suggestionsEl.is(e.target) && suggestionsEl.has(e.target).length === 0 && !destinationInput.is(e.target)) {
        suggestionsEl.hide();
    }
  });

  // --------------------- 日期選擇 flatpickr ---------------------
  flatpickr("#daterange", {
    locale: "zh_tw",
    mode: "range",
    minDate: "today",
    dateFormat: "Y-m-d",
    showMonths: 2,
    onClose: function(selectedDates, dateStr) {
      if (!dateStr) {
        filterState.checkin = "";
        filterState.checkout = "";
        return;
      }
      const [checkin, checkout] = dateStr.split(' to ');
      filterState.checkin = checkin;
      filterState.checkout = checkout || "";
    }
  });

  // --------------------- 房客人數 popup ---------------------
  const guestBtn = $("#guest-btn");
  const guestPopup = $("#guest-popup");
  const guestCounts = { adults: 2, children: 0, rooms: 1 };

  function updateGuestText() {
    guestBtn.val(`${guestCounts.adults} 位成人・${guestCounts.children} 位孩童・${guestCounts.rooms} 間房`);
    filterState.adult = guestCounts.adults;
    filterState.child = guestCounts.children;
    filterState.room = guestCounts.rooms;
  }
  guestBtn.on("click", function(e) {
    e.stopPropagation();
    guestPopup.toggle();
  });
  $(document).on("click", function(e) {
    if (!guestPopup.is(e.target) && guestPopup.has(e.target).length === 0 && !guestBtn.is(e.target)) {
      guestPopup.hide();
    }
  });
  guestPopup.find("button.qty-btn").on("click", function() {
    const $btn = $(this);
    const type = $btn.data("type");
    const action = $btn.data("action");
    if (action === "increase") {
      guestCounts[type]++;
    } else if (action === "decrease" && ((type === "adults" || type === "rooms") ? guestCounts[type] > 1 : guestCounts[type] > 0)) {
      guestCounts[type]--;
    }
    $("#" + type + "-count").text(guestCounts[type]);
    updateGuestText();
  });
  updateGuestText();

  // ------------------- Dropdowns & 篩選邏輯 -------------------
  function closeAllDropdownsExcept(exceptId) {
    $('.dropdown-menu').not('#' + exceptId).removeClass('active');
  }

  // 區域 Dropdown
  function updateAreaDropdown(areaList) {
    const $ul = $('#areaDropdown');
    $ul.empty();
    areaList.forEach(area => {
      $('<li></li>')
        .text(area.label)
        .on('click', function () {
          $('#area span').text(area.label);
          $ul.removeClass('active');
          filterState.area = area.value;
        })
        .appendTo($ul);
    });
    if (!areaList.length) $('#area span').text('區域');
  }
  $('#area').on('click', function (e) {
    e.stopPropagation();
    closeAllDropdownsExcept('areaDropdown');
    $('#areaDropdown').toggleClass('active');
  });

  // 通用 Dropdown 設定
  function setupDropdown({buttonId, dropdownId, spanSelector, options, onSelect}) {
    const $btn = $(`#${buttonId}`);
    const $dropdown = $(`#${dropdownId}`);
    const $span = $btn.find(spanSelector);

    function renderOptions() {
      $dropdown.empty();
      options.forEach(opt => {
        const label = typeof opt === 'string' ? opt : opt.label;
        $('<li></li>')
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
      if (buttonId === 'area') return;
      e.stopPropagation();
      closeAllDropdownsExcept(dropdownId);
      if (!$dropdown.hasClass('active')) { // 只有在要打開時才重新渲染
        renderOptions();
      }
      $dropdown.toggleClass('active');
    });
  }
  
  // 關閉所有 dropdowns
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.dropdown').length) {
      $('.dropdown-menu').removeClass('active');
    }
  });

  const priceOptions = [ { label: '500+', value: '500up' }, { label: '500~1000', value: '500-1000' }, { label: '1000~3000', value: '1000-3000' }, { label: '3000~6000', value: '3000-6000' }, { label: '6000~9000', value: '6000-9000' }, { label: '9000+', value: '9000up' } ];
  const facilityOptions = [ { label: 'Wi-Fi', value: 'wifi' }, { label: '停車場', value: 'parking' }, { label: '餐廳', value: 'restaurant' }, { label: '洗衣設備', value: 'laundry' }, { label: '可攜帶寵物', value: 'pet' }, { label: '商店', value: 'store' }, { label: '無障礙設施', value: 'accessible' } ];
  const scoreOptions = [ { label: '1 分以上', value: '1' }, { label: '2 分以上', value: '2' }, { label: '3 分以上', value: '3' }, { label: '4 分以上', value: '4' }, { label: '5 分以上', value: '5' }, { label: '6 分以上', value: '6' }, { label: '7 分以上', value: '7' }, { label: '8 分以上', value: '8' }, { label: '9 分以上', value: '9' }, { label: '10 分', value: '10' } ];
  const sortOptions = [ { label: '價格(高價優先)', value: 'price_highest' }, { label: '評分(由高到低)', value: 'rating_highest' } ];

  function createOnSelect(key) {
    return (opt) => {
      filterState[key] = opt.value;
      if (key !== 'area') fetchHotelsMain(filterState);
    };
  }

  setupDropdown({ buttonId: 'price', dropdownId: 'priceDropdown', spanSelector: 'span', options: priceOptions, onSelect: createOnSelect('price') });
  setupDropdown({ buttonId: 'facility', dropdownId: 'facilityDropdown', spanSelector: 'span', options: facilityOptions, onSelect: createOnSelect('facility') });
  setupDropdown({ buttonId: 'score', dropdownId: 'scoreDropdown', spanSelector: 'span', options: scoreOptions, onSelect: createOnSelect('score') });
  setupDropdown({ buttonId: 'sort', dropdownId: 'sortDropdown', spanSelector: 'span', options: sortOptions, onSelect: createOnSelect('sort') });

  // --------------- 搜尋 & 狀態同步 -----------------
  $('#search-btn').on('click', function (e) {
    e.preventDefault();
    if (!filterState.city) {
      alert("請選擇有效的目的地");
      return;
    }
    updateAreaDropdown(cityToAreas[filterState.city] || []);
    fetchHotelsMain(filterState);
  });

  // ----------- 飯店渲染 & 查詢 -----------
  function renderHotelList(hotels) {
    const $list = $('#hotelList');
    $list.empty();
    if (!hotels || !hotels.length) {
      $list.append(`<div class="no-result text-center py-4">查無資料</div>`);
      updateResultTitle(0);
      return;
    }
    hotels.forEach(hotel => {
      const $card = $(`
        <article class="hotel-card">
          <div class="hotel-image">
            <img src="${hotel.imageUrl || 'https://fakeimg.pl/200x200/?text=No+Image'}" alt="${hotel.name}">
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
            <div class="hotel-rating"><span class="rating-score">${hotel.rating ?? ''}</span></div>
            <div class="hotel-date">
              ${hotel.nights ?? '-'} 晚，${hotel.adults ?? '-'} 成人<br>
              <strong>TWD ${hotel.price ?? '-'}</strong><br>含稅及其他費用
            </div>
            <button class="btn btn-booking" onclick="location.href='hotel-detail.html?id=${hotel.id}'">
              查詢客房詳情
            </button>
          </div>
        </article>
      `);
      $list.append($card);
    });
    updateResultTitle(hotels.length);
  }

  function updateResultTitle(count = 0) {
    const cityLabel = cityOptions.find(c => c.value === filterState.city)?.label || '請選擇城市';
    $('#cityText').text(cityLabel);
    $('#hotelCount').text(count);
  }

  function fetchHotelsMain(filters) {
    console.log("Fetching hotels with filters:", filters);
    // 以下為模擬 fetch，請替換為您的後端 API
    //alert(`正在用以下條件搜尋：\n${JSON.stringify(filters, null, 2)}`);
    // 模擬回傳資料
    const fakeHotels = [
      { id: 1, name: '範例飯店 A', district: '西屯區', city: '台中市', mapUrl: '#', distance: 1.5, roomType: '雙人房', rating: 8.5, nights: 2, adults: 2, price: 3200, imageUrl: 'https://fakeimg.pl/200x200/?text=Hotel+A' },
      { id: 2, name: '範例飯店 B', district: '中區', city: '台中市', mapUrl: '#', distance: 0.5, roomType: '家庭房', rating: 9.1, nights: 2, adults: 2, price: 4500, imageUrl: 'https://fakeimg.pl/200x200/?text=Hotel+B' }
    ];
    renderHotelList(fakeHotels);
  }

  // ------------ 地圖模式 (全域綁定) ---------------
  window.openMapMode = function () {
    document.getElementById('mapMode').classList.add('active');
  };
  window.closeMapMode = function () {
    document.getElementById('mapMode').classList.remove('active');
  };

  // ========== 以下是 Modal 相關的處理程式碼 ==========

  let priceSlider, minPriceEl, maxPriceEl, applyBtn;

  // 住宿數量動態更新函式
  function updateHotelCountText() {
    // 這是模擬計數，您可以串接 API 來取得真實數量
    const recommendBtns = document.querySelectorAll('.recommend-btn.active').length;
    const facilityBtns = document.querySelectorAll('.facility-btn.active').length;
    let isPriceChanged = false;
    if (priceSlider && priceSlider.noUiSlider) {
        const currentRange = priceSlider.noUiSlider.get(true);
        // 假設預設值是 1000 和 80000
        if (currentRange[0] !== 1000 || currentRange[1] !== 80000) {
            isPriceChanged = true;
        }
    }
    const totalSelected = recommendBtns + facilityBtns + (isPriceChanged ? 1 : 0);
    const count = 1000 + totalSelected * 50; // 僅為示意
    if (applyBtn) {
        applyBtn.textContent = `顯示 ${count}+ 住宿`;
    }
  }

  // 綁定按鈕切換 active 狀態
  function toggleButton(selector) {
    $(document).on('click', selector, function() {
        $(this).toggleClass('active');
        updateHotelCountText();
    });
  }
  
  toggleButton('.recommend-btn');
  toggleButton('.facility-btn');

  // 當 modal 顯示時，才初始化 noUiSlider
  $('#filterModal').on('shown.bs.modal', function () {
    priceSlider = document.getElementById('priceSlider');
    minPriceEl = document.getElementById('minPrice');
    maxPriceEl = document.getElementById('maxPrice');
    applyBtn = document.querySelector('.btn-apply');

    // 如果滑桿還沒被初始化
    if (priceSlider && !priceSlider.noUiSlider) {
      noUiSlider.create(priceSlider, {
        start: [1000, 80000], // 初始值
        connect: true, // 連結中間的區域
        range: { min: 500, max: 100000 },
        step: 100,
        format: {
          to: value => Math.round(value),
          from: value => Number(value)
        }
      });

      // 當滑桿數值更新時，同步更新顯示的價格
      priceSlider.noUiSlider.on('update', function (values) {
        minPriceEl.textContent = values[0];
        maxPriceEl.textContent = values[1];
        // 將值存入 filterState
        filterState.price = [values[0], values[1]];
      });

      // 當滑桿停止滑動時，更新住宿數量文字
      priceSlider.noUiSlider.on('change', updateHotelCountText);
    }
    // Modal 一打開，就先更新一次按鈕文字
    updateHotelCountText();
  });

  // 清除全部按鈕
  $('#clearAllBtn').on('click', function () {
    // 清除按鈕 active 狀態
    $('.recommend-btn, .facility-btn').removeClass('active');
    // 重設滑桿
    if (priceSlider && priceSlider.noUiSlider) {
      priceSlider.noUiSlider.set([1000, 80000]);
    }
    // 重設 filterState
    filterState.recommend = [];
    filterState.facilities = [];
    filterState.price = [];

    updateHotelCountText();
  });
  
  // 套用按鈕 (全域綁定)
  window.applyFilter = function () {
    // 從 modal 收集篩選條件
    filterState.facilities = [];
    $('.facility-btn.active').each(function() {
        // 這邊需要將按鈕文字對應到一個 value，暫時用文字代替
        filterState.facilities.push($(this).text());
    });
    
    $('#filterModal').modal('hide');
    fetchHotelsMain(filterState);
  };
});