// Test the roles API directly
async function testRolesAPI() {
  try {
    console.log('Testing roles API...')

    // First, let's try to get a session
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session')
    console.log('Session response status:', sessionResponse.status)

    if (sessionResponse.ok) {
      const session = await sessionResponse.json()
      console.log('Session data:', session)

      if (session.user) {
        console.log('User type:', session.user.userType)

        // Now try to get roles
        const rolesResponse = await fetch('http://localhost:3000/api/roles', {
          headers: {
            'Cookie': sessionResponse.headers.get('set-cookie') || ''
          }
        })

        console.log('Roles response status:', rolesResponse.status)

        if (rolesResponse.ok) {
          const roles = await rolesResponse.json()
          console.log('Roles data:', roles)
          console.log('Number of roles:', roles.length)
        } else {
          const error = await rolesResponse.text()
          console.log('Roles API error:', error)
        }
      } else {
        console.log('No user in session')
      }
    } else {
      console.log('No session found')
    }

  } catch (error) {
    console.error('Error testing roles API:', error)
  }
}

testRolesAPI()


