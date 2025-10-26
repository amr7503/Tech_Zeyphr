import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface BookingCalendarProps {
  onBookingComplete?: (date: Date, time: string) => void;
}

const BookingCalendar = ({ onBookingComplete }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();

  const timeSlots = [
    { time: "09:00 AM", available: true },
    { time: "10:00 AM", available: true },
    { time: "11:00 AM", available: false },
    { time: "12:00 PM", available: true },
    { time: "01:00 PM", available: true },
    { time: "02:00 PM", available: false },
    { time: "03:00 PM", available: true },
    { time: "04:00 PM", available: true },
    { time: "05:00 PM", available: true },
  ];

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onBookingComplete?.(selectedDate, selectedTime);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-strong p-6">
        <h3 className="text-xl font-semibold mb-4">Select a Date</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => date < new Date()}
          className="rounded-md border-0"
        />
      </Card>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="glass-strong p-6">
              <h3 className="text-xl font-semibold mb-4">
                Available Times for {format(selectedDate, "PPP")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <motion.button
                    key={slot.time}
                    whileHover={{ scale: slot.available ? 1.05 : 1 }}
                    whileTap={{ scale: slot.available ? 0.95 : 1 }}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`glass-hover p-4 rounded-lg text-center transition-all ${
                      selectedTime === slot.time
                        ? "border-primary bg-primary/10 glow"
                        : slot.available
                        ? "border-border/50"
                        : "opacity-50 cursor-not-allowed bg-destructive/5"
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    <div className="font-medium text-sm">{slot.time}</div>
                    {!slot.available && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        Booked
                      </Badge>
                    )}
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass-strong p-6 border-primary/50 glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Your Booking
                  </p>
                  <p className="font-semibold text-lg">
                    {format(selectedDate, "PPP")} at {selectedTime}
                  </p>
                </div>
                <Button onClick={handleConfirm} size="lg" className="glow">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm Booking
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BookingCalendar;
