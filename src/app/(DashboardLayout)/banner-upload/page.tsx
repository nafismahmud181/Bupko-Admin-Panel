'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Button,
  Input,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, secondaryDb } from '@/utils/firebase';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

const BannerUpload = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      setSuccess(false);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!selectedImage) {
        throw new Error('Please select an image');
      }

      // Upload image to Firebase Storage
      const storageRef = ref(storage, `banners/${selectedImage.name}`);
      const uploadResult = await uploadBytes(storageRef, selectedImage);
      const image = await getDownloadURL(uploadResult.ref);

      // Add banner data to Firestore in 'banners' collection of secondaryDb
      await addDoc(collection(secondaryDb, 'banner'), {
        image: image,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Banner Upload" description="Upload new banner image">
      <DashboardCard title="Upload Banner">
        <Box
          sx={{
            maxWidth: 600,
            mx: 'auto',
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: 'background.paper',
          }}
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Banner uploaded successfully!
              </Alert>
            )}
            <Typography variant="h5" fontWeight={600} gutterBottom align="center" sx={{ mb: 3 }}>
              Upload Banner Image
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: 'primary.light',
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                  width: '100%',
                  minHeight: 220,
                  background: selectedImage ? 'rgba(0,0,0,0.02)' : 'none',
                }}
              >
                <Input
                  type="file"
                  inputRef={fileInputRef}
                  onChange={handleImageChange}
                  sx={{ display: 'none' }}
                  inputProps={{ accept: 'image/*' }}
                  id="banner-upload-input"
                />
                <label htmlFor="banner-upload-input">
                    <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
                        Select Image
                    </Button>
                </label>

                {selectedImage ? (
                  <Box sx={{ mt: 2, position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Image
                      src={URL.createObjectURL(selectedImage)}
                      alt="Banner Preview"
                      width={400}
                      height={200}
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        maxHeight: 200, 
                        borderRadius: 8, 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        objectFit: 'contain'
                      }}
                    />
                    <IconButton
                      aria-label="Remove image"
                      size="small"
                      onClick={() => {
                        setSelectedImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        background: 'rgba(255,255,255,0.9)',
                        zIndex: 2,
                        '&:hover': { background: 'white' }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {selectedImage.name}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No image selected
                    </Typography>
                  </Box>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading || !selectedImage}
                sx={{
                  fontWeight: 600,
                  minWidth: 200,
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                    Uploading...
                  </>
                ) : (
                  'Upload Banner'
                )}
              </Button>
            </Box>
          </form>
        </Box>
      </DashboardCard>
    </PageContainer>
  );
};

export default BannerUpload; 