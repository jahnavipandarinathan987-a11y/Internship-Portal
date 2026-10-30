
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import "./App.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

function Header() {
  return (
    <header className="header">
      <Link to="/" className="brand">
        Intern<span>Connect</span>
      </Link>

      <nav>
        <Link to="/">Internships</Link>
        <a href="/#application">Apply</a>
      </nav>
    </header>
  );
}

function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/internships`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load internships.");
        }
        return response.json();
      })
      .then(setInternships)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">YOUR CAREER STARTS HERE</p>
        <h1>
          Discover your next <span>opportunity.</span>
        </h1>
        <p>
          Explore internships, develop real-world skills, and take
          the first step towards your professional future.
        </p>
        <a href="#internships" className="primary-button">
          Explore Internships
        </a>
      </section>

      <main className="container" id="internships">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR FIT</p>
            <h2>Available Internships</h2>
          </div>
          <span className="count">
            {internships.length} opportunities
          </span>
        </div>

        {loading && <p className="notice">Loading internships...</p>}
        {error && <p className="error">{error}</p>}

        <div className="internship-grid">
          {internships.map((item) => (
            <article className="internship-card" key={item.id}>
              <div className="card-top">
                <span className="card-icon">✦</span>
                <span className="badge">{item.location}</span>
              </div>

              <h3>{item.title}</h3>
              <p className="company">{item.company}</p>
              <p className="description">{item.description}</p>

              <div className="skill-list">
                {item.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <div className="card-footer">
                <span>{item.duration}</span>
                <Link
                  to={`/internship/${item.id}`}
                  className="text-link"
                >
                  View Details →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <ApplicationForm internships={internships} />
      </main>
    </>
  );
}

function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/internships/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Internship not found.");
        }

        return data;
      })
      .then(setInternship)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="container">
        <p>Loading internship details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <p className="error">{error}</p>
        <Link to="/">← Back to internships</Link>
      </main>
    );
  }

  return (
    <main className="container detail-page">
      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← All internships
      </button>

      <article className="detail-card">
        <p className="eyebrow">INTERNSHIP DETAILS</p>
        <h1>{internship.title}</h1>
        <p className="company">{internship.company}</p>

        <div className="detail-meta">
          <span>Location: {internship.location}</span>
          <span>Duration: {internship.duration}</span>
        </div>

        <h3>About this opportunity</h3>
        <p>{internship.description}</p>

        <h3>Skills required</h3>
        <div className="skill-list">
          {internship.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate(`/?internship=${internship.id}#application`)
          }
        >
          Apply for this Internship
        </button>
      </article>
    </main>
  );
}

function ApplicationForm({ internships }) {
  const [form, setForm] = useState({
    studentName: "",
    email: "",
    rollNumber: "",
    internship: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedInternship = params.get("internship");

    if (
      selectedInternship &&
      internships.some((item) => item.id === selectedInternship)
    ) {
      setForm((previous) => ({
        ...previous,
        internship: selectedInternship,
      }));
    }

    if (window.location.hash === "#application") {
      setTimeout(() => {
        document.getElementById("application")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 200);
    }
  }, [internships]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (form.studentName.trim().length < 2) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    if (!form.rollNumber.trim()) {
      setMessage("Please enter your roll number.");
      setMessageType("error");
      return;
    }

    if (!form.internship) {
      setMessage("Please select an internship.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          studentName: form.studentName.trim(),
          email: form.email.trim(),
          rollNumber: form.rollNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Application submission failed."
        );
      }

      setMessage("Application submitted successfully!");
      setMessageType("success");

      setForm({
        studentName: "",
        email: "",
        rollNumber: "",
        internship: "",
      });
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to submit your application. Please try again."
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="application-section" id="application">
      <div className="application-intro">
        <p className="eyebrow">TAKE THE NEXT STEP</p>
        <h2>Apply for an Internship</h2>
        <p>
          Complete the form below to submit your application.
        </p>
      </div>

      <form className="application-form" onSubmit={handleSubmit}>
        <label htmlFor="studentName">Student Name</label>
        <input
          id="studentName"
          name="studentName"
          type="text"
          placeholder="Enter your full name"
          value={form.studentName}
          onChange={handleChange}
          minLength={2}
          required
        />

        <label htmlFor="email">Email ID</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="rollNumber">Roll Number</label>
        <input
          id="rollNumber"
          name="rollNumber"
          type="text"
          placeholder="Enter your roll number"
          value={form.rollNumber}
          onChange={handleChange}
          required
        />

        <label htmlFor="internship">Select Internship</label>
        <select
          id="internship"
          name="internship"
          value={form.internship}
          onChange={handleChange}
          required
        >
          <option value="">Choose an internship</option>

          {internships.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} — {item.company}
            </option>
          ))}
        </select>

        <button
          className="primary-button submit-button"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Application →"}
        </button>

        {message && (
          <p
            className={messageType}
            role="status"
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="brand">
        Intern<span>Connect</span>
      </Link>
      <p>Connecting students with opportunities.</p>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<InternshipList />} />
        <Route
          path="/internship/:id"
          element={<InternshipDetails />}
        />
        <Route
          path="*"
          element={
            <main className="container">
              <h2>Page not found</h2>
              <Link to="/">Return home</Link>
            </main>
          }
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
