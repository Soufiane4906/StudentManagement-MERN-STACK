import express from 'express';
import Grade from '../models/Grade.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get all grades (ADMIN, SCOLARITE)
router.get('/', auth, checkRole(['ADMIN', 'SCOLARITE']), async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate('studentId', 'firstName lastName studentId')
      .populate('courseId', 'name credits');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student grades (ADMIN, SCOLARITE, own grades for STUDENT)
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId })
      .populate('courseId', 'name credits');

    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student || student._id.toString() !== req.params.studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
import mongoose from 'mongoose';
import Student from "../models/Student.js";
import Course from "../models/Course.js";

router.post('/', auth, checkRole(['ADMIN', 'SCOLARITE']), async (req, res) => {
  try {
    const { studentId, courseId, grade, date } = req.body;

    // Vérifier que studentId et courseId sont des ObjectId valides
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid studentId' });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid courseId' });
    }

    // Vérifier que l'étudiant et le cours existent
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Créer la note
    const gradeDoc = new Grade({ studentId, courseId, grade, date });
    await gradeDoc.save();

    res.status(201).json(gradeDoc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update grade (ADMIN, SCOLARITE)
router.patch('/:id', auth, checkRole(['ADMIN', 'SCOLARITE']), async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json(grade);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete grade (ADMIN only)
router.delete('/:id', auth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json({ message: 'Grade deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;