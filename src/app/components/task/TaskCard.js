'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/app/components/ui/ToastContainer';
import { updateTask } from '@/app/services/taskService';

const TaskCard = ({ task }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { token } = useAuth();
  const { addToast } = useToast();

  // Get priority class for styling
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low':
        return 'priority-low';
      case 'medium':
        return 'priority-medium';
      case 'high':
        return 'priority-high';
      case 'urgent':
        return 'priority-urgent';
      default:
        return 'priority-medium';
    }
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'todo':
        return 'status-todo';
      case 'in-progress':
        return 'status-in-progress';
      case 'review':
        return 'status-review';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-todo';
    }
  };

  // Format status text for display
  const formatStatus = (status) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'todo':
        return 'To Do';
      case 'review':
        return 'Review';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Calculate if task is overdue
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    setIsCompleting(true);
    
    try {
      const response = await updateTask(token, task._id, {
        status: 'completed'
      });
      
      if (response.success) {
        addToast('Task marked as completed', 'success');
        // Refresh the page to show updated task status
        window.location.reload();
      } else {
        addToast(response.message || 'Failed to complete task', 'error');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      addToast(error.message || 'Failed to complete task', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="card h-100 shadow-sm" style={{ 
      backgroundColor: '#242424', 
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      transition: 'transform 0.2s, box-shadow 0.2s',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0.1)';
    }}
    >
      <div className="card-header d-flex justify-content-between align-items-center" style={{
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <span className={`badge ${getStatusClass(task.status)}`} style={{
          fontSize: '0.8rem',
          padding: '0.4rem 0.6rem',
          borderRadius: '4px'
        }}>
          {formatStatus(task.status)}
        </span>
        <span className={`badge ${getPriorityClass(task.priority)}`} style={{
          fontSize: '0.8rem',
          padding: '0.4rem 0.6rem',
          borderRadius: '4px'
        }}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>
      <div className="card-body" style={{ padding: '1.25rem' }}>
        <h5 className="card-title mb-3" style={{ 
          fontWeight: '600',
          fontSize: '1.1rem', 
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          <Link href={`/tasks/${task._id}`} className="text-decoration-none" style={{ color: '#e0e0e0' }}>
            {task.title}
          </Link>
        </h5>
        <p className="card-text text-muted mb-3" style={{ 
          height: '3rem', 
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          fontSize: '0.9rem',
          opacity: '0.7'
        }}>
          {task.description}
        </p>
        
        <div className="task-details" style={{ fontSize: '0.9rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <strong style={{ color: '#c9c9c9' }}>Due:</strong>{' '}
              <span className={isOverdue ? 'text-danger' : ''} style={{ 
                padding: '0.2rem 0.5rem', 
                backgroundColor: isOverdue ? 'rgba(220, 53, 69, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}>
                {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && <span className="ms-1">⚠️</span>}
              </span>
            </div>
          </div>
          
          {task.assignedTo && (
            <div className="mb-2 d-flex align-items-center">
              <strong style={{ color: '#c9c9c9', marginRight: '0.5rem' }}>Assigned to:</strong> 
              <span style={{ 
                backgroundColor: 'rgba(66, 135, 245, 0.2)', 
                padding: '0.2rem 0.5rem', 
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}>
                {task.assignedTo.name ? task.assignedTo.name : (typeof task.assignedTo === 'string' ? 'User ID: ' + task.assignedTo.substring(0, 8) + '...' : 'Unknown')}
              </span>
            </div>
          )}
          
          {task.createdBy && (
            <div className="d-flex align-items-center">
              <strong style={{ color: '#c9c9c9', marginRight: '0.5rem' }}>Created by:</strong> 
              <span style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                padding: '0.2rem 0.5rem', 
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}>
                {task.createdBy.name ? task.createdBy.name : (typeof task.createdBy === 'string' ? 'User ID: ' + task.createdBy.substring(0, 8) + '...' : 'Unknown')}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-3 text-muted" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
          Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
        </div>
      </div>
      <div className="card-footer" style={{
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '0.75rem'
      }}>
        {task.status !== 'completed' ? (
          <div className="d-flex gap-3">
            <Link href={`/tasks/${task._id}`} className="btn btn-sm btn-outline-primary flex-grow-1" style={{
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '500',
              padding: '0.375rem 0.75rem',
              transition: 'all 0.2s'
            }}>
              View Details
            </Link>
            <button 
              className="btn btn-sm btn-success flex-grow-1" 
              onClick={handleCompleteTask}
              disabled={isCompleting}
              style={{
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                padding: '0.375rem 0.75rem',
                background: isCompleting ? '#198754' : 'linear-gradient(45deg, #198754, #20c997)',
                border: 'none',
                transition: 'all 0.2s'
              }}
            >
              {isCompleting ? 'Completing...' : 'Complete'}
            </button>
          </div>
        ) : (
          <Link href={`/tasks/${task._id}`} className="btn btn-sm btn-outline-primary w-100" style={{
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '500',
            padding: '0.375rem 0.75rem',
            transition: 'all 0.2s'
          }}>
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default TaskCard; 