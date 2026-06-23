async function test() {
    const endpoints = [
        'http://127.0.0.1:3000/api/employees',
        'http://127.0.0.1:3000/api/areas',
        'http://127.0.0.1:3000/api/settings',
        'http://127.0.0.1:3000/api/permissions',
        'http://127.0.0.1:3000/api/schedules'
    ];

    for (const url of endpoints) {
        try {
            console.log(`Testing ${url}...`);
            const res = await fetch(url);
            console.log(`Status: ${res.status}`);
            if (!res.ok) {
                const text = await res.text();
                console.log(`Error body: ${text}`);
            } else {
                const data = await res.json();
                console.log(`Success: ${Array.isArray(data) ? data.length + ' items' : 'Object'}`);
            }
        } catch (error: any) {
            console.log(`Fetch error: ${error.message}`);
        }
        console.log('---');
    }
}

test();
