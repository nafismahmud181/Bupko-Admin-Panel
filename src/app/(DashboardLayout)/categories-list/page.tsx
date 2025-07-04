'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/utils/firebase';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  [key: string]: any;
}

const CategoriesList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, 'categories');
        const q = query(categoriesRef, orderBy('categoryName', 'asc'));
        const querySnapshot = await getDocs(q);
        const categoriesData: Category[] = [];
        querySnapshot.forEach((doc) => {
          categoriesData.push({
            id: doc.id,
            ...doc.data()
          } as Category);
        });
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || !newCategoryImage) {
      setError('Please provide both category name and image.');
      return;
    }
    setAddLoading(true);
    setError(null);
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `categories/${newCategoryImage.name}`);
      const uploadResult = await uploadBytes(storageRef, newCategoryImage);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      // Add to Firestore
      await addDoc(collection(db, 'categories'), {
        categoryName: newCategoryName,
        image: imageUrl,
      });
      setNewCategoryName('');
      setNewCategoryImage(null);
      // Refresh list
      setLoading(true);
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('categoryName', 'asc'));
      const querySnapshot = await getDocs(q);
      const categoriesData: Category[] = [];
      querySnapshot.forEach((doc) => {
        categoriesData.push({
          id: doc.id,
          ...doc.data()
        } as Category);
      });
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setAddLoading(false);
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setError(null);
    try {
      const category = categories.find(c => c.id === deleteId);
      // Delete Firestore doc
      await deleteDoc(doc(db, 'categories', deleteId));
      // Delete image from storage
      if (category && category.image) {
        try {
          const imageRef = ref(storage, category.image);
          await deleteObject(imageRef);
        } catch (e) {
          // Ignore if not found
        }
      }
      setCategories(categories.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Edit handlers
  const startEdit = (category: Category) => {
    setEditId(category.id);
    setEditName(category.categoryName);
    setEditImageUrl(category.image);
    setEditImage(null);
    setEditDialogOpen(true);
  };
  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
    setEditImage(null);
    setEditImageUrl(null);
    setEditDialogOpen(false);
  };
  const handleEditSave = async (category: Category) => {
    setEditLoading(true);
    setError(null);
    try {
      let imageUrl = editImageUrl;
      // If new image, upload and delete old
      if (editImage) {
        // Delete old image
        if (category.image) {
          try {
            const oldRef = ref(storage, category.image);
            await deleteObject(oldRef);
          } catch (e) {}
        }
        // Upload new
        const storageRef = ref(storage, `categories/${editImage.name}`);
        const uploadResult = await uploadBytes(storageRef, editImage);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }
      await updateDoc(doc(db, 'categories', category.id), {
        categoryName: editName,
        image: imageUrl,
      });
      // Update local state
      setCategories(categories.map(c => c.id === category.id ? { ...c, categoryName: editName, image: imageUrl } : c));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Categories List" description="View all categories from the primary database">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Categories List" description="View all categories from the primary database">
      <DashboardCard title="Categories">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" color="primary" onClick={() => router.push('/category-upload')}>
            Add Category
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Category Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.image && (
                      <Image
                        src={category.image}
                        alt={category.categoryName}
                        width={48}
                        height={48}
                        style={{ borderRadius: 4, objectFit: 'cover' }}
                        unoptimized
                      />
                    )}
                  </TableCell>
                  <TableCell>{category.categoryName}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => startEdit(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => setDeleteId(category.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {categories.length === 0 && !loading && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6">No categories found.</Typography>
          </Box>
        )}
      </DashboardCard>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={cancelEdit}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Category Name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              size="small"
              required
            />
            {(editImage || editImageUrl) && (
              <Image
                src={editImage ? URL.createObjectURL(editImage) : editImageUrl || ''}
                alt="Preview"
                width={60}
                height={60}
                style={{ borderRadius: 4, objectFit: 'cover' }}
                unoptimized
              />
            )}
            <Button variant="contained" component="label" size="small">
              Change Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setEditImage(e.target.files[0]);
                  }
                }}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEdit} disabled={editLoading}>Cancel</Button>
          <Button
            onClick={() => {
              const cat = categories.find(c => c.id === editId);
              if (cat) handleEditSave(cat);
            }}
            disabled={editLoading}
            color="primary"
            variant="contained"
          >
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this category? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={deleteLoading} autoFocus>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default CategoriesList; 