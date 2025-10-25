import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StatsCard from '../components/StatsCard'
import ProjectList from '../components/ProjectList'
import TaskList from '../components/TaskList'
import { useEmployee } from '../context/EmployeeContext'
import api from '../api'

function Dashboard({ role = 'pm' }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('projects')
  const { currentEmployee } = useEmployee()

  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])

  // Load data
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [projRes, taskRes] = await Promise.all([api.listProjects(), api.listTasks()])
        if (!mounted) return
        setProjects(projRes || [])
        setTasks(taskRes || [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Calculate overall project progress for PM stats (based on task completion)
  const overallProjectProgress = useMemo(() => {
    if (role !== 'pm') return 0
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'Completed').length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [role, tasks])

  // Get color based on project statuses
  const getProjectStatsColor = useMemo(() => {
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length
  const completedCount = tasks.filter(t => t.status === 'Completed').length
  const planningCount = tasks.filter(t => t.status === 'Planning').length
    
    // En çok hangi status varsa ona göre renk ver
    if (completedCount >= inProgressCount && completedCount > 0) return 'success'
    if (inProgressCount > 0) return 'primary'
    if (planningCount > 0) return 'warning'
    return 'info'
  }, [role])

  // Calculate executor stats based on current employee
  const executorStats = useMemo(() => {
    if (!currentEmployee || role !== 'executor') return null
    const myTasks = tasks.filter(task => task.assignee === currentEmployee.name)
    const assignedTasks = myTasks.length
    const inProgress = myTasks.filter(task => task.status === 'In Progress').length
    const completed = myTasks.filter(task => task.status === 'Completed').length
    const pending = myTasks.filter(task => task.status === 'Pending').length
    return {
      assignedTasks: { title: 'Assigned Tasks', value: assignedTasks, color: 'primary' },
      inProgress: { title: 'In Progress', value: inProgress, color: 'warning' },
      completed: { title: 'Completed', value: completed, color: 'success' },
      pending: { title: 'Pending', value: pending, color: 'info' }
    }
  }, [currentEmployee, role, tasks])

  // Role-based configuration
  const config = {
    pm: {
      title: 'Project Manager Dashboard',
      stats: {
        totalProjects: { 
          title: 'Total Projects', 
          value: projects.length, 
          color: getProjectStatsColor,
          subtitle: `${overallProjectProgress}% Overall Progress`
        },
        activeTasks: { title: 'Active Tasks', value: tasks.filter(t => t.status === 'In Progress').length, color: 'success' },
        pendingTasks: { title: 'Pending Tasks', value: tasks.filter(t => t.status === 'Pending').length, color: 'warning' },
        teamMembers: { title: 'Team Members', value: 6, color: 'info' }
      },
      showTabs: true
    },
    executor: {
      title: 'Executor Dashboard',
      stats: executorStats || {
        assignedTasks: { title: 'Assigned Tasks', value: 0, color: 'primary' },
        inProgress: { title: 'In Progress', value: 0, color: 'warning' },
        completed: { title: 'Completed', value: 0, color: 'success' },
        pending: { title: 'Pending', value: 0, color: 'info' }
      },
      showTabs: false
    }
  }

  const currentConfig = config[role] || config.pm
  const statsArray = Object.values(currentConfig.stats)

  return (
    <div>
      <Header 
        title={currentConfig.title} 
        onChangeRole={() => navigate('/')} 
      />
      
      <div className="container-fluid">
        {/* Employee Info Card (for executors) */}
        {role === 'executor' && currentEmployee && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <h6 className="text-muted mb-1">Current Workload</h6>
                      <h3 className="mb-0">{currentEmployee.current_load_hours}h / {currentEmployee.capacity_hours_per_week}h</h3>
                    </div>
                    <div className="col-md-6">
                      <div className="progress" style={{ height: '24px' }}>
                        <div 
                          className={`progress-bar ${
                            (currentEmployee.current_load_hours / currentEmployee.capacity_hours_per_week * 100) > 85 ? 'bg-danger' : 
                            (currentEmployee.current_load_hours / currentEmployee.capacity_hours_per_week * 100) > 70 ? 'bg-warning' : 
                            'bg-success'
                          }`}
                          style={{ width: `${(currentEmployee.current_load_hours / currentEmployee.capacity_hours_per_week * 100).toFixed(0)}%` }}
                        >
                          {(currentEmployee.current_load_hours / currentEmployee.capacity_hours_per_week * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 text-end">
                      <h6 className="text-muted mb-1">Available Capacity</h6>
                      <h3 className="mb-0 text-success">
                        {currentEmployee.capacity_hours_per_week - currentEmployee.current_load_hours}h
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="row mb-4">
          {statsArray.map((stat, index) => (
            <div key={index} className="col-md-3">
              <StatsCard 
                title={stat.title} 
                value={stat.value} 
                color={stat.color}
                subtitle={stat.subtitle}
              />
            </div>
          ))}
        </div>

        {/* Tabs (only for PM) */}
        {currentConfig.showTabs && (
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                Projects
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                All Tasks
              </button>
            </li>
          </ul>
        )}

        {/* Content */}
        <div className="tab-content">
          {currentConfig.showTabs ? (
            <>
              {activeTab === 'projects' && <ProjectList role={role} />}
              {activeTab === 'tasks' && <TaskList role={role} />}
            </>
          ) : (
            <TaskList role={role} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

