import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Typography, Button, MenuItem, FormControlLabel, Checkbox, RadioGroup, Radio, FormLabel, FormControl
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { FormField } from '../types/formTypes';
import { validateValue } from '../utils/validation';

function evalDerived(formula: string, parentMap: Record<string, any>) {
  try {
    const keys = Object.keys(parentMap);
    const vals = keys.map(k => parentMap[k]);
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, `return (${formula});`);
    return fn(...vals);
  } catch {
    return '';
  }
}

export default function PreviewForm() {
  const current = useSelector((s: RootState) => s.form.currentForm);
  const savedForms = useSelector((s: RootState) => s.form.savedForms);
  const [schema, setSchema] = useState(current.fields.length ? current : savedForms[0] ?? current);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const initial: Record<string, any> = {};
    schema.fields.forEach(f => {
      initial[f.id] = f.defaultValue ?? (f.type === 'checkbox' ? false : '');
    });
    setValues(initial);
  }, [schema.id]);

  useEffect(() => {
    const next = { ...values };
    schema.fields.forEach(f => {
      if (f.derived && f.derived.parents.length) {
        const parentMap: Record<string, any> = {};
        f.derived.parents.forEach(pid => parentMap[pid] = values[pid]);
        const res = evalDerived(f.derived.formula || '""', parentMap);
        next[f.id] = res;
      }
    });
    setValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  function handleChange(id: string, v: any) {
    setValues(prev => ({ ...prev, [id]: v }));
    const field = schema.fields.find(f => f.id === id)!;
    const errs = validateValue(v, field.validations);
    setErrors(prev => ({ ...prev, [id]: errs }));
  }

  function handleSubmit() {
    const allErrors: Record<string, string[]> = {};
    let ok = true;
    schema.fields.forEach(f => {
      const errs = validateValue(values[f.id], f.validations);
      if (errs.length) {
        ok = false;
        allErrors[f.id] = errs;
      }
    });
    setErrors(allErrors);
    if (!ok) return alert('Fix validation errors first');
    alert('Form submitted:\n' + JSON.stringify(values, null, 2));
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>Preview Form: {schema.name || '(unsaved)'}</Typography>
      {schema.fields.map((f: FormField) => {
        const val = values[f.id] ?? '';
        const fieldErrs = errors[f.id] ?? [];
        const disabled = !!f.derived;
        switch (f.type) {
          case 'text':
          case 'number':
          case 'date':
            return (
              <Box key={f.id} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label={f.label}
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  value={val}
                  onChange={(e)=>handleChange(f.id, e.target.value)}
                  InputLabelProps={f.type === 'date' ? { shrink: true } : undefined}
                  helperText={fieldErrs.join(', ')}
                  error={fieldErrs.length>0}
                  disabled={disabled}
                />
              </Box>
            );
          case 'textarea':
            return (
              <Box key={f.id} sx={{ mb: 2 }}>
                <TextField fullWidth multiline minRows={3} label={f.label} value={val} onChange={(e)=>handleChange(f.id, e.target.value)} helperText={fieldErrs.join(', ')} error={fieldErrs.length>0} disabled={disabled}/>
              </Box>
            );
          case 'select':
            return (
              <Box key={f.id} sx={{ mb: 2 }}>
                <TextField select fullWidth label={f.label} value={val} onChange={(e)=>handleChange(f.id, e.target.value)} helperText={fieldErrs.join(', ')} error={fieldErrs.length>0} disabled={disabled}>
                  {(f.options || []).map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
              </Box>
            );
          case 'radio':
            return (
              <Box key={f.id} sx={{ mb: 2 }}>
                <FormControl>
                  <FormLabel>{f.label}</FormLabel>
                  <RadioGroup value={val} onChange={(e)=>handleChange(f.id, e.target.value)}>
                    {(f.options || []).map(o => <FormControlLabel key={o} value={o} control={<Radio />} label={o} disabled={disabled}/>)}
                  </RadioGroup>
                  {fieldErrs.length>0 && <Typography color="error">{fieldErrs.join(', ')}</Typography>}
                </FormControl>
              </Box>
            );
          case 'checkbox':
            return (
              <Box key={f.id} sx={{ mb: 2 }}>
                <FormControlLabel control={<Checkbox checked={!!val} onChange={(e)=>handleChange(f.id, e.target.checked)} disabled={disabled}/>} label={f.label}/>
                {fieldErrs.length>0 && <Typography color="error">{fieldErrs.join(', ')}</Typography>}
              </Box>
            );
          default: return null;
        }
      })}
      {schema.fields.length > 0 && <Button variant="contained" onClick={handleSubmit}>Submit</Button>}
    </Box>
  );
}
