'use client';
import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Input,
  CircularProgress,
  Alert
} from '@mui/material';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, /* db, */ secondaryDb } from '@/utils/firebase';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

const BookUpload = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    isbn: ''
  });

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
      const bookRef = await addDoc(collection(secondaryDb, 'books-aff'), {
        ...bookData,
        imageUrl,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setBookData({
        title: '',
        author: '',
        description: '',
        price: '',
        isbn: ''
      });
      setSelectedImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Book Upload" description="Upload new book information">
      <DashboardCard title="Upload Book">
        <form onSubmit={handleSubmit}>
          <Box sx={{ p: 2 }}>
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
            <Grid container spacing={3}>
              <Grid>
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
                  label="ISBN"
                  name="isbn"
                  value={bookData.isbn}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={bookData.price}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={bookData.description}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={4}
                  required
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Book Cover Image
                  </Typography>
                  <Input
                    type="file"
                    onChange={handleImageChange}
                    sx={{ mb: 2 }}
                    inputProps={{ accept: 'image/*' }}
                  />
                  {selectedImage && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Selected file: {selectedImage.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Upload Book'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </DashboardCard>
    </PageContainer>
  );
};

export default BookUpload;