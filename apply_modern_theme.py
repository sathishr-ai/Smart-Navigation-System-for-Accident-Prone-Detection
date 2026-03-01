import re

file_path = r"c:\Users\SATHISH\Downloads\Smart Navigation System\deepseek_html_20251106_47dcd1.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update font in head
content = content.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">'
)

# 2. Replace CSS Block
old_css_start = content.find("    <style>")
old_css_end = content.find("    </style>") + len("    </style>")

if old_css_start != -1 and old_css_end != -1:
    new_css = """    <style>
        :root {
            /* Light Theme - Modern & Vibrant */
            --bg-body: #f1f5f9;
            --bg-panel: rgba(255, 255, 255, 0.75);
            --border-panel: rgba(255, 255, 255, 0.5);
            --bg-input: rgba(255, 255, 255, 0.9);
            --text-primary: #0f172a;
            --text-secondary: #475569;

            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --secondary: #8b5cf6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --info: #0ea5e9;
            --light: #f8fafc;
            --dark: #0f172a;

            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
            --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);
            
            --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            --blur: blur(20px) saturate(180%);
            --radius-lg: 24px;
            --radius-md: 16px;
        }

        body.dark-theme {
            /* Dark Theme - Sleek & Premium */
            --bg-body: #09090b;
            --bg-panel: rgba(24, 24, 27, 0.75);
            --border-panel: rgba(63, 63, 70, 0.4);
            --bg-input: rgba(39, 39, 42, 0.9);
            --text-primary: #f4f4f5;
            --text-secondary: #a1a1aa;
            
            --primary: #60a5fa;
            --primary-hover: #3b82f6;
            --light: #27272a;
            --dark: #fafafa;
            --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Outfit', sans-serif;
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--text-secondary); border-radius: 10px; opacity: 0.5; }
        ::-webkit-scrollbar-thumb:hover { background: var(--primary); }

        body { background: var(--bg-body); color: var(--text-primary); overflow: hidden; transition: var(--transition); }
        #map { height: 100vh; width: 100vw; z-index: 1; }
        
        /* Modern Leaflet popups */
        .leaflet-popup-content-wrapper { background: var(--bg-panel); backdrop-filter: var(--blur); border: 1px solid var(--border-panel); border-radius: var(--radius-md); color: var(--text-primary); box-shadow: var(--shadow-lg); }
        .leaflet-popup-tip { background: var(--bg-panel); }
        .leaflet-container a.leaflet-popup-close-button { color: var(--text-secondary); padding: 8px; }

        .control-panel { position: absolute; top: 24px; left: 24px; z-index: 1000; background: var(--bg-panel); backdrop-filter: var(--blur); border-radius: var(--radius-lg); padding: 28px; width: 420px; box-shadow: var(--shadow-lg); border: 1px solid var(--border-panel); color: var(--text-primary); transition: var(--transition); }
        .search-box-container { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; position: relative; }
        .search-input-wrapper { position: relative; display: flex; align-items: center; background: var(--bg-input); border: 1px solid var(--border-panel); border-radius: var(--radius-md); padding: 0 16px; transition: var(--transition); box-shadow: var(--shadow-sm); }
        .search-input-wrapper:focus-within { border-color: var(--primary); box-shadow: var(--shadow-glow); transform: translateY(-1px); }
        .search-input-wrapper i { font-size: 1.1rem; margin-right: 12px; color: var(--text-secondary); }
        .search-input-wrapper i.text-primary { color: var(--primary); }
        .search-input-wrapper i.text-danger { color: var(--danger); }
        .search-input-wrapper input { flex: 1; padding: 16px 0; background: transparent; color: var(--text-primary); border: none; font-size: 1rem; font-weight: 500; }
        .search-input-wrapper input:focus { outline: none; }

        .swap-btn { position: absolute; right: 24px; top: 50%; transform: translateY(-50%) rotate(90deg); z-index: 10; background: var(--bg-panel); border: 1px solid var(--border-panel); color: var(--primary); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow); transition: var(--transition); }
        .swap-btn:hover { background: var(--primary); color: white; box-shadow: var(--shadow-glow); transform: translateY(-50%) rotate(270deg); }

        .autocomplete-dropdown { position: absolute; top: calc(100% + 8px); left: 0; width: 100%; background: var(--bg-panel); backdrop-filter: var(--blur); border: 1px solid var(--border-panel); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); max-height: 250px; overflow-y: auto; display: none; z-index: 1001; }
        .autocomplete-item { padding: 14px 20px; cursor: pointer; display: flex; align-items: center; transition: var(--transition); border-bottom: 1px solid var(--border-panel); font-weight: 500; }
        .autocomplete-item:last-child { border-bottom: none; }
        .autocomplete-item:hover { background: var(--primary); color: white; padding-left: 24px; }
        .autocomplete-item:hover i { color: rgba(255,255,255,0.8) !important; }

        .btn { padding: 14px 24px; border: none; border-radius: var(--radius-md); cursor: pointer; font-weight: 600; font-size: 1rem; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; overflow: hidden; }
        .btn::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(rgba(255,255,255,0.2), transparent); opacity: 0; transition: var(--transition); }
        .btn:hover::after { opacity: 1; }

        .btn-primary { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; box-shadow: var(--shadow-glow); }
        .btn-success { background: linear-gradient(135deg, var(--success), #059669); color: white; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2); }
        .btn-danger { background: linear-gradient(135deg, var(--danger), #e11d48); color: white; box-shadow: 0 8px 16px rgba(239, 68, 68, 0.2); }
        .btn-warning { background: linear-gradient(135deg, var(--warning), #d97706); color: white; box-shadow: 0 8px 16px rgba(245, 158, 11, 0.2); }
        .w-100 { width: 100%; }
        .btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }

        .route-options { margin: 24px 0; color: var(--text-secondary); }
        .option-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
        .option-group label { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 12px 16px; border-radius: var(--radius-md); transition: var(--transition); font-size: 0.95rem; color: var(--text-primary); background: var(--bg-input); border: 1px solid transparent; font-weight: 500; }
        .option-group label:hover { background: var(--light); border-color: var(--border-panel); transform: translateX(4px); }
        .option-group input[type="radio"], .option-group input[type="checkbox"] { accent-color: var(--primary); width: 18px; height: 18px; cursor: pointer; }

        .driving-panel { position: absolute; top: 24px; left: 50%; transform: translateX(-50%); z-index: 1000; background: var(--bg-panel); backdrop-filter: var(--blur); border-radius: var(--radius-lg); padding: 16px 32px; box-shadow: var(--shadow-lg); border: 1px solid var(--border-panel); display: none; color: var(--text-primary); transition: var(--transition); }
        .driving-stats { display: flex; gap: 32px; align-items: center; }
        .driving-stat { text-align: center; }
        .driving-value { font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .driving-label { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; font-weight: 600; }

        .live-alert, .weather-alert, .hospital-alert { position: absolute; left: 50%; transform: translateX(-50%); z-index: 1000; color: white; padding: 14px 28px; border-radius: 30px; box-shadow: var(--shadow-lg); display: none; align-items: center; gap: 12px; font-weight: 600; backdrop-filter: var(--blur); animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(255,255,255,0.2); }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .live-alert { top: 100px; background: linear-gradient(135deg, rgba(239,68,68,0.9), rgba(185,28,28,0.9)); animation: pulse-danger 2s infinite, slideDown 0.4s; }
        .weather-alert { top: 160px; background: linear-gradient(135deg, rgba(59,130,246,0.9), rgba(29,78,216,0.9)); }
        .hospital-alert { top: 220px; background: linear-gradient(135deg, rgba(16,185,129,0.9), rgba(4,120,87,0.9)); }
        @keyframes pulse-danger { 0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); } 50% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } }

        .info-panel { position: absolute; bottom: 24px; left: 24px; right: 24px; z-index: 1000; background: var(--bg-panel); backdrop-filter: var(--blur); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-lg); border: 1px solid var(--border-panel); max-height: 280px; color: var(--text-primary); transition: var(--transition); display: flex; flex-direction: column; }
        .info-tabs { display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 2px solid var(--border-panel); padding-bottom: 12px; overflow-x: auto; }
        .info-tabs::-webkit-scrollbar { height: 0; }
        .tab { padding: 10px 24px; border: none; background: transparent; color: var(--text-secondary); cursor: pointer; border-radius: 30px; transition: var(--transition); font-weight: 600; font-size: 0.95rem; white-space: nowrap; }
        .tab:hover { color: var(--text-primary); background: var(--light); }
        .tab.active { background: var(--text-primary); color: var(--bg-body); box-shadow: var(--shadow); }
        .tab-content { display: none; flex: 1; overflow-y: auto; padding-right: 10px; }
        .tab-content.active { display: block; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .weather-card { display: flex; align-items: center; gap: 24px; padding: 24px; background: linear-gradient(135deg, var(--info), var(--primary)); color: white; border-radius: var(--radius-md); margin-bottom: 16px; box-shadow: var(--shadow-glow); }
        .weather-icon { font-size: 3.5rem; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
        .weather-info h3 { margin-bottom: 8px; font-weight: 700; font-size: 1.25rem; }
        .weather-info p { margin-bottom: 4px; opacity: 0.9; font-weight: 500; }

        .hospital-list, #risk-zones-list, #alerts-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .hospital-item, .risk-zone-item { padding: 16px; background: var(--bg-input); border: 1px solid var(--border-panel); cursor: pointer; transition: var(--transition); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); }
        .hospital-item:hover, .risk-zone-item:hover { transform: translateY(-4px); box-shadow: var(--shadow); border-color: var(--primary); }
        .hospital-name { font-weight: 700; color: var(--text-primary); margin-bottom: 8px; font-size: 1.1rem; }
        .hospital-details { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 6px; font-weight: 500; }

        .map-controls { position: absolute; top: 24px; right: 24px; z-index: 1000; display: flex; flex-direction: column; gap: 16px; }
        .control-btn { width: 52px; height: 52px; border: none; border-radius: 50%; background: var(--bg-panel); backdrop-filter: var(--blur); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: var(--text-primary); box-shadow: var(--shadow); border: 1px solid var(--border-panel); transition: var(--transition); }
        .control-btn:hover { transform: scale(1.1); background: var(--primary); color: white; box-shadow: var(--shadow-glow); }
        .control-btn.active { background: var(--primary); color: white; animation: pulse-primary 2s infinite; }
        @keyframes pulse-primary { 0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); } 50% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } }

        .emergency-panel { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000; background: var(--bg-panel); backdrop-filter: blur(40px) saturate(200%); padding: 40px; border-radius: var(--radius-lg); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); display: none; max-width: 500px; width: 90%; color: var(--text-primary); border: 1px solid var(--border-panel); }
        .emergency-panel.active { display: block; animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes modalSlideIn { from { opacity: 0; transform: translate(-50%, -60%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        .emergency-contacts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
        .emergency-contact { padding: 24px 16px; background: var(--bg-input); border-radius: var(--radius-md); text-align: center; cursor: pointer; transition: var(--transition); border: 1px solid var(--border-panel); box-shadow: var(--shadow-sm); }
        .emergency-contact:hover { background: linear-gradient(135deg, var(--danger), #be123c); color: white; transform: translateY(-4px); box-shadow: 0 10px 20px rgba(225, 29, 72, 0.3); }

        .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .pulse-marker { width: 20px; height: 20px; background: var(--primary); border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); animation: ripple 1.5s infinite; }
        @keyframes ripple { 70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }

        .accident-marker { background: linear-gradient(135deg, #ef4444, #991b1b); border: 2px solid white; border-radius: 8px; transform: rotate(45deg); box-shadow: 0 4px 10px rgba(239, 68, 68, 0.5); display: flex; justify-content: center; align-items: center; }
        .accident-marker i { transform: rotate(-45deg); color: white; font-size: 10px; }
        .hospital-marker { background: linear-gradient(135deg, #10b981, #047857); border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.5); }
        .weather-marker { background: linear-gradient(135deg, #3b82f6, #1d4ed8); border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.5); }
        .speed-camera-marker { background: #8b5cf6; border: 2px solid white; border-radius: 8px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.5); }
        .toll-marker { background: #f59e0b; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.5); }

        .status-indicator { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
        .status-live { background: #10b981; animation: pulse-success 2s infinite; }
        @keyframes pulse-success { 0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); } 50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); } }
        .status-updating { background: #f59e0b; }
        .status-offline { background: #64748b; }

        @media (max-width: 768px) {
            .control-panel { top: 16px; left: 16px; width: calc(100vw - 32px); padding: 20px; }
            .info-panel { left: 16px; right: 16px; bottom: 16px; padding: 16px; }
            .map-controls { top: auto; bottom: auto; right: 16px; top: 16px; flex-direction: row; }
            .driving-panel { width: calc(100vw - 32px); padding: 16px; }
            .driving-stats { gap: 16px; flex-wrap: wrap; justify-content: space-around; }
            .search-input-wrapper input { padding: 12px 0; }
        }
    </style>"""
    content = content[:old_css_start] + new_css + content[old_css_end:]

