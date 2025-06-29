'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { secondaryDb } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

interface Book {
  id: string;
  title: string;
  author: string;
  'aff-link': string;
  'actual-price': string;
  'disc-price': string;
  'image-url': string;
  createdAt: string;
}

const BooksList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksRef = collection(secondaryDb, 'books-aff');
        const q = query(booksRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const booksData: Book[] = [];
        querySnapshot.forEach((doc) => {
          booksData.push({
            id: doc.id,
            ...doc.data()
          } as Book);
        });
        
        setBooks(booksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;

    setDeleteLoading(bookToDelete.id);
    try {
      const bookRef = doc(secondaryDb, 'books-aff', bookToDelete.id);
      await deleteDoc(bookRef);
      
      // Remove the book from the local state
      setBooks(books.filter(book => book.id !== bookToDelete.id));
      
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };

  if (loading) {
    return (
      <PageContainer title="Books List" description="View all uploaded books">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Books List" description="View all uploaded books">
      <DashboardCard title="Books Database">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Total Books: {books.length}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/book-upload')}
          >
            Add Book
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Actual Price</TableCell>
                <TableCell>Discount Price</TableCell>
                <TableCell>Affiliate Link</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <Avatar
                      src={book['image-url']}
                      alt={book.title}
                      sx={{ width: 50, height: 50 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {book.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`$${book['actual-price']}`} 
                      color="primary" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`$${book['disc-price']}`} 
                      color="secondary" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      href={book['aff-link']}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      variant="outlined"
                    >
                      View Link
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(book.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(book)}
                      disabled={deleteLoading === book.id}
                      size="small"
                    >
                      {deleteLoading === book.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteIcon />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {books.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              No books found in the database
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Upload some books to see them here
            </Typography>
          </Box>
        )}
      </DashboardCard>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete &ldquo;{bookToDelete?.title}&rdquo; by {bookToDelete?.author}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading === bookToDelete?.id}
          >
            {deleteLoading === bookToDelete?.id ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default BooksList; 