async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY || '';
  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{
          role: 'user',
          content: 'Hello, write a short sentence testing the connection.'
        }]
      })
    });
    const json = await response.json();
    console.log('Status Code:', response.status);
    console.log('Response JSON:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

testGroq();
