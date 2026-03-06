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
                <span className={t.completed ? "completed" : ""}>
                  {t.title}
                </span>

                {t.dueDate && (
                  <div className="taskDueDate">Due: {t.dueDate}</div>
                )}
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
