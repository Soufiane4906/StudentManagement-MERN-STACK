import express from 'express';
import Course from '../models/Course.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get all courses (authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create course (ADMIN, SCOLARITE)
router.post('/', auth, checkRole(['ADMIN', 'SCOLARITE']), async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update course (ADMIN, SCOLARITE)
router.patch('/:id', auth, checkRole(['ADMIN', 'SCOLARITE']), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course (ADMIN only)
router.delete('/:id', auth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;