'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastContainer';
import { getAssignedTasks, getCreatedTasks, getOverdueTasks } from '../services/taskService';
import TaskCard from '../components/task/TaskCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Dashboard() {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, token } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      setLoading(true);
      try {
        // Fetch all required data in parallel
        const [assignedRes, createdRes, overdueRes] = await Promise.all([
          getAssignedTasks(token),
          getCreatedTasks(token),
          getOverdueTasks(token)
        ]);

        setAssignedTasks(assignedRes.data);
        setCreatedTasks(createdRes.data);
        setOverdueTasks(overdueRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, addToast]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-4">
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h1>Dashboard</h1>
          <Link href="/tasks/create" className="btn btn-primary">
            Create New Task
          </Link>
        </div>
        {/* Summary Cards */}
        <div className="row mb-4 cards-section" style={{ display: 'flex', gap:'1rem'}}>
          <div className="col-md-4 mb-3" style={{ width: '100%'}}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Assigned Tasks</h5>
                <p className="card-text display-4">{assignedTasks.length}</p>
                <Link href="/tasks?filter=assigned" className="text-primary">
                  View All
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3" style={{ width: '100%'}}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Created Tasks</h5>
                <p className="card-text display-4">{createdTasks.length}</p>
                <Link href="/tasks?filter=created" className="text-primary">
                  View All
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3" style={{ width: '100%'}}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title text-danger">Overdue Tasks</h5>
                <p className="card-text display-4 text-danger">{overdueTasks.length}</p>
                <Link href="/tasks?filter=overdue" className="text-danger">
                  View All
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="row cards-section" style={{ display: 'flex', gap:'1rem', justifyContent: 'space-between'}}>


        {/* Overdue Tasks Section */}
        <section className="mb-5 card-container" style={{ width: '100%'}}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Overdue Tasks</h2>
            <Link href="/tasks?filter=overdue" className="text-primary">
              View All
            </Link>
          </div>

          {overdueTasks.length === 0 ? (
            <div className="alert alert-success">
              No overdue tasks! You're all caught up.
            </div>
          ) : (
            <div className="row" style={{ overflowY: 'scroll', height: '35rem', scrollbarWidth: 'none'}}>
              {overdueTasks.slice(0, 3).map((task) => (
                <div key={task._id} className="col-md-4 mb-3">
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tasks Assigned To You */}
        <section className="mb-5 card-container" style={{ width: '100%'}}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2> Assigned Tasks</h2>
            <Link href="/tasks?filter=assigned" className="text-primary">
              View All
            </Link>
          </div>

          {assignedTasks.length === 0 ? (
            <div className="alert alert-info">
              No tasks assigned to you at the moment.
            </div>
          ) : (
            <div className="row" style={{ overflowY: 'scroll', height: '35rem', scrollbarWidth: 'none'}}>
              {assignedTasks.slice(0, 3).map((task) => (
                <div key={task._id} className="col-md-4 mb-3">
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tasks Created By You */}
        <section className="card-container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2> Created Tasks</h2>
            <Link href="/tasks?filter=created" className="text-primary">
              View All
            </Link>
          </div>

          {createdTasks.length === 0 ? (
            <div className="alert alert-info">
              You haven't created any tasks yet.
            </div>
          ) : (
            <div className="row" style={{ overflowY: 'scroll', height: '35rem', scrollbarWidth: 'none'}}>
              {createdTasks.slice(0, 3).map((task) => (
                <div key={task._id} className="col-md-4 mb-3">
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 