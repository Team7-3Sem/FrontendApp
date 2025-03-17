const API_URL = "http://localhost:8080/kinogrisen/employees"; // Adjust if needed

// Fetch and display employees
async function fetchEmployees() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const employees = await response.json();
        const list = document.getElementById("employee-list");
        list.innerHTML = ""; // Clear previous entries

        employees.forEach(employee => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${employee.name}</strong> - ${employee.role}
                <button onclick="editEmployee(${employee.employeeId}, '${employee.name}', '${employee.role}')">Edit</button>
                <button onclick="deleteEmployee(${employee.employeeId})">Delete</button>
            `;
            list.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching employees:", error);
    }
}

// Add or update an employee
async function saveEmployee(event) {
    event.preventDefault(); // Prevent form submission reload

    const employeeId = document.getElementById("employee-id").value;
    const name = document.getElementById("name").value;
    const role = document.getElementById("role").value;

    const employeeData = { name, role };

    try {
        const requestOptions = {
            method: employeeId ? "PUT" : "POST", // Use PUT for update, POST for new
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employeeData),
        };

        const url = employeeId ? `${API_URL}/${employeeId}` : API_URL;
        const response = await fetch(url, requestOptions);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        fetchEmployees(); // Refresh the list
        document.getElementById("employee-form").reset(); // Clear form
        document.getElementById("employee-id").value = ""; // Reset hidden field

    } catch (error) {
        console.error("Error saving employee:", error);
    }
}

// Populate form for editing an employee
function editEmployee(id, name, role) {
    document.getElementById("employee-id").value = id;
    document.getElementById("name").value = name;
    document.getElementById("role").value = role;
}

// Delete an employee
async function deleteEmployee(id) {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        fetchEmployees(); // Refresh the list

    } catch (error) {
        console.error("Error deleting employee:", error);
    }
}

// Attach event listener to the form
document.getElementById("employee-form").addEventListener("submit", saveEmployee);

// Load employees when the page loads
document.addEventListener("DOMContentLoaded", fetchEmployees);
