import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Users, Calendar, Heart, TrendingUp, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";

interface Project {
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
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  });

  const currentUserId = '123'; // TODO: Replace with actual user ID from auth

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3000/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    }
  };

  const handleCreateProject = async () => {
    try {
      // Validate required fields
      if (!newProject.title || !newProject.description || !newProject.category) {
        toast.error('Please fill in all required fields');
        return;
      }

      const projectData = {
        title: newProject.title,
        description: newProject.description,
        category: newProject.category,
        adminId: currentUserId,
        tags: newProject.tags ? newProject.tags.split(',').map(tag => tag.trim()) : []
      };

      console.log('Sending project data:', projectData);

      const response = await fetch('http://localhost:3000/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      toast.success('Project created successfully');
      setIsCreating(false);
      setNewProject({ title: '', description: '', category: '', tags: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleJoinProject = async (projectId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/projects/${projectId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join project');
      }

      toast.success('Successfully joined project');
      fetchProjects();
    } catch (error) {
      console.error('Error joining project:', error);
      toast.error('Failed to join project');
    }
  };

  

  const handleUpdateProgress = async (projectId: string, progress: number) => {
    try {
      const response = await fetch(`http://localhost:3000/projects/${projectId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: currentUserId,
          progress
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update progress');
      }

      toast.success('Progress updated successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error(error.message || 'Failed to update progress');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Community Projects</h1>
          <p className="text-muted-foreground">
            Join collaborative projects and make a real impact in your community
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Active Projects",
              // Active = progress < 100
              value: projects.filter(p => (p.progress && p.progress.completed < 100)).length.toString(),
              icon: TrendingUp
            },
            {
              label: "Total Members",
              value: projects.reduce((acc, p) => acc + p.members.length, 0).toString(),
              icon: Users
            },
            {
              label: "Completed Projects",
              // Completed = progress >= 100
              value: projects.filter(p => (p.progress && p.progress.completed >= 100)).length.toString(),
              icon: Calendar
            },
            {
              label: "Avg. Progress",
              value: Math.round(projects.reduce((acc, p) => acc + p.progress.completed, 0) / Math.max(projects.length, 1)) + "%",
              icon: Heart
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="glass-strong p-6 hover:border-primary/50 transition-all glow-hover">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <ProjectCard
                project={project}
                currentUserId={currentUserId}
                onJoin={handleJoinProject}
                onUpdateProgress={handleUpdateProgress}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Create Project Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 glass rounded-2xl p-8 text-center"
            >
              <h2 className="text-2xl font-bold mb-2">Have a Project Idea?</h2>
              <p className="text-muted-foreground mb-6">
                Start your own community project and bring people together
              </p>
              <Button size="lg" className="glow">
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="title"
                  className="col-span-4"
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Textarea
                  id="description"
                  className="col-span-4"
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Select
                  value={newProject.category}
                  onValueChange={(value) => setNewProject({ ...newProject, category: value })}
                >
                  <SelectTrigger className="col-span-4">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="tags"
                  className="col-span-4"
                  placeholder="Tags (comma-separated)"
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateProject}>Create Project</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
};

export default Projects;