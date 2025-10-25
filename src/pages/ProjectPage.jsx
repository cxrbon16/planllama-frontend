import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TaskList from "../components/TaskList"
import ProjectModal from '../components/ProjectModal'
import api from '../api'
import {
  normalizeProjectBasic,
  augmentProjectWithTasks,
  normalizeTasks,
  normalizeEmployees,
  buildProjectMap,
  buildEmployeeMap,
  getStatusLabel,
  getStatusColor,
  getInitials,
  formatLanguages,
  formatSkills,
} from '../utils/dataMappers'

function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  
  // Project state
  const [project, setProject] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const isMountedRef = useRef(false)

  const buildMembers = useCallback((projectPayload, normalizedEmployees, projectSpecificTasks) => {
    const members = []
    const seenMembers = new Set()
    const pushMember = (member) => {
      if (!member) return
      const key = member.employeeId || member.id || member.employee_id || member.name
      if (!key || seenMembers.has(key)) return
      seenMembers.add(key)
      members.push(member)
    }

    if (Array.isArray(projectPayload?.team)) {
      projectPayload.team.forEach(member => {
        const normalized = normalizedEmployees.find(e => e.employeeId === (member.employee_id || member.id))
        if (normalized) {
          pushMember(normalized)
        } else {
          pushMember({
            id: member.employee_id || member.id || member.name,
            name: member.name || member.employee_id || 'Team Member',
            role: member.role || member.department || 'Contributor',
            avatar: getInitials(member.name || member.employee_id || 'TM'),
            userRole: member.user_role || 'executor',
            skills: member.skills,
            languages: member.languages,
          })
        }
      })
    }

    projectSpecificTasks.forEach(task => {
      if (task.assigneeId) {
        const normalized = normalizedEmployees.find(e => e.employeeId === task.assigneeId)
        if (normalized) pushMember(normalized)
      }
    })

    return members
  }, [])

  const fetchProjectData = useCallback(async () => {
    const proj = await api.getProject(projectId)
    const tasksRes = await api.listTasks(projectId)
    const employeesRes = await api.listEmployees()

    const normalizedEmployees = normalizeEmployees(employeesRes || [])
    const employeeMap = buildEmployeeMap(normalizedEmployees)

    const basicProject = normalizeProjectBasic(proj || {})
    const projectMap = buildProjectMap([basicProject])
    const normalizedTasks = normalizeTasks(tasksRes || [], projectMap, employeeMap)
    const projectSpecificTasks = normalizedTasks.filter(task => task.projectId === basicProject.id)
    const normalizedProject = augmentProjectWithTasks(basicProject, projectSpecificTasks)
    const members = buildMembers(proj, normalizedEmployees, projectSpecificTasks)

    if (!isMountedRef.current) return

    setProject({ ...normalizedProject, raw: proj })
    setProjectTasks(projectSpecificTasks)
    setProjectMembers(members)
  }, [buildMembers, projectId])

  // Seçili projeyi bul
  useEffect(() => {
    isMountedRef.current = true
    ;(async () => {
      try {
        await fetchProjectData()
      } catch (err) {
        console.error('Failed to load project page data', err)
      }
    })()
    return () => {
      isMountedRef.current = false
    }
  }, [fetchProjectData])
  
  // Proje için task ve member bilgilerini hesapla
  const [projectTasks, setProjectTasks] = useState([])
  const [projectMembers, setProjectMembers] = useState([])

  // Progress hesapla
  const progress = useMemo(() => {
    if (!project) return 0
    const total = project.tasksCount || projectTasks.length
    const completed = project.completedTasks || projectTasks.filter(t => t.statusKey === 'completed').length
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
      await api.updateProject(updatedProject.id, updatedProject)
      await fetchProjectData()
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

  const statusLabel = project ? getStatusLabel(project.statusKey) : 'Planning'
  const statusColor = project ? getStatusColor(project.statusKey) : 'secondary'

  return (
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-outline-secondary me-3" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h3 className="mb-0">{project.title}</h3>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title">Project Details</h5>
                    <p className="text-muted mb-0">{project.description || project.metadata?.description || 'No description provided.'}</p>
                  </div>
                  <span className={`badge bg-${statusColor}`}>
                  {statusLabel}
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
                    <h6 className="text-muted">Estimated Duration</h6>
                    <p>{project.estimatedTime || 'Not set'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Possible Solution</h6>
                    <p>{project.possibleSolution || '—'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Company</h6>
                    <p>{project.metadata?.company || '—'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Department</h6>
                    <p>{project.metadata?.department || '—'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Year</h6>
                    <p>{project.metadata?.year || '—'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <h6 className="text-muted">Languages</h6>
                    <p>{formatLanguages(project.metadata?.languages)}</p>
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
                <TaskList role="pm" projectId={project.id} />
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
                        <div key={member.id || member.employeeId || member.name} className="d-flex align-items-center">
                          <div
                            className="text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{
                              width: '32px',
                              height: '32px',
                              fontSize: '14px',
                              backgroundColor: (member.userRole || member.user_role) === 'pm' ? '#0d6efd' : '#198754'
                            }}
                            title={member.role}
                          >
                            {member.avatar || getInitials(member.name)}
                          </div>
                          <div>
                            <div>{member.name}</div>
                            <small className="text-muted">{member.role}</small>
                            {member.skills && (
                              <div className="text-muted small">Skills: {formatSkills(member.skills)}</div>
                            )}
                            {member.languages && (
                              <div className="text-muted small">Languages: {formatLanguages(member.languages)}</div>
                            )}
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
                  <button className="btn btn-outline-secondary" disabled title="Team management coming soon">Add Member</button>
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
          project={project?.raw || project}
        />
      </div>
  )
}

export default ProjectPage