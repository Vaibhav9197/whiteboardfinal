import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Board from '../components/Board';
import Toolbar from '../components/Toolbar';
import Toolbox from '../components/Toolbox';
import BoardProvider from '../store/BoardProvider';
import ToolboxProvider from '../store/ToolboxProvider';
import { updateCanvas, loadCanvas } from '../utils/api';
import './Canvas.css';

function Canvas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [canvasData, setCanvasData] = useState(null);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [history, setHistory] = useState([]);

  // Replace localhost with your deployed backend URL here:
  const SOCKET_SERVER_URL = 'https://whiteboardfinal-1.onrender.com';

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && id) {
      socket.emit('join-canvas', id);
    }
  }, [socket, id]);

  useEffect(() => {
    if (socket) {
      const handleCanvasUpdate = (updatedElements) => {
        setCanvasData(prevData => ({
          ...prevData,
          elements: updatedElements
        }));
      };

      socket.on('canvas-updated', handleCanvasUpdate);

      return () => {
        socket.off('canvas-updated', handleCanvasUpdate);
      };
    }
  }, [socket]);

  useEffect(() => {
    const fetchCanvas = async () => {
      try {
        const data = await loadCanvas(id);
        setCanvasData(data);
      } catch (err) {
        console.error('Error loading canvas:', err);
        setError(err.message);
      }
    };

    fetchCanvas();
  }, [id]);

  const handleCanvasChange = useCallback(async (updatedElements) => {
    if (!updatedElements) return;
    
    try {
      setHistory(prev => [...prev, canvasData.elements]);

      setCanvasData(prevData => ({
        ...prevData,
        elements: updatedElements,
      }));

      socket?.emit('canvas-update', {
        canvasId: id,
        elements: updatedElements
      });

      const timeoutId = setTimeout(async () => {
        try {
          const data = await updateCanvas(id, updatedElements);
          console.log('Canvas updated successfully:', data);
        } catch (error) {
          console.error('Failed to save canvas:', error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    } catch (err) {
      console.error('Error updating canvas:', err);
      setError(err.message);
    }
  }, [id, socket, canvasData]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    const previousElements = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    setCanvasData(prevData => ({
      ...prevData,
      elements: previousElements
    }));

    socket?.emit('canvas-update', {
      canvasId: id,
      elements: previousElements
    });
  }, [history, id, socket]);

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/profile')}>Back to Profile</button>
      </div>
    );
  }

  if (!canvasData) {
    return <div className="loading">Loading canvas...</div>;
  }

  return (
    <div className="canvas-container">
      <BoardProvider 
        initialElements={canvasData.elements}
        onUndo={handleUndo}
      >
        <ToolboxProvider>
          <Toolbar />
          <Board 
            onCanvasChange={handleCanvasChange}
          />
          <Toolbox />
        </ToolboxProvider>
      </BoardProvider>
    </div>
  );
}

export default Canvas;