# 3. HTML Search Box replacement
old_html = '''        <div class="search-box">
            <input type="text" id="start-input" placeholder="Start location" value="Chennai Central">
            <input type="text" id="end-input" placeholder="Destination" value="Coimbatore Junction">
            <button class="btn btn-primary" id="find-safest-route">
                <i class="fas fa-shield-alt"></i> Safe Route
            </button>
        </div>'''
new_html = '''        <div class="search-box-container">
            <div class="search-input-wrapper">
                <i class="fas fa-dot-circle text-primary"></i>
                <input type="text" id="start-input" placeholder="Start location" value="Chennai Central" autocomplete="off">
                <div id="start-autocomplete" class="autocomplete-dropdown"></div>
            </div>
            <button id="swap-locations" class="swap-btn" title="Swap Locations">
                <i class="fas fa-exchange-alt"></i>
            </button>
            <div class="search-input-wrapper">
                <i class="fas fa-map-marker-alt text-danger"></i>
                <input type="text" id="end-input" placeholder="Destination" value="Coimbatore Junction" autocomplete="off">
                <div id="end-autocomplete" class="autocomplete-dropdown"></div>
            </div>
            <button class="btn btn-primary w-100" id="find-safest-route" style="margin-top: 10px;">
                <i class="fas fa-shield-alt"></i> Find Safe Route
            </button>
        </div>'''
