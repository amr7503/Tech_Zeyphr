import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Star, Users, Coins, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Shield,
      title: "User Authentication & Verification",
      description: "Secure profiles with trusted verification",
    },
    {
      icon: MapPin,
      title: "Geo-Location Matching",
      description: "Find skills near you instantly",
    },
    {
      icon: Calendar,
      title: "Booking & Scheduling",
      description: "Seamless session management",
    },
    {
      icon: Star,
      title: "Reputation & Reviews",
      description: "Build trust through community feedback",
    },
    {
      icon: Users,
      title: "Community Projects",
      description: "Collaborate on meaningful initiatives",
    },
    {
      icon: Coins,
      title: "Credit / Token System",
      description: "Fair exchange economy",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary-glow/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.1),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 py-20 md:py-32 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Empower Your Community
              <br />
              <span className="gradient-text">Through Skills</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8"
            >
              Find, share, or learn talents around you — hyperlocal and trustworthy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative glass rounded-full p-2 flex items-center gap-2 glow">
                <Search className="w-5 h-5 text-muted-foreground ml-3" />
                <Input
                  placeholder="Search for skills like 'Yoga', 'Coding', 'Guitar'..."
                  className="border-0 bg-transparent focus-visible:ring-0 text-base"
                />
                <Button size="lg" className="rounded-full">
                  Explore
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link to="/discover">
                <Button size="lg" className="glow">
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore Skills
                </Button>
              </Link>
              <Link to="/profile">
                <Button size="lg" variant="outline" className="glass border-primary/30">
                  <Zap className="w-5 h-5 mr-2" />
                  Offer Your Skill
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Animated background dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: 20 + Math.random() * 20,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute w-1 h-1 bg-primary/30 rounded-full blur-sm"
            />
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to build a thriving skill-sharing community
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="glass p-6 h-full hover:border-primary/50 transition-all duration-300 hover:glow group cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                >
                  <feature.icon className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 md:p-12 text-center glow"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Start Sharing?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of community members exchanging skills and building meaningful connections.
          </p>
          <Link to="/discover">
            <Button size="lg" className="glow">
              Get Started Now
            </Button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;