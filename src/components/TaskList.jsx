import { useState, useEffect, useCallback } from 'react'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import { useEmployee } from '../context/EmployeeContext'
import api from '../api'
import {
  normalizeProjectBasic,
  normalizeProjects,
  normalizeTasks,
  normalizeEmployees,
  buildProjectMap,
  buildEmployeeMap,
  groupTasksByProject,
} from '../utils/dataMappers'

function TaskList({ role, projectId = null }) {
  const { currentEmployee } = useEmployee()
  const [tasks, setTasks] = useState([])
  const [projectOptions, setProjectOptions] = useState([])
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [expandedProjects, setExpandedProjects] = useState({})

  const loadData = useCallback(async () => {
    const [tasksRes, projectsRes, employeesRes] = await Promise.all([
      api.listTasks(projectId),
      api.listProjects(),
      api.listEmployees(),
    ])

    const normalizedEmployees = normalizeEmployees(employeesRes || [])
    const employeeMap = buildEmployeeMap(normalizedEmployees)

    const basicProjects = (projectsRes || []).map(normalizeProjectBasic)
    const projectMap = buildProjectMap(basicProjects)

    const normalizedTasks = normalizeTasks(tasksRes || [], projectMap, employeeMap)
    const tasksByProject = groupTasksByProject(normalizedTasks)
    const normalizedProjects = normalizeProjects(projectsRes || [], tasksByProject)

    setEmployeeOptions(normalizedEmployees)
    setProjectOptions(normalizedProjects)
    setTasks(normalizedTasks)
  }, [projectId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await loadData()
      } catch (err) {
        if (mounted) console.error('Failed to load tasks', err)
      }
    })()
    return () => {
      mounted = false
    }
  }, [loadData])

  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const toggleProject = (projectName) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectName]: !prev[projectName],
    }))
  }

  const handleNewTask = () => {
    setEditingTask(null)
    setShowModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleSaveTask = async (payload, { taskId } = {}) => {
    try {
      if (taskId) {
        await api.updateTask(taskId, payload)
      } else {
        await api.createTask(payload)
      }
      await loadData()
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
      await loadData()
    } catch (err) {
      console.error('Failed to delete task', err)
      alert('Failed to delete task')
    }
  }

  const handleUpdateStatus = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleSubmitStatus = async (taskId, statusName) => {
    try {
      await api.updateTaskStatus(taskId, { status_name: statusName })
      await loadData()
      setShowModal(false)
    } catch (err) {
      console.error('Failed to update task status', err)
      alert('Failed to update task status')
    }
  }

  let filteredTasks = tasks

  if (projectId) {
    filteredTasks = filteredTasks.filter(task => `${task.projectId}` === `${projectId}`)
  }

  if (role === 'executor' && currentEmployee) {
    const myId = currentEmployee.employee_id || currentEmployee.id
    filteredTasks = filteredTasks.filter(task => task.assigneeId === myId)
  }

  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const projectName = task.projectTitle
    if (!groups[projectName]) {
      groups[projectName] = []
    }
    groups[projectName].push(task)
    return groups
  }, {})

  const sortedProjects = Object.keys(groupedTasks).sort()

  if (projectId && filteredTasks.length === 0) {
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

        <TaskModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveTask}
          task={editingTask}
          projectId={projectId}
          projectOptions={projectOptions}
          employeeOptions={employeeOptions}
          role={role}
          onSubmitStatus={handleSubmitStatus}
        />
      </div>
    )
  }

  const projectLabel = projectId
    ? projectOptions.find(p => `${p.id}` === `${projectId}`)?.title || 'Project'
    : null

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          {projectId ? `Tasks for ${projectLabel}` : (role === 'pm' ? 'All Tasks' : 'My Tasks')}
        </h5>
        {role === 'pm' && (
          <button className="btn btn-primary btn-sm" onClick={handleNewTask}>
            + New Task
          </button>
        )}
      </div>

      {projectId ? (
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

      <TaskModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveTask}
        task={editingTask}
        projectId={projectId}
        projectOptions={projectOptions}
        employeeOptions={employeeOptions}
        role={role}
        onSubmitStatus={handleSubmitStatus}
      />
    </div>
  )
}

export default TaskList
