import express from 'express';
import { protect } from '../middlewares/auth.js';
import upload from '../services/uploadService.js';
import { uploadFile, uploadMultipleFiles } from '../controllers/uploadController.js';

const router = express.Router();

router.use(protect);

router.post('/single', upload.single('file'), uploadFile);
router.post('/multiple', upload.array('files', 5), uploadMultipleFiles);

export default router;
