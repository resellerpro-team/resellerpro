async function verify() {
    const res = await fetch('http://localhost:3000/api/ekodrix-panel/system');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
verify();
