export const teacherData = [
  {
    id: 1,
    idNumber: "TCHR001",
    teacherName: "Rahim Uddin",
    photo: "https://randomuser.me/api/portraits/men/31.jpg",
    designation: "Math Teacher",
    phone: "01700000001",
    email: "rahim@example.com",
    password: "pass1234",
    absence: 2,
    present: 18,
    late: 1,
    leave: 1,
    totalPayable: 25000,
    payableDue: 5000,
  },
  {
    id: 2,
    idNumber: "TCHR002",
    teacherName: "Karim Ahmed",
    photo: "https://randomuser.me/api/portraits/men/42.jpg",
    designation: "English Teacher",
    phone: "01700000002",
    email: "karim@example.com",
    password: "pass1234",
    absence: 0,
    present: 20,
    late: 0,
    leave: 0,
    totalPayable: 24000,
    payableDue: 0,
  },
  {
    id: 3,
    idNumber: "TCHR003",
    teacherName: "Fatima Begum",
    photo: "https://randomuser.me/api/portraits/women/25.jpg",
    designation: "Science Teacher",
    phone: "01700000003",
    email: "fatima@example.com",
    password: "pass1234",
    absence: 1,
    present: 19,
    late: 0,
    leave: 0,
    totalPayable: 26000,
    payableDue: 2000,
  },

  // ===== AUTO GENERATED DATA =====
  ...Array.from({ length: 30 }, (_, i) => {
    const id = i + 4;
    const randMale = Math.random() < 0.5;
    const randPicIndex = Math.floor(Math.random() * 99) + 1;
    const photo = randMale
      ? `https://randomuser.me/api/portraits/men/${randPicIndex}.jpg`
      : `https://randomuser.me/api/portraits/women/${randPicIndex}.jpg`;

    const designations = [
      "Math Teacher",
      "English Teacher",
      "Science Teacher",
      "History Teacher",
      "Art Teacher",
      "Physical Education Teacher",
    ];

    const desig = designations[id % designations.length];

    return {
      id,
      idNumber: `TCHR${String(id).padStart(3, "0")}`,
      teacherName: `Teacher ${id}`,
      photo,
      designation: desig,
      phone: `0170000${String(100 + id).slice(-7)}`,
      email: `teacher${id}@example.com`,
      password: "pass1234",
      absence: Math.floor(Math.random() * 5),
      present: 20 - Math.floor(Math.random() * 5),
      late: Math.floor(Math.random() * 3),
      leave: Math.floor(Math.random() * 3),
      totalPayable: 22000 + Math.floor(Math.random() * 8000),
      payableDue: Math.floor(Math.random() * 7000),
    };
  }),
];
