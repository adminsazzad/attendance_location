const BOT_TOKEN = "8596201289:AAE7Ymg25nOMZlgWDpw-128Mkzbu90PVTMw";
const CHAT_ID = "7491798353";
const status = document.getElementById("status");

// One-time daily send check
function hasSentToday() {
    const lastSent = localStorage.getItem('attendanceLastSent');
    if(!lastSent) return false;
    return new Date(lastSent).toDateString() === new Date().toDateString();
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
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({chat_id: CHAT_ID, text: message})
    })
    .then(res => {
        if(res.ok) {
            status.textContent = "Location sent successfully ✅";
            markSent();
        } else {
            status.textContent = "Failed to send location ❌";
        }
    })
    .catch(() => status.textContent = "Error sending location ❌");
}

// Main function: Request location
function requestLocation() {
    if(!navigator.geolocation) {
        status.textContent = "Geolocation not supported by your browser";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => sendLocation(pos.coords.latitude, pos.coords.longitude),
        err => {
            if(err.code === err.PERMISSION_DENIED) {
                // User blocked or location OFF → show alert
                status.textContent = "Please turn ON location and click Allow 📍";

                // Try again after short delay in case user allows later
                const checkInterval = setInterval(() => {
                    navigator.geolocation.getCurrentPosition(
                        pos2 => {
                            sendLocation(pos2.coords.latitude, pos2.coords.longitude);
                            clearInterval(checkInterval);
                        },
                        err2 => {
                            // still denied → wait
                        }
                    );
                }, 3000);
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

// On page load
window.onload = requestLocation;
