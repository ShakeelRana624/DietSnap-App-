import { UserProfile, MealLog } from '../types';

export const scheduleReminders = (profile: UserProfile, todayMeals: MealLog[]) => {
  if (!profile.notificationsEnabled) return;

  // This is a client-side simulation of reminders.
  // In a real PWA, this would be handled by a Service Worker and Push API.
  
  const checkReminders = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Low intensity: Just dinner reminder
    // Medium: Lunch and Dinner
    // High: Breakfast, Lunch, Dinner, and Goal check
    // Custom: User determined times
    
    const intensity = profile.reminderFrequency || 'medium';
    
    const sendNotification = (title: string, body: string) => {
       if (Notification.permission === 'granted') {
         new Notification(title, {
           body,
           icon: profile.photoURL || '/logo192.png',
           badge: '/logo192.png',
         });
       }
    };

    const isTime = (timeStr?: string) => timeStr === currentTimeStr;

    // Breakfast
    const breakfastTrigger = intensity === 'custom' 
      ? isTime(profile.reminderTimes?.breakfast)
      : (hours === 9 && intensity === 'high');

    if (breakfastTrigger && todayMeals.length === 0) {
      sendNotification("Time for Breakfast! 🍳", "Bhai, have you logged your morning meal yet? Keep that streak alive!");
    }
    
    // Lunch
    const lunchTrigger = intensity === 'custom'
      ? isTime(profile.reminderTimes?.lunch)
      : (hours === 13 && (intensity === 'medium' || intensity === 'high'));

    if (lunchTrigger) {
      const hasLunch = todayMeals.some(m => new Date(m.timestamp).getHours() >= 11 && new Date(m.timestamp).getHours() <= 15);
      if (!hasLunch) {
        sendNotification("Lunch Time! 🍱", "Don't forget to snap your lunch. Tracking is the first step to progress!");
      }
    }
    
    // Dinner
    const dinnerTrigger = intensity === 'custom'
      ? isTime(profile.reminderTimes?.dinner)
      : (hours === 20);

    if (dinnerTrigger) {
      sendNotification("Dinner Check-in 🥗", "How was dinner? Log it now to finish your day strong.");
    }

    // Streak Saver (9 PM)
    if (hours === 21 && minutes === 0 && todayMeals.length === 0 && profile.streak > 0) {
      sendNotification("Streak at Risk! 🔥", `Paji, your ${profile.streak} day streak is about to break! Log a meal now to save it.`);
    }
    
    // Goal Check (10 PM - Stays at 10 PM for High intensity usually, but could be tied to dinner)
    if (hours === 22 && intensity === 'high') {
      const consumed = todayMeals.reduce((a, m) => a + m.calories, 0);
      if (consumed < profile.goal * 0.8) {
        sendNotification("Goal Alert! 📉", `You're currently at ${consumed} kcal. You need about ${profile.goal - consumed} more to hit your target!`);
      }
    }
  };

  // Check every minute to handle custom times precisely
  const interval = setInterval(checkReminders, 60 * 1000);
  return () => clearInterval(interval);
};

export const showInstantWelcome = () => {
    if (Notification.permission === 'granted') {
        new Notification("DietSnap Activated! 🚀", {
            body: "Daily reminders are now live. We'll keep you on track!",
            icon: '/logo192.png'
        });
    }
};
