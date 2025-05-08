'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/app/components/ui/ToastContainer';
import { createTask } from '@/app/services/taskService';
import { getUsers } from '@/app/services/userService';

export default function CreateTask() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
        assignedTo: ''
    });

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const router = useRouter();
    const { token, user: currentUser } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        if (!token) return;
        
        const fetchUsers = async () => {
            try {
                console.log('Fetching users...');
                const response = await getUsers(token);
                console.log('Users API response:', response);
                if (response.success) {
                    console.log('Users found:', response.data);
                    setUsers(response.data);
                } else {
                    console.error('Failed to load users:', response.message);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        
        fetchUsers();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.dueDate) {
            addToast('Please fill all required fields', 'error');
            return;
        }

        setLoading(true);

        try {
            // Format date for API
            const taskData = {
                ...formData,
                dueDate: new Date(formData.dueDate).toISOString()
            };

            // Handle the "Me" option
            if (formData.assignedTo === "me") {
                taskData.assignedTo = currentUser._id;
            }

            // Remove empty assignedTo field
            if (!taskData.assignedTo) {
                delete taskData.assignedTo;
            }

            const response = await createTask(token, taskData);

            addToast('Task created successfully', 'success');
            router.push('/tasks');
        } catch (error) {
            console.error('Error creating task:', error);
            addToast(error.message || 'Failed to create task', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
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
                        <div className="card-header" style={{
                            backgroundColor: '#242424',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '1.5rem'
                        }}>
                            <h1 className="h3 mb-0">Create New Task</h1>
                        </div>
                        <div className="card-body" style={{ padding: '2rem' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="row" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',

                                }}>
                                    {/* Left Column */}
                                    <div className="col-md-6 pe-md-4" style={{
                                        width: '48%'
                                    }}>
                                        <div className="form-group mb-4">
                                            <label htmlFor="title" className="form-label">Title *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                suppressHydrationWarning
                                                required
                                                style={{
                                                    backgroundColor: '#242424',
                                                    color: '#e0e0e0',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            />
                                        </div>

                                        <div className="form-group mb-4">
                                            <label htmlFor="description" className="form-label">Description *</label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                name="description"
                                                rows="5"
                                                value={formData.description}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    backgroundColor: '#242424',
                                                    color: '#e0e0e0',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            ></textarea>
                                        </div>

                                        <div className="form-group mb-4">
                                            <label htmlFor="dueDate" className="form-label">Due Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="dueDate"
                                                name="dueDate"
                                                value={formData.dueDate}
                                                onChange={handleChange}
                                                suppressHydrationWarning
                                                required
                                                style={{
                                                    backgroundColor: '#242424',
                                                    color: '#e0e0e0',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="col-md-6 ps-md-4" style={{
                                        width: '48%', display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',

                                    }}>
                                        <div className="form-group mb-4">
                                            <label htmlFor="priority" className="form-label">Priority</label>
                                            <select
                                                className="form-control"
                                                id="priority"
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleChange}
                                                style={{
                                                    backgroundColor: '#242424',
                                                    color: '#e0e0e0',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>

                                        <div className="form-group mb-4">
                                            <label htmlFor="status" className="form-label">Status</label>
                                            <select
                                                className="form-control"
                                                id="status"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                style={{
                                                    backgroundColor: '#242424',
                                                    color: '#e0e0e0',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <option value="todo">To Do</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="review">Review</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>

                                        <div className="form-group mb-4">
                                            <label htmlFor="assignedTo" className="form-label">Assign To</label>
                                            <select
                                                className="form-control"
                                                id="assignedTo"
                                                name="assignedTo"
                                                value={formData.assignedTo}
                                                onChange={handleChange}
                                                style={{
                                                    backgroundColor: '#242424',
                                                    color: '#e0e0e0',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}
                                            >
                                                <option value="">Select a user</option>
                                                {currentUser ? (
                                                    currentUser.role === 'user' ? (
                                                        <option value="me">Me (Assign to myself)</option>
                                                    ) : (
                                                        <>
                                                            <option value="me">Me (Assign to myself)</option>
                                                            {users.map(user => (
                                                                <option key={user._id} value={user._id}>
                                                                    {user.name}
                                                                </option>
                                                            ))}
                                                        </>
                                                    )
                                                ) : null}
                                            </select>
                                            <small className="text-muted">Choose the user you want to assign this task to.</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => router.back()}
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            border: 'none',
                                            padding: '0.75rem 1.5rem'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                        style={{
                                            background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                                            border: 'none',
                                            padding: '0.75rem 1.5rem'
                                        }}
                                    >
                                        {loading ? 'Creating...' : 'Create Task'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
