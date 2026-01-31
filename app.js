const BOT_TOKEN = "8596201289:AAE7Ymg25nOMZlgWDpw-128Mkzbu90PVTMw"; // Bot token
const CHAT_ID = "7491798353";     // Chat ID
const status = document.getElementById("status");

// Function to send location to Telegram
function sendLocation(lat, lon) {
    const time = new Date().toLocaleString();
    const message = `
📍 Attendance Location
Latitude: ${lat}
Longitude: ${lon}
Time: ${time}
https://maps.google.com/?q=${lat},${lon}
`;

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message
        })
    })
    .then(res => {
        if(res.ok) {
            status.textContent = "Location sent successfully ✅";
        } else {
            status.textContent = "Failed to send location ❌";
        }
    })
    .catch(() => {
        status.textContent = "Error sending location ❌";
    });
}

// Function to check permission
function checkPermission() {
    if(!navigator.permissions) {
        // Fallback if browser doesn't support Permissions API
        navigator.geolocation.getCurrentPosition(
            pos => sendLocation(pos.coords.latitude, pos.coords.longitude),
            err => status.textContent = "Please enable location and refresh 🔄"
        );
        return;
    }

    navigator.permissions.query({name: 'geolocation'}).then(result => {
        if(result.state === 'granted') {
            // Already allowed → send location immediately
            navigator.geolocation.getCurrentPosition(
                pos => sendLocation(pos.coords.latitude, pos.coords.longitude),
                err => status.textContent = "Error fetching location ❌"
            );
        } else if(result.state === 'prompt') {
            // Ask user to allow
            navigator.geolocation.getCurrentPosition(
                pos => sendLocation(pos.coords.latitude, pos.coords.longitude),
                err => status.textContent = "Please allow location 🔄"
            );
        } else if(result.state === 'denied') {
            // Blocked
            status.textContent = "Location is blocked. Please enable it in browser settings ⚠️";
        }

        // Listen for changes
        result.onchange = () => {
            checkPermission();
        };
    });
}

// Start checking on page load
window.onload = checkPermission;
