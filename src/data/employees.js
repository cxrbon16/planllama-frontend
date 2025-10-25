// Mock employee data
export const employees = [
  {
    id: 1,
    employee_id: 'e01',
    name: 'Sarah Johnson',
    role: 'Project Manager',
    user_role: 'pm',
    avatar: 'SJ',
    capacity_hours_per_week: 40,
    current_load_hours: 32,
    integrations: {
      email: 'sarah.johnson@codelllama.ai',
      jira_account_id: '5f9c-e01',
      slack_user_id: 'U01ABC'
    },
    languages: ['en', 'es'],
    skills: [
      { name: 'project_management', level: 5 },
      { name: 'agile', level: 5 },
      { name: 'leadership', level: 4 },
      { name: 'stakeholder_management', level: 4 }
    ],
    timezone: 'America/New_York'
  },
  {
    id: 2,
    employee_id: 'e02',
    name: 'David Wilson',
    role: 'Senior Project Manager',
    user_role: 'pm',
    avatar: 'DW',
    capacity_hours_per_week: 40,
    current_load_hours: 28,
    integrations: {
      email: 'david.wilson@codelllama.ai',
      jira_account_id: '5f9c-e02',
      slack_user_id: 'U02DEF'
    },
    languages: ['en', 'fr'],
    skills: [
      { name: 'project_management', level: 5 },
      { name: 'scrum', level: 5 },
      { name: 'risk_management', level: 5 },
      { name: 'budgeting', level: 4 }
    ],
    timezone: 'America/Los_Angeles'
  },
  {
    id: 3,
    employee_id: 'e03',
    name: 'Michael Chen',
    role: 'Backend Engineer',
    user_role: 'executor',
    avatar: 'MC',
    capacity_hours_per_week: 40,
    current_load_hours: 35,
    integrations: {
      email: 'michael.chen@codelllama.ai',
      jira_account_id: '5f9c-e03',
      slack_user_id: 'U03GHI'
    },
    languages: ['en', 'zh'],
    skills: [
      { name: 'python', level: 5 },
      { name: 'fastapi', level: 5 },
      { name: 'postgresql', level: 4 },
      { name: 'redis', level: 4 },
      { name: 'docker', level: 4 }
    ],
    timezone: 'Asia/Shanghai'
  },
  {
    id: 4,
    employee_id: 'e04',
    name: 'Emily Davis',
    role: 'UI/UX Designer',
    user_role: 'executor',
    avatar: 'ED',
    capacity_hours_per_week: 40,
    current_load_hours: 22,
    integrations: {
      email: 'emily.davis@codelllama.ai',
      jira_account_id: '5f9c-e04',
      slack_user_id: 'U04JKL'
    },
    languages: ['en', 'de'],
    skills: [
      { name: 'figma', level: 5 },
      { name: 'ui_design', level: 5 },
      { name: 'ux_research', level: 4 },
      { name: 'prototyping', level: 4 },
      { name: 'user_testing', level: 3 }
    ],
    timezone: 'Europe/Berlin'
  },
  {
    id: 5,
    employee_id: 'e05',
    name: 'Alex Kumar',
    role: 'Frontend Developer',
    user_role: 'executor',
    avatar: 'AK',
    capacity_hours_per_week: 40,
    current_load_hours: 30,
    integrations: {
      email: 'alex.kumar@codelllama.ai',
      jira_account_id: '5f9c-e05',
      slack_user_id: 'U05MNO'
    },
    languages: ['en', 'hi'],
    skills: [
      { name: 'react', level: 5 },
      { name: 'typescript', level: 5 },
      { name: 'tailwind', level: 4 },
      { name: 'nextjs', level: 4 },
      { name: 'graphql', level: 3 }
    ],
    timezone: 'Asia/Kolkata'
  },
  {
    id: 6,
    employee_id: 'e06',
    name: 'Yavuz Kaya',
    role: 'Backend Engineer',
    user_role: 'executor',
    avatar: 'YK',
    capacity_hours_per_week: 40,
    current_load_hours: 18,
    integrations: {
      email: 'yavuz.k@codelllama.ai',
      jira_account_id: '5f9c-e06',
      slack_user_id: 'U06PQR'
    },
    languages: ['tr', 'en'],
    skills: [
      { name: 'python', level: 5 },
      { name: 'fastapi', level: 5 },
      { name: 'redis', level: 4 },
      { name: 'mongodb', level: 4 },
      { name: 'aws', level: 3 }
    ],
    timezone: 'Europe/Istanbul'
  }
]

export const getEmployeeById = (id) => {
  return employees.find(emp => emp.id === id)
}

export const getEmployeesByRole = (role) => {
  return employees.filter(emp => emp.user_role === role)
}

export const getEmployeeByEmployeeId = (employeeId) => {
  return employees.find(emp => emp.employee_id === employeeId)
}