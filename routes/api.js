const express = require("express");
const router = express.Router();
const InternshipApplication = require("../models/InternshipApplication");

// Sample internship data
const internships = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    company: "TechNova",
    location: "Remote",
    duration: "3 Months",
    description:
      "Build responsive user interfaces using React and modern frontend technologies.",
    skills: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    id: "2",
    title: "Data Science Intern",
    company: "DataSphere",
    location: "Hybrid",
    duration: "6 Months",
    description:
      "Analyze datasets, build machine learning models, and communicate useful insights.",
    skills: ["Python", "Pandas", "Machine Learning"],
  },
  {
    id: "3",
    title: "Backend Developer Intern",
    company: "CloudBridge",
    location: "Remote",
    duration: "3 Months",
    description:
      "Develop REST APIs and work with databases to build reliable backend services.",
    skills: ["Node.js", "Express", "MongoDB"],
  },
  {
    id: "4",
    title: "AI/ML Intern",
    company: "InnovateAI",
    location: "On-site",
    duration: "4 Months",
    description:
      "Explore artificial intelligence, train machine learning models, and evaluate results.",
    skills: ["Python", "Scikit-learn", "AI/ML"],
  },
];

// GET: Retrieve all internships
router.get("/internships", (req, res) => {
  res.json(internships);
});

// GET: Retrieve one internship by ID
router.get("/internships/:id", (req, res) => {
  const internship = internships.find(
    (item) => item.id === req.params.id
  );

  if (!internship) {
    return res.status(404).json({
      message: "Internship not found.",
    });
  }

  res.json(internship);
});

// POST: Submit an internship application
router.post("/applications", async (req, res) => {
  try {
    const { studentName, email, rollNumber, internship } = req.body;

    if (
      !studentName?.trim() ||
      !email?.trim() ||
      !rollNumber?.trim() ||
      !internship
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const validInternship = internships.find(
      (item) => item.id === internship
    );

    if (!validInternship) {
      return res.status(400).json({
        message: "Please select a valid internship.",
      });
    }

    const application = new InternshipApplication({
      studentName,
      email,
      rollNumber,
      internship,
    });

    const savedApplication = await application.save();

    res.status(201).json({
      message: "Application submitted successfully!",
      application: savedApplication,
    });
  } catch (error) {
    console.error("Application submission error:", error);

    res.status(500).json({
      message: "Unable to submit the application. Please try again.",
    });
  }
});

module.exports = router;