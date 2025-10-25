function TaskCard({ task, role, onEdit, onDelete, onUpdateStatus }) {
  const statusColor = task.statusColor || 'secondary'
  const priorityColor = task.priorityColor || 'secondary'
  const priorityLabel = task.priorityLabel || 'Priority'

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task)
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id)
    }
  }

  const handleUpdateStatus = () => {
    if (onUpdateStatus) {
      onUpdateStatus(task)
    }
  }

  return (
    <div
      className={`task-card priority-${task.priorityKey || 'medium'}`}
      style={{ borderLeft: `8px solid var(--bs-${statusColor})` }}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="mb-1 flex-grow-1">{task.title}</h6>
        <span className={`badge bg-${statusColor} ms-2`}>
          {task.statusLabel}
        </span>
      </div>

      <p className="text-muted small mb-3">{task.description || 'No description provided.'}</p>

      <div className="mb-2">
        <div className="small text-muted mb-1">
          <strong>Project:</strong> {task.projectTitle}
        </div>
        <div className="small text-muted mb-1">
          <strong>Assignee:</strong> {task.assigneeName || 'Unassigned'}
        </div>
        <div className="small text-muted">
          <strong>Estimated:</strong> {task.estimatedTime || 'Not set'}
        </div>
        {task.epicName && (
          <div className="small text-muted">
            <strong>Epic:</strong> {task.epicName}
          </div>
        )}
        {task.labels && task.labels.length > 0 && (
          <div className="small text-muted">
            <strong>Labels:</strong> {task.labels.join(', ')}
          </div>
        )}
      </div>

      <div className="mb-3">
        <span className={`badge bg-${priorityColor}`}>
          {priorityLabel} priority
        </span>
      </div>

      {role === 'executor' && (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary flex-grow-1"
            onClick={handleUpdateStatus}
          >
            Update Status
          </button>
        </div>
      )}

      {role === 'pm' && (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary flex-grow-1"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default TaskCard
