import React, { useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loadSavedForms, setCurrentForm } from '../store/formSlice';
import { RootState } from '../store/store';

export default function MyForms() {
  const dispatch = useDispatch();
  const saved = useSelector((s: RootState) => s.form.savedForms);

  useEffect(() => {
    dispatch(loadSavedForms());
  }, [dispatch]);

  function openPreview(formId: string) {
    const f = saved.find(s => s.id === formId);
    if (!f) return;
    dispatch(setCurrentForm(f));
    window.location.href = '/preview';
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>My Forms</Typography>
      {saved.length === 0 && <Typography color="text.secondary">No saved forms yet.</Typography>}
      <List>
        {saved.map(f => (
          <ListItem key={f.id} secondaryAction={<Button onClick={()=>openPreview(f.id)}>Open</Button>}>
            <ListItemText primary={f.name} secondary={new Date(f.createdAt).toLocaleString()} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
