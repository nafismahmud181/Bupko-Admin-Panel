'use client';
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '@/utils/firebase';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useRef } from 'react';

const CategoryUpload = () => {
  const [categoryName, setCategoryName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
    }
  };
  const handleBoxClick = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      if (!categoryName || !image) {
        throw new Error('Please provide both category name and image.');
      }
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `categories/${image.name}`);
      const uploadResult = await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      // Add to Firestore
      await addDoc(collection(db, 'categories'), {
        categoryName,
        image: imageUrl,
      });
      setCategoryName('');
      setImage(null);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Category Upload" description="Upload a new category">
      <DashboardCard title="Upload Category">
        <Box
          sx={{
            maxWidth: 500,
            mx: 'auto',
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: 'background.paper',
          }}
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>Category uploaded successfully!</Alert>
            )}
            <Typography variant="h5" fontWeight={600} gutterBottom align="center" sx={{ mb: 3 }}>
              Upload Category
            </Typography>
            <TextField
              label="Category Name"
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              required
              fullWidth
              margin="normal"
            />
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBoxClick}
              sx={{
                mt: 2,
                mb: 2,
                p: 3,
                border: '2px dashed',
                borderColor: dragActive ? 'primary.main' : 'grey.400',
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <input
                type="file"
                accept="image/*"
                hidden
                ref={inputRef}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setImage(e.target.files[0]);
                  }
                }}
              />
              {image ? (
                <>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    style={{ width: 80, height: 80, borderRadius: 4, objectFit: 'cover', marginBottom: 8 }}
                  />
                  <Typography variant="body2" color="textSecondary">{image.name}</Typography>
                  <Typography variant="caption" color="textSecondary">Click or drag to change image</Typography>
                </>
              ) : (
                <>
                  <Typography variant="body1" color="textSecondary">
                    Drag & drop an image here, or click to select
                  </Typography>
                </>
              )}
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} /> : 'Upload Category'}
            </Button>
          </form>
        </Box>
      </DashboardCard>
    </PageContainer>
  );
};

export default CategoryUpload; 