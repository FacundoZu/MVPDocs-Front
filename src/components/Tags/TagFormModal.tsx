// frontend/src/components/Tags/TagFormModal.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ColorPicker } from './ColorPicker';
import type { Tag } from '../../types/tagTypes';

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTag?: Tag;
  projectId: string;
  onSubmit: (data: TagFormData) => Promise<void>;
}

export interface TagFormData {
  name: string;
  color: string;
  description?: string;
}

export const TagFormModal: React.FC<TagFormModalProps> = ({
  isOpen,
  onClose,
  existingTag,
  projectId,
  onSubmit,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TagFormData>({
    defaultValues: {
      name: '',
      color: '#3B82F6',
      description: '',
    },
  });

  const watchedName = watch('name');
  const watchedDescription = watch('description');
  const watchedColor = watch('color');

  // 🔁 Prellenar en modo edición
  useEffect(() => {
    if (existingTag) {
      reset({
        name: existingTag.name,
        color: existingTag.color,
        description: existingTag.description || '',
      });
    } else {
      reset({
        name: '',
        color: '#3B82F6',
        description: '',
      });
    }
  }, [existingTag, isOpen, reset]);

  // 🚀 Mutation con React Query
  const mutation = useMutation({
    mutationFn: async (data: TagFormData) => {
      return onSubmit(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
      onClose();
    },
  });

  const submitHandler = (data: TagFormData) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {existingTag ? 'Editar Tag' : 'Crear Nuevo Tag'}
            </h2>
            <button
              onClick={onClose}
              disabled={mutation.isPending}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del tag *
              </label>
              <input
                type="text"
                maxLength={50}
                autoFocus
                disabled={mutation.isPending}
                placeholder="ej: Ansiedad, Motivación, Conflicto..."
                {...register('name', {
                  required: 'El nombre es requerido',
                  maxLength: {
                    value: 50,
                    message: 'Máximo 50 caracteres',
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
                  }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {watchedName?.length || 0}/50 caracteres
              </p>
            </div>

            {/* Color Picker */}
            <div>
              <ColorPicker
                selectedColor={watchedColor}
                onChange={(color) => setValue('color', color)}
              />
              <input
                type="hidden"
                {...register('color', {
                  required: 'Color requerido',
                  pattern: {
                    value: /^#[0-9A-F]{6}$/i,
                    message: 'Color inválido (formato: #RRGGBB)',
                  },
                })}
              />
              {errors.color && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.color.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                rows={3}
                maxLength={200}
                disabled={mutation.isPending}
                placeholder="Describe cuándo usar este tag..."
                {...register('description', {
                  maxLength: {
                    value: 200,
                    message: 'Máximo 200 caracteres',
                  },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {watchedDescription?.length || 0}/200 caracteres
              </p>
            </div>

            {/* Error submit */}
            {mutation.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  {(mutation.error as Error)?.message ||
                    'Error al guardar el tag'}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={mutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending
                  ? 'Guardando...'
                  : existingTag
                    ? 'Guardar Cambios'
                    : 'Crear Tag'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
