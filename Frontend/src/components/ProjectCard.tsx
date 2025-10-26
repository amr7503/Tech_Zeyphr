import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ProjectCardProps {
    project: {
        _id: string;
        title: string;
        description: string;
        category: string;
        tags: string[];
        status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
        progress: {
            completed: number;
            lastUpdated: string;
        };
        members: {
            userId: string;
            role: 'admin' | 'member';
            joinedAt: string;
        }[];
    };
    currentUserId?: string;
    onJoin?: (projectId: string) => void;
    onUpdateProgress?: (projectId: string, progress: number) => void;
}

const statusColors = {
    'planning': 'bg-blue-500',
    'in-progress': 'bg-yellow-500',
    'completed': 'bg-green-500',
    'on-hold': 'bg-gray-500'
};

export function ProjectCard({ project, currentUserId, onJoin, onUpdateProgress }: ProjectCardProps) {
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [progressValue, setProgressValue] = useState(project.progress.completed);
    
    const isAdmin = project.members.some(
        member => member.userId === currentUserId && member.role === 'admin'
    );
    const isMember = project.members.some(
        member => member.userId === currentUserId
    );

    const handleProgressUpdate = () => {
        if (onUpdateProgress) {
            onUpdateProgress(project._id, progressValue);
            setIsUpdateDialogOpen(false);
        }
    };

    const handleCardClick = () => {
        if (isAdmin) setIsUpdateDialogOpen(true);
    };

    return (
        <Card onClick={handleCardClick} className={`w-full max-w-md shadow-lg hover:shadow-xl transition-shadow ${isAdmin ? 'cursor-pointer' : ''}`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold">{project.title}</h3>
                        <p className="text-sm text-gray-500">{project.category}</p>
                    </div>
                    <Badge variant="secondary" className={statusColors[project.status]}>
                        {project.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm mb-4">{project.description}</p>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{project.progress.completed}%</span>
                        </div>
                        <Progress value={project.progress.completed} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                    {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                </div>
                {!isMember && onJoin && (
                    <Button onClick={(e) => { e.stopPropagation(); onJoin(project._id); }}>
                        Join Project
                    </Button>
                )}
                {isAdmin && (
                    <>
                        <Badge variant="secondary" className="bg-purple-500">
                            Admin
                        </Badge>

                        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Update Project Progress</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <div className="mb-4">
                                        <label className="text-sm font-medium mb-2 block">Progress: {progressValue}%</label>
                                        <Slider
                                            value={[progressValue]}
                                            onValueChange={([value]) => setProgressValue(value)}
                                            max={100}
                                            step={1}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={(e) => { e.stopPropagation(); handleProgressUpdate(); }}>
                                            Save Progress
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </CardFooter>
        </Card>
    );
}