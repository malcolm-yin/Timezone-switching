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

    // Define backend API base URL
    const API_BASE_URL = 'https://timeelsewhere.com/api';

    // Initialize: Display user timezone information
    userTimezoneEl.textContent = `You are in: ${userTimezone.split('/')[1].replace('_', ' ')}`;

    // Function to update clocks
    const updateClocks = () => {
        const now = moment();

        // Update current timezone time
        const userTime = now.tz(userTimezone);
        currentLocalTimeEl.textContent = userTime.format('HH:mm:ss');
        currentTimeEl.textContent = userTime.format('HH:mm:ss');
        currentDateEl.textContent = userTime.format('YYYY-MM-DD');

        // Update target timezone time if set
        if (targetTimezone) {
            const targetTime = now.tz(targetTimezone);
            const targetDate = targetTime.format('YYYY-MM-DD');
            const userDate = userTime.format('YYYY-MM-DD');

            targetTimeEl.textContent = targetTime.format('HH:mm:ss');
            targetDateEl.textContent = targetDate;

            // Update date difference label
            updateDateDiff(userDate, targetDate);
        }

        // Update every second
        setTimeout(updateClocks, 1000);
    };

    // Function to dynamically calculate date difference
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

    // Initialize clocks
    updateClocks();

    // Function to update datalist dynamically
    const updateDatalist = async (query) => {
        if (query.length < 2) {
            citySuggestions.innerHTML = ''; // Clear suggestions
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/autocomplete?term=${encodeURIComponent(query)}`);
            if (response.ok) {
                const cities = await response.json();

                // Clear datalist and dynamically insert options
                citySuggestions.innerHTML = cities.map(city => `<option value="${city}">`).join('');
            } else {
                console.error('Failed to fetch city suggestions:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching city suggestions:', error);
        }
    };

    // Search function
    const handleSearch = async () => {
        const targetLocation = targetLocationInput.value.trim();

        if (!targetLocation) {
            alert('Please enter a city name');
            return;
        }

        let errorEl = document.getElementById('error-message');
        if (!errorEl) {
            errorEl = document.createElement('p');
            errorEl.id = 'error-message';
            errorEl.style.color = 'red';
            errorEl.style.marginTop = '10px';
            document.getElementById('search-bar').appendChild(errorEl);
        }

        try {
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
            targetTimezone = data.timezone; // Update target timezone
            targetLocationNameEl.textContent = data.city; // Update target city name

            // Clear error message
            errorEl.textContent = '';

            // Display results
            initialView.style.display = 'none';
            resultDiv.style.display = 'flex';
        } catch (error) {
            console.error('Error fetching timezone data:', error);
            errorEl.textContent = 'Error connecting to the server.';
        }
    };

    // Input event listener for updating suggestions
    targetLocationInput.addEventListener('input', (event) => {
        const query = event.target.value.trim();
        updateDatalist(query);
    });

    // Button click event
    convertBtn.addEventListener('click', handleSearch);

    // Enter key event listener
    targetLocationInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
});