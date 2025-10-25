import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const EmployeeContext = createContext()

export function EmployeeProvider({ children }) {
  const [currentEmployee, setCurrentEmployee] = useState(null)

  // Load employee from localStorage on mount and fetch full data from backend
  useEffect(() => {
    const savedEmployeeId = localStorage.getItem('currentEmployeeId')
    if (savedEmployeeId) {
      // saved value might be employee_id string (eXX) or numeric id
      (async () => {
        try {
          const emp = await api.getEmployee(savedEmployeeId)
          setCurrentEmployee(emp)
        } catch (err) {
          // fall back to clearing storage if fetch fails
          console.warn('Failed to load employee from API', err)
          localStorage.removeItem('currentEmployeeId')
        }
      })()
    }
  }, [])

  // Save employee to localStorage when it changes
  const selectEmployee = async (employee) => {
    // Accept either employee object or employee_id string
    if (!employee) {
      setCurrentEmployee(null)
      localStorage.removeItem('currentEmployeeId')
      return
    }

    const empId = employee.employee_id || employee.id || employee
    try {
      const emp = await api.getEmployee(empId)
      setCurrentEmployee(emp)
      localStorage.setItem('currentEmployeeId', empId.toString())
    } catch (err) {
      console.warn('Failed to select employee from API', err)
    }
  }

  const logout = () => {
    setCurrentEmployee(null)
    localStorage.removeItem('currentEmployeeId')
  }

  return (
    <EmployeeContext.Provider value={{ currentEmployee, selectEmployee, logout }}>
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployee() {
  const context = useContext(EmployeeContext)
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider')
  }
  return context
}

