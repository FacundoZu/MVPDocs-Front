import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ColorPicker } from './ColorPicker';
import type { Tag } from '../../types/tagTypes';
import { IoClose } from 'react-icons/io5';
import { createTag } from '../../API/TagAPI';
import { toast } from 'sonner';

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTag?: Tag;
  projectId: string;
}

export interface TagFormData {
  name: string;
  color: string;
  description?: string;
}

export const TagFormModal = ({ isOpen, onClose, existingTag, projectId }: TagFormModalProps) => {

  const defaultValues = {
    name: existingTag?.name || '',
    color: existingTag?.color || '#3B82F6',
    description: existingTag?.description || '',
  }

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<TagFormData>({ defaultValues })

  const watchedColor = watch('color')

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] })
      onClose()
      toast.success('Código creado exitosamente')
      reset()
    },
    onError: (error) => {
      toast.error(error.message)
    }

  })

  const onSubmit = (formData: TagFormData) => {
    mutate({ ...formData, projectId })
  }

  if (!isOpen) return null;

  return (
    <div className="overflow-y-hidden h-full w-full flex flex-col items-center justify-end z-10 bg-black/10 backdrop-blur-xs absolute top-0 left-0">

      <div className="bg-white w-full p-6 rounded-t-2xl open-modal">
        <header className='flex flex-col gap-2'>
          <div className="flex items-center justify-between">
            <h3 className='text-lg font-bold'>Crea un nuevo código</h3>
            <button className='cursor-pointer text-gray-500 hover:text-gray-600 transition-colors duration-300' onClick={onClose}>
              <IoClose />
            </button>
          </div>
          <p className='text-sm text-gray-500'>Los códigos te ayudarán a organizar tus documentos</p>
        </header>

        <form className='flex flex-col gap-4 mt-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-2 text-sm'>
            <label htmlFor="name" className='text-gray-500'>Nombre</label>
            <input
              type="text"
              id="name"
              placeholder='Ingresa el nombre del código'
              className="p-2 border border-gray-300 rounded-md bg-gray-100"
              {...register('name', { required: 'El nombre es requerido' })}
            />
            {errors.name && <p className='text-red-500 text-xs'>{errors.name.message}</p>}
          </div>

          <ColorPicker
            selectedColor={watchedColor}
            onChange={(color) => setValue('color', color)}
          />

          <div className='flex flex-col gap-2 text-sm'>
            <label htmlFor="description" className='text-gray-500'>Descripcion <span className='text-gray-400 text-xs'>(Opcional)</span></label>
            <textarea
              id="description"
              cols={10}
              rows={4}
              placeholder='Ingresa una descripcion'
              className='p-2 border border-gray-300 rounded-md bg-gray-100 text-sm'
              {...register('description')}
            ></textarea>
          </div>

          <button type='submit' className='bg-blue-500 text-white p-2 rounded-md text-sm cursor-pointer'>Crear</button>
        </form>

      </div>
    </div>
  );
};
