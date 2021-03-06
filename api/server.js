const express = require('express');
const cors = require('cors');

const db = require('../data/helpers');

const server = express();

server.use(express.json());
server.use(cors());

server.get('/', async (req, res) => {
    res.status(200).json({message: 'Server is listening.'});
});

server.get('/api/notes', async (req, res) => {
    const notes = await db.getAll();
    res.status(200).json(notes);
});

/* Delete Me Before Final */
server.get('/api/reset', async (req, res) => {
    if(db.reset()) {
        res.status(200).json({message: 'Database reset.'});
    }
});

server.get('/api/notes/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const note = await db.getById(id);
        if (note[0].title && note[0].content) {
            res.status(200).json(note);
        }
    }
    catch {
        res.status(404).json({errorMessage: `No note found with id: ${id}.`});
    }
});

server.post('/api/notes', async (req, res) => {
    let note = req.body;
    // The note api expects both the title and content keys to be on the note object.
    if (note.title && note.content) {
        const ids = await db.insert(note);
        // We send back the ID of the newly created note.
        res.status(201).json({id: ids[0]});
    }
    else {
        res.status(422).json(
                {errorMessage: 'This endpoint expects both a title and content in the note object.', 
                received: note }
            );
    }
});

server.put('/api/notes/:id', async (req, res) => {
    const {id} = req.params;
    const note = req.body;
    if (note.title && note.content) {
        try {
            const updatedId = await db.editNote(id, note);
            res.status(200).json(updatedId);
        }
        catch(error) {
            res.status(404).json({errorMessage: `No note found with id: ${id}.`});
        }
    }
    else {
        res.status(422).json(
            {errorMessage: 'This endpoint expects both a title and content in the note object.', 
            received: note }
        );
    }
});

server.delete('/api/notes/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const recordsDeleted = await db.deleteNote(id)
        if (recordsDeleted !== 0)
            res.status(200).json(`Deleted ${recordsDeleted} records with the id of : ${id}`);
        else 
            res.status(404).json({errorMessage: `No note found with id: ${id}.`});
    }
    catch {
        res.status(404).json({errorMessage: `No note found with id: ${id}.`});
    }
});

module.exports = server;