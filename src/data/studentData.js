// helper function to format date for UI
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options); // e.g., "10 Jan 2026"
};
export const studentData = [
  {
    id: 1,
    admissionNo: "AD1001",
    studentId: "STU1001",
    rollNo: 101,
    student_name: "Janet",
    photo: "https://i.pravatar.cc/40?img=1",
    fatherName: "Robert Smith",
    motherName: "Anna Smith",
    className: "10",
    group: "Science",
    section: "A",
    session: "2025-26",
    phone: "01710000001",
    email: "janet@example.com",
    password: "123456",
    feesDue: 1200,
    

    loginType: "Active",
    status: "approved",

    joinDate: "2026-01-10",

    guardian: {
      name: "Robert Smith",
      relation: "Father",
      photo: "https://i.pravatar.cc/40?img=11",
      division: "Dhaka",
      district: "Gazipur",
      upazila: "Savar",
      village: "Ashulia",
      phone: "01711111111",
      email: "robert@example.com",
    },
  },

  // ===== AUTO GENERATED (3 – 32) =====
  ...Array.from({ length: 30 }, (_, i) => {
    const id = i + 3;
    const joinDay = ((id % 28) + 1).toString().padStart(2, "0");

    return {
      id,
      admissionNo: `AD10${id}`,
      studentId: `STU10${id}`,
      rollNo: 100 + id,
      student_name: `Student ${id}`,
      photo: `https://i.pravatar.cc/40?img=${id + 2}`,
      fatherName: `Father ${id}`,
      motherName: `Mother ${id}`,
      className: ["10", "12", "11", "12", "10", "11"][id % 6],
      group: id % 6 > 3 ? "Science" : "N/A",
      section: ["A", "B", "C"][id % 3],
      session: "2025-26",
      phone: `01710000${id.toString().padStart(2, "0")}`,
      email: `student${id}@example.com`,
      password: "123456",
      feesDue: id % 2 === 0 ? 0 : 1500,
      

      loginType: id % 3 === 0 ? "Inactive" : "Active",
      status: ["pending", "approved", "rejected"][id % 3],

      joinDate: `2025-12-${joinDay}`,

      guardian: {
        name: `Guardian ${id}`,
        relation: id % 2 === 0 ? "Father" : "Mother",
        photo: `https://i.pravatar.cc/40?img=${id + 50}`,
        division: "Dhaka",
        district: ["Gazipur", "Narayanganj", "Dhaka"][id % 3],
        upazila: ["Savar", "Sonargaon", "Dhamrai"][id % 3],
        village: `Village ${id}`,
        phone: `01711111${200 + id}`,
        email: `guardian${id}@example.com`,
      },
    };
  }),
];
