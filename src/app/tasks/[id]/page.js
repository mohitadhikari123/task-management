'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/app/components/ui/ToastContainer';
import { getTask, addComment, deleteTask } from '@/app/services/taskService';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export default function TaskDetails() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const { addToast } = useToast();
  
  useEffect(() => {
    if (!token) return;
    
    const fetchTask = async () => {
      try {
        const taskId = params.id;
        const response = await getTask(token, taskId);
        
        if (response.success) {
          setTask(response.data);
        } else {
          addToast('Failed to load task details', 'error');
          router.replace('/tasks');
        }
      } catch (error) {
        console.error('Error fetching task details:', error);
        if (error.message && error.message.includes('not found')) {
          router.replace('/tasks');
        } else {
          // window.location.href = '/tasks';
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [params.id, token, router]);

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

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  
  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      addToast('Comment cannot be empty', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await addComment(token, task._id, comment);
      
      if (response.success) {
        addToast('Comment added successfully', 'success');
        setComment('');
        // Refresh the task data to include the new comment
        const updatedTask = await getTask(token, task._id);
        if (updatedTask.success) {
          setTask(updatedTask.data);
        }
      } else {
        addToast(response.message || 'Failed to add comment', 'error');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      addToast(error.message || 'Failed to add comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await deleteTask(token, task._id);
      
      if (response.success) {
        addToast('Task deleted successfully', 'success');
        router.replace('/tasks');
      } else {
        // Server returned an error response
        addToast(response.message || 'Failed to delete task', 'error');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // If the error contains a 401 (unauthorized) message, show it clearly
      if (error.message && error.message.includes('Not authorized')) {
        addToast('You do not have permission to delete this task. Only the task creator or an admin can delete tasks.', 'error');
      } else {
        addToast(error.message || 'Failed to delete task', 'error');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!task) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">Task not found</div>
        <Link href="/tasks" className="btn btn-primary mt-3">Back to Tasks</Link>
      </div>
    );
  }

  // Calculate if task is overdue
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link href="/tasks" className="btn btn-link ps-0" style={{ paddingLeft: '0px' }}>
            &larr; Back to Tasks
          </Link>
          <h1 className="mt-2">{task.title}</h1>
        </div>
        <div className="d-flex gap-3" style={{ flexWrap: 'wrap' ,justifyContent: 'center'}}>
          <Link href={`/tasks/${task._id}/edit`} className="btn btn-outline-primary me-2">
            Edit Task
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="card" style={{ 
        backgroundColor: '#1a1a1a', 
        color: '#e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ 
          height: '4px', 
          background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)' 
        }}></div>
        
        <div className="card-body p-4">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="d-flex mb-3 gap-3">
                <span className={`badge ${getStatusClass(task.status)} me-2`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  {formatStatus(task.status)}
                </span>
                <span className={`badge ${getPriorityClass(task.priority)}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
              
              <div className="mb-4">
                <h5>Description</h5>
                <p>{task.description}</p>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="mb-3">
                <h5>Due Date</h5>
                <p className={isOverdue ? 'text-danger' : ''}>
                  {new Date(task.dueDate).toLocaleDateString()} 
                  {isOverdue && <span className="badge bg-danger ms-2">Overdue</span>}
                </p>
              </div>
              
              <div className="mb-3">
                <h5>Assigned To</h5>
                <p>{task.assignedTo ? task.assignedTo.name : 'Unassigned'}</p>
              </div>
              
              <div className="mb-3">
                <h5>Created By</h5>
                <p>{task.createdBy ? task.createdBy.name : 'Unknown'}</p>
              </div>
              
              <div>
                <h5>Created At</h5>
                <p>{new Date(task.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          <div className="mt-4">
            <h5>Comments</h5>
            {task.comments && task.comments.length > 0 ? (
              <div className="mt-3">
                {task.comments.map((comment, index) => (
                  <div key={index} className="mb-3 p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <div className="d-flex justify-content-between mb-2">
                      <strong>{comment.user ? comment.user.name : 'Unknown'}</strong>
                      <small>{new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                    <p className="mb-0">{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No comments yet</p>
            )}
            
            <div className="mt-4">
              <h6>Add Comment</h6>
              <textarea 
                className="form-control mb-2" 
                rows="3" 
                placeholder="Write your comment here..."
                value={comment}
                onChange={handleCommentChange}
                style={{ 
                  backgroundColor: '#242424',
                  color: '#e0e0e0',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              ></textarea>
              <button 
                className="btn btn-primary"
                onClick={handleSubmitComment}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 