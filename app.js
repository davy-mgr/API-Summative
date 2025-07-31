const form = document.getElementById('alertForm');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const alertList = document.getElementById('alertList');

let pollingInterval = null;
let lastEventTime = null;

function notifyUser(title, message) {
  if (!("Notification" in window)) {
    alert(`${title}\n${message}`);
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(title, { body: message });
      } else {
        alert(`${title}\n${message}`);
      }
    });
  } else {
    alert(`${title}\n${message}`);
  }
}

async function fetchEarthquakes(minMagnitude, latitude, longitude, radius, startTime) {
  const baseUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
  const params = new URLSearchParams({
    format: 'geojson',
    minmagnitude: minMagnitude,
    latitude: latitude,
    longitude: longitude,
    maxradiuskm: radius,
    starttime: startTime.toISOString()
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch earthquake data');
    const data = await res.json();
    return data.features || [];
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    return [];
  }
}

function addAlert(quake) {
  const { place, mag, time } = quake.properties;
  const date = new Date(time);
  const li = document.createElement('li');
  li.textContent = `M${mag.toFixed(1)} - ${place} at ${date.toLocaleString()}`;
  alertList.prepend(li);
}

async function pollEarthquakes(settings) {
  const { minMagnitude, latitude, longitude, radius } = settings;

  const now = new Date();
  let startTime = lastEventTime || new Date(now.getTime() - 60000);

  const quakes = await fetchEarthquakes(minMagnitude, latitude, longitude, radius, startTime);

  if (quakes.length > 0) {
    quakes.forEach(q => {
      addAlert(q);
      notifyUser('Earthquake Alert!', `M${q.properties.mag.toFixed(1)} near ${q.properties.place}`);
    });
    lastEventTime = new Date(quakes[0].properties.time);
  } else {
    lastEventTime = now;
  }
}

function startMonitoring() {
  const minMagnitude = parseFloat(document.getElementById('minMagnitude').value);
  const latitude = parseFloat(document.getElementById('latitude').value);
  const longitude = parseFloat(document.getElementById('longitude').value);
  const radius = parseInt(document.getElementById('radius').value, 10);

  if (
    isNaN(minMagnitude) || isNaN(latitude) ||
    isNaN(longitude) || isNaN(radius)
  ) {
    alert('Please enter valid input values.');
    return;
  }

  const settings = { minMagnitude, latitude, longitude, radius };

  pollEarthquakes(settings);

  pollingInterval = setInterval(() => pollEarthquakes(settings), 60000);

  startBtn.disabled = true;
  stopBtn.disabled = false;
}

function stopMonitoring() {
  clearInterval(pollingInterval);
  pollingInterval = null;
  lastEventTime = null;

  startBtn.disabled = false;
  stopBtn.disabled = true;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  startMonitoring();
});

stopBtn.addEventListener('click', stopMonitoring);
