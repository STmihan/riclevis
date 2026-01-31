import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { SectionType } from '../types/resume'
import { useResumeContext } from '../context/ResumeContext'
import { createSection } from '../utils/sectionTemplates'
import { AddSectionModal } from './AddSectionModal'

export function AddSectionButton() {
  const { isEditMode, addSection } = useResumeContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!isEditMode) return null

  const handleSelect = (type: SectionType) => {
    const section = createSection(type)
    addSection(section)
  }

  return (
    <>
      <div className="flex justify-center py-2 print:hidden">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-500 flex items-center justify-center transition-colors border border-dashed border-gray-300 hover:border-blue-400"
          title="Добавить секцию"
        >
          <Plus size={16} />
        </button>
      </div>
      <AddSectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
      />
    </>
  )
}
