const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'questions.json');

app.use(express.json());
app.use(express.static(__dirname));

// Helper: Load questions
function loadQuestions() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// Helper: Save questions
function saveQuestions(questions) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(questions, null, 2));
}

// Get all questions
app.get('/api/questions', (req, res) => {
    res.json(loadQuestions());
});

// Add a question
app.post('/api/questions', (req, res) => {
    const questions = loadQuestions();
    const newQuestion = {
        id: Date.now(),
        text: req.body.text,
        replies: []
    };
    questions.push(newQuestion);
    saveQuestions(questions);
    res.json(newQuestion);
});

// Add a reply
app.post('/api/questions/:id/reply', (req, res) => {
    const questions = loadQuestions();
    const q = questions.find(q => q.id == req.params.id);
    if (!q) return res.status(404).send('Not found');
    const reply = {
        text: req.body.text,
        teacher: !!req.body.teacher
    };
    if (reply.teacher) {
        q.replies.unshift(reply); // Teacher replies at top
    } else {
        q.replies.push(reply);
    }
    saveQuestions(questions);
    res.json(reply);
});

// Delete a question (teacher only)
app.delete('/api/questions/:id', (req, res) => {
    const questions = loadQuestions();
    const idx = questions.findIndex(q => q.id == req.params.id);
    if (idx === -1) return res.status(404).send('Not found');
    questions.splice(idx, 1);
    saveQuestions(questions);
    res.sendStatus(204);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));