const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Get all tasks with pagination and filters
export const getTasks = async (token, page = 1, limit = 10, filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    });

    const response = await fetch(`${API_URL}/api/tasks?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Get a single task by ID
export const getTask = async (token, taskId) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};

// Create a new task
export const createTask = async (token, taskData) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create task');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update a task
export const updateTask = async (token, taskId, taskData) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update task');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (token, taskId) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete task');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

// Assign a task to a user
export const assignTask = async (token, taskId, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assignedTo: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to assign task');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error assigning task ${taskId}:`, error);
    throw error;
  }
};

// Add a comment to a task
export const addComment = async (token, taskId, comment) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: comment }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add comment');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error adding comment to task ${taskId}:`, error);
    throw error;
  }
};

// Search tasks
export const searchTasks = async (token, searchTerm) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks/search?q=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching tasks:', error);
    throw error;
  }
};

// Get overdue tasks
export const getOverdueTasks = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks/filter/overdue`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch overdue tasks');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    throw error;
  }
};

// Get tasks assigned to current user
export const getAssignedTasks = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks/filter/assigned`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch assigned tasks');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    throw error;
  }
};

// Get tasks created by current user
export const getCreatedTasks = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/tasks/filter/created`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch created tasks');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching created tasks:', error);
    throw error;
  }
}; 