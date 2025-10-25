import { useState, useEffect } from 'react'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import { useEmployee } from '../context/EmployeeContext'
import api from '../api'

function TaskList({ role, project = null }) {
  const { currentEmployee } = useEmployee()
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.listTasks(project)
        if (!mounted) return
        setTasks(res || [])
      } catch (err) {
        console.error('Failed to load tasks', err)
      }
    })()
    return () => { mounted = false }
  }, [project])

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Hangi projelerin açık olduğunu takip et
  const [expandedProjects, setExpandedProjects] = useState({})

  // Proje açma/kapama toggle fonksiyonu
  const toggleProject = (projectName) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectName]: !prev[projectName]
    }))
  }

  // Modal functions
  const handleNewTask = () => {
    setEditingTask(null)
    setShowModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const updated = await api.updateTask(taskData.id, taskData)
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
      } else {
        const created = await api.createTask(taskData)
        setTasks(prev => [...prev, created])
      }
      setShowModal(false)
    } catch (err) {
      console.error('Failed to save task', err)
      alert('Failed to save task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await api.deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      console.error('Failed to delete task', err)
      alert('Failed to delete task')
    }
  }

  const handleUpdateStatus = (task) => {
    // Executor için task düzenleme (sadece status güncellemesi için de kullanılabilir)
    setEditingTask(task)
    setShowModal(true)
  }

  // Eğer project prop'u varsa, sadece o projeye ait taskları filtrele
  // Executor ise sadece kendi task'larını göster
  let filteredTasks = tasks
  
  if (project) {
    filteredTasks = filteredTasks.filter(task => task.project === project)
  }
  
  if (role === 'executor' && currentEmployee) {
    filteredTasks = filteredTasks.filter(task => task.assignee === currentEmployee.name)
  }

  // Taskları projelere göre grupla
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const projectName = task.project
    if (!groups[projectName]) {
      groups[projectName] = []
    }
    groups[projectName].push(task)
    return groups
  }, {})

  // Proje isimlerini alfabetik sırala
  const sortedProjects = Object.keys(groupedTasks).sort()

  // Eğer belirli bir proje için gösteriliyorsa ve task yoksa
  if (project && filteredTasks.length === 0) {
    return (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Tasks</h5>
            {role === 'pm' && (
                <button className="btn btn-primary btn-sm" onClick={handleNewTask}>
                  + New Task
                </button>
            )}
          </div>
          <div className="alert alert-info">
            No tasks found for this project.
          </div>

          {/* Task Modal */}
          <TaskModal
              show={showModal}
              onClose={() => setShowModal(false)}
              onSave={handleSaveTask}
              task={editingTask}
              projectName={project}
          />
        </div>
    )
  }

  return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            {project ? `Tasks for ${project}` : (role === 'pm' ? 'All Tasks' : 'My Tasks')}
          </h5>
          {role === 'pm' && (
              <button className="btn btn-primary btn-sm" onClick={handleNewTask}>
                + New Task
              </button>
          )}
        </div>

        {/* Eğer tek proje gösteriliyorsa, gruplanmadan direkt göster */}
        {project ? (
            <div className="row">
              {filteredTasks.map(task => (
                  <div key={task.id} className="col-md-6 col-lg-4 mb-3">
                    <TaskCard
                        task={task}
                        role={role}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onUpdateStatus={handleUpdateStatus}
                    />
                  </div>
              ))}
            </div>
        ) : (
            /* Tüm projeler için gruplanmış görünüm */
            sortedProjects.map(projectName => (
                <div key={projectName} className="mb-3">
                  <div
                      className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleProject(projectName)}
                  >
                    <h6 className="mb-0 text-muted">
                      {expandedProjects[projectName] ? '▼' : '▶'} {projectName} ({groupedTasks[projectName].length})
                    </h6>
                  </div>

                  {expandedProjects[projectName] && (
                      <div className="row">
                        {groupedTasks[projectName].map(task => (
                            <div key={task.id} className="col-md-6 col-lg-4 mb-3">
                              <TaskCard
                                  task={task}
                                  role={role}
                                  onEdit={handleEditTask}
                                  onDelete={handleDeleteTask}
                                  onUpdateStatus={handleUpdateStatus}
                              />
                            </div>
                        ))}
                      </div>
                  )}
                </div>
            ))
        )}

        {/* Task Modal */}
        <TaskModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveTask}
            task={editingTask}
            projectName={project}
            role={role}
        />
      </div>
  )
}

export default TaskList