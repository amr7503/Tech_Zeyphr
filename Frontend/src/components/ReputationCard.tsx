import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Award, TrendingUp } from "lucide-react";

interface ReputationCardProps {
  userName: string;
  rating: number;
  totalReviews: number;
  endorsements: string[];
  badges: string[];
}

const ReputationCard = ({
  userName,
  rating,
  totalReviews,
  endorsements,
  badges,
}: ReputationCardProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-yellow-500";
    if (rating >= 4.0) return "text-yellow-600";
    if (rating >= 3.5) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Card className="glass-strong p-6 glow-hover h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-1">{userName}</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? `${getRatingColor(rating)} fill-current`
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className={`font-bold ${getRatingColor(rating)}`}>
                {rating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({totalReviews} reviews)
              </span>
            </div>
          </div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Badges
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Badge className="glass-strong">{badge}</Badge>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Top Endorsements</p>
          <div className="flex flex-wrap gap-2">
            {endorsements.map((endorsement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Badge variant="secondary" className="glass">
                  {endorsement}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ReputationCard;
