document.addEventListener('DOMContentLoaded', () => {
    const targetLocationInput = document.getElementById('target-location');
    const citySuggestions = document.getElementById('city-suggestions');

    const userTimezoneEl = document.getElementById('user-timezone');
    const currentLocalTimeEl = document.getElementById('current-local-time');
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

    // 定义后端 API 基础地址
    const API_BASE_URL = 'timezone-switching.vercel.app'; // 替换为实际的后端地址

    // 初始化：显示用户当前时区信息
    userTimezoneEl.textContent = `You are in: ${userTimezone.split('/')[1].replace('_', ' ')}`;

    // 更新时钟的函数
    const updateClocks = () => {
        const now = moment();

        // 更新当前时区时间
        const userTime = now.tz(userTimezone);
        currentLocalTimeEl.textContent = userTime.format('HH:mm:ss');
        currentTimeEl.textContent = userTime.format('HH:mm:ss');
        currentDateEl.textContent = userTime.format('YYYY-MM-DD');

        // 如果目标时区已设置，更新目标时区时间
        if (targetTimezone) {
            const targetTime = now.tz(targetTimezone);
            const targetDate = targetTime.format('YYYY-MM-DD');
            const userDate = userTime.format('YYYY-MM-DD');

            targetTimeEl.textContent = targetTime.format('HH:mm:ss');
            targetDateEl.textContent = targetDate;

            // 更新日期差异标签
            updateDateDiff(userDate, targetDate);
        }

        // 每秒更新一次
        setTimeout(updateClocks, 1000);
    };

    // 动态计算日期差异并更新标签
    const updateDateDiff = (userDate, targetDate) => {
        const dateDiff = moment(targetDate).diff(moment(userDate), 'days');
        if (dateDiff !== 0) {
            dateDiffEl.textContent = dateDiff > 0 ? `+${dateDiff}` : `${dateDiff}`;
            dateDiffEl.style.display = 'inline';
            dateDiffEl.className = dateDiff > 0 ? 'date-diff positive' : 'date-diff negative';
        } else {
            dateDiffEl.style.display = 'none';
        }
    };

    // 初始化时钟
    updateClocks();

    // 动态更新 datalist 的函数
    const updateDatalist = async (query) => {
        if (query.length < 2) {
            citySuggestions.innerHTML = ""; // 清空建议
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/autocomplete?term=${encodeURIComponent(query)}`);
            if (response.ok) {
                const cities = await response.json();

                // 清空 datalist 并动态插入候选项
                citySuggestions.innerHTML = cities.map(city => `<option value="${city}">`).join('');
            } else {
                console.error("Failed to fetch city suggestions:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching city suggestions:", error);
        }
    };

    // 搜索功能
    const handleSearch = async () => {
        const targetLocation = targetLocationInput.value.trim();

        if (!targetLocation) {
            alert("Please enter a city name");
            return;
        }

        let errorEl = document.getElementById("error-message");
        if (!errorEl) {
            errorEl = document.createElement("p");
            errorEl.id = "error-message";
            errorEl.style.color = "red";
            errorEl.style.marginTop = "10px";
            document.getElementById("search-bar").appendChild(errorEl);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/timezone?city=${encodeURIComponent(targetLocation)}`);
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
    };

    // 输入事件监听，用于更新表单提示
    targetLocationInput.addEventListener('input', (event) => {
        const query = event.target.value.trim();
        updateDatalist(query);
    });

    // 按钮点击事件
    convertBtn.addEventListener('click', handleSearch);

    // 回车键事件监听
    targetLocationInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
});
