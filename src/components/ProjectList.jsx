import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import api from '../api'
import {
  normalizeEmployees,
  normalizeProjectBasic,
  normalizeProjects,
  normalizeTasks,
  buildProjectMap,
  buildEmployeeMap,
  groupTasksByProject,
  getInitials,
} from '../utils/dataMappers'

function ProjectList({ role }) {
  const navigate = useNavigate()

  // Modal state for editing only
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const isMountedRef = useRef(false)

  const loadData = useCallback(async () => {
    const [projRes, tasksRes, empRes] = await Promise.all([
      api.listProjects(),
      api.listTasks(),
      api.listEmployees(),
    ])

    const normalizedEmployees = normalizeEmployees(empRes || [])
    const employeeMap = buildEmployeeMap(normalizedEmployees)

    const basicProjects = (projRes || []).map(normalizeProjectBasic)
    const projectMap = buildProjectMap(basicProjects)

    const normalizedTasks = normalizeTasks(tasksRes || [], projectMap, employeeMap)
    const tasksByProject = groupTasksByProject(normalizedTasks)
    const normalizedProjects = normalizeProjects(projRes || [], tasksByProject)

    if (!isMountedRef.current) return

    setEmployees(normalizedEmployees)
    setTasks(normalizedTasks)
    setProjects(normalizedProjects)
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    ;(async () => {
      try {
        await loadData()
      } catch (err) {
        console.error('Failed to load projects/tasks/employees', err)
      }
    })()
    return () => {
      isMountedRef.current = false
    }
  }, [loadData])

  const handleNewProject = () => {
    navigate('/pm/new-project')
  }

  const handleEditProject = (project) => {
    setEditingProject(project?.raw || project)
    setShowModal(true)
  }

  const handleSaveProject = async (project) => {
    try {
      await api.updateProject(project.id || project.project_id, project)
      await loadData()
      setShowModal(false)
    } catch (err) {
      console.error('Failed to save project', err)
      alert('Failed to save project')
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await api.deleteProject(projectId)
      await loadData()
    } catch (err) {
      console.error('Failed to delete project', err)
      alert('Failed to delete project')
    }
  }

  const handleClick = (projectId) => {
    // Role'e göre doğru path'e yönlendir
    const basePath = role === 'pm' ? '/pm' : '/executor'
    navigate(`${basePath}/projects/${projectId}`)
  }

  // Her proje için çalışanları hesapla
  const getProjectMembers = (project) => {
    if (!project) return []
    const members = []
    const seen = new Set()

    const pushMember = (member) => {
      if (!member) return
      const key = member.employeeId || member.id || member.employee_id || member.name
      if (!key || seen.has(key)) return
      seen.add(key)
      members.push(member)
    }

    // Team members defined on project
    if (Array.isArray(project.team)) {
      project.team.forEach(member => {
        const normalized = employees.find(e => e.employeeId === (member.employee_id || member.id))
        if (normalized) {
          pushMember(normalized)
        } else {
          pushMember({
            id: member.employee_id || member.id || member.name,
            name: member.name || member.employee_id || 'Team Member',
            role: member.role || member.department || 'Contributor',
            avatar: getInitials(member.name || member.employee_id || 'TM'),
            userRole: member.user_role || 'executor',
          })
        }
      })
    }

    // Members from assigned tasks
    tasks
      .filter(task => task.projectId === project.id && task.assigneeId)
      .forEach(task => {
        const normalized = employees.find(e => e.employeeId === task.assigneeId)
        if (normalized) pushMember(normalized)
      })

    return members
  }

  return (
      <div className="projects-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Projects</h5>
          {role === 'pm' && (
              <button className="btn btn-primary btn-sm" onClick={handleNewProject}>
                + New Project
              </button>
          )}
        </div>

        <div className="row">
          {projects.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info">
                  No projects yet. Click "New Project" to create one!
                </div>
              </div>
          ) : (
              projects.map(project => (
                  <div key={project.id} className="col-md-6 col-lg-4 mb-3">
                    <ProjectCard
                        project={project}
                        role={role}
                        members={getProjectMembers(project)}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                        onClick={() => handleClick(project.id)}
                    />
                  </div>
              ))
          )}
        </div>

        {/* Project Modal - Only for editing */}
        <ProjectModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveProject}
            project={editingProject}
        />
      </div>
  )
}

export default ProjectList