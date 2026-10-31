export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  type:
    | "Hackathon"
    | "Workshop"
    | "Seminar"
    | "Cultural"
    | "Placement"
    | "Technical";
  description: string;
  registeredCount: number;
  maxCapacity: number;
  tags: string[];
  image: string;
  organizer: string;
  registrationLink: string;
};

export type Update = {
  id: string;
  title: string;
  date: string;
  content: string;
  category: "Academic" | "Placement" | "General";
  important?: boolean;
};

export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "CampusOne Hackathon 2025",
    date: "2025-06-15",
    location: "Main Auditorium",
    type: "Hackathon",
    description:
      "Build the future of campus technology. 24-hour coding marathon with prizes worth $5000.",
    registeredCount: 142,
    maxCapacity: 200,
    tags: ["Coding", "Innovation", "React", "AI"],
    image:
      "https://images.unsplash.com/photo-1504384308090-c54be3855833?w=800&q=80",
    organizer: "CS Department",
    registrationLink: "https://forms.gle/mock-hackathon-link",
  },
  {
    id: "2",
    title: "AI & Machine Learning Workshop",
    date: "2025-05-20",
    location: "Lab 304",
    type: "Workshop",
    description:
      "Hands-on session with TensorFlow and PyTorch. Learn to build your first neural network.",
    registeredCount: 45,
    maxCapacity: 50,
    tags: ["AI", "ML", "Python", "Data Science"],
    image:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
    organizer: "Dr. Sarah Williams",
    registrationLink: "https://forms.gle/mock-workshop-link",
  },
  {
    id: "3",
    title: "Pre-Placement Talk: Google",
    date: "2025-05-25",
    location: "Conference Hall A",
    type: "Seminar",
    description:
      "Interact with Google engineers and learn about their hiring process for 2025 batch.",
    registeredCount: 280,
    maxCapacity: 300,
    tags: ["Placement", "Career", "Tech"],
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    organizer: "Placement Cell",
    registrationLink: "https://meet.google.com/mock-link",
  },
  {
    id: "4",
    title: "Strides Fest 2026",
    date: "2026-01-07",
    location: "Tech Block",
    type: "Technical",
    description:
      "Technical projects, new ideas and more. The biggest event of the year is here.",
    registeredCount: 500,
    maxCapacity: 2000,
    tags: ["Technical", "Project", "Code"],
    image:
      "https://e-artifact-2k26.netlify.app/3c78cd8e-52ad-480d-9eea-d70648f4fa19.jpg",
    organizer: "Student Council",
    registrationLink: "https://e-artifact-2k26.netlify.app/",
  },
];

export const MOCK_UPDATES: Update[] = [
  {
    id: "u1",
    title: "End Semester Exam Schedule Released",
    date: "2025-05-01",
    content:
      "The final exam schedule for all branches has been published. Check the notice board for details.",
    category: "Academic",
    important: true,
  },
  {
    id: "u2",
    title: "TCS Recruitment Drive Registration",
    date: "2025-05-03",
    content:
      "TCS will be visiting campus next week. Eligible students (CGPA > 7.5) must register by Friday.",
    category: "Placement",
    important: true,
  },
  {
    id: "u3",
    title: "Library Renovation Notice",
    date: "2025-05-05",
    content:
      "The central library will remain closed on weekends for renovation work.",
    category: "General",
  },
  {
    id: "u4",
    title: "New Elective Courses for 3rd Year",
    date: "2025-05-08",
    content:
      "List of new open electives has been updated on the portal. Choose your subjects before 20th May.",
    category: "Academic",
  },
];

export const MOCK_STATS = {
  placements: [
    { name: "CS", placed: 85, total: 100 },
    { name: "IT", placed: 78, total: 90 },
    { name: "ECE", placed: 65, total: 80 },
    { name: "MECH", placed: 45, total: 60 },
  ],
  attendance: [
    { month: "Jan", avg: 92 },
    { month: "Feb", avg: 88 },
    { month: "Mar", avg: 85 },
    { month: "Apr", avg: 90 },
    { month: "May", avg: 75 },
  ],
  skills: [
    { skill: "React", count: 120 },
    { skill: "Python", count: 150 },
    { skill: "Java", count: 90 },
    { skill: "Node.js", count: 80 },
    { skill: "C++", count: 110 },
  ],
};
