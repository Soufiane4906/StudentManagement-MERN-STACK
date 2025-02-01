import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get all students (ADMIN, SCOLARITE)
router.get('/', auth, checkRole(['ADMIN', 'SCOLARITE']), async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'email role');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student profile (ADMIN, SCOLARITE, own profile for STUDENT)
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'email role');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if user has permission to view this profile
    if (req.user.role === 'STUDENT' && student.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student (ADMIN, SCOLARITE)
router.post('/', auth, checkRole(['ADMIN', 'SCOLARITE']), async (req, res) => {
  try {
    const { email, password, firstName, lastName, studentId, enrollmentDate } = req.body;

    // Créer un nouvel utilisateur
    const user = new User({
      email,
      password,
      role: 'STUDENT', // Par défaut, le rôle est STUDENT
    });
    await user.save();

    // Créer un nouvel étudiant avec l'ID de l'utilisateur
    const student = new Student({
      userId: user._id,
      firstName,
      lastName,
      studentId,
      enrollmentDate,
    });
    await student.save();

    res.status(201).json({ user, student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student (ADMIN, SCOLARITE)
router.patch('/:id', auth, checkRole(['ADMIN', 'SCOLARITE']), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student (ADMIN only)
router.delete('/:id', auth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;