import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import api from '../api'

function ProjectList({ role }) {
  const navigate = useNavigate()

  // Modal state for editing only
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [projRes, tasksRes, empRes] = await Promise.all([
          api.listProjects(),
          api.listTasks(),
          api.listEmployees(),
        ])
        if (!mounted) return
        setProjects(projRes || [])
        setTasks(tasksRes || [])
        setEmployees(empRes || [])
      } catch (err) {
        console.error('Failed to load projects/tasks/employees', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleNewProject = () => {
    navigate('/pm/new-project')
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setShowModal(true)
  }

  const handleSaveProject = async (project) => {
    if (!editingProject) return
    try {
      const updated = await api.updateProject(project.id, project)
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
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
      setProjects(prev => prev.filter(p => p.id !== projectId))
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
  const getProjectMembers = (projectName) => {
    const projectTasks = tasks.filter(task => task.project === projectName)
    const uniqueAssignees = [...new Set(projectTasks.map(task => task.assignee))]
    return uniqueAssignees.map(name => employees.find(e => e.name === name)).filter(Boolean)
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
                        members={getProjectMembers(project.name)}
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