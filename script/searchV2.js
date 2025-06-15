//V3.js
$(function () {
  'use strict';

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

  //狀態區
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
    taipei: [{ label: '信義區', value: 'xinyi' }, { label: '大安區', value: 'daan' }, { label: '中正區', value: 'zhongzheng' }, { label: '中山區', value: 'zhongshan' }, { label: '松山區', value: 'songshan' }, { label: '萬華區', value: 'wanhua' }, { label: '文山區', value: 'wenshan' }, { label: '內湖區', value: 'neihu' }],
    taichung: [{ label: '西屯區', value: 'xitun' }, { label: '北區', value: 'north' }, { label: '中區', value: 'central' }, { label: '南屯區', value: 'nantun' }, { label: '南區', value: 'south' }, { label: '北屯區', value: 'beitun' }, { label: '西區', value: 'west' }, { label: '東區', value: 'east' }],
    kaohsiung: [{ label: '鼓山區', value: 'gushan' }, { label: '苓雅區', value: 'lingya' }, { label: '前鎮區', value: 'qianzhen' }, { label: '新興區', value: 'xinxing' }, { label: '左營區', value: 'zuoying' }, { label: '三民區', value: 'sanmin' }, { label: '鹽埕區', value: 'yancheng' }, { label: '前金區', value: 'qianjin' }],
    newtaipei: [{ label: '板橋區', value: 'banqiao' }, { label: '中和區', value: 'zhonghe' }, { label: '永和區', value: 'yonghe' }, { label: '新店區', value: 'xindian' }, { label: '三重區', value: 'sanchong' }, { label: '新莊區', value: 'xinzhuang' }, { label: '蘆洲區', value: 'luzhou' }, { label: '汐止區', value: 'xizhi' }],
    taoyuan: [{ label: '桃園區', value: 'taoyuan' }, { label: '中壢區', value: 'zhongli' }, { label: '平鎮區', value: 'pingzhen' }, { label: '楊梅區', value: 'yangmei' }, { label: '八德區', value: 'bade' }, { label: '蘆竹區', value: 'luzhu' }, { label: '龜山區', value: 'guishan' }, { label: '大園區', value: 'dayuan' }],
    tainan: [{ label: '中西區', value: 'westcentral' }, { label: '東區', value: 'east' }, { label: '北區', value: 'north' }, { label: '南區', value: 'south' }, { label: '安平區', value: 'anping' }, { label: '永康區', value: 'yongkang' }, { label: '安南區', value: 'annan' }, { label: '新營區', value: 'xinying' }]
  };

  //城市建議功能
  const suggestionsEl = $("#suggestions");
  const destinationInput = $("#destinationInput");

  function showSuggestions(keyword = "") {
    const filtered = cityOptions.filter(city => city.label.includes(keyword)).map(city => city.label);
    suggestionsEl.html(filtered.map(cityLabel => `<li class="list-group-item">${cityLabel}</li>`).join(""));
    suggestionsEl.css('display', filtered.length ? "block" : "none");
  }

  destinationInput.on("input", () => { showSuggestions(destinationInput.val().trim()); });
  destinationInput.on("focus", () => { showSuggestions(); });
  suggestionsEl.on("click", "li", function () {
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

  //日期
  flatpickr("#daterange", {
    locale: "zh_tw",
    mode: "range",
    minDate: "today",
    dateFormat: "Y-m-d",
    showMonths: 2,
    onClose: function (selectedDates, dateStr) {
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

  //房客人數 popup
  const guestBtn = $("#guest-btn");
  const guestPopup = $("#guest-popup");
  const guestCounts = { adults: 2, children: 0, rooms: 1 };

  function updateGuestText() {
    guestBtn.val(`${guestCounts.adults} 位成人・${guestCounts.children} 位孩童・${guestCounts.rooms} 間房`);
    filterState.adult = guestCounts.adults;
    filterState.child = guestCounts.children;
    filterState.room = guestCounts.rooms;
  }
  guestBtn.on("click", function (e) {
    e.stopPropagation();
    guestPopup.toggle();
  });
  $(document).on("click", function (e) {
    if (!guestPopup.is(e.target) && guestPopup.has(e.target).length === 0 && !guestBtn.is(e.target)) {
      guestPopup.hide();
    }
  });
  guestPopup.find("button.qty-btn").on("click", function () {
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

  //Dropdowns & 篩選
  function closeAllDropdownsExcept(exceptId) {
    $('.dropdown-menu').not('#' + exceptId).removeClass('active');
  }

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
  function setupDropdown({ buttonId, dropdownId, spanSelector, options, onSelect }) {
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

  const priceOptions = [{ label: '500+', value: '500up' }, { label: '500~1000', value: '500-1000' }, { label: '1000~3000', value: '1000-3000' }, { label: '3000~6000', value: '3000-6000' }, { label: '6000~9000', value: '6000-9000' }, { label: '9000+', value: '9000up' }];
  const facilityOptions = [{ label: 'Wi-Fi', value: 'wifi' }, { label: '停車場', value: 'parking' }, { label: '餐廳', value: 'restaurant' }, { label: '洗衣設備', value: 'laundry' }, { label: '可攜帶寵物', value: 'pet' }, { label: '商店', value: 'store' }, { label: '無障礙設施', value: 'accessible' }];
  const scoreOptions = [{ label: '1 分以上', value: '1' }, { label: '2 分以上', value: '2' }, { label: '3 分以上', value: '3' }, { label: '4 分以上', value: '4' }, { label: '5 分以上', value: '5' }, { label: '6 分以上', value: '6' }, { label: '7 分以上', value: '7' }, { label: '8 分以上', value: '8' }, { label: '9 分以上', value: '9' }, { label: '10 分', value: '10' }];
  const sortOptions = [{ label: '價格(高價優先)', value: 'price_highest' }, { label: '評分(由高到低)', value: 'rating_highest' }];

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

  //搜尋 & 狀態同步
  $('#search-btn').on('click', function (e) {
    e.preventDefault();
    if (!filterState.city) {
      alert("請選擇有效的目的地");
      return;
    }
    updateAreaDropdown(cityToAreas[filterState.city] || []);
    fetchHotelsMain(filterState);
  });

  //飯店渲染 & 查詢
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
            <img src="${hotel.imgUrl || 'https://fakeimg.pl/200x200/?text=No+Image'}" alt="${hotel.name}">
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
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach(v => params.append(key, v));
      else if (value !== '' && value !== null && typeof value !== 'undefined') params.append(key, value);
    });

    fetch('http://localhost:8080/api/hotels?' + params.toString())
      .then(res => res.json())
      .then(data => {
        renderHotelList(data.hotels || []);
      })
      .catch(err => {
        $('#hotelList').empty().append(`<div class="no-result text-center py-4">資料載入失敗</div>`);
      });
  }

  //地圖模式
  window.openMapMode = function () {
    $('#mapMode').addClass('active');
    renderMapHotelList(); // 每次打開都重新查詢
  };

  window.closeMapMode = function () {
    $('#mapMode').removeClass('active');
  };

  //地圖模式專用的飯店渲染
  function renderMapHotelList() {
    const params = new URLSearchParams();
    Object.entries(filterState).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach(v => params.append(key, v));
      else if (value !== '' && value !== null && typeof value !== 'undefined') params.append(key, value);
    });

    fetch('http://localhost:8080/api/hotels?' + params.toString())
      .then(res => res.json())
      .then(data => {
        const $list = $('#mapHotelList');
        $list.empty();
        const hotels = data.hotels || [];
        if (!hotels.length) {
          $list.append(`<div class="no-result text-center py-4">查無資料</div>`);
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
      })
      .catch(err => {
        $('#mapHotelList').empty().append(`<div class="no-result text-center py-4">資料載入失敗</div>`);
      });
  }

  // Modal

  let priceSlider, minPriceEl, maxPriceEl, applyBtn;

  function updateHotelCountText() {
    const recommendBtns = document.querySelectorAll('.recommend-btn.active').length;
    const facilityBtns = document.querySelectorAll('.facility-btn.active').length;
    let isPriceChanged = false;
    if (priceSlider && priceSlider.noUiSlider) {
      const currentRange = priceSlider.noUiSlider.get(true);
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

  function toggleButton(selector) {
    $(document).on('click', selector, function () {
      $(this).toggleClass('active');
      updateHotelCountText();
    });
  }

  toggleButton('.recommend-btn');
  toggleButton('.facility-btn');

  $('#filterModal').on('shown.bs.modal', function () {
    priceSlider = document.getElementById('priceSlider');
    minPriceEl = document.getElementById('minPrice');
    maxPriceEl = document.getElementById('maxPrice');
    applyBtn = document.querySelector('.btn-apply');

    if (priceSlider && !priceSlider.noUiSlider) {
      noUiSlider.create(priceSlider, {
        start: [1000, 80000], 
        connect: true, 
        range: { min: 500, max: 100000 },
        step: 100,
        format: {
          to: value => Math.round(value),
          from: value => Number(value)
        }
      });

      priceSlider.noUiSlider.on('update', function (values) {
        minPriceEl.textContent = values[0];
        maxPriceEl.textContent = values[1];
        filterState.price = [values[0], values[1]];
      });

      priceSlider.noUiSlider.on('change', updateHotelCountText);
    }
    updateHotelCountText();
  });

  $('#clearAllBtn').on('click', function () {
    $('.recommend-btn, .facility-btn').removeClass('active');
    if (priceSlider && priceSlider.noUiSlider) {
      priceSlider.noUiSlider.set([1000, 80000]);
    }
    filterState.recommend = [];
    filterState.facilities = [];
    filterState.price = [];

    updateHotelCountText();
  });

  window.applyFilter = function () {
    filterState.facilities = [];
    $('.facility-btn.active').each(function () {
      filterState.facilities.push($(this).text());
    });

    $('#filterModal').modal('hide');
    fetchHotelsMain(filterState);
  };
});