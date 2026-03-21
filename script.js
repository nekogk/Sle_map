const mapSize = 65536;
const bounds = [[0, 0], [mapSize, mapSize]];

// 현재 선택된 언어를 저장할 변수
let currentLang = 'lo';
let locationData = [];

const isMobile = window.innerWidth < 768;
const zoomThresholds = isMobile ? 
    {'a': -6, 'b': -4.5, 'c': -3, 'd': -1.5, 'e': 0} : 
    {'a': -5, 'b': -3.5, 'c': -2, 'd': -0.5, 'e': 1};
const zoomThresholdsDisappear = isMobile ?
    {'a': -4, 'b': -2.5, 'c': -1, 'd': 0.5, 'e': 2} :
    {'a': -3, 'b': -1.5, 'c': 0, 'd': 1.5, 'e': 3};
const fontSizeThresholds = isMobile ?
    {'a': '4vw', 'b': '3.6vw', 'c': '3vw', 'd': '2.4vw', 'e': '2vw'} :
    {'a': '2vw', 'b': '1.8vw', 'c': '1.5vw', 'd': '1.2vw', 'e': '1vw'};

const map = isMobile ?
    L.map('map', {
        crs: L.CRS.Simple,
        zoomSnap: 1/4,
        minZoom: -6,
        maxZoom: 2,
        zoomControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
    }) :
    L.map('map', {
        crs: L.CRS.Simple,
        zoomSnap: 1/4,
        minZoom: -5,
        maxZoom: 3,
        zoomControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0
    });

L.imageOverlay('Sle_map.svg', bounds).addTo(map);
map.fitBounds(bounds);
map.setView([44000, 29000], 0);

let markerLayer = L.layerGroup().addTo(map);

// 2. 마커 렌더링 함수 수정
function renderMarkers() {
    markerLayer.clearLayers();
    const currentZoom = map.getZoom(); // 현재 지도의 줌 레벨 가져오기

    locationData.forEach(loc => {
        if (currentZoom >= zoomThresholds[loc.rank] && currentZoom <= zoomThresholdsDisappear[loc.rank]) {
            const text = loc.names[currentLang] || loc.names['en'];
            
            const fontSize = fontSizeThresholds[loc.rank];

            const textIcon = L.divIcon({
                className: 'map-label',
                html: `<div style="font-size: ${fontSize}">${text}</div>`,
                iconSize: [200, 40],
                iconAnchor: [100, 10]
            });

            L.marker(loc.coords, { icon: textIcon }).addTo(markerLayer);
        }
    });
}

// 3. 이벤트 리스너: 줌이 끝날 때마다 호출
map.on('zoomend', renderMarkers);

// 4. 언어 변경 함수
function changeLang(lang, btnElement) {
    // 1. 모든 버튼에서 active 제거 및 현재 버튼에 추가
    document.querySelectorAll('.lang-group .control-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    // 2. body 태그의 언어 클래스 교체
    document.body.className = '';
    document.body.classList.add(`lang-${lang}`);

    // 3. 현재 언어 변수 업데이트 및 마커 다시 그리기
    currentLang = lang;
    renderMarkers();
}

// 초기 로드 시 실행 (첫 접속은 로포나어이므로)
document.addEventListener('DOMContentLoaded', () => {
    changeLang('lo', document.querySelector('.lang-group .control-btn.active'));
});

// 데이터 로드
fetch('locations.json')
    .then(res => res.json())
    .then(data => {
        locationData = data;
        renderMarkers();
    });

// 좌표 표시 로직
const coordsDisplay = document.getElementById('coords-display');
map.on('mousemove', function(e) {
    coordsDisplay.innerHTML = `${Math.round(e.latlng.lat)}, ${Math.round(e.latlng.lng)}`;
});

/*
// 좌표 클립보드 복사
map.on('click', function(e) {
    // 1. 좌표 추출 및 반올림
    const y = Math.round(e.latlng.lat);
    const x = Math.round(e.latlng.lng);
    
    // 2. 복사할 문자열 형식 지정 (예: [32768, 32768])
    const coordString = `[${y}, ${x}]`;
    
    // 3. 클립보드로 복사
    navigator.clipboard.writeText(coordString).then(() => {
        // 4. 복사 성공 시 사용자에게 알림 (간단한 alert 혹은 커스텀 UI)
        console.log('복사된 좌표:', coordString);
        showToast(`좌표 ${coordString}가 복사되었습니다!`);
    }).catch(err => {
        console.error('복사 실패:', err);
    });
});
*/