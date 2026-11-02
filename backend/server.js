
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json());

// In-memory storage
let todos = [
    { id: 1, task: 'Learn Express.js', completed: false },
    { id: 2, task: 'Build Full-Stack App', completed: false }
];

let nextId = 3;

// GET: Get all tasks
app.get('/todos', (req, res) => {
    res.status(200).json(todos);
});

// POST: Add new task
app.post('/todos', (req, res) => {
    const task = req.body.task;

    // 400: Invalid or empty task
    if (typeof task !== 'string' || !task.trim()) {
        return res.status(400).json({
            message: 'Task is required.'
        });
    }

    // 409: Duplicate task
    const normalizedTask = task.trim().toLowerCase();

    const duplicate = todos.find(
        todo => todo.task.toLowerCase() === normalizedTask
    );

    if (duplicate) {
        return res.status(409).json({
            message: 'This task already exists!'
        });
    }

    const newTodo = {
        id: nextId++,
        task: task.trim(),
        completed: false
    };

    todos.push(newTodo);

    // 201: Task created
    res.status(201).json({
        message: 'Task added successfully!',
        todo: newTodo
    });
});

// PUT: Update task
app.put('/todos/:id', (req, res) => {
    const id = Number(req.params.id);

    // 400: Invalid ID
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Invalid Todo ID.'
        });
    }

    const todo = todos.find(t => t.id === id);

    // 404: Task not found
    if (!todo) {
        return res.status(404).json({
            message: 'Task not found.'
        });
    }

    const { task, completed } = req.body;

    // 400: No update data
    if (task === undefined && completed === undefined) {
        return res.status(400).json({
            message: 'No update data provided.'
        });
    }

    // Validate task
    if (task !== undefined) {
        if (typeof task !== 'string' || !task.trim()) {
            return res.status(400).json({
                message: 'Invalid task.'
            });
        }

        // 409: Duplicate task
        const duplicate = todos.find(
            t => t.id !== todo.id &&
            t.task.toLowerCase() === task.trim().toLowerCase()
        );

        if (duplicate) {
            return res.status(409).json({
                message: 'This task already exists!'
            });
        }

        todo.task = task.trim();
    }

    // Validate completed value
    if (completed !== undefined) {
        if (typeof completed !== 'boolean') {
            return res.status(400).json({
                message: 'Invalid completed value.'
            });
        }

        todo.completed = completed;
    }

    // 200: Task updated
    res.status(200).json(todo);
});

// DELETE: Remove task
app.delete('/todos/:id', (req, res) => {
    const id = Number(req.params.id);

    // 400: Invalid ID
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'Invalid Todo ID.'
        });
    }

    const exists = todos.some(t => t.id === id);

    // 404: Task not found
    if (!exists) {
        return res.status(404).json({
            message: 'Task not found.'
        });
    }

    todos = todos.filter(t => t.id !== id);

    // 204: Task deleted
    res.status(204).end();
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
