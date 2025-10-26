import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Settings, Award, Calendar, Star, TrendingUp, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReputationCard from "@/components/ReputationCard";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

type SkillFormValues = {
  name: string;
  category: string;
  level: number;
  address?: string;
  lat?: number | null;
  lng?: number | null;
};

const Profile = () => {
  const { user, isSignedIn } = useUser();
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    // fetch persisted user profile from backend
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
  const res = await fetch(`https://tech-zeyphr.onrender.com/users/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data || {});
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    const fetchSkills = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`https://tech-zeyphr.onrender.com/skills/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setSkills(data);
          }
        } catch (error) {
          console.error('Error fetching skills:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSkills();
  }, [user?.id]);

  const form = useForm<SkillFormValues>({
    defaultValues: {
      name: "",
      category: "",
      level: 50,
      address: "",
      lat: null,
      lng: null,
    },
  });

  const onSubmit = async (values: SkillFormValues) => {
    try {
      // ensure location provided
      if (!values.lat || !values.lng) {
        alert('Please provide your location (use "Use my location" or fill latitude/longitude)');
        return;
      }
  const response = await fetch('https://tech-zeyphr.onrender.com/skills/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          skill: {
            name: values.name,
            category: values.category,
            level: values.level,
            location: {
              address: values.address || '',
              coordinates: {
                lat: Number(values.lat),
                lng: Number(values.lng)
              }
            }
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add skill');
      }

      const data = await response.json();
      setSkills(data.skills);
      setIsAddingSkill(false);
      form.reset();
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your profile and manage your skills
            </p>
            <Link to="/">
              <Button size="lg" className="glow">
                Go to Home
              </Button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = [
    { label: "Skills Shared", value: "12", icon: Star },
    { label: "Sessions", value: "48", icon: Calendar },
    { label: "Rating", value: "4.9", icon: TrendingUp },
    { label: "Badges", value: "6", icon: Award },
  ];

  const badges = [
    { name: "Early Adopter", icon: "🌟", earned: true },
    { name: "Top Rated", icon: "⭐", earned: true },
    { name: "Community Hero", icon: "🦸", earned: true },
    { name: "Master Teacher", icon: "👨‍🏫", earned: false },
    { name: "Super Learner", icon: "📚", earned: false },
    { name: "Project Leader", icon: "🎯", earned: false },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 mb-8 relative overflow-hidden glow"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/10" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl border-2 border-primary/30 overflow-hidden">
                {(profile?.avatarUrl || user?.imageUrl) ? (
                  <img
                    src={profile?.avatarUrl || user.imageUrl}
                    alt={profile?.displayName || user.fullName || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  (profile?.displayName?.charAt(0) || user?.firstName?.charAt(0) || "U")
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">
                    {profile?.displayName || user?.fullName || user?.firstName || "User"}
                  </h1>
                  <Badge variant="default" className="glow">
                    Verified
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="glow">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your public profile information.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Display name</label>
                          <Input value={profile?.displayName ?? user?.fullName ?? ''} onChange={(e) => setProfile({ ...(profile||{}), displayName: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Bio</label>
                          <Input value={profile?.bio ?? ''} onChange={(e) => setProfile({ ...(profile||{}), bio: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Location</label>
                          <Input value={profile?.location ?? ''} onChange={(e) => setProfile({ ...(profile||{}), location: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Avatar URL</label>
                          <Input value={profile?.avatarUrl ?? ''} onChange={(e) => setProfile({ ...(profile||{}), avatarUrl: e.target.value })} />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                          <Button onClick={async () => {
                            // save profile
                            try {
                              const resp = await fetch(`https://tech-zeyphr.onrender.com/users/${user.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  userId: user.id,
                                  displayName: profile?.displayName,
                                  bio: profile?.bio,
                                  location: profile?.location,
                                  avatarUrl: profile?.avatarUrl,
                                }),
                              });
                              if (!resp.ok) throw new Error('Failed to save profile');
                              const body = await resp.json();
                              setProfile(body.profile || body);
                              setIsEditingProfile(false);
                            } catch (err) {
                              console.error('Error saving profile:', err);
                              alert('Failed to save profile');
                            }
                          }}>Save</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" className="glass">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="glass-strong p-6 text-center hover:border-primary/50 transition-all glow-hover">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-strong p-6">
              <h2 className="text-2xl font-bold mb-6">My Skills</h2>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-semibold">{skill.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {skill.category}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {skill.level}%
                      </span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </motion.div>
                ))}
              </div>
              <Dialog open={isAddingSkill} onOpenChange={setIsAddingSkill}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-6" variant="outline">
                    Add New Skill
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Skill</DialogTitle>
                    <DialogDescription>
                      Add a new skill to your profile. Fill in the details below.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skill Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Web Development" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Tech">Tech</SelectItem>
                                <SelectItem value="Fitness">Fitness</SelectItem>
                                <SelectItem value="Language">Language</SelectItem>
                                <SelectItem value="Art">Art</SelectItem>
                                <SelectItem value="Music">Music</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proficiency Level ({field.value}%)</FormLabel>
                            <FormControl>
                              <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[field.value]}
                                onValueChange={([value]) => field.onChange(value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="City, street or place" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="lat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude</FormLabel>
                              <FormControl>
                                <Input type="number" step="any" placeholder="e.g. 12.9716" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lng"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude</FormLabel>
                              <FormControl>
                                <Input type="number" step="any" placeholder="e.g. 77.5946" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            if (!navigator.geolocation) {
                              alert('Geolocation is not supported by your browser');
                              return;
                            }
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                const { latitude, longitude } = pos.coords;
                                form.setValue('lat', Number(latitude.toFixed(6)));
                                form.setValue('lng', Number(longitude.toFixed(6)));
                                alert('Location filled using your device coordinates');
                              },
                              (err) => {
                                console.error(err);
                                alert('Unable to retrieve your location');
                              },
                              { enableHighAccuracy: true }
                            );
                          }}
                        >
                          Use my location
                        </Button>
                        <span className="text-sm text-muted-foreground">Or fill latitude/longitude manually</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddingSkill(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Add Skill</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-strong p-6">
              <h2 className="text-2xl font-bold mb-6">Achievements</h2>
              <div className="grid grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    className={`text-center ${!badge.earned && "opacity-30 grayscale"
                      }`}
                  >
                    <div
                      className={`w-16 h-16 mx-auto mb-2 rounded-xl flex items-center justify-center text-3xl ${badge.earned ? "bg-primary/10 glow" : "bg-muted"
                        }`}
                    >
                      {badge.icon}
                    </div>
                    <div className="text-xs font-medium">{badge.name}</div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Reputation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold mb-4">Community Reputation</h2>
          <ReputationCard
            userName={user?.fullName || user?.firstName || "User"}
            rating={4.9}
            totalReviews={48}
            endorsements={["Excellent Teacher", "Patient", "Expert", "Reliable"]}
            badges={["Top Rated", "Verified Pro", "Community Hero"]}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-strong rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="glass h-auto py-4 flex-col gap-2">
              <Calendar className="w-6 h-6" />
              <span>Schedule Session</span>
            </Button>
            <Link to="/discover" className="block">
              <Button variant="outline" className="glass h-auto py-4 flex-col gap-2 w-full">
                <Star className="w-6 h-6" />
                <span>Find Skills</span>
              </Button>
            </Link>
            <Link to="/projects" className="block">
              <Button variant="outline" className="glass h-auto py-4 flex-col gap-2 w-full">
                <Award className="w-6 h-6" />
                <span>Join Project</span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;