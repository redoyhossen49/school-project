// src/data/feeStatsData.js

export const feeStatsData = {
  today: {
    fees: [
      { type: "Tuition", collected: 15000, due: 2000 },
      { type: "Exam", collected: 5000, due: 500 },
      { type: "Library", collected: 2000, due: 0 },
      { type: "Transport", collected: 4000, due: 1000 },
      { type: "Sports", collected: 1000, due: 0 },
      { type: "Lab", collected: 3000, due: 500 },
      { type: "Misc", collected: 500, due: 0 },
    ],
    trend: [
      { label: "9 AM", collected: 5000, due: 500 },
      { label: "12 PM", collected: 8000, due: 1000 },
      { label: "3 PM", collected: 6000, due: 500 },
      { label: "6 PM", collected: 6500, due: 0 },
    ],
  },

  weekly: {
    fees: [
      { type: "Tuition", collected: 120000, due: 15000 },
      { type: "Exam", collected: 30000, due: 3000 },
      { type: "Library", collected: 12000, due: 1000 },
      { type: "Transport", collected: 40000, due: 5000 },
      { type: "Sports", collected: 8000, due: 1000 },
      { type: "Lab", collected: 20000, due: 3000 },
      { type: "Misc", collected: 5000, due: 500 },
    ],
    trend: [
      { label: "Mon", collected: 25000, due: 3000 },
      { label: "Tue", collected: 30000, due: 4000 },
      { label: "Wed", collected: 28000, due: 3500 },
      { label: "Thu", collected: 32000, due: 4500 },
      { label: "Fri", collected: 27000, due: 3000 },
      { label: "Sat", collected: 20000, due: 2500 },
      { label: "Sun", collected: 15000, due: 1500 },
    ],
  },

  monthly: {
    fees: [
      { type: "Tuition", collected: 200000, due: 20000 },
      { type: "Exam", collected: 80000, due: 5000 },
      { type: "Library", collected: 30000, due: 2000 },
      { type: "Transport", collected: 70000, due: 10000 },
      { type: "Sports", collected: 20000, due: 3000 },
      { type: "Lab", collected: 40000, due: 5000 },
      { type: "Misc", collected: 10000, due: 1000 },
    ],
    trend: [
      { label: "Jan", collected: 40000, due: 5000 },
      { label: "Feb", collected: 42000, due: 6000 },
      { label: "Mar", collected: 38000, due: 4000 },
      { label: "Apr", collected: 45000, due: 7000 },
      { label: "May", collected: 47000, due: 5000 },
      { label: "Jun", collected: 43000, due: 6000 },
       { label: "Jul", collected: 40000, due: 5000 },
      { label: "Aug", collected: 42000, due: 6000 },
      { label: "Sep", collected: 38000, due: 4000 },
      { label: "Oct", collected: 45000, due: 7000 },
      { label: "Nov", collected: 47000, due: 5000 },
      { label: "Dec", collected: 43000, due: 6000 },
    ],
  },

  session: {
    "2024-25": {
      fees: [
        { type: "Tuition", collected: 3000000, due: 150000 },
        { type: "Exam", collected: 500000, due: 30000 },
        { type: "Library", collected: 200000, due: 10000 },
        { type: "Transport", collected: 400000, due: 50000 },
        { type: "Sports", collected: 100000, due: 8000 },
        { type: "Lab", collected: 250000, due: 20000 },
        { type: "Misc", collected: 50000, due: 7000 },
      ],
      trend: [
        { label: "Jul", collected: 350000, due: 25000 },
        { label: "Aug", collected: 360000, due: 30000 },
        { label: "Sep", collected: 370000, due: 20000 },
        { label: "Oct", collected: 380000, due: 30000 },
        { label: "Nov", collected: 390000, due: 25000 },
        { label: "Dec", collected: 400000, due: 25000 },
        { label: "Jan", collected: 410000, due: 30000 },
        { label: "Feb", collected: 420000, due: 20000 },
        { label: "Mar", collected: 430000, due: 30000 },
        { label: "Apr", collected: 440000, due: 25000 },
        { label: "May", collected: 450000, due: 30000 },
        { label: "Jun", collected: 460000, due: 20000 },
      ],
    },
  },
};
