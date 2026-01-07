export const dashboardData = {
  admin: [
    { title: "Total School", value: 3654, active: 3643, inactive: 11 },
    { title: "Total Students", value: 284, active: 254, inactive: 30 },
   {
  title: "Total Revenue Income",
  value: 162,       // total expected income
  collected: 161,   // collected so far
  due: 1,           // remaining
},

    { title: "Customer Balance", value: 82, request: 81, },
  ],

  teacher: [
    { title: "My Students", value: 120, active: 118, inactive: 2 },
    { title: "My Classes", value: 6, active: 6, inactive: 0 },
    { title: "My Subjects", value: 4, active: 4, inactive: 0 },
    { title: "Attendance Taken", value: "95%", active: "-", inactive: "-" },
  ],

  school: [
    { title: "Total Teachers", value: 75, active: 70, inactive: 5 },
    { title: "Total Students", value: 1800, active: 1750, inactive: 50 },
    { title: "Total Classes", value: 45, active: 45, inactive: 0 },
    { title: "Total Departments", value: 8, active: 8, inactive: 0 },
  ],

  student: [
    { title: "My Subjects", value: 6, active: 6, inactive: 0 },
    { title: "My Teachers", value: 8, active: 8, inactive: 0 },
    { title: "Attendance", value: "92%", active: "-", inactive: "-" },
    { title: "Pending Fees", value: "৳ 2000", active: "-", inactive: "-" },
  ],
};
