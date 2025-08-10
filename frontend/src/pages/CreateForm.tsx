import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addField, updateField, removeField, saveForm, reorderFields, resetCurrentForm } from '../store/formSlice';
import FieldEditor from '../components/FieldEditor';
import { v4 as uuidv4 } from 'uuid';
import { FormField } from '../types/formTypes';

export default function CreateForm() {
  const dispatch = useDispatch();
  const current = useSelector((s: RootState) => s.form.currentForm);

  function handleAdd() {
    const f: FormField = {
      id: uuidv4(),
      type: 'text',
      label: 'New Field',
      required: false,
      defaultValue: '',
      options: [],
      validations: {},
      derived: null,
    };
    dispatch(addField(f));
  }

  function handleUpdate(field: FormField) {
    dispatch(updateField(field));
  }

  function handleDelete(id: string) {
    dispatch(removeField(id));
  }

  function move(from: number, to: number) {
    dispatch(reorderFields({ from, to }));
  }

  function handleSave(name: string) {
    if (!name || name.trim() === '') return alert('Please enter form name');
    dispatch(saveForm({ name }));
    alert('Form saved to localStorage');
    dispatch(resetCurrentForm());
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>Build Form</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={handleAdd}>Add Field</Button>
        <Button variant="outlined" onClick={() => { dispatch(resetCurrentForm()); }}>Reset</Button>
      </Box>

      <Box>
        {current.fields.length === 0 && <Typography color="text.secondary">No fields yet — add one.</Typography>}
        {current.fields.map((f, idx) => (
          <FieldEditor
            key={f.id}
            field={f}
            allFields={current.fields}
            onChange={(updated) => handleUpdate(updated)}
            onDelete={(id) => handleDelete(id)}
            index={idx}
            moveUp={() => idx > 0 && move(idx, idx-1)}
            moveDown={() => idx < current.fields.length-1 && move(idx, idx+1)}
          />
        ))}
      </Box>

      <Box sx={{ mt: 3 }}>
        <TextField id="form-name" label="Form name to save" variant="outlined" size="small" sx={{ mr: 2 }} />
        <Button variant="contained" onClick={() => {
          const el = document.getElementById('form-name') as HTMLInputElement | null;
          handleSave(el?.value ?? '');
        }}>Save Form</Button>
      </Box>
    </Box>
  );
}