content = content.replace(old_html, new_html)

# 4. JS Autocomplete replacement
old_js = '''        function setupCityAutocomplete() {
            const startInput = document.getElementById('start-input');
            const endInput = document.getElementById('end-input');

            startInput.addEventListener('input', function () {
                showCitySuggestions(this);
            });

            endInput.addEventListener('input', function () {
                showCitySuggestions(this);
            });
        }

        function showCitySuggestions(input) {
            // Simple autocomplete implementation
            const value = input.value.toLowerCase();
            const matches = Object.keys(tamilNaduData.cities).filter(city =>
                city.toLowerCase().includes(value)
            );
        }'''
new_js = '''        function setupCityAutocomplete() {
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
                if(!e.target.closest('.search-input-wrapper')) {
                    document.querySelectorAll('.autocomplete-dropdown').forEach(d => d.style.display = 'none');
                }
            });
        }

        function showCitySuggestions(input, type) {
            const value = input.value.toLowerCase();
            const dropdown = document.getElementById(`${type}-autocomplete`);
            if(!dropdown) return;
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
        }'''
content = content.replace(old_js, new_js)

# 5. JS locateUser replacement with geowatch tracking
old_locate = '''        function locateUser() {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by this browser.");
                return;
            }

            const locateBtn = document.getElementById('locate-me');
            const originalHtml = locateBtn.innerHTML;
            locateBtn.innerHTML = '<div class="loading"></div>';

            navigator.geolocation.getCurrentPosition(
                function (position) {
                    userLocation = [position.coords.latitude, position.coords.longitude];

                    L.marker(userLocation)
                        .addTo(map)
                        .bindPopup('Your current location')
                        .openPopup();

                    map.setView(userLocation, 13);
                    document.getElementById('start-input').value = "Current Location";

                    locateBtn.innerHTML = originalHtml;
                },
                function (error) {
                    alert("Unable to retrieve your location. Please ensure location services are enabled.");
                    locateBtn.innerHTML = originalHtml;
                }
            );
        }'''
new_locate = '''        let watchId = null;
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
        }'''
content = content.replace(old_locate, new_locate)

# Write back
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Update script executed.")
