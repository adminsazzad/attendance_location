const BOT_TOKEN = "8596201289:AAE7Ymg25nOMZlgWDpw-128Mkzbu90PVTMw"; // Bot token
const CHAT_ID = "7491798353";     // Chat ID
const sendButton = document.getElementById("sendLocation");
const status = document.getElementById("status");

sendButton.addEventListener("click", () => {
    status.textContent = "Requesting location...";
    
    if (!navigator.geolocation) {
        status.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    navigator.geolocation.getCurrentPosition(success, error);
});

function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
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
            sendButton.disabled = true; // prevent multiple sends
        } else {
            status.textContent = "Failed to send location ❌";
        }
    })
    .catch(() => {
        status.textContent = "Error sending location ❌";
    });
}

function error() {
    status.textContent = "Location permission denied ❌";
}
