export const validateCounterForm = ({
  title,
  dailyGoal,
  currentValue,
  icon,
  color,
}) => {
  const trimmedTitle = String(title || "").trim();
  const goal = Number(dailyGoal);
  const value = Number(currentValue ?? 0);

  if (!trimmedTitle) {
    return "Title is required.";
  }
  if (trimmedTitle.length < 2 || trimmedTitle.length > 50) {
    return "Title must be between 2 and 50 characters.";
  }
  if (!Number.isInteger(goal) || goal < 1) {
    return "Goal must be an integer greater than or equal to 1.";
  }
  if (!Number.isInteger(value) || value < 0) {
    return "Initial value must be an integer greater than or equal to 0.";
  }
  if (!icon) {
    return "Please choose an icon.";
  }
  if (!color) {
    return "Please choose a color.";
  }
  return "";
};
