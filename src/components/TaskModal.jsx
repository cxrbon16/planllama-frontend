import { useState, useEffect } from 'react'
import MarkdownEditor from './MarkdownEditor'
import { useEmployee } from '../context/EmployeeContext'
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS, parseLabels } from '../utils/dataMappers'

function TaskModal({
  show,
  onClose,
  onSave,
  task = null,
  projectId = null,
  projectOptions = [],
  employeeOptions = [],
  role = 'pm',
  onSubmitStatus,
}) {
  const { currentEmployee } = useEmployee()
  const isExecutor = role === 'executor'

  const initialForm = {
    title: '',
    description: '',
    status_name: 'proposed',
    priority: 'medium',
    project_id: projectId || '',
    assignee_id: '',
    estimated_time: '',
    epic_name: '',
    labels: '',
  }

  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status_name: task.statusKey || 'proposed',
        priority: task.priorityKey || 'medium',
        project_id: task.projectId || projectId || '',
        assignee_id: task.assigneeId || '',
        estimated_time: task.estimatedTime || '',
        epic_name: task.epicName || '',
        labels: Array.isArray(task.labels) ? task.labels.join(', ') : '',
      })
    } else {
      setFormData(initialForm)
    }
  }, [task, projectId, show])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isExecutor) {
      if (!task || !onSubmitStatus) return
      await onSubmitStatus(task.id, formData.status_name)
      return
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      status_name: formData.status_name,
      priority: formData.priority,
      project_id: formData.project_id ? Number(formData.project_id) : null,
      estimated_time: formData.estimated_time || null,
      epic_name: formData.epic_name || null,
      labels: parseLabels(formData.labels),
    }

    if (formData.assignee_id) {
      payload.assignee = { employee_id: formData.assignee_id }
    }

    await onSave(payload, { taskId: task?.id })
  }

  if (!show) return null

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>

      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isExecutor ? 'Update Task Status' : (task ? 'Edit Task' : 'Create New Task')}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {isExecutor ? (
                  <>
                    <div className="mb-3">
                      <h5>{task?.title}</h5>
                      <p className="text-muted">{task?.description || 'No description'}</p>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Project</label>
                        <p className="form-control-plaintext">{task?.projectTitle}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Priority</label>
                        <p className="form-control-plaintext">
                          <span className={`badge bg-${task?.priorityColor || 'secondary'}`}>
                            {task?.priorityLabel || 'Priority'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Estimated Time</label>
                        <p className="form-control-plaintext">{task?.estimatedTime || 'Not set'}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Assignee</label>
                        <p className="form-control-plaintext">{task?.assigneeName || currentEmployee?.name}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="status_name" className="form-label">Update Status *</label>
                      <select
                        className="form-select form-select-lg"
                        id="status_name"
                        name="status_name"
                        value={formData.status_name}
                        onChange={handleChange}
                      >
                        {TASK_STATUS_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Task Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Design homepage mockup"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <div style={{ minHeight: '150px' }}>
                        <MarkdownEditor
                          value={formData.description}
                          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                          placeholder="Describe the task requirements..."
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="project_id" className="form-label">Project *</label>
                        <select
                          className="form-select"
                          id="project_id"
                          name="project_id"
                          value={formData.project_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select a project</option>
                          {projectOptions.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="status_name" className="form-label">Status</label>
                        <select
                          className="form-select"
                          id="status_name"
                          name="status_name"
                          value={formData.status_name}
                          onChange={handleChange}
                        >
                          {TASK_STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="priority" className="form-label">Priority</label>
                        <select
                          className="form-select"
                          id="priority"
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                        >
                          {TASK_PRIORITY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="estimated_time" className="form-label">Estimated Time</label>
                        <input
                          type="text"
                          className="form-control"
                          id="estimated_time"
                          name="estimated_time"
                          value={formData.estimated_time}
                          onChange={handleChange}
                          placeholder="e.g., 2d or PT8H"
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="assignee_id" className="form-label">Assignee</label>
                        <select
                          className="form-select"
                          id="assignee_id"
                          name="assignee_id"
                          value={formData.assignee_id}
                          onChange={handleChange}
                        >
                          <option value="">Unassigned</option>
                          {employeeOptions.map(employee => (
                            <option key={employee.employeeId} value={employee.employeeId}>
                              {employee.name} ({employee.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="epic_name" className="form-label">Epic Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="epic_name"
                          name="epic_name"
                          value={formData.epic_name}
                          onChange={handleChange}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="labels" className="form-label">Labels (comma separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="labels"
                        name="labels"
                        value={formData.labels}
                        onChange={handleChange}
                        placeholder="backend, infra"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isExecutor ? 'Update Status' : (task ? 'Update Task' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default TaskModal
