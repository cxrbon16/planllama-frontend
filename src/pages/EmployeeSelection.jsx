import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api'
import { useEmployee } from '../context/EmployeeContext'
import logo from '../assets/logo.ico'

function EmployeeSelection() {
  const navigate = useNavigate()
  const { selectEmployee } = useEmployee()

  const [employees, setEmployees] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.listEmployees()
        if (!mounted) return
        setEmployees(res || [])
      } catch (err) {
        console.error('Failed to load employees', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleSelectEmployee = async (employee) => {
    await selectEmployee(employee)
    navigate(`/${employee.user_role}`)
  }

  // Group employees by role
  // Backend şimdilik role bazlı filtreleme yapmı
  // const projectManagers = employees.filter(emp => emp.user_role === 'pm')
  // const executors = employees.filter(emp => emp.user_role === 'executor')
  const executors = employees
  const projectManagers = employees

  const EmployeeCard = ({ employee }) => {
    const availableHours = employee.capacity_hours_per_week - employee.current_load_hours
    const loadPercentage = (employee.current_load_hours / employee.capacity_hours_per_week * 100).toFixed(0)
    
    return (
      <div 
        className="card employee-card h-100 text-center p-3" 
        onClick={() => handleSelectEmployee(employee)}
        style={{ cursor: 'pointer', transition: 'all 0.3s' }}
      >
        <div className="card-body">
          <div className="mb-3">
            <div 
              className="avatar-circle mx-auto"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: employee.user_role === 'pm' ? '#0d6efd' : '#198754',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              {employee.avatar}
            </div>
          </div>
          <h5 className="card-title mb-1">{employee.name}</h5>
          <p className="text-muted small mb-2">{employee.role}</p>
          <span className={`badge ${employee.user_role === 'pm' ? 'bg-primary' : 'bg-success'} mb-2`}>
            {employee.user_role === 'pm' ? 'Project Manager' : 'Executor'}
          </span>
          <div className="mt-2 small">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Workload:</span>
              <span className="fw-bold">{loadPercentage}%</span>
            </div>
            <div className="progress" style={{ height: '6px' }}>
              <div 
                className={`progress-bar ${loadPercentage > 85 ? 'bg-danger' : loadPercentage > 70 ? 'bg-warning' : 'bg-success'}`}
                style={{ width: `${loadPercentage}%` }}
              ></div>
            </div>
            <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
              {availableHours}h available / {employee.capacity_hours_per_week}h
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="row min-vh-100 align-items-center justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="text-center mb-5">
            <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
              <img src={logo} alt="PlanLLaMA" style={{ width: '48px', height: '48px' }} />
              <h1 className="display-4 mb-0">PlanLLaMA</h1>
            </div>
            <p className="lead text-muted">Select an employee to continue</p>
          </div>

          {/* Project Managers Section */}
          <div className="mb-5">
            <h4 className="mb-3">
              <span className="badge bg-primary me-2">PM</span>
              Project Managers
            </h4>
            <div className="row g-3">
              {projectManagers.map(employee => (
                <div key={employee.id} className="col-md-6">
                  <EmployeeCard employee={employee} />
                </div>
              ))}
            </div>
          </div>

          {/* Executors Section */}
          <div>
            <h4 className="mb-3">
              <span className="badge bg-success me-2">EX</span>
              Executors
            </h4>
            <div className="row g-3">
              {executors.map(employee => (
                <div key={employee.id} className="col-md-6">
                  <EmployeeCard employee={employee} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeSelection

