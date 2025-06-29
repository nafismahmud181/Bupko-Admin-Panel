'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  TextField,
  Button,
  Input,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, /* db, */ secondaryDb } from '@/utils/firebase';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

const BookUpload = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    'disc-price': '',
    price: '',
    'aff-link': ''
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setBookData(prevState => ({
      ...prevState,
      [name]: value
    }));
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
      const storageRef = ref(storage, `book-covers/${selectedImage.name}`);
      const uploadResult = await uploadBytes(storageRef, selectedImage);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Add book data to Firestore
      const { price, ...restBookData } = bookData;
      const bookRef = await addDoc(collection(secondaryDb, 'books-aff'), {
        ...restBookData,
        ['actual-price']: price,
        ['image-url']: imageUrl,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setBookData({
        title: '',
        author: '',
        'disc-price': '',
        price: '',
        'aff-link': ''
      });
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Book Upload" description="Upload new book information">
      <DashboardCard title="Upload Book">
        <Box
          sx={{
            maxWidth: 800,
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
                Book uploaded successfully!
              </Alert>
            )}
            <Typography variant="h5" fontWeight={600} gutterBottom align="center" sx={{ mb: 3 }}>
              Enter Book Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                  Book Cover Image
                </Typography>
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
                    minHeight: 220,
                    background: selectedImage ? 'rgba(0,0,0,0.02)' : 'none',
                  }}
                >
                  <Input
                    type="file"
                    inputRef={fileInputRef}
                    onChange={handleImageChange}
                    sx={{ mb: 2 }}
                    inputProps={{ accept: 'image/*' }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      minHeight: 140,
                      borderRadius: 2,
                      background: '#fafafa',
                      border: '1px solid #eee',
                      p: 1,
                      position: 'relative',
                    }}
                  >
                    {selectedImage ? (
                      <>
                        <Box sx={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Image
                            src={URL.createObjectURL(selectedImage)}
                            alt="Book Cover Preview"
                            width={200}
                            height={120}
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: 120, 
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
                              top: 4,
                              right: 4,
                              background: 'rgba(255,255,255,0.7)',
                              zIndex: 2,
                              '&:hover': { background: 'rgba(255,255,255,1)' }
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          {selectedImage.name}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                          No image selected
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="Book Title"
                  name="title"
                  value={bookData.title}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Author"
                  name="author"
                  value={bookData.author}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Affiliate Link"
                  name="aff-link"
                  value={bookData['aff-link']}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Actual Price"
                  name="price"
                  type="number"
                  value={bookData.price}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Discount Price"
                  name="disc-price"
                  type="number"
                  value={bookData['disc-price']}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                {/* You can add more fields or content here if needed */}
              </Box>
            </Box>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                sx={{ mt: 2, px: 4, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 2 }}
                fullWidth
              >
                {loading ? 'Uploading...' : 'Upload Book'}
              </Button>
            </Box>
          </form>
        </Box>
      </DashboardCard>
    </PageContainer>
  );
};

export default BookUpload;