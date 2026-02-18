import { createContext, useContext, type ReactNode } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { projectApi } from '../API/projects';

export interface Project {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

interface ProjectContextType {
    addProject: (data: { name: string; description?: string }) => Promise<Project>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const { mutateAsync: addProject } = useMutation({
        mutationFn: projectApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    return (
        <ProjectContext.Provider value={{ addProject }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
}
