const API_URL = 'http://localhost:3000/api';

async function debugFetch() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@rentmaroc.com', password: 'admin123' })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token obtained.');

        console.log('\n2. Fetching Clients...');
        const clientsRes = await fetch(`${API_URL}/clients`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!clientsRes.ok) {
            console.error(`Clients fetch failed: ${clientsRes.status} ${await clientsRes.text()}`);
        } else {
            const clients = await clientsRes.json();
            console.log(`Clients found: ${clients.length}`);
            if (clients.length > 0) console.log('First client:', clients[0].nom);
        }

        console.log('\n3. Fetching Vehicles...');
        const vehiclesRes = await fetch(`${API_URL}/vehicules?limit=1000`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!vehiclesRes.ok) {
            console.error(`Vehicles fetch failed: ${vehiclesRes.status} ${await vehiclesRes.text()}`);
        } else {
            const vehiclesData = await vehiclesRes.json();
            // Handle both array and object with pagination
            const vehicles = vehiclesData.vehicules || vehiclesData;
            console.log(`Vehicles found: ${vehicles.length}`);
            if (vehicles.length > 0) console.log('First vehicle:', vehicles[0].marque);
        }

        console.log('\n4. Fetching Settings...');
        const settingsRes = await fetch(`${API_URL}/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!settingsRes.ok) {
            console.error(`Settings fetch failed: ${settingsRes.status} ${await settingsRes.text()}`);
        } else {
            const settings = await settingsRes.json();
            console.log(`Settings fetched successfully. Keys: ${Object.keys(settings).join(', ')}`);
        }

    } catch (error) {
        console.error('Debug Error:', error);
    }
}

debugFetch();
