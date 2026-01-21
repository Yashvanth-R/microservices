'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { fileService, FileRecord } from '@/lib/services/fileService';
import { Upload, Download, File, AlertCircle, Trash2 } from 'lucide-react';

export default function FilesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userFiles, setUserFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchUserFiles();
  }, []);

  const fetchUserFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const files = await fileService.getUserFiles();
      setUserFiles(files);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch files';
      setError(`Failed to fetch files: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fileService.uploadFile(selectedFile);
      if (response.success) {
        setSuccess(`File uploaded successfully: ${response.originalName}`);
        await fetchUserFiles(); // Refresh the file list
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileName: string, originalName: string) => {
    try {
      const blob = await fileService.downloadFile(fileName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Download failed. Please try again.');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await fileService.deleteFile(fileId);
      setSuccess('File deleted successfully');
      await fetchUserFiles(); // Refresh the file list
    } catch (err: any) {
      setError(err.response?.data?.error || 'Delete failed. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">File Management</h1>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Files</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                <File size={20} className="text-gray-600" />
                <span className="text-sm text-gray-700">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </div>

        {/* User Files Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Files</h2>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading files...</p>
          ) : userFiles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {userFiles.map((file) => (
                <div key={file._id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <File size={20} className="text-gray-600" />
                    <div>
                      <span className="text-gray-900 font-medium">{file.originalName}</span>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(file.fileName, file.originalName)}
                      className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file._id)}
                      className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}