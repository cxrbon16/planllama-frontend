const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function _inspectResponse(path, json) {
  try {
    // Print returned JSON (readable)
    console.groupCollapsed(`[API] Response ${path}`)
    console.log(json)

    // Basic emptiness checks
    if (json === null || json === undefined) {
      console.warn(`[API][WARN] ${path} returned null/undefined`)
    } else if (Array.isArray(json) && json.length === 0) {
      console.warn(`[API][WARN] ${path} returned an empty array`)
    } else if (typeof json === 'object' && !Array.isArray(json) && Object.keys(json).length === 0) {
      console.warn(`[API][WARN] ${path} returned an empty object`)
    }

    // Endpoint-specific lightweight validations
    if (path.startsWith('/api/employees')) {
      if (Array.isArray(json)) {
        // expect elements to have employee_id or id
        const missing = json.filter(e => !e || (!e.employee_id && !e.id))
        if (missing.length > 0) console.warn(`[API][WARN] Some employees are missing 'employee_id' or 'id' fields`)
      } else if (json && typeof json === 'object') {
        if (!json.employee_id && !json.id) console.warn(`[API][WARN] Employee object missing 'employee_id' or 'id'`)
      }
    }

    if (path.startsWith('/api/projects')) {
      if (Array.isArray(json)) {
        // expect elements to have id or name
        const missing = json.filter(p => !p || (!p.id && !p.project_id && !p.name))
        if (missing.length > 0) console.warn(`[API][WARN] Some projects are missing 'id'/'project_id'/'name'`)
      } else if (json && typeof json === 'object') {
        if (!json.id && !json.project_id && !json.name) console.warn(`[API][WARN] Project object missing 'id'/'project_id'/'name'`)
      }
    }

    if (path.startsWith('/api/tasks')) {
      if (Array.isArray(json)) {
        const missing = json.filter(t => !t || (!t.task_id && !t.id && !t.title))
        if (missing.length > 0) console.warn(`[API][WARN] Some tasks are missing 'task_id'/'id'/'title'`)
      } else if (json && typeof json === 'object') {
        if (!json.task_id && !json.id && !json.title) console.warn(`[API][WARN] Task object missing 'task_id'/'id'/'title'`)
      }
    }

    console.groupEnd()
  } catch (e) {
    console.error('[API][ERROR] Failed to inspect response', e)
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const method = (options.method || 'GET').toUpperCase()
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(`Request failed: ${res.status} ${res.statusText}`)
    err.status = res.status
    err.body = text
    // Print server error details if available
    console.error(`[API][ERROR] ${method} ${url} -> ${res.status} ${res.statusText}`, text)
    throw err
  }

  // Some endpoints return empty body
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) return null
  const json = await res.json()

  // Inspect and print the returned JSON
  _inspectResponse(path, json)

  return json
}

// Employees
export const listEmployees = async () => {
  const res = await request('/api/employees')
  return res.employees || []   // sadece array kısmını dön
}
export const getEmployee = (employeeId) => request(`/api/employees/${employeeId}`)
export const createEmployee = (payload) => request('/api/employees', { method: 'POST', body: JSON.stringify(payload) })
export const updateEmployee = (employeeId, payload) => request(`/api/employees/${employeeId}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deleteEmployee = (employeeId) => request(`/api/employees/${employeeId}`, { method: 'DELETE' })

// Projects
export const listProjects = () => request('/api/projects')
export const getProject = (projectId) => request(`/api/projects/${projectId}`)
export const createProject = (payload) => request('/api/projects', { method: 'POST', body: JSON.stringify(payload) })
export const updateProject = (projectId, payload) => request(`/api/projects/${projectId}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deleteProject = (projectId) => request(`/api/projects/${projectId}`, { method: 'DELETE' })

// Tasks
export const listTasks = (projectId) => {
  const query = projectId ? `?project_id=${encodeURIComponent(projectId)}` : ''
  return request(`/api/tasks${query}`)
}
export const getTask = (taskId) => request(`/api/tasks/${taskId}`)
export const createTask = (payload) => request('/api/tasks', { method: 'POST', body: JSON.stringify(payload) })
export const updateTask = (taskId, payload) => request(`/api/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deleteTask = (taskId) => request(`/api/tasks/${taskId}`, { method: 'DELETE' })

// Task assignment/status
export const assignTask = (taskId, payload) => request(`/api/tasks/${taskId}/assign`, { method: 'POST', body: JSON.stringify(payload) })
export const updateTaskStatus = (taskId, payload) => request(`/api/tasks/${taskId}/status`, { method: 'PUT', body: JSON.stringify(payload) })

// LLM
export const analyzeProject = (projectId) => request('/api/llm/analyze-project', { method: 'POST', body: JSON.stringify({ project_id: projectId }) })
export const llmAutoAssign = (projectId, limit = 5) => request('/api/llm/auto-assign', { method: 'POST', body: JSON.stringify({ project_id: projectId, limit }) })

export default {
  listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee,
  listProjects, getProject, createProject, updateProject, deleteProject,
  listTasks, getTask, createTask, updateTask, deleteTask,
  assignTask, updateTaskStatus, analyzeProject, llmAutoAssign,
}
