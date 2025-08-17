import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function Dashboard() {
  const { user, loading } = useAuth();
  const [protectedData, setProtectedData] = useState(null);

  useEffect(() => {
    if (user) {
      // Fetch protected data
      fetch("http://localhost:3000/api/protected", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setProtectedData(data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <div>Please sign in to access the dashboard.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Dashboard</h1>
        <button
          onClick={() => alert("hi")}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2>User Info</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
      </div>

      {protectedData && (
        <div className="bg-green-100 p-4 rounded">
          <h2>Protected Data</h2>
          <pre>{JSON.stringify(protectedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
