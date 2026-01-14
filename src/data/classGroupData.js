export const classGroupData = Array.from({ length: 20 }, (_, i) => ({
  sl: i + 1,
  class: `Class ${i + 1}`,
  groups: [
    {
      name: "Group A",
      section: `Section ${i % 3 + 1}`, // Section 1,2,3 চক্রাকারে
      subjects: 5 + (i % 3),
      totalStudents: 20 + (i % 5),
      totalPayable: 1200 + i * 50,
      monthly: Array.from({ length: 12 }, (_, m) => ({
        month: new Date(2023, m).toLocaleString("default", { month: "long" }),
        paid: 50 * (m + 1) + i * 5,
        due: 50 * (12 - m) + i * 5,
      })),
    },
    {
      name: "Group B",
      section: `Section ${i % 2 + 1}`, // Section 1,2 চক্রাকারে
      subjects: 4 + (i % 2),
      totalStudents: 18 + (i % 6),
      totalPayable: 1000 + i * 45,
      monthly: Array.from({ length: 12 }, (_, m) => ({
        month: new Date(2023, m).toLocaleString("default", { month: "long" }),
        paid: 40 * (m + 1) + i * 5,
        due: 60 * (12 - m) + i * 5,
      })),
    },
  ],
}));
