import React, { useState, useEffect } from 'react';
import {
  TextField, MenuItem, Grid, IconButton, Switch, FormControlLabel,
  Box, Button, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormField, FieldType } from '../types/formTypes';

interface Props {
  field: FormField;
  allFields: FormField[];
  onChange: (f: FormField) => void;
  onDelete: (id: string) => void;
  index: number;
  moveUp: () => void;
  moveDown: () => void;
}

const types: FieldType[] = ['text', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date'];

export default function FieldEditor({ field, allFields, onChange, onDelete, index, moveUp, moveDown }: Props) {
  const [local, setLocal] = useState<FormField>(field);

  useEffect(() => setLocal(field), [field]);

  function update(partial: Partial<FormField>) {
    const next = { ...local, ...partial };
    setLocal(next);
    onChange(next);
  }

  function addOption() {
    const next = { ...local, options: [...(local.options || []), `Option ${(local.options || []).length + 1}`] };
    update(next);
  }

  function removeOptionAt(i: number) {
    const opts = (local.options || []).filter((_, idx) => idx !== i);
    update({ options: opts });
  }

  function setOptionAt(i: number, value: string) {
    const opts = [...(local.options || [])];
    opts[i] = value;
    update({ options: opts });
  }

  return (
    <Box sx={{ border: '1px solid #ddd', p: 2, mb: 2, borderRadius: 1 }}>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Label" value={local.label} onChange={(e) => update({ label: e.target.value })} />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField select fullWidth label="Type" value={local.type} onChange={(e) => update({ type: e.target.value as FieldType })}>
            {types.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControlLabel control={<Switch checked={!!local.required} onChange={(e) => update({ required: e.target.checked })} />} label="Required" />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Default value" value={local.defaultValue ?? ''} onChange={(e) => update({ defaultValue: e.target.value })} />
        </Grid>

        {/* Validation */}
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Min length" type="number" value={local.validations?.minLength ?? ''} onChange={(e) => {
            const v = e.target.value ? Number(e.target.value) : null;
            update({ validations: { ...(local.validations || {}), minLength: v } });
          }} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="Max length" type="number" value={local.validations?.maxLength ?? ''} onChange={(e) => {
            const v = e.target.value ? Number(e.target.value) : null;
            update({ validations: { ...(local.validations || {}), maxLength: v } });
          }} />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel control={<Switch checked={!!local.validations?.email} onChange={(e) => update({ validations: { ...(local.validations || {}), email: e.target.checked } })} />} label="Email format" />
          <FormControlLabel control={<Switch checked={!!local.validations?.passwordRule} onChange={(e) => update({ validations: { ...(local.validations || {}), passwordRule: e.target.checked } })} />} label="Password rule" />
        </Grid>

        {/* Options */}
        {(local.type === 'select' || local.type === 'radio' || local.type === 'checkbox') && (
          <Grid item xs={12}>
            <Button size="small" onClick={addOption}>Add option</Button>
            {(local.options || []).map((opt, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField fullWidth value={opt} onChange={(e) => setOptionAt(i, e.target.value)} />
                <Button color="error" onClick={() => removeOptionAt(i)}>Remove</Button>
              </Box>
            ))}
          </Grid>
        )}

        {/* Derived field */}
        <Grid item xs={12}>
          <FormControlLabel control={<Switch checked={!!local.derived} onChange={(e) => {
            if (e.target.checked) {
              update({ derived: { parents: [], formula: '' } });
            } else update({ derived: null });
          }} />} label="Derived field" />
          {local.derived && (
            <Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {allFields.filter(f => f.id !== local.id).map(f => {
                  const selected = local.derived!.parents.includes(f.id);
                  return (
                    <Chip
                      key={f.id}
                      label={f.label}
                      color={selected ? 'primary' : 'default'}
                      onClick={() => {
                        const parents = new Set(local.derived!.parents);
                        if (parents.has(f.id)) parents.delete(f.id);
                        else parents.add(f.id);
                        update({ derived: { ...local.derived!, parents: Array.from(parents) } });
                      }}
                    />
                  );
                })}
              </Box>
              <TextField
                fullWidth
                label="Formula"
                value={local.derived.formula}
                onChange={(e) => update({ derived: { ...local.derived!, formula: e.target.value } })}
              />
            </Box>
          )}
        </Grid>

        {/* Actions */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button size="small" onClick={moveUp} disabled={index === 0}>Up</Button>
            <Button size="small" onClick={moveDown}>Down</Button>
          </Box>
          <IconButton color="error" onClick={() => onDelete(local.id)}><DeleteIcon /></IconButton>
        </Grid>
      </Grid>
    </Box>
  );
}
