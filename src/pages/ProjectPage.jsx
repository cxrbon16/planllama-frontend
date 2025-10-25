import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TaskList from "../components/TaskList"
import ProjectModal from '../components/ProjectModal'
import api from '../api'

function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  
  // Project state
  const [project, setProject] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Seçili projeyi bul
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const proj = await api.getProject(projectId)
        const tasksRes = await api.listTasks(projectId)
        const employeesRes = await api.listEmployees()
        if (!mounted) return
        setProject(proj)
        setProjectTasks(tasksRes || [])
        const uniqueAssignees = [...new Set((tasksRes || []).map(t => t.assignee))]
        setProjectMembers(uniqueAssignees.map(name => (employeesRes || []).find(e => e.name === name)).filter(Boolean))
      } catch (err) {
        console.error('Failed to load project page data', err)
      }
    })()
    return () => { mounted = false }
  }, [projectId])
  
  // Proje için task ve member bilgilerini hesapla
  const [projectTasks, setProjectTasks] = useState([])
  const [projectMembers, setProjectMembers] = useState([])

  // Progress hesapla
  const progress = useMemo(() => {
    if (!project) return 0
    const total = project.tasksCount || projectTasks.length
    const completed = project.completedTasks || projectTasks.filter(t => t.status === 'Completed').length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [project, projectTasks])

  // Progress'e göre renk belirle
  const getProgressBarClass = () => {
    if (progress >= 100) return 'bg-success' // completed
    if (progress >= 70) return 'bg-primary' // good progress
    if (progress >= 40) return 'bg-warning' // moderate progress
    if (progress > 0) return 'bg-warning' // just started
    return 'bg-secondary' // not started
  }

  // Edit project handler
  const handleEditProject = () => {
    setShowModal(true)
  }

  const handleSaveProject = async (updatedProject) => {
    try {
      const saved = await api.updateProject(updatedProject.id, updatedProject)
      setProject(saved)
      setShowModal(false)
    } catch (err) {
      console.error('Failed to save project', err)
      alert('Failed to save project')
    }
  }

  // Proje bulunamazsa
  if (!project) {
    return (
        <div className="container-fluid py-4">
          <div className="alert alert-warning">
            Project not found!
            <button className="btn btn-link" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
    )
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'success'
      case 'In Progress': return 'primary'
      case 'Planning': return 'warning'
      default: return 'secondary'
    }
  }

  return (
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-outline-secondary me-3" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h3 className="mb-0">{project.name}</h3>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title">Project Details</h5>
                    <p className="text-muted mb-0">{project.description}</p>
                  </div>
                  <span className={`badge bg-${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Progress</span>
                    <span className="fw-bold">{progress}%</span>
                  </div>
                  <div className="progress" style={{ height: '12px' }}>
                    <div
                        className={`progress-bar ${getProgressBarClass()}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Created At</h6>
                    <p>{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Due Date</h6>
                    <p>{new Date(project.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Budget</h6>
                    <p>${project.budget.toLocaleString()}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Priority</h6>
                    <span className={`badge bg-${project.priority === 'critical' ? 'danger' : project.priority === 'high' ? 'warning' : 'info'}`}>
                      {project.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Task listesi buraya eklenebilir */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Tasks</h5>
                <p className="text-muted">
                  {project.completedTasks} / {project.tasksCount} tasks completed
                </p>
                <TaskList role="pm" project={project.name} />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Team Members</h5>
                {projectMembers.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {projectMembers.map((member) => (
                        <div key={member.id} className="d-flex align-items-center">
                          <div 
                            className="text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              fontSize: '14px',
                              backgroundColor: member.user_role === 'pm' ? '#0d6efd' : '#198754'
                            }}
                            title={member.role}
                          >
                            {member.avatar}
                          </div>
                          <div>
                            <div>{member.name}</div>
                            <small className="text-muted">{member.role}</small>
                          </div>
                        </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No team members assigned yet.</p>
                )}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Actions</h5>
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-primary" onClick={handleEditProject}>
                    Edit Project
                  </button>
                  <button className="btn btn-outline-secondary">Add Member</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Modal */}
        <ProjectModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProject}
          project={project}
        />
      </div>
  )
}

export default ProjectPage