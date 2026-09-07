/* FlightOps Executive - offline demo dataset.
   Ports the original SQLite seeders (airports, fleet, fixed Gulf Air routes) into a
   deterministic in-browser generator so the demo runs with dummy data and no backend. */

const FlightOpsData = (() => {
    'use strict';

    // ================= AIRPORTS (InitialDatabaseSeeder + full route network) =================
    const airports = [
        { code: 'BAH', name: 'Bahrain International', city: 'Manama', country: 'Bahrain', lat: 26.2708, lng: 50.6331, tz: 'AST' },
        { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', lat: 51.4700, lng: -0.4543, tz: 'GMT' },
        { code: 'LGW', name: 'London Gatwick', city: 'London', country: 'UK', lat: 51.1481, lng: -0.1903, tz: 'GMT' },
        { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'UK', lat: 53.3537, lng: -2.2750, tz: 'GMT' },
        { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479, tz: 'CET' },
        { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622, tz: 'CET' },
        { code: 'FCO', name: 'Leonardo da Vinci', city: 'Rome', country: 'Italy', lat: 41.8003, lng: 12.2389, tz: 'CET' },
        { code: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italy', lat: 45.6306, lng: 8.7281, tz: 'CET' },
        { code: 'ATH', name: 'Athens International', city: 'Athens', country: 'Greece', lat: 37.9364, lng: 23.9445, tz: 'EET' },
        { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkiye', lat: 41.2753, lng: 28.7519, tz: 'TRT' },
        { code: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco', lat: 33.3675, lng: -7.5899, tz: 'WET' },
        { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', lat: 30.1219, lng: 31.4056, tz: 'EET' },
        { code: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781, tz: 'EST' },
        { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657, tz: 'GST' },
        { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE', lat: 24.4330, lng: 54.6511, tz: 'GST' },
        { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', lat: 25.2731, lng: 51.6081, tz: 'AST' },
        { code: 'KWI', name: 'Kuwait International', city: 'Kuwait City', country: 'Kuwait', lat: 29.2266, lng: 47.9689, tz: 'AST' },
        { code: 'MCT', name: 'Muscat International', city: 'Muscat', country: 'Oman', lat: 23.5933, lng: 58.2844, tz: 'GST' },
        { code: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia', lat: 24.9576, lng: 46.6988, tz: 'AST' },
        { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia', lat: 21.6796, lng: 39.1565, tz: 'AST' },
        { code: 'MED', name: 'Prince Mohammad bin Abdulaziz', city: 'Medina', country: 'Saudi Arabia', lat: 24.5534, lng: 39.7051, tz: 'AST' },
        { code: 'AMM', name: 'Queen Alia International', city: 'Amman', country: 'Jordan', lat: 31.7226, lng: 35.9932, tz: 'EET' },
        { code: 'BGW', name: 'Baghdad International', city: 'Baghdad', country: 'Iraq', lat: 33.2625, lng: 44.2346, tz: 'AST' },
        { code: 'GYD', name: 'Heydar Aliyev International', city: 'Baku', country: 'Azerbaijan', lat: 40.4675, lng: 50.0467, tz: 'AZT' },
        { code: 'BOM', name: 'Chhatrapati Shivaji', city: 'Mumbai', country: 'India', lat: 19.0896, lng: 72.8656, tz: 'IST' },
        { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi', country: 'India', lat: 28.5562, lng: 77.1000, tz: 'IST' },
        { code: 'BLR', name: 'Kempegowda International', city: 'Bengaluru', country: 'India', lat: 13.1986, lng: 77.7066, tz: 'IST' },
        { code: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India', lat: 12.9941, lng: 80.1709, tz: 'IST' },
        { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad', country: 'India', lat: 17.2403, lng: 78.4294, tz: 'IST' },
        { code: 'COK', name: 'Cochin International', city: 'Kochi', country: 'India', lat: 10.1520, lng: 76.4019, tz: 'IST' },
        { code: 'TRV', name: 'Trivandrum International', city: 'Thiruvananthapuram', country: 'India', lat: 8.4821, lng: 76.9200, tz: 'IST' },
        { code: 'GOI', name: 'Goa International', city: 'Goa', country: 'India', lat: 15.3808, lng: 73.8314, tz: 'IST' },
        { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan', lat: 24.9065, lng: 67.1608, tz: 'PKT' },
        { code: 'LHE', name: 'Allama Iqbal International', city: 'Lahore', country: 'Pakistan', lat: 31.5216, lng: 74.4036, tz: 'PKT' },
        { code: 'ISB', name: 'Islamabad International', city: 'Islamabad', country: 'Pakistan', lat: 33.5490, lng: 72.8256, tz: 'PKT' },
        { code: 'MLE', name: 'Velana International', city: 'Male', country: 'Maldives', lat: 4.1918, lng: 73.5290, tz: 'MVT' },
        { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501, tz: 'ICT' },
        { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915, tz: 'SGT' },
        { code: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines', lat: 14.5086, lng: 121.0198, tz: 'PHT' },
        { code: 'PVG', name: 'Shanghai Pudong', city: 'Shanghai', country: 'China', lat: 31.1443, lng: 121.8083, tz: 'CST' }
    ];

    const airportByCode = Object.fromEntries(airports.map(a => [a.code, a]));

    // ================= FLEET =================
    const aircrafts = [
        { registration: 'A9C-TA', type: 'Boeing 787-9', status: 'Active' },
        { registration: 'A9C-TB', type: 'Boeing 787-9', status: 'Active' },
        { registration: 'A9C-TC', type: 'Boeing 787-9', status: 'Active' },
        { registration: 'A9C-DC', type: 'Airbus A321neo', status: 'Active' },
        { registration: 'A9C-DD', type: 'Airbus A321neo', status: 'Active' },
        { registration: 'A9C-XA', type: 'Airbus A320neo', status: 'Active' },
        { registration: 'A9C-XB', type: 'Airbus A320neo', status: 'Active' },
        { registration: 'A9C-NA', type: 'Airbus A320neo', status: 'Maintenance' },
        { registration: 'A9C-NB', type: 'Airbus A321neo', status: 'Active' },
        { registration: 'A9C-CD', type: 'Boeing 787-9', status: 'Active' }
    ];

    // ================= FIXED ROUTES (FixedRouteInitializer) =================
    const routeSeed = [
        // EUROPE
        ['GF001', 'BAH', 'LHR'], ['GF002', 'LHR', 'BAH'],
        ['GF003', 'BAH', 'LGW'], ['GF004', 'LGW', 'BAH'],
        ['GF005', 'BAH', 'MAN'], ['GF006', 'MAN', 'BAH'],
        ['GF009', 'BAH', 'CDG'], ['GF010', 'CDG', 'BAH'],
        ['GF011', 'BAH', 'FRA'], ['GF012', 'FRA', 'BAH'],
        ['GF015', 'BAH', 'FCO'], ['GF016', 'FCO', 'BAH'],
        ['GF019', 'BAH', 'MXP'], ['GF020', 'MXP', 'BAH'],
        ['GF031', 'BAH', 'ATH'], ['GF032', 'ATH', 'BAH'],
        ['GF043', 'BAH', 'IST'], ['GF044', 'IST', 'BAH'],
        // AFRICA
        ['GF065', 'BAH', 'CMN'], ['GF066', 'CMN', 'BAH'],
        ['GF079', 'BAH', 'CAI'], ['GF080', 'CAI', 'BAH'],
        // NORTH AMERICA
        ['GF090', 'BAH', 'JFK'], ['GF091', 'JFK', 'BAH'],
        // GCC & MIDDLE EAST
        ['GF500', 'BAH', 'DXB'], ['GF501', 'DXB', 'BAH'],
        ['GF540', 'BAH', 'AUH'], ['GF541', 'AUH', 'BAH'],
        ['GF520', 'BAH', 'DOH'], ['GF521', 'DOH', 'BAH'],
        ['GF210', 'BAH', 'KWI'], ['GF211', 'KWI', 'BAH'],
        ['GF560', 'BAH', 'MCT'], ['GF561', 'MCT', 'BAH'],
        ['GF160', 'BAH', 'RUH'], ['GF161', 'RUH', 'BAH'],
        ['GF170', 'BAH', 'JED'], ['GF171', 'JED', 'BAH'],
        ['GF180', 'BAH', 'MED'], ['GF181', 'MED', 'BAH'],
        ['GF075', 'BAH', 'AMM'], ['GF076', 'AMM', 'BAH'],
        ['GF077', 'BAH', 'BGW'], ['GF078', 'BGW', 'BAH'],
        ['GF081', 'BAH', 'GYD'], ['GF082', 'GYD', 'BAH'],
        // INDIA
        ['GF110', 'BAH', 'BOM'], ['GF111', 'BOM', 'BAH'],
        ['GF130', 'BAH', 'DEL'], ['GF131', 'DEL', 'BAH'],
        ['GF280', 'BAH', 'BLR'], ['GF281', 'BLR', 'BAH'],
        ['GF052', 'BAH', 'MAA'], ['GF053', 'MAA', 'BAH'],
        ['GF270', 'BAH', 'HYD'], ['GF271', 'HYD', 'BAH'],
        ['GF260', 'BAH', 'COK'], ['GF261', 'COK', 'BAH'],
        ['GF262', 'BAH', 'TRV'], ['GF263', 'TRV', 'BAH'],
        ['GF284', 'BAH', 'GOI'], ['GF285', 'GOI', 'BAH'],
        // PAKISTAN
        ['GF771', 'BAH', 'KHI'], ['GF772', 'KHI', 'BAH'],
        ['GF765', 'BAH', 'LHE'], ['GF766', 'LHE', 'BAH'],
        ['GF773', 'BAH', 'ISB'], ['GF774', 'ISB', 'BAH'],
        // ASIA
        ['GF151', 'BAH', 'MLE'], ['GF152', 'MLE', 'BAH'],
        ['GF150', 'BAH', 'BKK'],
        ['GF165', 'BAH', 'SIN'], ['GF166', 'SIN', 'BAH'],
        ['GF156', 'BAH', 'MNL'], ['GF157', 'MNL', 'BAH'],
        ['GF188', 'BAH', 'PVG'], ['GF189', 'PVG', 'BAH']
    ];

    const depSlots = [30, 130, 345, 500, 670, 820, 975, 1135, 1295, 1390]; // minutes from midnight

    function hash(flightNo) {
        let n = 0;
        for (let i = 0; i < flightNo.length; i++) n = (Math.imul(n, 31) + flightNo.charCodeAt(i)) | 0;
        return Math.abs(n);
    }

    function scheduleFor(flightNumber) {
        const n = hash(flightNumber);
        const depMinutes = depSlots[n % depSlots.length];
        const durationMinutes = 60 + (n % 420);
        return { n, depMinutes, durationMinutes };
    }

    const fixedRoutes = routeSeed.map(([flightNumber, origin, destination], index) => {
        const { depMinutes, durationMinutes } = scheduleFor(flightNumber);
        return {
            id: index + 1,
            flightNumber,
            origin,
            destination,
            stdDepartureMinutes: depMinutes,
            stdArrivalMinutes: (depMinutes + durationMinutes) % 1440,
            durationMinutes
        };
    });

    const disruptionTypes = ['Weather', 'Technical', 'Air Traffic Control', 'Security', 'Crew Availability', 'Late Arrival of Inbound', 'Operational', 'Commercial'];
    const disruptionSeverities = ['Low', 'Medium', 'High', 'Critical'];
    const disruptionText = {
        'Weather': 'Adverse weather at destination reduced landing capacity.',
        'Technical': 'Mechanical issue reported by engineering. Monitoring systems.',
        'Air Traffic Control': 'Air traffic flow restriction imposed on the departure slot.',
        'Security': 'Additional security screening applied to the departure gate.',
        'Crew Availability': 'Operating crew held by an inbound connection.',
        'Late Arrival of Inbound': 'Aircraft rotation delayed by a late inbound sector.',
        'Operational': 'Ground equipment shortage impacting departure window.',
        'Commercial': 'Commercial cancellation. Passengers re-booked on the next sector.'
    };

    // ================= FLIGHT GENERATION (DailyFlightGenerator + DataSimulator) =================
    // Base day is today at 00:00 UTC, matching the original rolling daily window.
    function baseDay(offsetDays = 0) {
        const now = new Date();
        return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays, 0, 0, 0);
    }

    function buildFlights() {
        const list = [];
        let id = 1;

        [-1, 0, 1].forEach(dayOffset => {
            const dayStart = baseDay(dayOffset);

            fixedRoutes.forEach((route, index) => {
                const n = hash(route.flightNumber + dayOffset);
                const scheduledDeparture = new Date(dayStart + route.stdDepartureMinutes * 60000);
                const scheduledArrival = new Date(scheduledDeparture.getTime() + route.durationMinutes * 60000);

                let delayMinutes = 0;
                let delayReason = null;
                if (n % 7 === 0) {
                    delayMinutes = 18 + (n % 42);
                    delayReason = disruptionTypes[n % 6];
                } else if (n % 11 === 0) {
                    delayMinutes = 65 + (n % 40);
                    delayReason = disruptionTypes[(n + 3) % 6];
                } else if (n % 5 === 0) {
                    delayMinutes = 5 + (n % 9);
                }

                const cancelled = n % 53 === 0;

                list.push({
                    id: id++,
                    flightNumber: route.flightNumber,
                    routeId: route.id,
                    aircraft: aircrafts[index % aircrafts.length],
                    departureAirport: route.origin,
                    arrivalAirport: route.destination,
                    scheduledDeparture,
                    scheduledArrival,
                    delayMinutes,
                    delayReason,
                    cancelled,
                    severitySeed: n
                });
            });
        });

        return list;
    }

    let flights = buildFlights();

    // Live status transitions, ported from DataSimulator.ExecuteAsync.
    function decorate(flight, now) {
        const delay = flight.delayMinutes || 0;
        const actualDeparture = new Date(flight.scheduledDeparture.getTime() + delay * 60000);
        const actualArrival = new Date(flight.scheduledArrival.getTime() + delay * 60000);

        let status = 'Scheduled';
        let remarks = null;
        let actualDep = null;
        let actualArr = null;

        if (flight.cancelled) {
            status = 'Cancelled';
            remarks = 'Flight cancelled due to fleet optimization';
        } else if (now >= actualArrival) {
            status = 'Arrived';
            actualDep = actualDeparture;
            actualArr = actualArrival;
            remarks = delay > 15 ? `Landed with ${delay}m delay` : 'Landed on time';
        } else if (now >= actualDeparture) {
            status = now > actualDeparture.getTime() + 15 * 60000 ? 'Enroute' : 'Departed';
            actualDep = actualDeparture;
            remarks = delay > 15 ? 'Departed behind schedule' : 'Airborne, on profile';
        } else if (delay > 15) {
            status = 'Delayed';
            remarks = 'Anticipated delay due to ground handling';
        } else if (now >= actualDeparture.getTime() - 45 * 60000) {
            status = 'Boarding';
            remarks = 'Boarding in progress';
        }

        return {
            ...flight,
            status,
            remarks,
            actualDeparture: actualDep,
            actualArrival: actualArr,
            plannedDeparture: actualDeparture,
            plannedArrival: actualArrival
        };
    }

    function snapshot(now = new Date()) {
        return flights.map(f => decorate(f, now.getTime()));
    }

    function todaysFlights(now = new Date()) {
        const start = baseDay(0);
        const end = start + 86400000;
        return snapshot(now).filter(f => f.scheduledDeparture.getTime() >= start && f.scheduledDeparture.getTime() < end);
    }

    // ================= DISRUPTIONS =================
    function disruptions(now = new Date()) {
        return snapshot(now)
            .filter(f => f.cancelled || (f.delayMinutes || 0) > 15)
            .map(f => {
                const type = f.cancelled ? 'Commercial' : (f.delayReason || 'Operational');
                const severity = f.cancelled
                    ? 'Critical'
                    : disruptionSeverities[Math.min(3, Math.floor((f.delayMinutes || 0) / 30))];
                const reportedAt = new Date(f.scheduledDeparture.getTime() - (30 + (f.severitySeed % 90)) * 60000);
                const resolved = f.status === 'Arrived';
                return {
                    disruptionId: f.id,
                    flightId: f.id,
                    flightNumber: f.flightNumber,
                    from: f.departureAirport,
                    to: f.arrivalAirport,
                    type,
                    severity,
                    description: disruptionText[type] || 'Operational disruption recorded.',
                    reportedAt,
                    resolvedAt: resolved ? f.actualArrival : null,
                    resolvedBy: resolved ? 'ops_controller' : null
                };
            })
            .sort((a, b) => b.reportedAt - a.reportedAt);
    }

    function activeDisruptions(now = new Date()) {
        const start = baseDay(0);
        const end = start + 86400000;
        return disruptions(now).filter(d => !d.resolvedAt && d.reportedAt.getTime() >= start - 86400000 && d.reportedAt.getTime() < end);
    }

    // ================= DASHBOARD AGGREGATES (DashboardController) =================
    function summary(now = new Date()) {
        const today = todaysFlights(now);
        const total = today.length;
        const delayed = today.filter(f => (f.delayMinutes || 0) > 15).length;
        const cancelled = today.filter(f => f.status === 'Cancelled').length;
        const airborne = today.filter(f => f.status === 'Departed' || f.status === 'Enroute').length;
        const onTime = Math.max(0, total - delayed - cancelled);
        return {
            totalFlights: total,
            delayedFlights: delayed,
            cancelledFlights: cancelled,
            activeAircrafts: airborne,
            onTimePerformance: total === 0 ? 0 : Math.round((onTime * 1000) / total) / 10
        };
    }

    function statusCounts(now = new Date()) {
        const counts = {};
        todaysFlights(now).forEach(f => { counts[f.status] = (counts[f.status] || 0) + 1; });
        return Object.entries(counts)
            .map(([status, count]) => ({ status, count }))
            .sort((a, b) => b.count - a.count);
    }

    function delayReasons(now = new Date()) {
        const counts = {};
        todaysFlights(now)
            .filter(f => f.delayReason)
            .forEach(f => { counts[f.delayReason] = (counts[f.delayReason] || 0) + 1; });
        return Object.entries(counts)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }

    // ================= MAP (MapController.GetAirborneFlights) =================
    function airborne(now = new Date()) {
        const t = now.getTime();
        return snapshot(now)
            .filter(f => f.status === 'Departed' || f.status === 'Enroute')
            .map(f => {
                const dep = airportByCode[f.departureAirport];
                const arr = airportByCode[f.arrivalAirport];
                if (!dep || !arr) return null;

                const totalMinutes = (f.plannedArrival - f.plannedDeparture) / 60000;
                let elapsedMinutes = Math.max(0, (t - f.plannedDeparture.getTime()) / 60000);
                elapsedMinutes = Math.min(elapsedMinutes, totalMinutes);
                const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes);
                const progress = totalMinutes === 0 ? 0 : elapsedMinutes / totalMinutes;

                return {
                    flightNumber: f.flightNumber,
                    status: 'EN ROUTE',
                    departureAirport: f.departureAirport,
                    arrivalAirport: f.arrivalAirport,
                    delayMinutes: f.delayMinutes,
                    latitude: dep.lat + (arr.lat - dep.lat) * progress,
                    longitude: dep.lng + (arr.lng - dep.lng) * progress,
                    depLat: dep.lat, depLng: dep.lng,
                    arrLat: arr.lat, arrLng: arr.lng,
                    progress: Math.round(progress * 1000) / 10,
                    elapsedMinutes: Math.round(elapsedMinutes),
                    remainingMinutes: Math.round(remainingMinutes)
                };
            })
            .filter(Boolean);
    }

    // ================= USERS (seeded, demo only - no authentication) =================
    const users = [
        { username: 'admin', role: 'Admin', createdAt: new Date(baseDay(-180)) },
        { username: 'demo', role: 'User', createdAt: new Date(baseDay(-120)) },
        { username: 'ops.controller', role: 'User', createdAt: new Date(baseDay(-64)) },
        { username: 'network.manager', role: 'Admin', createdAt: new Date(baseDay(-31)) },
        { username: 'duty.officer', role: 'User', createdAt: new Date(baseDay(-9)) }
    ];

    // ================= WORLD OUTLINE FOR THE OFFLINE MAP =================
    // Coarse continent polygons ([lon, lat]) used instead of the original Leaflet tile layer.
    const world = [
        [[-168, 66], [-160, 71], [-140, 70], [-125, 70], [-110, 68], [-95, 68], [-85, 70], [-75, 68], [-62, 60], [-55, 52], [-60, 46], [-66, 44], [-70, 42], [-74, 39], [-76, 35], [-81, 31], [-80, 25], [-84, 30], [-90, 29], [-97, 26], [-97, 22], [-105, 20], [-106, 23], [-114, 28], [-117, 32], [-122, 37], [-124, 43], [-125, 49], [-131, 53], [-140, 60], [-150, 59], [-158, 56], [-165, 60]],
        [[-92, 15], [-88, 16], [-83, 10], [-79, 9], [-77, 8], [-83, 13], [-88, 13]],
        [[-81, 8], [-75, 11], [-70, 12], [-62, 10], [-52, 5], [-50, 0], [-44, -2], [-38, -5], [-35, -8], [-39, -13], [-42, -22], [-48, -25], [-53, -33], [-58, -38], [-62, -40], [-65, -45], [-68, -50], [-70, -55], [-75, -50], [-73, -42], [-71, -30], [-70, -18], [-76, -14], [-81, -6], [-80, 0], [-78, 2]],
        [[-17, 15], [-16, 22], [-10, 27], [0, 32], [10, 34], [11, 37], [20, 33], [25, 32], [32, 31], [35, 28], [38, 22], [43, 12], [51, 12], [48, 5], [41, -2], [40, -10], [35, -17], [32, -26], [27, -34], [20, -35], [18, -32], [13, -23], [12, -16], [9, -1], [9, 4], [3, 6], [-5, 5], [-8, 4], [-13, 9]],
        [[-10, 36], [-9, 43], [-2, 43], [-2, 48], [-5, 48], [0, 50], [4, 52], [8, 54], [10, 57], [13, 55], [19, 54], [21, 56], [24, 60], [21, 66], [15, 68], [24, 71], [30, 70], [33, 66], [40, 66], [45, 68], [60, 70], [70, 73], [80, 74], [90, 76], [100, 77], [110, 74], [125, 74], [140, 72], [160, 70], [170, 68], [179, 66], [179, 60], [170, 60], [160, 58], [155, 52], [143, 45], [135, 45], [130, 42], [126, 38], [122, 31], [118, 24], [110, 20], [105, 10], [100, 6], [98, 8], [95, 16], [90, 22], [88, 21], [80, 15], [77, 8], [73, 16], [70, 22], [67, 24], [60, 25], [57, 20], [53, 17], [50, 13], [45, 13], [43, 17], [38, 25], [34, 28], [35, 32], [30, 32], [28, 37], [23, 35], [19, 40], [15, 38], [12, 45], [8, 44], [3, 43], [-2, 36], [-6, 36]],
        [[114, -22], [113, -26], [115, -34], [120, -34], [129, -32], [135, -35], [140, -38], [147, -38], [150, -35], [153, -28], [153, -25], [146, -19], [142, -11], [136, -12], [130, -11], [125, -14], [122, -18]],
        [[95, 5], [104, 2], [110, -1], [117, -4], [114, -8], [106, -7], [100, 0]]
    ];

    return {
        airports,
        airportByCode,
        aircrafts,
        fixedRoutes,
        users,
        world,
        disruptionTypes,
        snapshot,
        todaysFlights,
        disruptions,
        activeDisruptions,
        summary,
        statusCounts,
        delayReasons,
        airborne,
        addRoute(route) {
            const id = fixedRoutes.length ? Math.max(...fixedRoutes.map(r => r.id)) + 1 : 1;
            const { depMinutes, durationMinutes } = scheduleFor(route.flightNumber);
            fixedRoutes.push({
                id,
                flightNumber: route.flightNumber,
                origin: route.origin,
                destination: route.destination,
                stdDepartureMinutes: depMinutes,
                stdArrivalMinutes: (depMinutes + durationMinutes) % 1440,
                durationMinutes
            });
            flights = buildFlights();
            return id;
        },
        removeRoute(id) {
            const index = fixedRoutes.findIndex(r => r.id === id);
            if (index >= 0) fixedRoutes.splice(index, 1);
            flights = buildFlights();
        },
        addFlight(flight) {
            const id = flights.length ? Math.max(...flights.map(f => f.id)) + 1 : 1;
            flights.push({
                id,
                flightNumber: flight.flightNumber,
                routeId: null,
                aircraft: aircrafts[id % aircrafts.length],
                departureAirport: flight.departureAirport,
                arrivalAirport: flight.arrivalAirport,
                scheduledDeparture: flight.scheduledDeparture,
                scheduledArrival: flight.scheduledArrival,
                delayMinutes: 0,
                delayReason: null,
                cancelled: false,
                severitySeed: id
            });
            return id;
        },
        addUser(user) { users.push({ ...user, createdAt: new Date() }); },
        removeUser(username) {
            const index = users.findIndex(u => u.username === username);
            if (index >= 0) users.splice(index, 1);
        }
    };
})();
