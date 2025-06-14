import axios from "axios";

const API_BASE_URL = "https://whiteboardfinal-1.onrender.com/canvas"; // Your Render backend URL

export const updateCanvas = async (canvasId, elements) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication token not found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/update/${canvasId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ elements })
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response:', await response.text());
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update canvas');
    }

    return data;
  } catch (error) {
    console.error('Update canvas error:', error);
    throw error;
  }
};

export const loadCanvas = async (canvasId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(
      `${API_BASE_URL}/load/${canvasId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Canvas loaded successfully from the database!", response.data);
    return response.data;
  } catch (error) {
    console.error("Error loading canvas:", error);
    throw error;
  }
};
