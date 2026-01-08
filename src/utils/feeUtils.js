export const calculateSummary = (fees) => {
  const collected = fees.reduce((sum, f) => sum + f.collected, 0);
  const due = fees.reduce((sum, f) => sum + f.due, 0);

  return {
    total: collected + due,
    collected,
    due,
    pending: due,
  };
}