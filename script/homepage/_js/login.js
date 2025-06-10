// 導覽列 -------------------------------------------------

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



// 驗證碼-------------------------------------------------

const otpInputs = document.querySelectorAll('.otp-input');

otpInputs.forEach((input) => {
    // 只允許輸入英文和數字
    input.addEventListener('input', function (e) {
        const value = input.value;
        // 正則表達式：只允許英文字母和數字
        const regex = /^[a-zA-Z0-9]*$/;

        if (!regex.test(value)) {
            // 如果輸入的字符不符合英文字母和數字的要求，則清除該輸入框的內容
            input.value = value.slice(0, -1);
        }
    });
});

otpInputs.forEach((input, index) => {
    // 自動跳到下一個輸入框
    input.addEventListener('input', function () {
        if (input.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    // 處理 Backspace 事件
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && input.value === '') {
            // 如果當前框為空，將焦點移動到前一個框
            if (index > 0) {
                otpInputs[index - 1].focus(); // 移動焦點
                otpInputs[index - 1].value = ''; // 清除前一個框的內容
            }
        }
    });
});