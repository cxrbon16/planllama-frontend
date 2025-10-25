// Mock task data
export const tasks = [
  {
    id: 1,
    title: 'Design homepage mockup',
    description: 'Create high-fidelity mockup for the new homepage',
    status: 'In Progress',
    priority: 'high',
    assignee: 'Emily Davis',
    project: 'Website Redesign',
    dueDate: '2025-10-28',
    estimatedHours: 8,
    createdAt: '2025-10-15',
    completedAt: null
  },
  {
    id: 2,
    title: 'Implement user authentication',
    description: 'Set up JWT-based authentication system',
    status: 'Pending',
    priority: 'critical',
    assignee: 'Michael Chen',
    project: 'Mobile App Development',
    dueDate: '2025-10-30',
    estimatedHours: 16,
    createdAt: '2025-10-10',
    completedAt: null
  },
  {
    id: 3,
    title: 'Write API documentation',
    description: 'Document all REST API endpoints',
    status: 'In Progress',
    priority: 'medium',
    assignee: 'Michael Chen',
    project: 'API Integration',
    dueDate: '2025-11-05',
    estimatedHours: 12,
    createdAt: '2025-10-12',
    completedAt: null
  },
  {
    id: 4,
    title: 'Setup database schema',
    description: 'Design and implement database tables',
    status: 'Completed',
    priority: 'high',
    assignee: 'Michael Chen',
    project: 'Mobile App Development',
    dueDate: '2025-10-20',
    estimatedHours: 10,
    createdAt: '2025-10-05',
    completedAt: '2025-10-19'
  },
  {
    id: 5,
    title: 'Create component library',
    description: 'Build reusable React components',
    status: 'Pending',
    priority: 'low',
    assignee: 'Emily Davis',
    project: 'Website Redesign',
    dueDate: '2025-11-10',
    estimatedHours: 20,
    createdAt: '2025-10-08',
    completedAt: null
  },
  {
    id: 6,
    title: 'Implement payment gateway',
    description: 'Integrate Stripe payment system',
    status: 'In Progress',
    priority: 'critical',
    assignee: 'Michael Chen',
    project: 'E-commerce Platform',
    dueDate: '2025-11-01',
    estimatedHours: 24,
    createdAt: '2025-10-18',
    completedAt: null
  },
  {
    id: 7,
    title: 'Design product cards',
    description: 'Create responsive product card components',
    status: 'Completed',
    priority: 'medium',
    assignee: 'Emily Davis',
    project: 'E-commerce Platform',
    dueDate: '2025-10-22',
    estimatedHours: 6,
    createdAt: '2025-10-14',
    completedAt: '2025-10-21'
  },
  {
    id: 8,
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated deployment',
    status: 'In Progress',
    priority: 'high',
    assignee: 'Michael Chen',
    project: 'DevOps',
    dueDate: '2025-11-03',
    estimatedHours: 8,
    createdAt: '2025-10-16',
    completedAt: null
  },
  {
    id: 9,
    title: 'Create landing page',
    description: 'Design and implement marketing landing page',
    status: 'Pending',
    priority: 'medium',
    assignee: 'Emily Davis',
    project: 'Website Redesign',
    dueDate: '2025-11-08',
    estimatedHours: 12,
    createdAt: '2025-10-20',
    completedAt: null
  },
  {
    id: 10,
    title: 'Implement push notifications',
    description: 'Add Firebase push notifications to mobile app',
    status: 'Pending',
    priority: 'high',
    assignee: 'Michael Chen',
    project: 'Mobile App Development',
    dueDate: '2025-11-12',
    estimatedHours: 16,
    createdAt: '2025-10-11',
    completedAt: null
  },
  {
    id: 11,
    title: 'Create REST API endpoints',
    description: 'Build user management API endpoints',
    status: 'In Progress',
    priority: 'critical',
    assignee: 'Michael Chen',
    project: 'API Integration',
    dueDate: '2025-10-29',
    estimatedHours: 14,
    createdAt: '2025-10-13',
    completedAt: null
  },
  {
    id: 12,
    title: 'Design mobile UI screens',
    description: 'Create UI mockups for all mobile app screens',
    status: 'Completed',
    priority: 'high',
    assignee: 'Emily Davis',
    project: 'Mobile App Development',
    dueDate: '2025-10-18',
    estimatedHours: 20,
    createdAt: '2025-10-01',
    completedAt: '2025-10-17'
  },
  {
    id: 13,
    title: 'Implement search functionality',
    description: 'Add Elasticsearch integration for product search',
    status: 'Pending',
    priority: 'medium',
    assignee: 'Michael Chen',
    project: 'E-commerce Platform',
    dueDate: '2025-11-15',
    estimatedHours: 18,
    createdAt: '2025-10-19',
    completedAt: null
  },
  {
    id: 14,
    title: 'Create email templates',
    description: 'Design responsive email templates for notifications',
    status: 'In Progress',
    priority: 'low',
    assignee: 'Emily Davis',
    project: 'DevOps',
    dueDate: '2025-11-07',
    estimatedHours: 8,
    createdAt: '2025-10-17',
    completedAt: null
  },
  {
    id: 15,
    title: 'Performance optimization',
    description: 'Optimize API response times and database queries',
    status: 'Pending',
    priority: 'high',
    assignee: 'Michael Chen',
    project: 'API Integration',
    dueDate: '2025-11-20',
    estimatedHours: 16,
    createdAt: '2025-10-21',
    completedAt: null
  }
]

export const getTaskById = (id) => {
  return tasks.find(task => task.id === parseInt(id))
}

export const getTasksByProject = (projectName) => {
  return tasks.filter(task => task.project === projectName)
}

export const getTasksByAssignee = (assigneeName) => {
  return tasks.filter(task => task.assignee === assigneeName)
}

export const getTasksByStatus = (status) => {
  return tasks.filter(task => task.status === status)
}

export const getTasksByPriority = (priority) => {
  return tasks.filter(task => task.priority === priority)
}

