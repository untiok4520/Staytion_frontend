//V3.js
let currentPage = 1;
const pageSize = 5;
let loading = false;
let allLoaded = false;

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

  let cityOptions = [];
  let areaOptions = [];
  let areaOptionsMap = {};

  // 取得所有城市
  function fetchCities(callback) {
    fetch('http://localhost:8080/api/cities')
      .then(res => res.json())
      .then(data => {
        cityOptions = data || [];
        callback && callback(cityOptions);
      });
  }

  // 取得所有區域
  function fetchAreasAll(callback) {
    fetch('http://localhost:8080/api/areas/all')
      .then(res => res.json())
      .then(data => {
        areaOptions = data || [];
        callback && callback(areaOptions);
      });
  }

  fetchCities();
  fetchAreasAll();

  function fetchAreas(cityValue, callback) {
    console.log('fetchAreas cityValue:', cityValue, typeof cityValue);
    if (!cityValue) {
      callback && callback([]);
      return;
    }
    if (areaOptionsMap[cityValue]) {
      callback && callback(areaOptionsMap[cityValue]);
      return;
    }
    fetch('http://localhost:8080/api/areas?city=' + encodeURIComponent(cityValue))
      .then(res => res.json())
      .then(data => {
        console.log('areas fetch response:', data);
        areaOptionsMap[cityValue] = data || [];
        callback && callback(data || []);
      });
  }


  const destinationInput = $("#destinationInput");
  const $dropdown = $("#suggestions");

  function showAllCities() {
    $dropdown.empty();
    cityOptions.forEach(opt => {
      $dropdown.append(`<li class="dropdown-item" data-label="${opt.label}" data-value="${opt.value}">${opt.label}</li>`);
    });
    $dropdown.show();
  }

  // 依關鍵字即時篩選
  function filterDropdown(keyword) {
    if (!keyword) {
      showAllCities();
      return;
    }
    let cityFiltered = cityOptions.filter(opt => opt.label.includes(keyword));
    let areaFiltered = areaOptions.filter(opt => opt.label.includes(keyword));
    let filtered = [...cityFiltered, ...areaFiltered];

    $dropdown.empty();
    if (!filtered.length) {
      $dropdown.append('<li class="dropdown-item">查無資料</li>');
      return;
    }
    filtered.forEach(opt => {
      $dropdown.append(`<li class="dropdown-item" data-label="${opt.label}" data-value="${opt.value}">${opt.label}</li>`);
    });
    $dropdown.show();
  }

  destinationInput.on("input", function () {
    filterDropdown($(this).val().trim());
  });

  destinationInput.on("focus", function () {
    showAllCities();
  });

  $dropdown.on("click", "li", function () {
    const label = $(this).data('label');
    const value = $(this).data('value');
    if (!value) return; // 防止查無資料
    destinationInput.val(label);
    filterState.city = value;
    filterState.area = "";
    // fetchHotelsMain(filterState);
    $dropdown.hide();
  });

  destinationInput.on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputVal = $(this).val().trim();

      let cityObj = cityOptions.find(opt => opt.label === inputVal);

      let areaObj = areaOptions.find(opt => opt.label === inputVal);

      if (cityObj) {
        filterState.city = cityObj.value;
        filterState.area = "";
        fetchHotelsMain(filterState);
        $dropdown.hide();
      } else if (areaObj) {
        filterState.city = areaObj.city;
        filterState.area = areaObj.value;
        fetchHotelsMain(filterState);
        $dropdown.hide();
      } else {
        // 之後考慮多做一層模糊查詢,例如台北市,輸入"台"也會顯示選項
        // 
        let fuzzyCities = cityOptions.filter(opt => opt.label.includes(inputVal));
        let fuzzyAreas = areaOptions.filter(opt => opt.label.includes(inputVal));

        if (fuzzyCities.length === 1) {
          filterState.city = fuzzyCities[0].value;
          filterState.area = "";
          fetchHotelsMain(filterState);
          $dropdown.hide();
        } else if (fuzzyAreas.length === 1) {
          filterState.city = fuzzyAreas[0].city;
          filterState.area = fuzzyAreas[0].value;
          // fetchHotelsMain(filterState);
          $dropdown.hide();
        } else {
          alert("請選擇有效的目的地");
        }
      }
    }
  });

  // 點外面時關閉下拉
  $(document).on("click", function (e) {
    if (!$(e.target).is('#destinationInput') && !$(e.target).closest('#suggestions').length) {
      $dropdown.hide();
    }
  });

  function updateAreaDropdown(areaList) {
    console.log('updateAreaDropdown:', areaList);
    const $ul = $('#areaDropdown');
    $ul.empty();
    $('<li></li>')
      .text('全部區域')
      .on('click', function () {
        $('#area span').text('區域');
        $ul.removeClass('active');
        filterState.area = '';
        // 可選：fetchHotelsMain(filterState);
      })
      .appendTo($ul);
    areaList.forEach(area => {
      $('<li></li>')
        .text(area.label)
        .on('click', function () {
          $('#area span').text(area.label);
          $ul.removeClass('active');
          filterState.area = area.value;
          fetchHotelsMain(filterState);
        })
        .appendTo($ul);
    });
    if (!areaList.length) $('#area span').text('全部區域');
  }

  $('#area').on('click', function (e) {
    console.log('區域按鈕有被點到');
    e.stopPropagation();
    if (!filterState.city) return alert('請先選擇城市');
    closeAllDropdownsExcept('areaDropdown');
    fetchAreas(filterState.city, updateAreaDropdown);
    $('#areaDropdown').toggleClass('active');
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
      // 直接存選到的兩個日期
      filterState.checkin = selectedDates[0] ? selectedDates[0].toISOString().split('T')[0] : "";
      filterState.checkout = selectedDates[1] ? selectedDates[1].toISOString().split('T')[0] : "";
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

  function calculateNights(checkin, checkout) {
    if (!checkin || !checkout) return '-';
    const inDate = new Date(checkin);
    const outDate = new Date(checkout);
    const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : '-';
  }

  //Dropdowns & 篩選
  function closeAllDropdownsExcept(exceptId) {
    $('.dropdown-menu').not('#' + exceptId).removeClass('active');
  }

  // 通用 Dropdown 設定
  function setupDropdown({ buttonId, dropdownId, spanSelector, options, onSelect }) {
    const $btn = $(`#${buttonId}`);
    const $dropdown = $(`#${dropdownId}`);
    const $span = $btn.find(spanSelector);

    const defaultText = $span.text();

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

    $(document).on('click', function (e) {
      if (!$btn.is(e.target) && $dropdown.hasClass('active')) {

        const key = buttonId;
        if (!filterState[key] || (Array.isArray(filterState[key]) && !filterState[key].length)) {
          $span.text(defaultText);
        }
        $dropdown.removeClass('active');
      }
    })
  }
  //控制所有下拉選單
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.dropdown').length) {
      $('.dropdown-menu').removeClass('active');
    }
  });

  const priceOptions = [
    { label: '全部價格', value: '' }, { label: '500~1000', value: '500-1000' },
    { label: '1000~3000', value: '1000-3000' }, { label: '3000~6000', value: '3000-6000' },
    { label: '6000~9000', value: '6000-9000' }, { label: '9000+', value: '9000up' }
  ];
  const facilityOptions = [
    { label: '熱門設施', value: '' },
    { id: 1, label: 'Wi-Fi', value: 'wifi' },
    { id: 2, label: '停車場', value: 'parking' },
    { id: 4, label: '餐廳', value: 'restaurant' },
    { id: 6, label: '自助洗衣', value: 'laundry' },
    { id: 7, label: '寵物友善', value: 'pet' },
    { id: 11, label: '商店', value: 'store' },
    { id: 13, label: '無障礙設施', value: 'accessible' }
  ];
  const scoreOptions = [
    { label: '所有評分', value: '' }, { label: '5 分以上', value: '5' },
    { label: '6 分以上', value: '6' }, { label: '7 分以上', value: '7' },
    { label: '8 分以上', value: '8' }, { label: '9 分以上', value: '9' }
  ];
  const sortOptions = [
    { label: '價格(高價優先)', value: 'price_highest' },
    { label: '評分(由高到低)', value: 'rating_highest' }
  ];

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
    currentPage = 1;
    allLoaded = false;
    fetchHotelsMain(filterState, 1, false);
  });

  //飯店渲染 & 查詢
  function renderHotelList(hotels) {
    console.log("DEBUG 渲染房型", {
      checkin: filterState.checkin,
      checkout: filterState.checkout,
      nights: calculateNights(filterState.checkin, filterState.checkout)
    });
    const $list = $('#hotelList');
    $list.empty();
    if (!hotels || !hotels.length) {
      $list.append(`<div class="no-result text-center py-4">查無資料</div>`);
      updateResultTitle(0);
      return;
    }

    //飯店列表幾晚除錯
    const nights = calculateNights(filterState.checkin, filterState.checkout);
    const adults = filterState.adult ?? '-';
    console.log('>>> 渲染房型, night:', nights, 'checkin:', filterState.checkin, 'checkout:', filterState.checkout);

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
            <div class="hotel-rating">
              <span class="rating-score">
                ${hotel.rating !== undefined && hotel.rating !== null ? hotel.rating.toFixed(1) : ''}
                </span>
              </div>
            <div class="hotel-date">
              ${nights} 晚，${adults} 成人<br>
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

  //動態新增所有飯店
  function appendHotelList(hotels) {
    const $list = $('#hotelList');
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
            <div class="hotel-rating">
              <span class="rating-score">
                ${hotel.rating !== undefined && hotel.rating !== null ? hotel.rating.toFixed(1) : ''}
              </span>
            </div>
            <div class="hotel-date">
              ${hotel.night ?? '-'} 晚，${hotel.adults ?? '-'} 成人<br>
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
  }

  function updateResultTitle(count = 0) {
    const cityLabel = cityOptions.find(c => c.value === filterState.city)?.label || '請選擇城市';
    $('#cityText').text(cityLabel);
    $('#hotelCount').text(count);
  }

  //無限滾動及分頁處理
  function fetchHotelsMain(filters, page = 1, append = false) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach(v => params.append(key, v));
      else if (value !== '' && value !== null && typeof value !== 'undefined') params.append(key, value);
    });
    params.append('page', page);
    params.append('size', pageSize);

    loading = true;

    fetch('http://localhost:8080/api/hotels?' + params.toString())
      .then(res => res.json())
      .then(data => {
        const hotels = data.hotels || [];
        if (append) {
          appendHotelList(hotels);
        } else {
          renderHotelList(hotels);
          $('#hotelList').data('total', data.total || 0);
        }
        updateResultTitle(data.total || 0);

        if (hotels.length < pageSize) allLoaded = true;
        else allLoaded = false;
        loading = false;
        // if (!append) currentPage = 1;
      })
      .catch(err => {
        if (!append) {
          $('#hotelList').empty().append(`<div class="no-result text-center py-4">資料載入失敗</div>`);
        }
        loading = false;
      });
  }

  window.openMapMode = function () {
    $('#mapMode').addClass('active');
    renderMapHotelList();
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
        console.log('地圖模式資料:', data);
        const $list = $('#mapHotelList');
        $list.empty();
        const hotels = data.hotels || [];
        console.log('hotels:', hotels);
        if (!hotels.length) {
          $list.append(`<div class="no-result text-center py-4">查無資料</div>`);
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
                   距市中心${hotel.distance ?? '-'}公里
                </div>
                <div class="hotel-type">${hotel.roomType}</div>
              </div>
              <div class="hotel-extra">
                <div class="hotel-rating">
                  <span class="rating-score">
                  ${hotel.rating !== undefined && hotel.rating !== null ? hotel.rating.toFixed(1) : ''}
                  </span>
                </div>
                <div class="hotel-date">
                  ${hotel.night ?? '-'} 晚，${hotel.adults ?? '-'} 成人<br>
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
        initGoogleMap(hotels);
      })
      .catch(err => {
        $('#mapHotelList').empty().append(`<div class="no-result text-center py-4">資料載入失敗</div>`);
      });
  }

  function initGoogleMap(hotels = []) {
    if (!hotels.length) return;

    const center = {
      lat: parseFloat(hotels[0].lat),
      lng: parseFloat(hotels[0].lng)
    };

    const map = new google.maps.Map(document.getElementById("mapContainer"), {
      zoom: 13,
      center: center
    });

    const infoWindow = new google.maps.InfoWindow();

    hotels.forEach(hotel => {
      if (hotel.lat && hotel.lng) {
        const marker = new google.maps.Marker({
          position: { lat: hotel.lat, lng: hotel.lng },
          map: map,
          title: hotel.name,
        });

        marker.addListener('click', function () {
          infoWindow.setContent(`
            <div style="min-width: 180px;">
              <strong>${hotel.name}</strong><br>
              ${hotel.district ?? ''}, ${hotel.city ?? ''}<br>
              <a href="hotel-detail.html?id=${hotel.id}" target="_blank">查看詳情</a>
            </div>
          `);
          infoWindow.open(map, marker);
        });
      }
    });
  }

  // Modal(選項寫死,讓id跟後端取資料)
  const FACILITIES = [
    { id: 1, name: 'Wi-Fi', icon: 'bi bi-wifi' },
    { id: 2, name: '停車場', icon: 'bi bi-p-circle' },
    { id: 3, name: '溫泉', icon: 'bi bi-water' },
    { id: 4, name: '餐廳', icon: 'bi bi-fork-knife' },
    { id: 5, name: '健身房', icon: 'bi bi-person-arms-up' },
    { id: 6, name: '自助洗衣', icon: 'bi bi-disc' },
    { id: 7, name: '寵物友善', icon: 'bi bi-person-hearts' },
    { id: 8, name: '自行車友善', icon: 'bi bi-bicycle' },
    { id: 9, name: '會議室', icon: 'bi bi-chat-left-text' },
    { id: 10, name: '酒吧', icon: 'bi bi-cup-straw' },
    { id: 11, name: '商店', icon: 'bi bi-shop' },
    { id: 12, name: '接送服務', icon: 'bi bi-taxi-front' },
    { id: 13, name: '無障礙設施', icon: 'bi bi-person-wheelchair' }
  ];

  function renderFacilityOptions() {
    const $facilityOptions = $('#facilityOptions');
    $facilityOptions.empty();
    FACILITIES.forEach(f => {
      $facilityOptions.append(`
      <button type="button" class="facility-btn" data-id="${f.id}">
        ${f.name} <i class="${f.icon}"></i>
      </button>
    `);
    });
  }
  renderFacilityOptions();

  let priceSlider, minPriceEl, maxPriceEl, applyBtn;

  //modal右下住宿更新
  function fetchFilteredHotelCount() {
    const params = new URLSearchParams();
    Object.entries(filterState).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach(v => params.append(key, v));
      else if (value !== '' && value !== null && typeof value !== 'undefined') params.append(key, value);
    });
    return fetch('http://localhost:8080/api/hotels/count?' + params.toString())
      .then(res => res.json())
      .then(data => data.count || 0);
  }

  function updateHotelCountText() {
    fetchFilteredHotelCount().then(count => {
      console.log('Fetched hotel count:', count, 'applyBtn:', applyBtn);
      if (applyBtn) {
        applyBtn.textContent = `顯示 ${count}+ 住宿`;
      }
    });
  }

  $(document).on('click', '.facility-btn', function () {
    $(this).toggleClass('active');
    updateFacilityFilterState();
    updateHotelCountText();
  });

  function updateFacilityFilterState() {
    filterState.amenity = [];
    $('.facility-btn.active').each(function () {
      filterState.amenity.push($(this).data('id'));
    });
  }
  $(document).on('click', '.recommend-btn', function () {
    $(this).toggleClass('active');
    updateHotelCountText();
  });

  //modal選項及價錢滑桿控制
  $('#filterModal').on('shown.bs.modal', function () {
    priceSlider = document.getElementById('priceSlider');
    minPriceEl = document.getElementById('minPrice');
    maxPriceEl = document.getElementById('maxPrice');
    applyBtn = document.querySelector('.btn-apply');

    if (priceSlider && !priceSlider.noUiSlider) {
      noUiSlider.create(priceSlider, {
        start: [1000, 5000],
        connect: true,
        range: { min: 500, max: 10000 },
        step: 100,
        format: {
          to: value => Math.round(value),
          from: value => Number(value)
        }
      });
      priceSlider.noUiSlider.on('update', function (values) {
        minPriceEl.textContent = values[0];
        maxPriceEl.textContent = values[1];
        filterState.price = [values[0] + '-' + values[1]];
      });
      priceSlider.noUiSlider.on('change', updateHotelCountText);
    }
    updateHotelCountText();
  });

  $('#filterModal').on('hidden.bs.modal', function () {
    $('.recommend-btn, .facility-btn').removeClass('active');
    filterState.recommend = [];
    filterState.facilities = [];
    filterState.price = [];
    if (priceSlider && priceSlider.noUiSlider) {
      priceSlider.noUiSlider.set([1000, 5000]);
    }
  });

  $('#clearAllBtn').on('click', function () {
    $('.recommend-btn, .facility-btn').removeClass('active');
    filterState.recommend = [];
    filterState.facilities = [];
    filterState.price = [];
    if (priceSlider && priceSlider.noUiSlider) {
      priceSlider.noUiSlider.set([1000, 8000]);
    }
    updateHotelCountText();
  });

  window.applyFilter = function () {
    updateFacilityFilterState();
    $('#filterModal').modal('hide');
    fetchHotelsMain(filterState);
  };

  window.fetchHotelsMain = fetchHotelsMain;
  window.filterState = filterState;
});

//無限滾動
$(window).on('scroll', function () {
  if (loading || allLoaded) return;
  if ($(window).scrollTop() + $(window).height() >= $(document).height() - 300) {
    currentPage++;
    fetchHotelsMain(filterState, currentPage, true);
  }
});