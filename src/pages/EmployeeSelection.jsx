import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api'
import { useEmployee } from '../context/EmployeeContext'
import logo from '../assets/logo.ico'
import {
  normalizeEmployees,
  calculateLoadPercentage,
  formatSkills,
  formatLanguages,
} from '../utils/dataMappers'

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
        setEmployees(normalizeEmployees(res))
      } catch (err) {
        console.error('Failed to load employees', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleSelectEmployee = async (employee) => {
    const target = employee?.raw || employee
    await selectEmployee(target)
    const routeRole = employee.userRole || 'executor'
    navigate(`/${routeRole}`)
  }

  // Group employees by role
  const executors = employees.filter(emp => emp.userRole === 'executor')
  const projectManagers = employees.filter(emp => emp.userRole === 'pm')
  const hasSplitRoles = projectManagers.length > 0 && executors.length > 0
  const fallbackEmployees = !hasSplitRoles ? employees : null

  const EmployeeCard = ({ employee }) => {
    const availableHours = employee.capacityHours - employee.currentLoadHours
    const loadPercentage = calculateLoadPercentage(employee)

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
                backgroundColor: employee.userRole === 'pm' ? '#0d6efd' : '#198754',
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
          <span className={`badge ${employee.userRole === 'pm' ? 'bg-primary' : 'bg-success'} mb-2`}>
            {employee.userRole === 'pm' ? 'Project Manager' : 'Executor'}
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
              {availableHours}h available / {employee.capacityHours}h
            </div>
            <div className="text-muted mt-2" style={{ fontSize: '11px' }}>
              <strong>Skills:</strong> {formatSkills(employee.skills)}
            </div>
            <div className="text-muted" style={{ fontSize: '11px' }}>
              <strong>Languages:</strong> {formatLanguages(employee.languages)}
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

          {hasSplitRoles ? (
            <>
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
            </>
          ) : (
            <div>
              <h4 className="mb-3">
                <span className="badge bg-secondary me-2">Team</span>
                All Employees
              </h4>
              <div className="row g-3">
                {fallbackEmployees?.map(employee => (
                  <div key={employee.id} className="col-md-6">
                    <EmployeeCard employee={employee} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeSelection

