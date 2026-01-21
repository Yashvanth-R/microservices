const express = require('express');
const multer = require('multer');
const Minio = require('minio');
const mongoose = require('mongoose');
const cors = require('cors');
const { authenticateToken } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://mongo:27017/files')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// File Schema
const FileSchema = new mongoose.Schema({
  originalName: String,
  fileName: String,
  userId: String,
  size: Number,
  mimeType: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const FileModel = mongoose.model('File', FileSchema);

// MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const upload = multer({ storage: multer.memoryStorage() });

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'file-service' });
});

// Get user's files
app.get('/files', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    console.log('Fetching files for user:', userId);
    const files = await FileModel.find({ userId: userId });
    console.log('Found files:', files.length);
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload file
app.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const bucketName = 'taskflow-files';
    const fileName = `${Date.now()}-${req.file.originalname}`;
    
    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }
    
    await minioClient.putObject(bucketName, fileName, req.file.buffer);
    
    // Save file metadata to database
    const userId = req.user.userId || req.user.id;
    const fileRecord = new FileModel({
      originalName: req.file.originalname,
      fileName,
      userId: userId,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
    
    await fileRecord.save();
    
    res.json({
      success: true,
      fileName,
      originalName: req.file.originalname,
      url: `/download/${fileName}`,
      fileId: fileRecord._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download file
app.get('/download/:fileName', authenticateToken, async (req, res) => {
  try {
    // Check if user owns the file
    const userId = req.user.userId || req.user.id;
    const fileRecord = await FileModel.findOne({ 
      fileName: req.params.fileName,
      userId: userId 
    });
    
    if (!fileRecord) {
      return res.status(403).json({ error: 'Access denied or file not found' });
    }
    
    const bucketName = 'taskflow-files';
    const dataStream = await minioClient.getObject(bucketName, req.params.fileName);
    
    // Set proper headers
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
    res.setHeader('Content-Type', fileRecord.mimeType);
    
    dataStream.pipe(res);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Delete file
app.delete('/files/:fileId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const fileRecord = await FileModel.findOne({
      _id: req.params.fileId,
      userId: userId
    });
    
    if (!fileRecord) {
      return res.status(403).json({ error: 'Access denied or file not found' });
    }
    
    // Delete from MinIO
    const bucketName = 'taskflow-files';
    await minioClient.removeObject(bucketName, fileRecord.fileName);
    
    // Delete from database
    await FileModel.findByIdAndDelete(req.params.fileId);
    
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`File service running on port ${PORT}`);
});