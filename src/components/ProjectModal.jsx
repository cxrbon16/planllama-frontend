import { useState, useEffect } from 'react'
import { parseLabels } from '../utils/dataMappers'

function ProjectModal({ show, onClose, onSave, project = null }) {
  const [formData, setFormData] = useState({
    project_title: '',
    project_description: '',
    estimated_time: '',
    possible_solution: '',
    metadata_description: '',
    metadata_company: '',
    metadata_department: '',
    metadata_year: new Date().getFullYear().toString(),
    metadata_languages: '',
  })

  useEffect(() => {
    if (project) {
      const metadata = project.metadata || project.raw?.metadata || {}
      const languages = Array.isArray(metadata.languages) ? metadata.languages.join(', ') : ''
      setFormData({
        project_title: project.project_title || project.title || project.name || '',
        project_description: project.project_description || project.description || metadata.description || '',
        estimated_time: project.estimated_time || project.estimatedTime || '',
        possible_solution: project.possible_solution || project.raw?.possible_solution || '',
        metadata_description: metadata.description || '',
        metadata_company: metadata.company || '',
        metadata_department: metadata.department || '',
        metadata_year: (metadata.year || new Date().getFullYear()).toString(),
        metadata_languages: languages,
      })
    } else {
      setFormData({
        project_title: '',
        project_description: '',
        estimated_time: '',
        possible_solution: '',
        metadata_description: '',
        metadata_company: '',
        metadata_department: '',
        metadata_year: new Date().getFullYear().toString(),
        metadata_languages: '',
      })
    }
  }, [project, show])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const payload = {
      id: project?.project_id || project?.id,
      project_title: formData.project_title,
      project_description: formData.project_description,
      estimated_time: formData.estimated_time,
      possible_solution: formData.possible_solution,
      metadata: {
        description: formData.metadata_description,
        company: formData.metadata_company,
        department: formData.metadata_department,
        year: parseInt(formData.metadata_year, 10) || new Date().getFullYear(),
        languages: parseLabels(formData.metadata_languages),
      },
    }

    onSave(payload)
  }

  if (!show) return null

  return (
    <>
      {/* Bootstrap Modal Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      
      {/* Bootstrap Modal */}
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {project ? 'Edit Project' : 'Create New Project'}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="project_title" className="form-label">Project Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="project_title"
                    name="project_title"
                    value={formData.project_title}
                    onChange={handleChange}
                    required
                    placeholder="Enter project title"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="project_description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="project_description"
                    name="project_description"
                    rows="3"
                    value={formData.project_description}
                    onChange={handleChange}
                    placeholder="Enter project description"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="estimated_time" className="form-label">Estimated Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    id="estimated_time"
                    name="estimated_time"
                    value={formData.estimated_time}
                    onChange={handleChange}
                    placeholder="e.g., P2D or 2d"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="possible_solution" className="form-label">Possible Solution</label>
                  <textarea
                    className="form-control"
                    id="possible_solution"
                    name="possible_solution"
                    rows="2"
                    value={formData.possible_solution}
                    onChange={handleChange}
                    placeholder="Notes about potential approaches"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Metadata</label>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="metadata_company" className="form-label">Company</label>
                      <input
                        type="text"
                        className="form-control"
                        id="metadata_company"
                        name="metadata_company"
                        value={formData.metadata_company}
                        onChange={handleChange}
                        placeholder="Company name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="metadata_department" className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        id="metadata_department"
                        name="metadata_department"
                        value={formData.metadata_department}
                        onChange={handleChange}
                        placeholder="Department"
                      />
                    </div>
                  </div>
                  <div className="row g-3 mt-0">
                    <div className="col-md-4">
                      <label htmlFor="metadata_year" className="form-label">Year</label>
                      <input
                        type="number"
                        className="form-control"
                        id="metadata_year"
                        name="metadata_year"
                        value={formData.metadata_year}
                        onChange={handleChange}
                        min="2000"
                        max="2100"
                      />
                    </div>
                    <div className="col-md-8">
                      <label htmlFor="metadata_languages" className="form-label">Languages (comma separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="metadata_languages"
                        name="metadata_languages"
                        value={formData.metadata_languages}
                        onChange={handleChange}
                        placeholder="e.g., en, tr"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label htmlFor="metadata_description" className="form-label">Metadata Description</label>
                    <textarea
                      className="form-control"
                      id="metadata_description"
                      name="metadata_description"
                      rows="2"
                      value={formData.metadata_description}
                      onChange={handleChange}
                      placeholder="High-level summary"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {project ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProjectModal
