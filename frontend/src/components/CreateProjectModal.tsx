import ProjectOrientationFlow from './ProjectOrientationFlow'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  return <ProjectOrientationFlow isOpen={isOpen} onClose={onClose} />
}
