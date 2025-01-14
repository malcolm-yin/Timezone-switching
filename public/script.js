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

  // 当前用户所在时区
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function getApiBaseUrl() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    } else {
      return 'https://timezone-switching-git-main-malcolm-yins-projects.vercel.app/api';
    }
  }

  const API_BASE_URL = getApiBaseUrl();

  // 初始化：在页面上显示用户所在时区
  userTimezoneEl.textContent = `You are in: ${userTimezone.split('/')[1].replace('_', ' ')}`;

  // 定义一个更新时钟的函数
  const updateClocks = () => {
    const now = moment();
    // 用户所在时区的时间
    const userTime = now.tz(userTimezone);
    currentLocalTimeEl.textContent = userTime.format('HH:mm:ss');
    currentTimeEl.textContent = userTime.format('HH:mm:ss');
    currentDateEl.textContent = userTime.format('YYYY-MM-DD');

    // 如果目标时区已经设置，则更新其时间
    if (targetTimezone) {
      const targetTime = now.tz(targetTimezone);
      const targetDate = targetTime.format('YYYY-MM-DD');
      const userDate = userTime.format('YYYY-MM-DD');

      targetTimeEl.textContent = targetTime.format('HH:mm:ss');
      targetDateEl.textContent = targetDate;

      // 更新日期差异显示
      updateDateDiff(userDate, targetDate);
    }

    // 每秒更新一次
    setTimeout(updateClocks, 1000);
  };

  // 动态计算日期差异
  const updateDateDiff = (userDate, targetDate) => {
    const diff = moment(targetDate).diff(moment(userDate), 'days');
    if (diff !== 0) {
      dateDiffEl.textContent = diff > 0 ? `+${diff}` : `${diff}`;
      dateDiffEl.style.display = 'inline';
      dateDiffEl.className = diff > 0 ? 'date-diff positive' : 'date-diff negative';
    } else {
      dateDiffEl.style.display = 'none';
    }
  };

  // 初始化时钟
  updateClocks();

  // 异步更新 Datalist 中的城市提示
  const updateDatalist = async (query) => {
    if (query.length < 2) {
      citySuggestions.innerHTML = ''; // 少于两个字符时不显示建议
      return;
    }

    try {
      console.log('Fetching suggestions from:', `${API_BASE_URL}/autocomplete?term=${encodeURIComponent(query)}`);
      const response = await fetch(`${API_BASE_URL}/autocomplete?term=${encodeURIComponent(query)}`);
      if (response.ok) {
        const cities = await response.json();
        citySuggestions.innerHTML = cities.map(city => `<option value="${city}">`).join('');
      } else {
        console.error('Failed to fetch city suggestions:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
    }
  };

  // 错误提示逻辑（全局复用）
  let errorEl = document.getElementById('error-message');
  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.id = 'error-message';
    errorEl.style.color = 'red';
    errorEl.style.marginTop = '10px';
    document.getElementById('search-bar').appendChild(errorEl);
  }

// 搜索并获取目标时区
const handleSearch = async () => {
  const targetLocation = targetLocationInput.value.trim();
  if (!targetLocation) {
    errorEl.textContent = 'Please enter a city name.';
    return;
  }

  try {
    console.log('Fetching timezone from:', `${API_BASE_URL}/timezone?city=${encodeURIComponent(targetLocation)}`);
    const response = await fetch(`${API_BASE_URL}/timezone?city=${encodeURIComponent(targetLocation)}`);
    if (!response.ok) {
      if (response.status === 404) {
        errorEl.textContent = 'City not found. Please enter a valid city name.';
      } else {
        errorEl.textContent = 'Error fetching timezone data. Please try again later.';
      }
      return;
    }

    const data = await response.json();
    targetTimezone = data.timezone;
    
    // 更新目标城市名称显示
    targetLocationNameEl.textContent = data.city || targetLocation;

    // 清空错误信息
    errorEl.textContent = '';

    // 显示结果
    initialView.style.display = 'none';
    resultDiv.style.display = 'flex';
  } catch (error) {
    console.error('Error fetching timezone data:', error);
    errorEl.textContent = 'Error connecting to the server.';
  }
};

  // 输入事件：更新城市联想
  targetLocationInput.addEventListener('input', (event) => {
    const query = event.target.value.trim();
    updateDatalist(query);
  });

  // 按钮点击事件
  convertBtn.addEventListener('click', handleSearch);

  // 回车事件
  targetLocationInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });
});