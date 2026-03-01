        // Initialize Map
        const map = L.map('map').setView([11.1271, 78.6569], 8); // Tamil Nadu center

        // Add base layers
        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        });

        // Layer groups
        const accidentLayer = L.layerGroup().addTo(map);
        const hospitalLayer = L.layerGroup().addTo(map);
        const routeLayer = L.layerGroup().addTo(map);
        const weatherLayer = L.layerGroup().addTo(map);
        const liveUpdatesLayer = L.layerGroup().addTo(map);
        const speedCameraLayer = L.layerGroup().addTo(map);

        // Dark Theme Map Layers
        const darkThemeLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        });

        // Speech Synthesis Engine
        function speak(text) {
            if (document.getElementById('voice-navigation') && document.getElementById('voice-navigation').checked) {
                if ('speechSynthesis' in window) {
                    // Cancel any previous
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = 1.0;
                    utterance.pitch = 1.1;
                    window.speechSynthesis.speak(utterance);
                }
            }
        }

        // Application state
        let currentWeather = {};
        let hospitals = [];
        let accidentZones = [];
        let currentRoute = null;
        let userLocation = null;
        let isDriving = false;
        let drivingInterval = null;
        let currentPositionIndex = 0;
        let weatherStations = [];
        let liveHospitalUpdates = [];

        // Tamil Nadu specific data
        const tamilNaduData = {
            cities: {
                'Chennai Central': [13.0827, 80.2707],
                'Coimbatore Junction': [11.0168, 76.9558],
                'Madurai': [9.9252, 78.1198],
                'Salem': [11.6643, 78.1460],
                'Trichy': [10.7905, 78.7047],
                'Vellore': [12.9165, 79.1325],
                'Erode': [11.3410, 77.7172],
                'Tirunelveli': [8.7139, 77.7567]
            },
            accidentZones: [
                { id: 1, name: "Kathipara Junction, Chennai", lat: 13.0059, lng: 80.1992, risk: "high", accidents: 156, description: "Complex intersection with high pedestrian traffic", roadCondition: "poor" },
                { id: 2, name: "Maduravoyal Expressway", lat: 13.0659, lng: 80.1802, risk: "high", accidents: 89, description: "High-speed corridor with frequent accidents", roadCondition: "moderate" },
                { id: 3, name: "NH44 Salem Bypass", lat: 11.6542, lng: 78.1472, risk: "high", accidents: 134, description: "National highway bypass with sharp curves", roadCondition: "moderate" },
                { id: 4, name: "Coimbatore Avinashi Road", lat: 11.0168, lng: 76.9558, risk: "medium", accidents: 78, description: "Industrial corridor with heavy truck traffic", roadCondition: "good" },
                { id: 5, name: "Kodaikanal Ghat Road", lat: 10.2381, lng: 77.4892, risk: "high", accidents: 112, description: "Mountain road with sharp curves and poor visibility", roadCondition: "poor" }
            ],
            hospitals: [
                { id: 1, name: "Apollo Main", lat: 13.0827, lng: 80.2707, type: "Multi-specialty", emergency: true, phone: "044-28293333", distance: "2.5 km", beds: 45, ambulances: 3 },
                { id: 2, name: "KMCH Coimbatore", lat: 11.0168, lng: 76.9558, type: "Multi-specialty", emergency: true, phone: "0422-2627788", distance: "3.1 km", beds: 32, ambulances: 2 },
                { id: 3, name: "Madurai Medical College", lat: 9.9252, lng: 78.1198, type: "Government", emergency: true, phone: "0452-2532580", distance: "1.8 km", beds: 28, ambulances: 4 },
                { id: 4, name: "Salem Government Hospital", lat: 11.6643, lng: 78.1460, type: "Government", emergency: true, phone: "0427-2446600", distance: "2.2 km", beds: 36, ambulances: 2 },
                { id: 5, name: "Trichy Emergency Care", lat: 10.7905, lng: 78.7047, type: "Private", emergency: true, phone: "0431-4020505", distance: "4.5 km", beds: 24, ambulances: 1 }
            ],
            speedCameras: [
                { id: 1, name: "NH48 Toll Plaza", type: "toll", lat: 12.8916, lng: 79.8821, fee: "₹125", info: "Fastag Only" },
                { id: 2, name: "GST Road Speed Cam", type: "camera", lat: 12.7845, lng: 80.0152, limit: "80 km/h", info: "Automatic speedenforcement" },
                { id: 3, name: "L&T Bypass Toll", type: "toll", lat: 10.9254, lng: 77.0143, fee: "₹65", info: "Cash/Fastag" },
                { id: 4, name: "Avinashi Road Speed Cam", type: "camera", lat: 11.0333, lng: 77.0091, limit: "60 km/h", info: "School zone limits ahead" }
            ]
        };

        // Initialize application
        document.addEventListener('DOMContentLoaded', function () {
            initializeApp();
        });

        function initializeApp() {
            loadAccidentZones();
            loadHospitals();
            loadSpeedCameras();
            initializeWeatherStations();
            initializeWeather();
            setupEventListeners();
            startRealTimeUpdates();
            setupCityAutocomplete();
        }

        function initializeWeatherStations() {
            weatherStations = [
                { id: 1, city: "Chennai", lat: 13.0827, lng: 80.2707, temp: 32, condition: "Partly Cloudy", visibility: 8 },
                { id: 2, city: "Coimbatore", lat: 11.0168, lng: 76.9558, temp: 28, condition: "Clear", visibility: 10 },
                { id: 3, city: "Madurai", lat: 9.9252, lng: 78.1198, temp: 30, condition: "Sunny", visibility: 12 },
                { id: 4, city: "Salem", lat: 11.6643, lng: 78.1460, temp: 27, condition: "Cloudy", visibility: 6 },
                { id: 5, city: "Trichy", lat: 10.7905, lng: 78.7047, temp: 31, condition: "Hazy", visibility: 5 }
            ];
        }

        function setupCityAutocomplete() {
            const startInput = document.getElementById('start-input');
            const endInput = document.getElementById('end-input');

            startInput.addEventListener('input', function () {
                showCitySuggestions(this, 'start');
            });
            endInput.addEventListener('input', function () {
                showCitySuggestions(this, 'end');
            });

            const swapBtn = document.getElementById('swap-locations');
            if (swapBtn) {
                swapBtn.addEventListener('click', () => {
                    const temp = startInput.value;
                    startInput.value = endInput.value;
                    endInput.value = temp;
                    routeLayer.clearLayers();
                });
            }

            // Close dropdowns on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-input-wrapper')) {
                    document.querySelectorAll('.autocomplete-dropdown').forEach(d => d.style.display = 'none');
                }
            });
        }

        function showCitySuggestions(input, type) {
            const value = input.value.toLowerCase();
            const dropdown = document.getElementById(`${type}-autocomplete`);
            if (!dropdown) return;
            dropdown.innerHTML = '';

            if (!value) {
                dropdown.style.display = 'none';
                return;
            }

            const matches = Object.keys(tamilNaduData.cities).filter(city =>
                city.toLowerCase().includes(value)
            );

            if (matches.length > 0) {
                matches.forEach(match => {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-item';
                    div.innerHTML = `<i class="fas fa-map-pin" style="color: var(--text-secondary); margin-right: 8px;"></i> ${match}`;
                    div.onclick = () => {
                        input.value = match;
                        dropdown.style.display = 'none';
                    };
                    dropdown.appendChild(div);
                });
                dropdown.style.display = 'block';
            } else {
                dropdown.style.display = 'none';
            }
        }

        function loadAccidentZones() {
            accidentZones = tamilNaduData.accidentZones;

            accidentZones.forEach(zone => {
                const riskColor = zone.risk === 'high' ? '#e74c3c' : zone.risk === 'medium' ? '#f39c12' : '#27ae60';
                const riskIcon = L.divIcon({
                    className: 'risk-marker',
                    html: `<div style="background-color: ${riskColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                const marker = L.marker([zone.lat, zone.lng], { icon: riskIcon })
                    .addTo(accidentLayer)
                    .bindPopup(`
                        <div style="min-width: 250px;">
                            <h3 style="color: ${riskColor}; margin-bottom: 10px;">
                                <i class="fas fa-exclamation-triangle"></i> ${zone.name}
                            </h3>
                            <p><strong>Risk Level:</strong> ${zone.risk.toUpperCase()}</p>
                            <p><strong>Accidents Reported:</strong> ${zone.accidents}</p>
                            <p><strong>Road Condition:</strong> ${zone.roadCondition}</p>
                            <p><strong>Description:</strong> ${zone.description}</p>
                            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                                <i class="fas fa-lightbulb"></i> <strong>Safety Tip:</strong> ${getSafetyTip(zone.risk)}
                            </div>
                        </div>
                    `);

                // Add to risk zones list
                const riskItem = document.createElement('div');
                riskItem.className = `risk-card ${zone.risk}`;

                let iconClass = 'fa-exclamation-triangle';
                if (zone.risk === 'high') iconClass = 'fa-radiation';
                else if (zone.risk === 'medium') iconClass = 'fa-car-crash';
                else iconClass = 'fa-shield-alt';

                riskItem.innerHTML = `
                    <div class="card-icon"><i class="fas ${iconClass}"></i></div>
                    <div class="card-content">
                        <div class="card-title">${zone.name}</div>
                        <div class="card-subtitle">${zone.description}</div>
                        <div class="card-footer">
                            <span><i class="fas fa-car-side"></i> ${zone.accidents} accidents</span>
                            <span style="color: var(--${zone.risk === 'high' ? 'danger' : zone.risk === 'medium' ? 'warning' : 'success'}); font-weight: 700;">${zone.risk.toUpperCase()} RISK</span>
                        </div>
                    </div>
                `;
                document.getElementById('risk-zones-list').appendChild(riskItem);
            });
        }

        function loadSpeedCameras() {
            tamilNaduData.speedCameras.forEach(item => {
                const iconClass = item.type === 'camera' ? 'speed-camera-marker' : 'toll-marker';
                const iconHtml = item.type === 'camera' ? '<i class="fas fa-camera text-white" style="font-size:10px; margin:2px;"></i>' : '<i class="fas fa-coins text-white" style="font-size:10px; margin:2px;"></i>';

                const itemIcon = L.divIcon({
                    className: iconClass,
                    html: `<div style="display:flex; justify-content:center; align-items:center; width: 100%; height: 100%;">${iconHtml}</div>`,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });

                L.marker([item.lat, item.lng], { icon: itemIcon })
                    .addTo(speedCameraLayer)
                    .bindPopup(`
                        <div style="min-width: 200px;">
                            <h4 style="color: var(--text-primary); margin-bottom: 5px;">
                                <i class="fas ${item.type === 'camera' ? 'fa-camera' : 'fa-coins'}"></i> ${item.name}
                            </h4>
                            <p style="color: var(--text-secondary);"><strong>Type:</strong> ${item.type === 'camera' ? 'Speed Camera' : 'Toll Booth'}</p>
                            ${item.type === 'camera' ? `<p style="color: var(--danger);"><strong>Speed Limit:</strong> ${item.limit}</p>` : `<p style="color: var(--warning);"><strong>Fee:</strong> ${item.fee}</p>`}
                            <p style="color: var(--text-secondary); font-size: 0.9em; margin-top: 5px;">${item.info}</p>
                        </div>
                    `);
            });
        }

        function loadHospitals() {
            hospitals = tamilNaduData.hospitals;
            const hospitalList = document.getElementById('hospital-list');

            hospitals.forEach(hospital => {
                createHospitalMarker(hospital);

                // Add to hospital list
                const hospitalItem = document.createElement('div');
                hospitalItem.className = 'hospital-card';
                let hospIcon = hospital.type.toLowerCase().includes('govt') || hospital.type.toLowerCase().includes('government') ? 'fa-building' : 'fa-hospital-symbol';
                hospitalItem.innerHTML = `
                    <div class="card-icon"><i class="fas ${hospIcon}"></i></div>
                    <div class="card-content">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                            <div class="card-title" style="margin-bottom: 0;">${hospital.name}</div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: var(--primary); background: rgba(59, 130, 246, 0.1); padding: 2px 8px; border-radius: 12px;">${hospital.distance}</div>
                        </div>
                        <div class="card-subtitle"><i class="fas fa-stethoscope"></i> ${hospital.type} &bull; <i class="fas fa-phone-alt"></i> ${hospital.phone}</div>
                        <div class="card-footer">
                            <span class="card-highlight"><i class="fas fa-bed"></i> Beds: ${hospital.beds}</span>
                            <span class="card-highlight"><i class="fas fa-ambulance"></i> Ambulances: ${hospital.ambulances}</span>
                        </div>
                    </div>
                `;
                hospitalItem.onclick = () => {
                    map.setView([hospital.lat, hospital.lng], 15);
                };
                hospitalList.appendChild(hospitalItem);
            });
        }

        function createHospitalMarker(hospital) {
            const hospitalIcon = L.divIcon({
                className: 'hospital-marker',
                html: `<div style="background-color: #27ae60; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(39, 174, 96, 0.5);"></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            });

            const marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
                .addTo(hospitalLayer)
                .bindPopup(`
                    <div style="min-width: 250px;">
                        <h3 style="color: #27ae60; margin-bottom: 10px;">
                            <i class="fas fa-hospital"></i> ${hospital.name}
                        </h3>
                        <p><strong>Type:</strong> ${hospital.type}</p>
                        <p><strong>Emergency:</strong> ${hospital.emergency ? 'Available' : 'Not Available'}</p>
                        <p><strong>Phone:</strong> ${hospital.phone}</p>
                        <p><strong>Distance:</strong> ${hospital.distance}</p>
                        <p><strong>Available Beds:</strong> ${hospital.beds}</p>
                        <p><strong>Ambulances:</strong> ${hospital.ambulances}</p>
                        <button onclick="simulateEmergencyCall('${hospital.name} - ${hospital.phone}')" style="margin-top: 10px; padding: 8px 15px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-phone"></i> Call Hospital
                        </button>
                    </div>
                `);

            return marker;
        }

        function initializeWeather() {
            // Initialize with current weather
            updateWeatherData();

            // Add weather station markers
            addWeatherStations();
        }

        function addWeatherStations() {
            weatherStations.forEach(station => {
                const weatherIcon = L.divIcon({
                    className: 'weather-marker',
                    html: `<div style="background-color: #3498db; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(52, 152, 219, 0.5);"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });

                L.marker([station.lat, station.lng], { icon: weatherIcon })
                    .addTo(weatherLayer)
                    .bindPopup(`
                        <div style="min-width: 200px;">
                            <h4>${station.city} Weather Station</h4>
                            <p>Temperature: ${station.temp}°C</p>
                            <p>Condition: ${station.condition}</p>
                            <p>Visibility: ${station.visibility} km</p>
                            <div style="margin-top: 10px; font-size: 0.8rem; color: #666;">
                                <i class="fas fa-sync-alt"></i> Updated: ${new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    `);
            });
        }

        function updateWeatherData() {
            const weatherConditions = [
                { condition: 'Clear', icon: 'fa-sun', temp: [28, 35] },
                { condition: 'Partly Cloudy', icon: 'fa-cloud-sun', temp: [26, 32] },
                { condition: 'Cloudy', icon: 'fa-cloud', temp: [24, 30] },
                { condition: 'Rain', icon: 'fa-cloud-rain', temp: [22, 28] },
                { condition: 'Thunderstorm', icon: 'fa-bolt', temp: [21, 26] },
                { condition: 'Fog', icon: 'fa-smog', temp: [20, 27] }
            ];

            const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

            currentWeather = {
                temperature: Math.floor(Math.random() * (randomCondition.temp[1] - randomCondition.temp[0])) + randomCondition.temp[0],
                condition: randomCondition.condition,
                visibility: Math.floor(Math.random() * 10) + 5, // 5-15 km
                humidity: Math.floor(Math.random() * 50) + 40, // 40-90%
                windSpeed: Math.floor(Math.random() * 20) + 5 // 5-25 km/h
            };

            // Update weather display
            document.getElementById('current-temp').textContent = `${currentWeather.temperature}°C`;
            document.getElementById('weather-condition').textContent = currentWeather.condition;
            document.getElementById('weather-visibility').textContent = `${currentWeather.visibility} km`;

            // Update weather icon
            const weatherIcon = document.getElementById('weather-main-icon');
            weatherIcon.className = `fas ${randomCondition.icon}`;

            // Update weather status
            document.getElementById('weather-status').textContent = 'Live';

            // Update alerts based on weather
            updateWeatherAlerts();
        }

        function updateWeatherAlerts() {
            const alertsList = document.getElementById('alerts-list');

            // Clear previous weather alerts
            const previousAlerts = alertsList.querySelectorAll('.weather-alert-item');
            previousAlerts.forEach(alert => alert.remove());

            if (currentWeather.condition === 'Thunderstorm') {
                addAlert('Severe Weather Alert', 'Thunderstorm expected. Avoid travel if possible. Drive with extreme caution.', 'danger', 'weather');
            }
            if (currentWeather.visibility < 8) {
                addAlert('Visibility Alert', `Low visibility (${currentWeather.visibility} km). Use headlights and reduce speed.`, 'warning', 'weather');
            }
            if (currentWeather.condition === 'Fog') {
                addAlert('Fog Alert', 'Dense fog reported. Drive slowly and use fog lights.', 'warning', 'weather');
            }
            if (currentWeather.condition === 'Rain') {
                addAlert('Rain Alert', 'Wet roads expected. Increase following distance and reduce speed.', 'warning', 'weather');
            }

            // Add accident zone alerts
            accidentZones.filter(zone => zone.risk === 'high').forEach(zone => {
                addAlert('High Risk Zone', `${zone.name} has high accident rate. Consider alternative routes.`, 'danger', 'risk');
            });
        }

        function addAlert(title, message, type, category = 'general') {
            const alertsList = document.getElementById('alerts-list');
            const alertItem = document.createElement('div');

            // Assign a contextual icon
            let iconClass = 'fa-exclamation-triangle';
            if (category === 'weather') {
                if (type === 'danger') iconClass = 'fa-bolt';
                else if (title.includes('Fog') || title.includes('Visibility')) iconClass = 'fa-smog';
                else if (title.includes('Rain')) iconClass = 'fa-cloud-showers-heavy';
                else iconClass = 'fa-cloud';
            } else if (category === 'risk') {
                iconClass = 'fa-shield-alt';
            }

            alertItem.className = `alert-card ${type}`;
            alertItem.innerHTML = `
                <div class="alert-icon"><i class="fas ${iconClass}"></i></div>
                <div class="alert-content">
                    <div class="alert-title">${title}</div>
                    <div class="alert-message">${message}</div>
                    <div class="alert-time"><i class="fas fa-clock"></i> ${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            alertsList.appendChild(alertItem);
        }

        function setupEventListeners() {
            // Route calculation
            document.getElementById('find-safest-route').addEventListener('click', findSafestRoute);

            // Map controls
            document.getElementById('locate-me').addEventListener('click', locateUser);
            document.getElementById('satellite-view').addEventListener('click', toggleSatelliteView);
            document.getElementById('emergency-btn').addEventListener('click', showEmergencyPanel);
            document.getElementById('report-incident').addEventListener('click', reportIncident);

            // Stop navigation
            document.getElementById('stop-navigation').addEventListener('click', stopNavigation);

            // Tab switching
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', function () {
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                    this.classList.add('active');
                    document.getElementById(`${this.dataset.tab}-tab`).classList.add('active');
                });
            });

            // Layer toggles
            document.getElementById('show-hospitals').addEventListener('change', function () {
                if (this.checked) map.addLayer(hospitalLayer);
                else map.removeLayer(hospitalLayer);
            });
            document.getElementById('show-speed-cameras').addEventListener('change', function () {
                if (this.checked) map.addLayer(speedCameraLayer);
                else map.removeLayer(speedCameraLayer);
            });

            // Dark Mode Toggle
            document.getElementById('toggle-dark-mode').addEventListener('click', function () {
                document.body.classList.toggle('dark-theme');
                if (document.body.classList.contains('dark-theme')) {
                    this.innerHTML = '<i class="fas fa-sun"></i>';
                    map.removeLayer(streetLayer);
                    if (!map.hasLayer(satelliteLayer)) map.addLayer(darkThemeLayer);
                } else {
                    this.innerHTML = '<i class="fas fa-moon"></i>';
                    map.removeLayer(darkThemeLayer);
                    if (!map.hasLayer(satelliteLayer)) map.addLayer(streetLayer);
                }
            });
        }

        function findSafestRoute() {
            const start = document.getElementById('start-input').value.trim();
            const end = document.getElementById('end-input').value.trim();

            if (!start || !end) {
                alert('Please enter both start and end locations');
                return;
            }

            const routeType = document.querySelector('input[name="route-type"]:checked').value;
            const avoidHighRisk = document.getElementById('avoid-high-risk').checked;
            const considerWeather = document.getElementById('consider-weather').checked;

            // Fuzzy-match city names (case-insensitive partial match)
            function findCity(input) {
                const exact = tamilNaduData.cities[input];
                if (exact) return exact;
                const lower = input.toLowerCase();
                const key = Object.keys(tamilNaduData.cities).find(k => k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase()));
                return key ? tamilNaduData.cities[key] : null;
            }

            const startCoords = findCity(start);
            const endCoords = findCity(end);

            if (!startCoords) { alert(`City not found: "${start}". Please select from the autocomplete list.`); return; }
            if (!endCoords) { alert(`City not found: "${end}". Please select from the autocomplete list.`); return; }

            // Show loading state
            const calculateBtn = document.getElementById('find-safest-route');
            const originalHtml = calculateBtn.innerHTML;
            calculateBtn.innerHTML = '<div class="loading"></div> Analyzing...';
            calculateBtn.disabled = true;

            // Simulate route calculation with safety analysis
            setTimeout(() => {
                const route = calculateSafeRoute(startCoords, endCoords, routeType, avoidHighRisk, considerWeather);
                displayRoute(route, startCoords, endCoords);
                calculateBtn.innerHTML = originalHtml;
                calculateBtn.disabled = false;

                // Show route summary modal
                showRouteSummaryModal(start, end, route);

                // Start driving simulation
                startDrivingSimulation(route);
            }, 2000);
        }

        function showRouteSummaryModal(start, end, route) {
            window._lastRoute = route; // Store for startFromSummary
            document.getElementById('summary-route-label').textContent = `${start} \u2192 ${end}`;
            document.getElementById('sum-dist').textContent = route.distance;
            document.getElementById('sum-time').textContent = route.duration;
            document.getElementById('sum-safety').textContent = route.safetyScore + '/100';

            const safetyPct = parseInt(route.safetyScore);
            const fill = document.getElementById('safety-bar-fill');
            fill.style.width = '0%';
            fill.style.background = safetyPct > 70 ? 'var(--success)' : safetyPct > 40 ? 'var(--warning)' : 'var(--danger)';
            setTimeout(() => { fill.style.width = safetyPct + '%'; }, 100);

            const list = document.getElementById('instructions-list');
            list.innerHTML = route.safetyInstructions.map(i =>
                `<div class="instruction-item"><i class="fas fa-check-circle" style="color:var(--success)"></i>${i}</div>`
            ).join('');

            document.getElementById('route-summary-modal').classList.add('active');

            // Voice announcement (uses voiceSpeak if available)
            if (typeof voiceSpeak === 'function') {
                voiceSpeak(`Route found from ${start} to ${end}. Distance ${route.distance}. Estimated time ${route.duration}. Safety score ${route.safetyScore} out of 100.`);
            }
        }

        function calculateSafeRoute(startCoords, endCoords, routeType, avoidHighRisk, considerWeather) {
            // Calculate base route metrics
            const distance = calculateDistance(startCoords, endCoords, routeType);
            const baseDuration = calculateBaseDuration(distance, routeType);

            // Calculate safety score based on multiple factors
            let safetyScore = calculateSafetyScore(startCoords, endCoords, routeType, avoidHighRisk, considerWeather);

            // Generate waypoints that avoid high-risk zones if requested
            const waypoints = generateSafeWaypoints(startCoords, endCoords, avoidHighRisk, routeType);

            // Get road conditions along the route
            const roadConditions = analyzeRoadConditions(waypoints);

            // Generate safety instructions based on conditions
            const safetyInstructions = generateSafetyInstructions(safetyScore, roadConditions, currentWeather);

            return {
                distance: distance,
                duration: baseDuration,
                safetyScore: safetyScore,
                type: routeType,
                waypoints: waypoints,
                roadConditions: roadConditions,
                safetyInstructions: safetyInstructions,
                warnings: generateRouteWarnings(safetyScore, roadConditions)
            };
        }

        function calculateDistance(start, end, routeType) {
            // Simplified distance calculation using Haversine formula
            const R = 6371; // Earth's radius in km
            const dLat = (end[0] - start[0]) * Math.PI / 180;
            const dLon = (end[1] - start[1]) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(start[0] * Math.PI / 180) * Math.cos(end[0] * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            let distance = R * c;

            // Adjust distance based on real-world routing & route type
            // Straight line Haversine is always shorter than roads. Add base 20% penalty.
            distance *= 1.2;

            if (routeType === 'safest') {
                distance *= 1.15; // Safest routes often take longer detours around highways
            } else if (routeType === 'balanced') {
                distance *= 1.05; // Balanced is slightly longer than fastest
            }
            // fastest keeps the standard 1.2x penalty

            return `${Math.round(distance)} km`;
        }

        function calculateBaseDuration(distance, routeType) {
            const dist = parseInt(distance);
            let baseHours;

            switch (routeType) {
                case 'safest':
                    baseHours = dist / 45; // Slower, safer speed
                    break;
                case 'balanced':
                    baseHours = dist / 60; // Balanced speed
                    break;
                case 'fastest':
                    baseHours = dist / 75; // Faster speed
                    break;
                default:
                    baseHours = dist / 60;
            }

            const hours = Math.floor(baseHours);
            const minutes = Math.round((baseHours - hours) * 60);

            if (hours === 0) {
                return `${minutes}m`;
            } else if (minutes === 0) {
                return `${hours}h`;
            } else {
                return `${hours}h ${minutes}m`;
            }
        }

        function calculateSafetyScore(start, end, routeType, avoidHighRisk, considerWeather) {
            let baseSafety;

            // Base safety based on route type (out of 100)
            switch (routeType) {
                case 'safest':
                    baseSafety = 85 + Math.floor(Math.random() * 10); // 85-94
                    break;
                case 'balanced':
                    baseSafety = 65 + Math.floor(Math.random() * 15); // 65-79
                    break;
                case 'fastest':
                    baseSafety = 45 + Math.floor(Math.random() * 15); // 45-59
                    break;
                default:
                    baseSafety = 70;
            }

            // Adjust for high risk zone avoidance
            if (avoidHighRisk) {
                baseSafety += 5;
            }

            // Adjust for weather conditions
            if (considerWeather) {
                if (currentWeather.condition === 'Thunderstorm' || currentWeather.condition === 'Fog') {
                    baseSafety -= 25;
                } else if (currentWeather.condition === 'Rain') {
                    baseSafety -= 15;
                }
            }

            // Ensure safety score is between 1-100
            return Math.max(1, Math.min(100, baseSafety));
        }

        function generateSafeWaypoints(start, end, avoidHighRisk, routeType) {
            // Dynamically generate waypoints based on actual start and end coordinates
            const waypoints = [start];

            // Compute midpoint between start and end
            const midLat = (start[0] + end[0]) / 2;
            const midLng = (start[1] + end[1]) / 2;

            // Generate perpendicular offset vector for detours
            const latOffset = (end[1] - start[1]);
            const lngOffset = -(end[0] - start[0]);

            if (routeType === 'safest' || avoidHighRisk) {
                // Safest route takes a noticeable 30% curved detour to avoid main highways/risks
                waypoints.push([midLat + latOffset * 0.3, midLng + lngOffset * 0.3]);
                const lat34 = start[0] + (end[0] - start[0]) * 0.75;
                const lng34 = start[1] + (end[1] - start[1]) * 0.75;
                waypoints.push([lat34 + latOffset * 0.15, lng34 + lngOffset * 0.15]);
            } else if (routeType === 'balanced') {
                // Balanced route takes a slight 10% detour
                waypoints.push([midLat - latOffset * 0.1, midLng - lngOffset * 0.1]);
            } else {
                // Fastest route is nearly direct but we add a tiny variance so it looks realistic
                waypoints.push([midLat + latOffset * 0.02, midLng + lngOffset * 0.02]);
            }

            waypoints.push(end);
            return waypoints;
        }

        function analyzeRoadConditions(waypoints) {
            // Analyze road conditions along the route
            const conditions = [];

            waypoints.forEach((point, index) => {
                if (index < waypoints.length - 1) {
                    // Check if this segment passes through any high-risk zones
                    const segmentRisk = assessSegmentRisk(point, waypoints[index + 1]);
                    conditions.push({
                        segment: index + 1,
                        risk: segmentRisk.level,
                        condition: segmentRisk.condition,
                        description: segmentRisk.description
                    });
                }
            });

            return conditions;
        }

        function assessSegmentRisk(start, end) {
            // Check if segment intersects with any accident zones
            for (const zone of accidentZones) {
                if (isPointNearSegment([zone.lat, zone.lng], start, end)) {
                    return {
                        level: zone.risk,
                        condition: zone.roadCondition,
                        description: `Near ${zone.name}`
                    };
                }
            }

            // Default to moderate risk
            return {
                level: 'low',
                condition: 'good',
                description: 'Clear road conditions'
            };
        }

        function isPointNearSegment(point, segmentStart, segmentEnd) {
            // Simplified check if point is near segment
            return true; // For simulation, always return some risk
        }

        function generateSafetyInstructions(safetyScore, roadConditions, weather) {
            const instructions = [];

            // Base safety instructions
            instructions.push('Always wear seatbelt');
            instructions.push('Maintain safe following distance');
            instructions.push('Obey speed limits');

            // Safety-based instructions
            if (safetyScore <= 40) {
                instructions.push('High risk route - extreme caution advised');
                instructions.push('Consider alternative transportation if possible');
            } else if (safetyScore <= 65) {
                instructions.push('Moderate risk - stay alert and focused');
            }

            // Weather-based instructions
            if (weather.condition === 'Rain') {
                instructions.push('Reduce speed on wet roads');
                instructions.push('Use headlights in heavy rain');
            } else if (weather.condition === 'Fog') {
                instructions.push('Use fog lights and reduce speed');
                instructions.push('Increase following distance');
            } else if (weather.condition === 'Thunderstorm') {
                instructions.push('Avoid travel if possible');
                instructions.push('Pull over safely if visibility is poor');
            }

            // Road condition instructions
            const poorConditions = roadConditions.filter(rc => rc.condition === 'poor');
            if (poorConditions.length > 0) {
                instructions.push('Poor road conditions ahead - reduce speed');
            }

            return instructions;
        }

        function generateRouteWarnings(safetyScore, roadConditions) {
            const warnings = [];

            if (safetyScore <= 40) {
                warnings.push("High-risk route with multiple accident-prone zones");
            }

            if (currentWeather.condition === 'Rain' || currentWeather.condition === 'Thunderstorm') {
                warnings.push("Adverse weather conditions expected");
            }

            const highRiskSegments = roadConditions.filter(rc => rc.risk === 'high');
            if (highRiskSegments.length > 0) {
                warnings.push(`${highRiskSegments.length} high-risk segments detected`);
            }

            return warnings;
        }

        function displayRoute(route, startCoords, endCoords) {
            // Clear previous route
            routeLayer.clearLayers();

            // Draw route
            const routeLine = L.polyline(route.waypoints, {
                color: route.type === 'safest' ? '#27ae60' : route.type === 'balanced' ? '#f39c12' : '#e74c3c',
                weight: 6,
                opacity: 0.8
            }).addTo(routeLayer);

            // Add start and end markers
            L.marker(startCoords).addTo(routeLayer)
                .bindPopup(`<b>Start:</b> ${document.getElementById('start-input').value}`);

            L.marker(endCoords).addTo(routeLayer)
                .bindPopup(`<b>End:</b> ${document.getElementById('end-input').value}`);

            // Fit map to route
            map.fitBounds(routeLine.getBounds());

            // Show route warnings as alerts
            route.warnings.forEach(warning => {
                addAlert('Route Warning', warning, route.riskScore >= 7 ? 'danger' : 'warning');
            });

            // Switch to alerts tab to show warnings
            document.querySelector('[data-tab="alerts"]').click();
        }

        function startDrivingSimulation(route) {
            isDriving = true;
            currentPositionIndex = 0;

            // Show driving panel
            document.getElementById('driving-panel').style.display = 'block';

            // Update driving stats
            document.getElementById('driving-distance').textContent = route.distance;
            document.getElementById('driving-time').textContent = route.duration;
            document.getElementById('driving-weather').textContent = currentWeather.condition;
            document.getElementById('driving-hospitals').textContent = hospitals.length;

            // Calculate dynamic interval based on route duration (simulate faster but proportional)
            let dynamicInterval = 3000;
            const match = route.duration.match(/(\d+)h\s*(\d+)m/) || route.duration.match(/(\d+)m/);
            if (match) {
                let totalMin = 0;
                if (route.duration.includes('h')) {
                    totalMin = (parseInt(match[1]) || 0) * 60 + (parseInt(match[2]) || 0);
                } else {
                    totalMin = parseInt(match[1]) || 0;
                }

                // Scale simulation speed. E.g., a 60 min trip divided by say 20 waypoints
                // Minimum 2 seconds, maximum 8 seconds per waypoint hop.
                const timePerWaypoint = (totalMin * 60 * 1000) / (route.waypoints.length || 1);
                // Compress real-time into a visual simulation pace (e.g. 60x faster)
                dynamicInterval = Math.max(1500, Math.min(6000, timePerWaypoint / 60));
            }

            // Start simulation interval
            drivingInterval = setInterval(() => {
                simulateDrivingProgress(route);
            }, dynamicInterval);
        }

        function simulateDrivingProgress(route) {
            if (currentPositionIndex >= route.waypoints.length - 1) {
                // Prevent duplicate triggers
                if (isDriving) {
                    isDriving = false; // immediately mark as stopped
                    if (drivingInterval) {
                        clearInterval(drivingInterval);
                        drivingInterval = null;
                    }
                    stopNavigation(true); // Handles stopping the HUD/timers without raising 'Navigation Stopped' if we already arrived safely
                    showAlert('Destination Reached', 'You have safely reached your destination!', 'success');
                }
                return;
            }

            // Move to next waypoint
            currentPositionIndex++;
            const currentPosition = route.waypoints[currentPositionIndex];

            // Update map view
            map.setView(currentPosition, 13);

            // Update driving stats
            const remainingWaypoints = route.waypoints.length - currentPositionIndex - 1;
            const remainingDistance = Math.round(parseInt(route.distance) * (remainingWaypoints / route.waypoints.length));
            const remainingTime = calculateRemainingTime(route.duration, remainingWaypoints, route.waypoints.length);

            document.getElementById('driving-distance').textContent = `${remainingDistance} km`;
            document.getElementById('driving-time').textContent = remainingTime;

            // Simulate real-time updates
            simulateRealTimeUpdates(currentPosition);
        }

        function calculateRemainingTime(totalDuration, remainingWaypoints, totalWaypoints) {
            // Extract hours and minutes from duration string like "3h 25m"
            const match = totalDuration.match(/(\d+)h\s*(\d+)m/);
            if (match) {
                const totalHours = parseInt(match[1]);
                const totalMinutes = parseInt(match[2]);
                const totalTimeMinutes = totalHours * 60 + totalMinutes;
                const remainingTimeMinutes = Math.round(totalTimeMinutes * (remainingWaypoints / totalWaypoints));

                const hours = Math.floor(remainingTimeMinutes / 60);
                const minutes = remainingTimeMinutes % 60;

                if (hours === 0) {
                    return `${minutes}m`;
                } else if (minutes === 0) {
                    return `${hours}h`;
                } else {
                    return `${hours}h ${minutes}m`;
                }
            }
            return totalDuration;
        }

        function simulateRealTimeUpdates(currentPosition) {
            // Simulate weather changes (20% chance)
            if (Math.random() < 0.2) {
                updateWeatherData();
                showWeatherAlert(`Weather changed: ${currentWeather.condition}`);
                document.getElementById('driving-weather').textContent = currentWeather.condition;
            }

            // Simulate hospital updates (15% chance)
            if (Math.random() < 0.15) {
                updateHospitalStatus();
            }

            // Simulate traffic alerts (10% chance)
            if (Math.random() < 0.1) {
                showTrafficAlert();
            }

            // Update nearby hospitals count
            updateNearbyHospitals(currentPosition);
        }

        function updateHospitalStatus() {
            // Randomly update hospital status
            const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)];
            const oldBeds = randomHospital.beds;
            const oldAmbulances = randomHospital.ambulances;

            // Simulate status change
            randomHospital.beds = Math.max(0, oldBeds + Math.floor(Math.random() * 5) - 2);
            randomHospital.ambulances = Math.max(0, oldAmbulances + Math.floor(Math.random() * 3) - 1);

            // Show alert if significant change
            if (Math.abs(randomHospital.beds - oldBeds) >= 2 || Math.abs(randomHospital.ambulances - oldAmbulances) >= 1) {
                showHospitalAlert(`${randomHospital.name}: Beds ${oldBeds}→${randomHospital.beds}, Ambulances ${oldAmbulances}→${randomHospital.ambulances}`);
            }

            // Update hospital status display
            document.getElementById('hospital-status').textContent = 'Updated';
        }

        function updateNearbyHospitals(currentPosition) {
            // Count hospitals within 50km (simplified)
            let nearbyCount = 0;
            hospitals.forEach(hospital => {
                const distance = calculateSimpleDistance(currentPosition, [hospital.lat, hospital.lng]);
                if (distance < 50) {
                    nearbyCount++;
                }
            });

            document.getElementById('driving-hospitals').textContent = nearbyCount;
        }

        function calculateSimpleDistance(pos1, pos2) {
            // Simple distance calculation for simulation
            const latDiff = Math.abs(pos1[0] - pos2[0]);
            const lngDiff = Math.abs(pos1[1] - pos2[1]);
            return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
        }

        function showAlert(message, description, type) {
            speak(message + ". " + description);
            const alertElement = document.getElementById('live-alert');
            const messageElement = document.getElementById('alert-message');

            messageElement.textContent = message;
            alertElement.style.display = 'flex';
            alertElement.style.background = type === 'success' ?
                'rgba(39, 174, 96, 0.95)' :
                'rgba(231, 76, 60, 0.95)';

            // Auto hide after 5 seconds
            setTimeout(() => {
                alertElement.style.display = 'none';
            }, 5000);
        }

        function showWeatherAlert(message) {
            speak("Weather Alert: " + message);
            const alertElement = document.getElementById('weather-alert');
            const messageElement = document.getElementById('weather-message');

            messageElement.textContent = message;
            alertElement.style.display = 'flex';

            // Auto hide after 4 seconds
            setTimeout(() => {
                alertElement.style.display = 'none';
            }, 4000);
        }

        function showHospitalAlert(message) {
            const alertElement = document.getElementById('hospital-alert');
            const messageElement = document.getElementById('hospital-message');

            messageElement.textContent = message;
            alertElement.style.display = 'flex';

            // Auto hide after 4 seconds
            setTimeout(() => {
                alertElement.style.display = 'none';
            }, 4000);
        }

        function showTrafficAlert() {
            const alerts = [
                "Accident ahead on NH44 - expect delays",
                "Road construction near Coimbatore - detour suggested",
                "Heavy traffic on Chennai Bypass - add 15 mins",
                "Vehicle breakdown on Madurai Highway - lane blocked"
            ];

            const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
            speak("Traffic Alert: " + randomAlert);
            showAlert('Traffic Alert', randomAlert, 'warning');
        }

        function stopNavigation(isSuccess = false) {
            isDriving = false;
            if (drivingInterval) {
                clearInterval(drivingInterval);
                drivingInterval = null;
            }

            document.getElementById('driving-panel').style.display = 'none';
            if (!isSuccess) {
                showAlert('Navigation Stopped', 'Driving simulation has been stopped.', 'warning');
            }
        }

        let watchId = null;
        let userMarker = null;
        let userAccuracyCircle = null;

        function locateUser() {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by this browser.");
                return;
            }

            const locateBtn = document.getElementById('locate-me');
            if (watchId !== null) {
                // Stop tracking
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                locateBtn.classList.remove('active');
                if (userMarker) map.removeLayer(userMarker);
                if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);
                userMarker = null;
                userAccuracyCircle = null;
                document.getElementById('start-input').value = "";
                return;
            }

            locateBtn.innerHTML = '<div class="loading"></div>';

            watchId = navigator.geolocation.watchPosition(
                function (position) {
                    userLocation = [position.coords.latitude, position.coords.longitude];

                    if (!userMarker) {
                        const userIcon = L.divIcon({
                            className: 'user-location-marker',
                            html: `<div class="pulse-marker"></div>`,
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        });
                        userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map)
                            .bindPopup('Your Current Location');

                        map.setView(userLocation, 14);
                        locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                        locateBtn.classList.add('active');
                        document.getElementById('start-input').value = "Current Location";
                    } else {
                        userMarker.setLatLng(userLocation);
                    }
                },
                function (error) {
                    alert("Unable to retrieve your location. Please ensure location services are enabled.");
                    locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
        }

        function toggleSatelliteView() {
            const btn = document.getElementById('satellite-view');
            if (map.hasLayer(streetLayer)) {
                map.removeLayer(streetLayer);
                map.addLayer(satelliteLayer);
                btn.innerHTML = '<i class="fas fa-map"></i>';
                btn.title = "Street View";
            } else {
                map.removeLayer(satelliteLayer);
                map.addLayer(streetLayer);
                btn.innerHTML = '<i class="fas fa-satellite"></i>';
                btn.title = "Satellite View";
            }
        }

        function showEmergencyPanel() {
            document.getElementById('emergency-panel').classList.add('active');
        }

        function closeEmergencyPanel() {
            document.getElementById('emergency-panel').classList.remove('active');
        }

        function reportIncident() {
            const userLocation = map.getCenter();
            const incidentTypes = ['Accident', 'Road Block', 'Vehicle Breakdown', 'Flooding', 'Other Hazard'];
            const randomType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];

            const incidentData = {
                type: randomType,
                location: userLocation,
                severity: 'medium',
                description: 'User-reported incident',
                timestamp: new Date()
            };

            // Add temporary incident marker
            const incidentIcon = L.divIcon({
                className: 'accident-marker',
                html: `<div style="background-color: #e74c3c; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(231, 76, 60, 0.7);"></div>`,
                iconSize: [22, 22],
                iconAnchor: [11, 11]
            });

            L.marker([userLocation.lat, userLocation.lng], { icon: incidentIcon })
                .addTo(accidentLayer)
                .bindPopup(`
                    <div style="min-width: 200px;">
                        <h3 style="color: #e74c3c;">
                            <i class="fas fa-exclamation-circle"></i> User-Reported: ${randomType}
                        </h3>
                        <p><strong>Type:</strong> ${randomType}</p>
                        <p><strong>Status:</strong> Reported ${new Date().toLocaleTimeString()}</p>
                        <p><strong>Action:</strong> Authorities notified</p>
                    </div>
                `)
                .openPopup();

            addAlert('New Incident Reported', `${randomType} reported at your location. Emergency services have been notified.`, 'danger');

            alert(`Incident reported successfully!\n\nType: ${randomType}\n\nEmergency services have been notified.`);
        }

        function simulateEmergencyCall(service) {
            alert(`SIMULATION: Calling ${service}\n\nIn a real application, this would initiate a phone call or connect to emergency services.\n\nPlease call ${service.split(' - ')[1]} for actual emergency assistance.`);
        }

        function getSafetyTip(riskLevel) {
            const tips = {
                high: "Reduce speed, increase following distance, and avoid sudden maneuvers. Consider alternative routes.",
                medium: "Stay alert, obey speed limits, and watch for unexpected obstacles. Keep safe distance from other vehicles.",
                low: "Maintain normal driving precautions and stay aware of surroundings. Regular safety checks recommended."
            };
            return tips[riskLevel] || "Drive safely and follow traffic rules.";
        }

        function startRealTimeUpdates() {
            // Update weather every 2 minutes
            setInterval(updateWeatherData, 120000);

            // Update hospital status every 90 seconds
            setInterval(updateHospitalStatus, 90000);

            // Simulate traffic updates every minute
            setInterval(() => {
                if (Math.random() < 0.3) { // 30% chance
                    showTrafficAlert();
                }
            }, 60000);
        }

        // Export functions for global access
        window.simulateEmergencyCall = simulateEmergencyCall;
        window.closeEmergencyPanel = closeEmergencyPanel;

        // ========================================
        // NEW FEATURES
        // ========================================

        // --- 1. ENHANCED VOICE ASSISTANT ---
        let isVoicePanelOpen = false;
        let isSpeaking = false;

        function toggleVoicePanel() {
            isVoicePanelOpen = !isVoicePanelOpen;
            const panel = document.getElementById('voice-panel');
            panel.classList.toggle('active', isVoicePanelOpen);
        }

        function voiceSpeak(text) {
            if (!('speechSynthesis' in window)) {
                alert('Voice not supported in this browser.');
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-IN';
            utterance.rate = 0.95;
            utterance.pitch = 1.1;
            utterance.volume = 1;

            const wave = document.getElementById('mic-wave');
            const label = document.getElementById('voice-listening-label');
            const output = document.getElementById('voice-output');

            utterance.onstart = () => {
                wave.classList.remove('paused');
                label.textContent = 'Speaking...';
                output.textContent = text.substring(0, 40) + '...';
                isSpeaking = true;
            };
            utterance.onend = () => {
                wave.classList.add('paused');
                label.textContent = 'Done';
                isSpeaking = false;
                setTimeout(() => { label.textContent = 'Click a command to speak'; output.textContent = 'Ready...'; }, 2000);
            };
            window.speechSynthesis.speak(utterance);
        }

        function speakHospitals() {
            if (!hospitals || hospitals.length === 0) { voiceSpeak('No hospital data available.'); return; }
            const top = hospitals.slice(0, 3);
            const text = 'Nearest hospitals: ' + top.map((h, i) => `${i + 1}. ${h.name} at ${h.distance}`).join('. ');
            voiceSpeak(text);
        }

        function speakRouteInfo() {
            const start = document.getElementById('start-input').value || 'Unknown';
            const end = document.getElementById('end-input').value || 'Unknown';
            const dist = document.getElementById('sum-dist').textContent;
            const dur = document.getElementById('sum-time').textContent;
            const text = `Route from ${start} to ${end}. Distance: ${dist}. Estimated time: ${dur}.`;
            voiceSpeak(text);
        }

        // Add voice button to map controls
        (function addVoiceControl() {
            const mapControls = document.querySelector('.map-controls');
            if (!mapControls) return;
            const voiceBtn = document.createElement('button');
            voiceBtn.className = 'control-btn';
            voiceBtn.id = 'voice-btn';
            voiceBtn.title = 'Voice Assistant';
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.addEventListener('click', toggleVoicePanel);
            mapControls.appendChild(voiceBtn);

            const favBtn = document.createElement('button');
            favBtn.className = 'control-btn';
            favBtn.id = 'fav-btn';
            favBtn.title = 'Saved Routes';
            favBtn.innerHTML = '<i class="fas fa-star"></i>';
            favBtn.addEventListener('click', toggleFavoritesPanel);
            mapControls.appendChild(favBtn);
        })();

        // --- 2. LIVE SPEEDOMETER HUD ---
        let currentSpeed = 0;
        let speedInterval = null;

        function showSpeedometer() {
            document.getElementById('speedometer-hud').classList.add('active');
            speedInterval = setInterval(updateSimulatedSpeed, 1500);
        }

        function hideSpeedometer() {
            document.getElementById('speedometer-hud').classList.remove('active');
            if (speedInterval) { clearInterval(speedInterval); speedInterval = null; }
            currentSpeed = 0;
        }

        function updateSimulatedSpeed() {
            if (!isDriving) return;
            const routeType = document.querySelector('input[name="route-type"]:checked')?.value || 'balanced';
            const maxSpeed = routeType === 'fastest' ? 110 : routeType === 'balanced' ? 80 : 60;
            // Simulate realistic speed variation
            const delta = (Math.random() - 0.4) * 15;
            currentSpeed = Math.max(20, Math.min(maxSpeed, currentSpeed + delta));
            document.getElementById('hud-speed').textContent = Math.round(currentSpeed);
            const speedEl = document.getElementById('hud-speed');
            // Turn red if over limit
            if (currentSpeed > 80) {
                speedEl.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            } else {
                speedEl.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
            }
            speedEl.style.webkitBackgroundClip = 'text';
            speedEl.style.webkitTextFillColor = 'transparent';
        }

        // Patch startDrivingSimulation to show speedometer
        const _origStart = startDrivingSimulation;
        window._origStart = _origStart;
        startDrivingSimulation = function (route) {
            _origStart(route);
            showSpeedometer();
            startTripTimer(route.duration);
            currentSpeed = 30;
        };

        const _origStop = stopNavigation;
        stopNavigation = function () {
            _origStop();
            hideSpeedometer();
            stopTripTimer();
        };

        // --- 3. ROUTE SUMMARY MODAL ---
        function startFromSummary() {
            document.getElementById('route-summary-modal').classList.remove('active');
            // _pendingRoute is set by the original findSafestRoute via window._lastRoute
            if (window._lastRoute) startDrivingSimulation(window._lastRoute);
        }

        // --- 4. FAVORITES SYSTEM ---
        function getFavorites() {
            try { return JSON.parse(localStorage.getItem('saferoute_favorites') || '[]'); }
            catch { return []; }
        }

        function saveFavorites(favs) {
            localStorage.setItem('saferoute_favorites', JSON.stringify(favs));
        }

        function saveToFavorites() {
            const start = document.getElementById('start-input').value;
            const end = document.getElementById('end-input').value;
            if (!start || !end) { alert('No route to save.'); return; }
            const favs = getFavorites();
            const id = Date.now();
            favs.push({ id, start, end, label: `${start} → ${end}`, date: new Date().toLocaleDateString() });
            saveFavorites(favs);
            document.getElementById('route-summary-modal').classList.remove('active');
            voiceSpeak('Route saved to favorites.');
            renderFavorites();
            alert(`✅ Route "${start} → ${end}" saved to favorites!`);
        }

        function renderFavorites() {
            const list = document.getElementById('favorites-list');
            const favs = getFavorites();
            if (favs.length === 0) {
                list.innerHTML = '<p style="color:var(--text-secondary); font-size:0.85rem;">No saved routes yet.</p>';
                return;
            }
            list.innerHTML = favs.map(f => `
                <div class="fav-item" onclick="loadFavorite('${f.start}','${f.end}')">
                    <i class="fas fa-route" style="color:var(--primary)"></i>
                    <div class="fav-item-text">${f.label}<br><span class="fav-item-sub">${f.date}</span></div>
                    <button class="fav-delete" onclick="event.stopPropagation(); deleteFavorite(${f.id})"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }

        function loadFavorite(start, end) {
            document.getElementById('start-input').value = start;
            document.getElementById('end-input').value = end;
            document.getElementById('favorites-panel').classList.remove('active');
            voiceSpeak(`Loading route from ${start} to ${end}`);
        }

        function deleteFavorite(id) {
            const favs = getFavorites().filter(f => f.id !== id);
            saveFavorites(favs);
            renderFavorites();
        }

        function toggleFavoritesPanel() {
            const panel = document.getElementById('favorites-panel');
            renderFavorites();
            panel.classList.toggle('active');
        }

        // --- 5. LIVE TRIP TIMER ---
        let tripTimerInterval = null;
        let tripSeconds = 0;
        let tripTimerStopped = true; // guard: true = not running
        let _tripTimeMultiplier = 1; // used to advance the clock proportionally

        // Passed route duration to calculate simulation scale
        function startTripTimer(totalMinutesStr) {
            tripSeconds = 0;
            tripTimerStopped = false;
            _tripTimeMultiplier = 1;

            if (totalMinutesStr) {
                // Approximate total minutes expected
                let totalMin = 0;
                const match = totalMinutesStr.match(/(\d+)h\s*(\d+)m/) || totalMinutesStr.match(/(\d+)m/);
                if (match) {
                    if (totalMinutesStr.includes('h')) totalMin = (parseInt(match[1]) || 0) * 60 + (parseInt(match[2]) || 0);
                    else totalMin = parseInt(match[1]) || 0;
                }

                // If a 60 min trip takes 60 seconds to simulate, multiplier is 60x.
                // Assuming average simulation time of ~90 seconds
                if (totalMin > 0) {
                    _tripTimeMultiplier = Math.max(1, (totalMin * 60) / 90);
                }
            }

            document.getElementById('trip-timer').classList.add('active');
            document.getElementById('driving-panel').style.top = '72px';
            tripTimerInterval = setInterval(() => {
                // Add proportional seconds instead of real-time 1s
                tripSeconds += _tripTimeMultiplier;
                const h = String(Math.floor(tripSeconds / 3600)).padStart(2, '0');
                const m = String(Math.floor((tripSeconds % 3600) / 60)).padStart(2, '0');
                const s = String(Math.floor(tripSeconds % 60)).padStart(2, '0');
                document.getElementById('timer-display').textContent = `${h}:${m}:${s}`;
            }, 1000);
        }

        function stopTripTimer() {
            if (tripTimerStopped) return; // already stopped — don't repeat
            tripTimerStopped = true;
            clearInterval(tripTimerInterval);
            tripTimerInterval = null;
            document.getElementById('trip-timer').classList.remove('active');
            document.getElementById('driving-panel').style.top = '24px';
            const total = Math.floor(tripSeconds);
            if (total > 0) {
                const h = Math.floor(total / 3600);
                const m = Math.floor((total % 3600) / 60);
                let timeStr = "";
                if (h > 0) timeStr += `${h} hours and `;
                timeStr += `${m} minutes`;
                voiceSpeak(`Trip completed. Simulated time: ${timeStr}.`);
            }
        }

        // Init favorites on load
        renderFavorites();

        // Override the find route button using the patched function
        document.getElementById('find-safest-route').removeEventListener('click', findSafestRoute);
        document.getElementById('find-safest-route').addEventListener('click', findSafestRoute);

        window.saveToFavorites = saveToFavorites;
        window.startFromSummary = startFromSummary;
        window.voiceSpeak = voiceSpeak;
