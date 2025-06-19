$(document).ready(function () {
    const apiKey = 'ee0d0c516bd238331a8763258938b597';

    function switchTab(tabId) {
        $('.tab-btn').removeClass('active');
        $('.tab-content').removeClass('active');
        $(`.tab-btn[data-tab=${tabId}]`).addClass('active');
        $(`#${tabId}`).addClass('active');
    }

    function getEmoji(iconCode) {
        const map = {
            '01d': '☀️', '01n': '🌑',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '🌩️', '11n': '🌩️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return map[iconCode] || '❓';
    }

    $('.tab-btn').click(function () {
        const tabId = $(this).data('tab');
        switchTab(tabId);
    });

    $('#searchBtn').click(function () {
        const city = $('#cityInput').val();
        if (city) {
            fetchWeather(city);
            fetchForecast(city);
        }
    });

    function fetchNearbyCitiesWeather(lat, lon) {
        $.get(`https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=5&appid=${apiKey}&units=metric`, function (data) {
            let html = '<h3>Nearby Cities</h3>';
            data.list.forEach(city => {
                const emoji = getEmoji(city.weather[0].icon);
                html += `<p>${emoji} ${city.name}: ${city.main.temp}°C</p>`;
            });
            $('#nearbyCities').html(html);
        });
    }

    function fetchWeather(city) {
        $.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`, function (data) {
            const emoji = getEmoji(data.weather[0].icon);
            $('#todayWeather').html(`
                <h2>Weather in ${data.name}</h2>
                <p>${new Date(data.dt * 1000).toLocaleDateString()}</p>
                <p style="font-size: 30px;">${emoji}</p>
                <p>${data.weather[0].description}, ${data.main.temp}°C (feels like ${data.main.feels_like}°C)</p>
                <p>Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
                <p>Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
            `);
            fetchNearbyCitiesWeather(data.coord.lat, data.coord.lon);
        }).fail(function () {
            $('#todayWeather').html('<p>City not found or error loading data.</p>');
        });
    }

    function fetchForecast(city) {
        $.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`, function (data) {
            let grouped = {};
            data.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0];
                if (!grouped[date]) grouped[date] = [];
                grouped[date].push(item);
            });

            let html = '';
            Object.keys(grouped).slice(0, 5).forEach(date => {
                const day = grouped[date][0];
                const emoji = getEmoji(day.weather[0].icon);
                html += `
                    <div>
                        <h3>${new Date(date).toLocaleDateString()}</h3>
                        <span style="font-size: 30px;">${emoji}</span>
                        <p>${day.weather[0].description}, ${day.main.temp}°C</p>
                    </div>
                `;
            });
            $('#fiveDayWeather').html(html);
        });
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            $.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, function (data) {
                $('#cityInput').val(data.name);
                fetchWeather(data.name);
                fetchForecast(data.name);
            });
        });
    }
});
