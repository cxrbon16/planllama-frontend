// Mock project data
export const projects = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    status: 'In Progress',
    tasksCount: 3,
    completedTasks: 0,
    dueDate: '2025-11-15',
    createdAt: '2025-09-01',
    budget: 50000,
    priority: 'high'
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Build iOS and Android mobile application',
    status: 'In Progress',
    tasksCount: 4,
    completedTasks: 2,
    dueDate: '2025-12-01',
    createdAt: '2025-08-15',
    budget: 100000,
    priority: 'critical'
  },
  {
    id: 3,
    name: 'API Integration',
    description: 'Integrate third-party APIs',
    status: 'In Progress',
    tasksCount: 3,
    completedTasks: 0,
    dueDate: '2025-11-30',
    createdAt: '2025-09-10',
    budget: 30000,
    priority: 'medium'
  },
  {
    id: 4,
    name: 'E-commerce Platform',
    description: 'Build complete e-commerce solution with payment integration',
    status: 'In Progress',
    tasksCount: 3,
    completedTasks: 1,
    dueDate: '2025-12-15',
    createdAt: '2025-08-20',
    budget: 150000,
    priority: 'critical'
  },
  {
    id: 5,
    name: 'DevOps',
    description: 'Setup CI/CD pipeline and infrastructure automation',
    status: 'In Progress',
    tasksCount: 2,
    completedTasks: 0,
    dueDate: '2025-11-20',
    createdAt: '2025-09-05',
    budget: 40000,
    priority: 'high'
  }
]

export const getProjectById = (id) => {
  return projects.find(project => project.id === parseInt(id))
}

export const getProjectByName = (name) => {
  return projects.find(project => project.name === name)
}

export const getProjectsByStatus = (status) => {
  return projects.filter(project => project.status === status)
}

