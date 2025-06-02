// 找出所有「貨幣下拉」選項，選擇時更新按鈕文字
document
  .querySelectorAll("#currencyDropdown + .dropdown-menu .dropdown-item")
  .forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      // 只顯示貨幣代號（取最後一段，例如「美元 USD」取「USD」）
      const fullText = this.textContent.trim();
      const parts = fullText.split(" ");
      const code = parts[parts.length - 1];
      document.getElementById("currencyDropdown").textContent = code;
    });
  });
document
  .querySelectorAll("#currencyDropdown2 + .dropdown-menu .dropdown-item")
  .forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      // 只顯示貨幣代號（取最後一段，例如「美元 USD」取「USD」）
      const fullText = this.textContent.trim();
      const parts = fullText.split(" ");
      const code = parts[parts.length - 1];
      document.getElementById("currencyDropdown2").textContent = code;
    });
  });
