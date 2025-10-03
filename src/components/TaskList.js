import React from 'react';
import './TaskList.css';

const TaskList = ({ tasks, onEdit, onDelete }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  };

  if (tasks.length === 0) {
    return <div className="no-tasks">No tasks found.</div>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task._id || task.id} className="task-item">
          <div className="task-content">
            <h4 className="task-title">{task.title}</h4>
            <p className="task-description">{task.description || ''}</p>
            <span className={`task-status ${getStatusClass(task.status)}`}>
              {task.status}
            </span>
          </div>
          <div className="task-actions">
            <button 
              onClick={() => onEdit(task)}
              className="edit-button"
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(task._id || task.id)}
              className="delete-button"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
