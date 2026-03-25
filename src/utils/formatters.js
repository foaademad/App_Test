export const formatDate = (dateValue) => {
  return new Date(dateValue).toLocaleDateString();
};

export const getTodayKey = () => new Date().toISOString().slice(0, 10);

export const toProgress = (currentValue, dailyGoal) => {
  if (!dailyGoal || dailyGoal <= 0) {
    return 0;
  }
  return Math.min(currentValue / dailyGoal, 1);
};
