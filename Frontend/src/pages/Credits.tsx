import { motion } from "framer-motion";
import { Coins, TrendingUp, ArrowUpRight, ArrowDownRight, Gift, Users } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Credits = () => {
  const balance = 485;
  const earned = 1247;
  const spent = 762;

  const transactions = [
    {
      id: 1,
      type: "earned",
      amount: 50,
      description: "Yoga class taught",
      date: "2 hours ago",
      user: "Sarah M.",
    },
    {
      id: 2,
      type: "spent",
      amount: 75,
      description: "Web development lesson",
      date: "1 day ago",
      user: "Alex C.",
    },
    {
      id: 3,
      type: "earned",
      amount: 40,
      description: "Spanish conversation session",
      date: "2 days ago",
      user: "Isabella R.",
    },
    {
      id: 4,
      type: "spent",
      amount: 60,
      description: "Guitar lesson",
      date: "3 days ago",
      user: "Marcus J.",
    },
    {
      id: 5,
      type: "earned",
      amount: 85,
      description: "Pottery workshop",
      date: "4 days ago",
      user: "Emma D.",
    },
  ];

  const impactScore = Math.round((earned / (earned + spent)) * 100);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Credits Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your credit balance and track your community impact
          </p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 mb-8 relative overflow-hidden glow"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary-glow/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-6 h-6 text-primary" />
              <span className="text-muted-foreground">Current Balance</span>
            </div>
            <div className="text-6xl font-bold mb-6 gradient-text">
              <AnimatedCounter value={balance} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Total Earned</span>
                </div>
                <div className="text-3xl font-bold text-green-500">
                  <AnimatedCounter value={earned} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Total Spent</span>
                </div>
                <div className="text-3xl font-bold text-orange-500">
                  <AnimatedCounter value={spent} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Community Impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">
                    <AnimatedCounter value={impactScore} />%
                  </div>
                  <Badge variant="default">High</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button size="lg" className="glow">
                <Gift className="w-5 h-5 mr-2" />
                Donate Credits
              </Button>
              <Button size="lg" variant="outline" className="glass">
                <Users className="w-5 h-5 mr-2" />
                Refer Friends
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="glass-hover p-4 hover:border-primary/50 transition-all glow-hover">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "earned"
                            ? "bg-green-500/10"
                            : "bg-orange-500/10"
                        }`}
                      >
                        {transaction.type === "earned" ? (
                          <ArrowUpRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.user} • {transaction.date}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        transaction.type === "earned" ? "text-green-500" : "text-orange-500"
                      }`}
                    >
                      {transaction.type === "earned" ? "+" : "-"}
                      {transaction.amount}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
        >
          <Card className="glass-strong p-6">
            <h3 className="text-xl font-semibold mb-3">How Credits Work</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Earn credits by sharing your skills with others</li>
              <li>• Spend credits to learn new skills from the community</li>
              <li>• Credits promote fair exchange and equality</li>
              <li>• Unused credits can be donated to community projects</li>
            </ul>
          </Card>

          <Card className="glass-strong p-6">
            <h3 className="text-xl font-semibold mb-3">Boost Your Balance</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Complete your profile verification (+25 credits)</li>
              <li>• Refer a friend who joins (+50 credits per referral)</li>
              <li>• Teach your first session (+bonus 30 credits)</li>
              <li>• Participate in community projects (varies)</li>
            </ul>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Credits;