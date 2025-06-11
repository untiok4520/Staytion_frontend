
import { rooms } from './data.js';
import { renderRooms } from './render.js';
import { setupBookingEvents } from './booking.js';
import { setupUI } from './ui.js';

// 網頁載入完成，初始化畫面 事件

document.addEventListener('DOMContentLoaded', () => {
  renderRooms(rooms);         // 房型畫出來
  setupBookingEvents();       // 加入預約選擇計算邏輯
  setupUI();                  // 啟動 UI 控制（愛心、語言、幣別等）
});
