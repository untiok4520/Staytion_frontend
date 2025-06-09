const reviews = [
  {
    id: 1,
    name: "王小明",
    hotel: "台北民宿一館",
    room: "雙人房",
    time: "2025/06/01",
    score: 9,
    content: "房間乾淨舒適，交通方便。",
    reply: "謝謝您的肯定！歡迎再次入住。"
  },
  {
    id: 2,
    name: "林小花",
    hotel: "花蓮海景套房",
    room: "海景房",
    time: "2025/05/25",
    score: 8,
    content: "景色漂亮但隔音稍差。",
    reply: ""
  },
  {
    id: 3,
    name: "陳大雄",
    hotel: "台中青年旅店",
    room: "背包床位",
    time: "2025/05/20",
    score: 6,
    content: "床鋪有點硬，建議更換。",
    reply: ""
  }
];

const reviewList = document.getElementById("reviewList");
const avgRating = document.getElementById("avgRating");

function renderReviews() {
  let total = 0;
  reviewList.innerHTML = "";
  reviews.forEach((r) => {
    total += r.score;
    const card = document.createElement("div");
    card.className = "col-12";
    card.innerHTML = `
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <div>
                  <h6 class="mb-1">${r.name} · ${r.hotel} · ${r.room}</h6>
                  <small class="text-muted">留言時間：${r.time}</small>
                </div>
                <div>
                  <span class="badge bg-${r.score >= 8 ? "success" : r.score >= 6 ? "warning text-dark" : "danger"} fs-6">${r.score} / 10</span>
                </div>
              </div>
              <p>${r.content}</p>
              ${r.reply ? `<div class="alert alert-secondary small"><strong>業者回覆：</strong>${r.reply}</div>` : ""}
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-danger">修改</button>
                ${r.reply
        ? `<button class="btn btn-sm btn-outline-success" disabled>已回覆</button>`
        : `<button class="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#replyBox${r.id}">回覆</button>`
      }
              </div>
              <div class="collapse mt-2" id="replyBox${r.id}">
                <textarea class="form-control mb-2" rows="2" placeholder="輸入回覆內容..."></textarea>
                <div class="text-end">
                  <button class="btn btn-primary btn-sm" onclick="sendReply(${r.id})">送出回覆</button>
                </div>
              </div>
            </div>
          </div>
        `;
    reviewList.appendChild(card);
  });
  avgRating.textContent = (total / reviews.length).toFixed(1) + " / 10";
}

function sendReply(id) {
  const textarea = document.querySelector(`#replyBox${id} textarea`);
  const value = textarea.value.trim();
  if (value) {
    const target = reviews.find((r) => r.id === id);
    target.reply = value;
    renderReviews();
    new bootstrap.Toast(document.getElementById("replyToast")).show();
  }
}

document.addEventListener("DOMContentLoaded", renderReviews);