
document.addEventListener("DOMContentLoaded", function () {
    const hotelFilter = document.getElementById("hotelFilter");
    const roomGroups = document.querySelectorAll(".hotel-rooms");
    const summaryTbody = document.getElementById("summary-rooms");

    hotelFilter.addEventListener("change", function () {
        const selected = this.value;

        if (selected === "all") {
            roomGroups.forEach(group => group.classList.add("d-none"));
            summaryTbody.classList.remove("d-none");

            // 初始化統計資料
            const roomSummary = {};

            roomGroups.forEach(group => {
                group.querySelectorAll("tr").forEach(row => {
                    const roomName = row.children[0].innerText;
                    const totalRooms = parseInt(row.children[1].innerText);
                    const availRooms = parseInt(row.children[2].innerText);
                    const status = row.children[3].innerText;
                    const priceText = row.children[4].innerText.replace(/\$/g, '');
                    const price = parseInt(priceText);

                    if (!roomSummary[roomName]) {
                        roomSummary[roomName] = {
                            count: 0,
                            avail: 0,
                            status: status,
                            priceTotal: 0,
                            countEntries: 0
                        };
                    }

                    roomSummary[roomName].count += totalRooms;
                    roomSummary[roomName].avail += availRooms;
                    roomSummary[roomName].priceTotal += price;
                    roomSummary[roomName].countEntries += 1;
                });
            });

            // 清空 summary 表格
            summaryTbody.innerHTML = "";

            // 將統計資料轉為表格列
            for (const [name, data] of Object.entries(roomSummary)) {
                const avgPrice = Math.round(data.priceTotal / data.countEntries);
                summaryTbody.innerHTML += `
                    <tr style="background-color: #f9f9f9;">
                        <td>${name}（加總）</td>
                        <td>${data.count}</td>
                        <td>${data.avail}</td>
                        <td>${data.status}</td>
                        <td>$${avgPrice}</td>
                        <td>
                            <button class="btn btn-sm btn-primary">編輯</button>
                            <button class="btn btn-sm btn-outline-danger">下架</button>
                        </td>
                    </tr>
                `;
            }
        } else {
            // 顯示指定飯店資料
            roomGroups.forEach(group => {
                group.classList.toggle("d-none", group.dataset.hotel !== selected);
            });
            summaryTbody.classList.add("d-none");
        }
    });

    // 預設觸發一次
    hotelFilter.dispatchEvent(new Event("change"));
});

