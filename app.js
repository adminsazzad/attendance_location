const BOT_TOKEN = "8596201289:AAE7Ymg25nOMZlgWDpw-128Mkzbu90PVTMw"; // Telegram Bot Token
const CHAT_ID = "7491798353";     // Chat ID
const status = document.getElementById("status");

// One-time daily send check using localStorage
function hasSentToday() {
    const lastSent = localStorage.getItem('attendanceLastSent');
    if(!lastSent) return false;
    const lastDate = new Date(lastSent).toDateString();
    const today = new Date().toDateString();
    return lastDate === today;
}

function markSent() {
    localStorage.setItem('attendanceLastSent', new Date());
}

// Send location to Telegram
function sendLocation(lat, lon) {
    if(hasSentToday()) {
        status.textContent = "Location already sent today ✅";
        return;
    }

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    })
    .then(res => {
        if(res.ok) {
            status.textContent = "Location sent successfully ✅";
            markSent();
        } else {
            status.textContent = "Failed to send location ❌";
        }
    })
    .catch(() => {
        status.textContent = "Error sending location ❌";
    });
}

// Request or check location
function requestLocation() {
    if (!navigator.geolocation) {
        status.textContent = "Geolocation is not supported by your browser";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => sendLocation(pos.coords.latitude, pos.coords.longitude),
        err => {
            if(err.code === err.PERMISSION_DENIED) {
                status.textContent = "Please allow location to send attendance 📍";
            } else if(err.code === err.POSITION_UNAVAILABLE) {
                status.textContent = "Location unavailable";
            } else if(err.code === err.TIMEOUT) {
                status.textContent = "Location request timed out";
            } else {
                status.textContent = "Unknown error";
            }
        }
    );
}

// Detect permission state and auto send
function checkPermission() {
    if(navigator.permissions) {
        navigator.permissions.query({name:'geolocation'}).then(result => {
            if(result.state === 'granted') {
                requestLocation();
            } else if(result.state === 'prompt') {
                requestLocation();
            } else if(result.state === 'denied') {
                status.textContent = "Location blocked. Please enable it in browser settings ⚠️";
            }
            result.onchange = () => {
                requestLocation();
            };
        });
    } else {
        // Fallback
        requestLocation();
    }
}

// On page load
window.onload = checkPermission;
