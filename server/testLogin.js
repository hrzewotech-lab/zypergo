async function testLogin() {
  const email = 'testuser_' + Date.now() + '@gmail.com';
  const phone = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // random 10 digit phone
  
  console.log(`Testing signup with Email: ${email}, Phone: ${phone}`);
  
  try {
    const res = await fetch('http://localhost:5000/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'Customer',
        name: 'Test User',
        email,
        phone
      })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
testLogin();
