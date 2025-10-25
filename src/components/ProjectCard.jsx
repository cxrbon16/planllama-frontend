import { getInitials, getStatusColor } from '../utils/dataMappers'

function ProjectCard({ project, role, members = [], onEdit, onDelete, onClick }) {
  const progress = project.progress ?? (project.tasksCount > 0 ? (project.completedTasks / project.tasksCount) * 100 : 0)

  const statusColor = project.statusColor || getStatusColor(project.statusLabel || project.statusKey)
  const statusLabel = project.statusLabel || project.status || 'Planning'

  const getStatusBorderColor = () => {
    switch(statusColor) {
      case 'success': return 'var(--bs-success)'
      case 'primary': return 'var(--bs-primary)'
      case 'warning': return 'var(--bs-warning)'
      case 'danger': return 'var(--bs-danger)'
      default: return '#6c757d'
    }
  }

  const getProgressBarClass = () => {
    if (progress >= 100) return 'bg-success'
    if (progress >= 70) return 'bg-primary'
    if (progress >= 40) return 'bg-warning'
    if (progress > 0) return 'bg-warning'
    return 'bg-secondary'
  }

  const handleCardClick = (e) => {
    // Eğer butonlara tıklanmadıysa, kart tıklamasını işle
    if (!e.target.closest('button')) {
      onClick()
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(project)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(project.id)
  }

  return (
      <div
          className="project-card"
          onClick={handleCardClick}
          style={{
            cursor: 'pointer',
            borderLeft: `8px solid ${getStatusBorderColor()}`
          }}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-0">{project.title}</h6>
          <span className={`badge bg-${statusColor}`}>
          {statusLabel}
        </span>
        </div>

        <p className="text-muted small mb-3">{project.description || project.metadata?.description || 'No description available.'}</p>

        <div className="mb-2">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Progress</span>
            <span>{project.completedTasks || 0}/{project.tasksCount || 0} tasks</span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div
                className={`progress-bar ${getProgressBarClass()}`}
                role="progressbar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
            ></div>
          </div>
        </div>

        {/* Project Members */}
        {members.length > 0 && (
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <div className="d-flex" style={{ marginLeft: '-5px' }}>
                {members.slice(0, 4).map((member, index) => (
                  <div
                    key={member.id || member.employeeId || member.name}
                    className="position-relative"
                    style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                    title={`${member.name} - ${member.role || member.userRole}`}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: (member.userRole || member.user_role) === 'pm' ? '#0d6efd' : '#198754',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        border: '2px solid white',
                        cursor: 'pointer'
                      }}
                    >
                      {member.avatar || getInitials(member.name)}
                    </div>
                  </div>
                ))}
                {members.length > 4 && (
                  <div
                    className="position-relative"
                    style={{ marginLeft: '-8px' }}
                    title={`+${members.length - 4} more members`}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        border: '2px solid white'
                      }}
                    >
                      +{members.length - 4}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-muted ms-2 small">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            <svg width="14" height="14" fill="currentColor" className="me-1" viewBox="0 0 16 16">
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
            </svg>
            Estimated: {project.estimatedTime || 'N/A'}
          </div>

          {role === 'pm' && (
              <div className="btn-group btn-group-sm">
                <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleEdit}
                    title="Edit Project"
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                  </svg>
                </button>
                <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleDelete}
                    title="Delete Project"
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              </div>
          )}
        </div>
      </div>
  )
}

export default ProjectCard