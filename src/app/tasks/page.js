'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/app/components/ui/ToastContainer';
import { getTasks, searchTasks } from '@/app/services/taskService';
import TaskCard from '@/app/components/task/TaskCard';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { token } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    // If search is active, don't trigger filter-based fetching
    if (!isSearching) {
      fetchTasks();
    }
  }, [statusFilter, priorityFilter, dueDateFilter, page, token, isSearching]);

  const fetchTasks = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const filters = {};
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      // Apply priority filter
      if (priorityFilter !== 'all') {
        filters.priority = priorityFilter;
      }
      
      // Apply due date filter
      if (dueDateFilter !== 'all') {
        filters.dueDate = dueDateFilter;
      }
      
      const response = await getTasks(token, page, 10, filters);
      setTasks(response.data || []);
      
      // Calculate total pages
      if (response.pagination) {
        const total = Math.ceil(response.count / 10);
        setTotalPages(total || 1);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // If search is cleared, reset to normal filtering
      setIsSearching(false);
      return fetchTasks();
    }
    
    setLoading(true);
    setIsSearching(true);
    
    try {
      const response = await searchTasks(token, searchQuery);
      setTasks(response.data || []);
      setTotalPages(1); // Search doesn't use pagination in this implementation
    } catch (error) {
      console.error('Error searching tasks:', error);
      addToast('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchTasks();
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page on filter change
    setIsSearching(false); // Exit search mode when using filters
  };

  const handlePriorityFilterChange = (e) => {
    setPriorityFilter(e.target.value);
    setPage(1);
    setIsSearching(false);
  };

  const handleDueDateFilterChange = (e) => {
    setDueDateFilter(e.target.value);
    setPage(1);
    setIsSearching(false);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Tasks</h1>
        <Link href="/tasks/create" className="btn btn-primary">
          Create New Task
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-4">
        <div className="card" style={{ backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
          <div className="card-body">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="input-group search-input-container">
                
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search tasks by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  suppressHydrationWarning
                  style={{ backgroundColor: '#242424', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button 
                  className="btn btn-primary" 
                  type="submit"
                  style={{
                    background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                    border: 'none'
                  }}
                  suppressHydrationWarning
                >
                  Search
                </button>
                {isSearching && (
                  <button 
                    className="btn btn-secondary" 
                    type="button"
                    onClick={clearSearch}
                    style={{ backgroundColor: '#333', border: 'none' }}
                    suppressHydrationWarning
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
            
            {/* Active Filters Display */}
            {!isSearching && (statusFilter !== 'all' || priorityFilter !== 'all' || dueDateFilter !== 'all') && (
              <div className="mb-3">
                <div className="d-flex flex-wrap gap-2">
                  <span className="text-muted me-2">Active Filters:</span>
                  
                  {statusFilter !== 'all' && (
                    <span className="filter-pill filter-pill-status">
                      Status: {statusFilter.replace('-', ' ')}
                      <span 
                        className="close-btn"
                        onClick={() => {
                          setStatusFilter('all');
                          setPage(1);
                        }}
                      >
                        <i className="bi bi-x-circle"></i>
                      </span>
                    </span>
                  )}
                  
                  {priorityFilter !== 'all' && (
                    <span className="filter-pill filter-pill-priority">
                      Priority: {priorityFilter}
                      <span 
                        className="close-btn"
                        onClick={() => {
                          setPriorityFilter('all');
                          setPage(1);
                        }}
                      >
                        <i className="bi bi-x-circle"></i>
                      </span>
                    </span>
                  )}
                  
                  {dueDateFilter !== 'all' && (
                    <span className="filter-pill filter-pill-date">
                      Due Date: {
                        dueDateFilter === 'today' 
                          ? 'Today' 
                          : dueDateFilter === 'week' 
                            ? 'This Week' 
                            : dueDateFilter === 'month' 
                              ? 'This Month' 
                              : 'Overdue'
                      }
                      <span 
                        className="close-btn"
                        onClick={() => {
                          setDueDateFilter('all');
                          setPage(1);
                        }}
                      >
                        <i className="bi bi-x-circle"></i>
                      </span>
                    </span>
                  )}
                  
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={() => {
                      setStatusFilter('all');
                      setPriorityFilter('all');
                      setDueDateFilter('all');
                      setPage(1);
                    }}
                    style={{ fontSize: '0.8rem', padding: '2px 8px', marginLeft: 'auto' }}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
            
            <div className="filter-container">
              <h6 className="filter-title">Filter Tasks</h6>
              <div className="row">
                {/* Status Filter */}
                <div className="col-md-4 mb-3">
                  <label htmlFor="status-filter" className="form-label">Status</label>
                  <select 
                    id="status-filter" 
                    className="form-control"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    disabled={isSearching}
                    suppressHydrationWarning
                    style={{ backgroundColor: '#242424', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                {/* Priority Filter */}
                <div className="col-md-4 mb-3">
                  <label htmlFor="priority-filter" className="form-label">Priority</label>
                  <select 
                    id="priority-filter" 
                    className="form-control"
                    value={priorityFilter}
                    onChange={handlePriorityFilterChange}
                    disabled={isSearching}
                    suppressHydrationWarning
                    style={{ backgroundColor: '#242424', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                {/* Due Date Filter */}
                <div className="col-md-4 mb-3">
                  <label htmlFor="due-date-filter" className="form-label">Due Date</label>
                  <select 
                    id="due-date-filter" 
                    className="form-control"
                    value={dueDateFilter}
                    onChange={handleDueDateFilterChange}
                    disabled={isSearching}
                    style={{ backgroundColor: '#242424', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.1)' }}
                    suppressHydrationWarning
                  >
                    <option value="all">All Due Dates</option>
                    <option value="today">Due Today</option>
                    <option value="week">Due This Week</option>
                    <option value="month">Due This Month</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {isSearching && (
            <div className="alert alert-info mb-4">
              Search results for: "{searchQuery}" ({tasks.length} tasks found)
            </div>
          )}
        
          {tasks.length === 0 ? (
            <div className="alert alert-info">
              {isSearching 
                ? "No tasks found matching your search." 
                : "No tasks found with the selected filters. Try changing your filters or create a new task."}
            </div>
          ) : (
            <div className="row">
              {tasks.map((task) => (
                <div key={task._id} className="col-md-4 mb-4">
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination - Only show when not searching */}
          {!isSearching && totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav aria-label="Task pagination">
                <ul className="pagination">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index} className={`page-item ${page === index + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
