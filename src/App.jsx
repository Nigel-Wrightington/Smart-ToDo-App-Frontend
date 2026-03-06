import { useEffect, useState } from "react";
import "./App.css"; //this imports the external CSS file

//backend API endpoint so we can reach it
const API_URL = "http://localhost:3000/tasks";

export default function App() {
  //STATE MANAGEMENT
  //----------------

  // Stores all tasks from backend
  const [tasks, setTasks] = useState([]);

  // Stores current input value
  const [title, setTitle] = useState("");

  // Stores duedate input but set it to receive a string because date format will be a string (even though it is numbers).
  const [dueDate, setDueDate] = useState("");

  // Loading indicator state
  const [loading, setLoading] = useState(true);

  // Error message state
  const [error, setError] = useState("");

  //FETCHING TASKS FROM BACKEND
  //---------------------------

  async function fetchTasks() {
    try {
      setError("");
      setLoading(true);

      // make GET request to the backend
      const res = await fetch(API_URL);

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();

      // Update tasks state
      setTasks(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ADD NEW TASK
  // ------------

  async function addTask(e) {
    e.preventDefault(); //this prevents page refresh

    if (!title.trim()) return; //prevents empty tasks

    try {
      setError("");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueDate: dueDate || null }),
      });

      if (!res.ok) throw new Error("Failed to add task");

      setTitle(""); //clears input field
      setDueDate(""); //clear input field for dueDate
      await fetchTasks(); //Refreshes task list
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  //TOGGLE COMPLETED STATUS
  // ----------------------

  async function toggleTask(task) {
    try {
      setError("");

      const res = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      await fetchTasks(); //Refreshs task list
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  // DELETE TASK
  // -----------

  async function deleteTask(id) {
    try {
      setError("");

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");

      await fetchTasks(); //refreshes task list
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  // RUN ON FIRST RENDER
  // -------------------

  useEffect(() => {
    fetchTasks();
  }, []);

  // ------UI--------
  // ----------------

  // creating a helper function to parse dates correctly so we can make tasks on the same day
  // remember that January = 0, February = 1, etc etc etc. So that is why month - 1 is necessary.
  function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // create a helper function that we can call to make our below due date formatting cleaner
  function formatDate(dateString) {
    return parseLocalDate(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // create a helper function that checks if a task is overdue
  function isOverdue(dueDate, completed) {
    // the logic says:
    // if there is no due date, it cannot be overdue.
    // if the task is completed, do not mark it overdue.
    if (!dueDate || completed) return false;

    // this grabs todays date.
    const today = new Date();
    // this turns our current date into a real Date object.
    const due = parseLocalDate(dueDate);

    // we set both dates to midnight so we can compare only the date, not the time.
    // Without this, JavaScript will compare the full date and time.
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  }

  return (
    <div className="app-container">
      <h1>Smart To-Do</h1>

      {/* Task Form */}
      <form onSubmit={addTask} className="task-form">
        <input
          className="task-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
        />
        {/* make space for due date input before add button */}
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button className="btn">Add</button>
      </form>

      {/* Error Display */}
      {error && <p className="error"> {error}</p>}

      {/* Loading State */}
      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((t) => (
            <li key={t.id} className="task-item">
              <label>
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleTask(t)}
                />

                {/* Apply completed class conditionally */}
                <div className="task-Text">
                  <span
                    className={`${t.completed ? "completed" : ""} ${isOverdue(t.dueDate, t.completed) ? "overdueTask" : ""}`}
                  >
                    {t.title}
                  </span>

                  {/* this displays the date, but we are gonna format it to display nicely */}
                  {/* NOTICE that we are using the helper function to make this cleaner */}
                  {t.dueDate && (
                    <div className="taskDueDate">
                      Due: {formatDate(t.dueDate)}
                    </div>
                  )}

                  {/* adding in our isOverdue helper function to display if parameters are met */}
                  {isOverdue(t.dueDate, t.completed) && (
                    <div className="overdueWarning">Overdue!</div>
                  )}
                </div>
              </label>

              <button className="btn" onClick={() => deleteTask(t.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
