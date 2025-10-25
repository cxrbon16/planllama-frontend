import { useMemo, useState } from 'react'

function EmployeeSelector({ employees = [], selectedEmployees, onEmployeesChange }) {
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    name: '',
    skills: [],
    department: '',
  })
  const [skillInput, setSkillInput] = useState('')

  const availableEmployees = useMemo(() => {
    const selectedIds = new Set(selectedEmployees.map(emp => emp.employee_id))
    return employees.filter(emp => !selectedIds.has(emp.employeeId))
  }, [employees, selectedEmployees])

  const toTeamMember = (employee) => ({
    employee_id: employee.employeeId,
    name: employee.name,
    skills: Array.isArray(employee.raw?.skills) ? employee.raw.skills : employee.skills,
    department: employee.raw?.department || employee.department || employee.role,
  })

  const handleAddEmployee = (employee) => {
    const teamMember = employee.employeeId ? toTeamMember(employee) : employee
    if (!selectedEmployees.find(e => e.employee_id === teamMember.employee_id)) {
      onEmployeesChange([...selectedEmployees, teamMember])
    }
  }

  const handleRemoveEmployee = (employeeId) => {
    onEmployeesChange(selectedEmployees.filter(e => e.employee_id !== employeeId))
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !newEmployee.skills.includes(skillInput.trim())) {
      setNewEmployee({
        ...newEmployee,
        skills: [...newEmployee.skills, skillInput.trim().toLowerCase()],
      })
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill) => {
    setNewEmployee({
      ...newEmployee,
      skills: newEmployee.skills.filter(s => s !== skill),
    })
  }

  const handleCreateEmployee = () => {
    if (newEmployee.employee_id && newEmployee.name) {
      handleAddEmployee(newEmployee)
      setNewEmployee({ employee_id: '', name: '', skills: [], department: '' })
      setShowAddEmployee(false)
    }
  }

  const renderSkillBadges = (skills = []) => {
    if (!skills || skills.length === 0) return null
    return (Array.isArray(skills) ? skills : [skills]).map(skill => {
      if (typeof skill === 'string') {
        return (
          <span key={skill} className="badge bg-secondary me-1">{skill}</span>
        )
      }
      if (skill?.name) {
        return (
          <span key={skill.name} className="badge bg-secondary me-1">
            {skill.level ? `${skill.name} (Lv ${skill.level})` : skill.name}
          </span>
        )
      }
      return null
    })
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <label className="form-label mb-0">Project Team</label>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowAddEmployee(!showAddEmployee)}
        >
          {showAddEmployee ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {showAddEmployee && (
        <div className="card mb-3 p-3">
          <h6>Select from Available Employees</h6>
          <div className="list-group mb-3">
            {availableEmployees.length === 0 ? (
              <div className="text-muted small">No more employees available to add.</div>
            ) : (
              availableEmployees.map(emp => (
                <button
                  key={emp.employeeId}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => handleAddEmployee(emp)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{emp.name}</strong> ({emp.employeeId})
                      <div className="small text-muted">{emp.role}</div>
                      <div className="mt-1">
                        {renderSkillBadges(emp.skills)}
                      </div>
                    </div>
                    <span className="badge bg-primary">Add</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <hr />

          <h6>Or Create New Team Member</h6>
          <div className="row g-2">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Employee ID (e.g., e45)"
                value={newEmployee.employee_id}
                onChange={(e) => setNewEmployee({ ...newEmployee, employee_id: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Employee Name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Department"
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <div className="input-group input-group-sm">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleAddSkill}
                >
                  +
                </button>
              </div>
            </div>
            <div className="col-12">
              {renderSkillBadges(newEmployee.skills)}
            </div>
            <div className="col-12">
              <button
                type="button"
                className="btn btn-primary btn-sm w-100"
                onClick={handleCreateEmployee}
                disabled={!newEmployee.employee_id || !newEmployee.name}
              >
                Create & Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="selected-employees">
        {selectedEmployees.length === 0 ? (
          <div className="text-muted small">No employees added yet</div>
        ) : (
          <div className="list-group">
            {selectedEmployees.map(emp => (
              <div key={emp.employee_id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <strong>{emp.name}</strong> <span className="text-muted">({emp.employee_id})</span>
                    {emp.department && <div className="small text-muted">{emp.department}</div>}
                    <div className="mt-1">
                      {renderSkillBadges(emp.skills)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveEmployee(emp.employee_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeSelector
