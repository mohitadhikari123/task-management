const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Get all users (available to all authenticated users)
export const getUsers = async (token) => {
  try {
    console.log('Calling users API with token');
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API error:', data);
      return { 
        success: false, 
        message: data.message || 'Failed to fetch users'
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

// Get a single user by ID
export const getUser = async (token, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
}; 