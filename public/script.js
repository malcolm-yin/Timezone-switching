document.addEventListener('DOMContentLoaded', () => {
    const userTimezoneEl = document.getElementById('user-timezone');
    const currentLocalTimeEl = document.getElementById('current-local-time');
    const targetLocationInput = document.getElementById('target-location');
    const convertBtn = document.getElementById('convert-btn');
    const initialView = document.getElementById('initial-view');
    const resultDiv = document.getElementById('result');
    const currentLocationEl = document.getElementById('current-location');
    const currentTimeEl = document.getElementById('current-time');
    const currentDateEl = document.getElementById('current-date');
    const targetLocationNameEl = document.getElementById('target-location-name');
    const targetTimeEl = document.getElementById('target-time');
    const targetDateEl = document.getElementById('target-date');
    const timeDiffEl = document.getElementById('time-diff');
    const dateDiffEl = document.getElementById('date-diff');

    let targetTimezone = null;

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 显示初始状态
    userTimezoneEl.textContent = `You are in: ${userTimezone.split('/')[1].replace('_', ' ')}`;

    // 更新时钟的函数
    const updateClocks = () => {
        const now = moment();

        // 更新当前时区时间
        const userTime = now.tz(userTimezone);
        currentLocalTimeEl.textContent = userTime.format('HH:mm:ss');
        currentTimeEl.textContent = userTime.format('HH:mm:ss');
        currentDateEl.textContent = userTime.format('YYYY-MM-DD');

        // 如果目标时区已设置，动态更新目标时区时间
        if (targetTimezone) {
            const targetTime = now.tz(targetTimezone);
            targetTimeEl.textContent = targetTime.format('HH:mm:ss');
            targetDateEl.textContent = targetTime.format('YYYY-MM-DD');

            // 动态计算日期差异
            const userDate = now.tz(userTimezone).format('YYYY-MM-DD');
            const targetDate = now.tz(targetTimezone).format('YYYY-MM-DD');
            const dateDiff = moment(targetDate).diff(moment(userDate), 'days');
            if (dateDiff !== 0) {
                dateDiffEl.textContent = dateDiff > 0 ? `+${dateDiff}` : `${dateDiff}`;
                dateDiffEl.style.display = 'inline';
            } else {
                dateDiffEl.style.display = 'none';
            }
        }

        // 每秒更新一次
        setTimeout(updateClocks, 1000);
    };

    // 初始化时钟
    updateClocks();

    // 搜索功能
    convertBtn.addEventListener('click', async () => {
        const targetLocation = targetLocationInput.value.trim();
    
        if (!targetLocation) {
            alert("Please enter a city name");
            return;
        }
    
        // 获取或创建错误提示元素
        let errorEl = document.getElementById("error-message");
        if (!errorEl) {
            errorEl = document.createElement("p");
            errorEl.id = "error-message";
            errorEl.style.color = "red";
            errorEl.style.marginTop = "10px";
            document.getElementById("search-bar").appendChild(errorEl);
        }
    
        try {
            const response = await fetch(`http://localhost:3000/timezone?city=${encodeURIComponent(targetLocation)}`);
            if (!response.ok) {
                if (response.status === 404) {
                    errorEl.textContent = "City not found. Please enter a valid city name.";
                } else {
                    errorEl.textContent = "Error fetching timezone data. Please try again later.";
                }
                return;
            }
    
            const data = await response.json();
            targetTimezone = data.timezone; // 更新目标时区
            targetLocationNameEl.textContent = data.city; // 更新目标城市名称
    
            // 清除错误信息
            errorEl.textContent = "";
    
            // 显示结果
            initialView.style.display = 'none';
            resultDiv.style.display = 'flex';
        } catch (error) {
            console.error("Error fetching timezone data:", error);
            errorEl.textContent = "Error connecting to the server.";
        }
    });    
});
