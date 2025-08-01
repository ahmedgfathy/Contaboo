// Test the login API directly
const testLogin = async () => {
  try {
    console.log('Testing login API...')
    
    const response = await fetch('http://localhost:3003/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'ahmedgfathy@gmail.com',
        password: 'ZeroCall20!@H'
      }),
    })

    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', data)

    if (response.ok) {
      console.log('✅ Login successful!')
      console.log('User:', data.user)
      console.log('Token:', data.token ? 'Present' : 'Missing')
    } else {
      console.log('❌ Login failed:', data.message)
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testLogin()
