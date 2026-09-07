const aircraft = [
    { id: '789', name: 'Boeing 787-9 Dreamliner', total: 282, business: 26, economy: 256, role: 'Long-haul wide-body flagship', crew: '2-3 pilots, 9-11 cabin crew', engine: 'GE GEnx / RR Trent 1000', range: 'Long-haul (7,635 nm)', businessRows: 5, economyStart: 20, economyRows: 18, layout: 'wide' },
    { id: '32Q', name: 'Airbus A321neo', total: 166, business: 16, economy: 150, role: 'Cutting-edge technology and modern innovation', crew: '2 pilots, 5 cabin crew', engine: 'PW1100G / LEAP-1A', range: 'Medium-long haul', businessRows: 4, economyStart: 5, economyRows: 25, layout: 'narrow' },
    { id: '32N', name: 'Airbus A320neo', total: 136, business: 16, economy: 120, role: 'Comfortable journey with exceptional service', crew: '2 pilots, 4 cabin crew', engine: 'PW1100G / LEAP-1A', range: 'Short-medium haul', businessRows: 4, economyStart: 5, economyRows: 20, layout: 'narrow' },
    { id: '320', name: 'Airbus A320-200', total: 136, business: 16, economy: 120, role: 'Modern features and state-of-the-art technology', crew: '2 pilots, 4 cabin crew', engine: 'CFM56 / IAE V2500', range: 'Short-medium haul (3,300 nm)', businessRows: 4, economyStart: 5, economyRows: 20, layout: 'narrow' }
];
const picker = document.querySelector('#aircraftPicker');
const fields = ['aircraftName', 'totalSeats', 'businessSeats', 'economySeats', 'role', 'crew', 'engine', 'range'];
let activeAircraft = aircraft[0];

function updateDetails() {
    activeAircraft = aircraft.find(item => item.id === picker.value) || aircraft[0];
    fields.forEach(field => document.querySelector(`#${field}`).textContent = activeAircraft[{ aircraftName: 'name', totalSeats: 'total', businessSeats: 'business', economySeats: 'economy', role: 'role', crew: 'crew', engine: 'engine', range: 'range' }[field]]);
}
function seatButton(row, letter, category, isReserved, isExit) {
    const button = document.createElement('button');
    const seatId = `${row}${letter}`;
    button.type = 'button'; button.className = `seat ${category}${isReserved ? ' reserved' : ''}${isExit ? ' exit-row' : ''}`; button.textContent = letter; button.dataset.seat = seatId;
    if (isReserved) { button.disabled = true; button.title = `${seatId} is reserved`; }
    else { button.addEventListener('click', () => selectSeat(button, seatId, category, isExit)); }
    return button;
}
function createRow(row, category, letters, isExit = false) {
    const rowElement = document.createElement('div'); rowElement.className = 'seat-row';
    const number = document.createElement('span'); number.className = 'row-number'; number.textContent = row; rowElement.append(number);
    letters.forEach((letter, index) => {
        if (index === Math.ceil(letters.length / 2)) { const aisle = document.createElement('span'); aisle.className = 'aisle'; rowElement.append(aisle); }
        const reserved = category === 'economy' && (row + letter.charCodeAt(0)) % 11 === 0;
        rowElement.append(seatButton(row, letter, category, reserved, isExit));
    });
    while (rowElement.children.length < 9) rowElement.append(document.createElement('span'));
    return rowElement;
}
function buildMap() {
    const map = document.querySelector('#seatMap'); map.replaceChildren();
    const businessLabel = document.createElement('p'); businessLabel.className = 'cabin-label'; businessLabel.textContent = 'Business Class'; map.append(businessLabel);
    for (let row = 1; row <= activeAircraft.businessRows; row++) map.append(createRow(row, 'business', ['A', 'C', 'D', 'F']));
    const divider = document.createElement('p'); divider.className = 'facility'; divider.textContent = 'Galley and lavatories'; map.append(divider);
    const economyLabel = document.createElement('p'); economyLabel.className = 'cabin-label'; economyLabel.textContent = 'Economy Class'; map.append(economyLabel);
    for (let offset = 0; offset < activeAircraft.economyRows; offset++) {
        const row = activeAircraft.economyStart + offset;
        const isExit = offset === 7 || offset === 8;
        map.append(createRow(row, 'economy', ['A', 'B', 'C', 'D', 'E', 'F'], isExit));
        if (offset === 8) { const exit = document.createElement('p'); exit.className = 'facility'; exit.textContent = 'Emergency exit row'; map.append(exit); }
    }
}
function selectSeat(button, seatId, category, isExit) {
    document.querySelectorAll('.seat.selected').forEach(seat => seat.classList.remove('selected'));
    button.classList.add('selected');
    const cabin = category === 'business' ? 'Business Class' : 'Economy Class';
    const features = category === 'business' ? ['Recliner or flatbed seat', 'Personal entertainment', 'Power and USB charging'] : ['Seat-back entertainment', 'USB charging', 'Wi-Fi enabled'];
    if (isExit) features.push('Extra legroom; exit-row briefing required');
    document.querySelector('#selectionSummary').textContent = `${seatId} selected · ${cabin}`;
    document.querySelector('#seatPanel').innerHTML = `<p class="panel-caption">Seat details</p><h2>${seatId} · ${cabin}</h2><ul>${features.map(feature => `<li>${feature}</li>`).join('')}</ul>`;
}
function openMap() {
    buildMap(); document.querySelector('#mapTitle').textContent = activeAircraft.name; document.querySelector('#mapSeatCount').textContent = `${activeAircraft.business} Business · ${activeAircraft.economy} Economy`;
    document.querySelector('#selectionScreen').hidden = true; document.querySelector('#mapScreen').hidden = false; document.querySelector('#backButton').hidden = false; window.scrollTo(0, 0);
}
picker.innerHTML = aircraft.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
picker.addEventListener('change', updateDetails); document.querySelector('#viewMapButton').addEventListener('click', openMap);
document.querySelector('#backButton').addEventListener('click', () => { document.querySelector('#mapScreen').hidden = true; document.querySelector('#selectionScreen').hidden = false; document.querySelector('#backButton').hidden = true; window.scrollTo(0, 0); });
updateDetails();