const STATUS_LABELS = {
  proposed: 'Proposed',
  planning: 'Planning',
  pending: 'Pending',
  in_progress: 'In Progress',
  in_review: 'In Review',
  blocked: 'Blocked',
  completed: 'Completed',
}

const STATUS_COLORS = {
  proposed: 'info',
  planning: 'warning',
  pending: 'secondary',
  in_progress: 'primary',
  in_review: 'info',
  blocked: 'danger',
  completed: 'success',
}

const PRIORITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const PRIORITY_COLORS = {
  critical: 'danger',
  high: 'danger',
  medium: 'warning',
  low: 'success',
}

const DEFAULT_STATUS = 'planning'
const DEFAULT_PRIORITY = 'medium'

const normalizeKey = (value, fallback = '') => {
  if (!value) return fallback
  if (typeof value !== 'string') return String(value).toLowerCase()
  return value.toLowerCase()
}

export const getStatusLabel = (status) => {
  const key = normalizeKey(status, DEFAULT_STATUS)
  return STATUS_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export const getStatusColor = (status) => {
  const key = normalizeKey(status, DEFAULT_STATUS)
  return STATUS_COLORS[key] || 'secondary'
}

export const getPriorityLabel = (priority) => {
  const key = normalizeKey(priority, DEFAULT_PRIORITY)
  return PRIORITY_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

export const getPriorityColor = (priority) => {
  const key = normalizeKey(priority, DEFAULT_PRIORITY)
  return PRIORITY_COLORS[key] || 'secondary'
}

export const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join('') || name.charAt(0).toUpperCase()
}

const deriveUserRole = (employee) => {
  if (!employee) return 'executor'
  if (employee.user_role) return employee.user_role
  if (employee.role && typeof employee.role === 'string') {
    return employee.role.toLowerCase().includes('manager') ? 'pm' : 'executor'
  }
  return 'executor'
}

export const normalizeEmployee = (employee = {}) => {
  const id = employee.employee_id || employee.id || ''
  const name = employee.name || 'Unknown'
  return {
    id,
    employeeId: id,
    name,
    role: employee.role || 'Team Member',
    timezone: employee.timezone || '',
    capacityHours: employee.capacity_hours_per_week ?? 0,
    currentLoadHours: employee.current_load_hours ?? 0,
    skills: Array.isArray(employee.skills) ? employee.skills : [],
    languages: Array.isArray(employee.languages) ? employee.languages : [],
    integrations: employee.integrations || {},
    avatar: employee.avatar || getInitials(name),
    userRole: deriveUserRole(employee),
    raw: employee,
  }
}

export const normalizeProjectBasic = (project = {}) => {
  const id = project.project_id ?? project.id ?? project.index ?? null
  const title = project.project_title || project.name || (id ? `Project ${id}` : 'Untitled Project')
  const description = project.project_description || project.description || project.metadata?.description || ''
  const estimatedTime = project.estimated_time || project.metadata?.estimated_time || ''
  const possibleSolution = project.possible_solution || ''
  const metadata = project.metadata || {}
  const team = Array.isArray(project.team) ? project.team : []

  return {
    id,
    title,
    description,
    metadata,
    estimatedTime,
    possibleSolution,
    team,
    raw: project,
  }
}

export const augmentProjectWithTasks = (project, tasks = []) => {
  const tasksCount = tasks.length
  const completedTasks = tasks.filter((task) => task.statusKey === 'completed').length
  const inProgress = tasks.filter((task) => task.statusKey === 'in_progress').length
  const blocked = tasks.filter((task) => task.statusKey === 'blocked').length

  let statusKey = normalizeKey(project.raw?.status_name || project.raw?.status)
  if (!statusKey) {
    if (tasksCount === 0) {
      statusKey = DEFAULT_STATUS
    } else if (completedTasks === tasksCount) {
      statusKey = 'completed'
    } else if (blocked > 0) {
      statusKey = 'blocked'
    } else if (inProgress > 0) {
      statusKey = 'in_progress'
    } else {
      statusKey = tasks[0].statusKey
    }
  }

  const progress = tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0

  return {
    ...project,
    tasksCount,
    completedTasks,
    progress,
    statusKey,
    statusLabel: getStatusLabel(statusKey),
    statusColor: getStatusColor(statusKey),
  }
}

export const normalizeTask = (task = {}, projectMap = {}, employeeMap = {}) => {
  const id = task.task_id ?? task.id ?? null
  const projectId = task.project_id ?? task.project?.project_id ?? task.project?.id ?? null
  const project = projectMap[projectId]
  const statusKey = normalizeKey(task.status_name || task.status, DEFAULT_STATUS)
  const priorityKey = normalizeKey(task.priority, DEFAULT_PRIORITY)
  const assigneeId = task.assignee?.employee_id || task.assignee?.id || task.assignee_id || null
  const assignee = employeeMap[assigneeId]
  let assigneeName = 'Unassigned'
  if (task.assignee && typeof task.assignee === 'string') {
    assigneeName = task.assignee
  } else if (task.assignee?.name) {
    assigneeName = task.assignee.name
  } else if (assignee?.name) {
    assigneeName = assignee.name
  } else if (assigneeId) {
    assigneeName = assigneeId
  }

  const labels = Array.isArray(task.labels)
    ? task.labels
    : typeof task.labels === 'string'
      ? task.labels.split(',').map((label) => label.trim()).filter(Boolean)
      : []

  return {
    id,
    projectId,
    projectTitle: project?.title || task.project_title || task.project || 'Unknown Project',
    title: task.title || (id ? `Task ${id}` : 'Untitled Task'),
    description: task.description || '',
    statusKey,
    statusLabel: getStatusLabel(statusKey),
    statusColor: getStatusColor(statusKey),
    priorityKey,
    priorityLabel: getPriorityLabel(priorityKey),
    priorityColor: getPriorityColor(priorityKey),
    assigneeId,
    assigneeName,
    estimatedTime: task.estimated_time || task.estimatedTime || '',
    epicName: task.epic_name || task.epic || '',
    labels,
    score: task.assignee?.score,
    decidedBy: task.assignee?.decided_by,
    decidedAt: task.assignee?.decided_at,
    rationale: task.assignee?.rationale,
    raw: task,
  }
}

export const buildProjectMap = (projects) => {
  const map = {}
  projects.forEach((project) => {
    if (project.id != null) {
      map[project.id] = project
    }
  })
  return map
}

export const buildEmployeeMap = (employees) => {
  const map = {}
  employees.forEach((employee) => {
    if (employee.id != null) {
      map[employee.id] = employee
    }
  })
  return map
}

export const groupTasksByProject = (tasks = []) => {
  return tasks.reduce((acc, task) => {
    const key = task.projectId ?? 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {})
}

export const TASK_STATUS_OPTIONS = [
  { value: 'proposed', label: 'Proposed' },
  { value: 'planning', label: 'Planning' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'completed', label: 'Completed' },
]

export const TASK_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export const parseLabels = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const formatLanguages = (languages = []) => {
  if (!Array.isArray(languages) || languages.length === 0) return '—'
  return languages.join(', ')
}

export const formatSkills = (skills = []) => {
  if (!Array.isArray(skills) || skills.length === 0) return '—'
  return skills
    .map((skill) => {
      if (typeof skill === 'string') return skill
      if (skill?.name) {
        return skill.level ? `${skill.name} (Lv ${skill.level})` : skill.name
      }
      return ''
    })
    .filter(Boolean)
    .join(', ')
}

export const calculateLoadPercentage = (employee) => {
  if (!employee) return 0
  if (employee.capacityHours === 0) return 0
  return Math.round((employee.currentLoadHours / employee.capacityHours) * 100)
}

export const normalizeEmployees = (employees = []) => employees.map(normalizeEmployee)

export const normalizeProjects = (projects = [], tasksByProject = {}) => {
  const basics = projects.map(normalizeProjectBasic)
  return basics.map((project) => augmentProjectWithTasks(project, tasksByProject[project.id] || []))
}

export const normalizeTasks = (tasks = [], projectMap = {}, employeeMap = {}) =>
  tasks.map((task) => normalizeTask(task, projectMap, employeeMap))

export const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object' && Array.isArray(value.items)) return value.items
  if (value == null) return []
  return []
}
