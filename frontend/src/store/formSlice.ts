import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FormField, FormSchema } from '../types/formTypes';
import { v4 as uuidv4 } from 'uuid';

interface FormState {
  currentForm: FormSchema;
  savedForms: FormSchema[];
}

const persisted = JSON.parse(localStorage.getItem('upliance_forms_v1') || '[]') as FormSchema[];

const initialState: FormState = {
  currentForm: {
    id: uuidv4(),
    name: '',
    createdAt: new Date().toISOString(),
    fields: [],
  },
  savedForms: persisted,
};

const slice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    resetCurrentForm(state) {
      state.currentForm = {
        id: uuidv4(),
        name: '',
        createdAt: new Date().toISOString(),
        fields: [],
      };
    },
    setCurrentForm(state, action: PayloadAction<FormSchema>) {
      state.currentForm = action.payload;
    },
    addField(state, action: PayloadAction<FormField>) {
      state.currentForm.fields.push(action.payload);
    },
    updateField(state, action: PayloadAction<FormField>) {
      const idx = state.currentForm.fields.findIndex((f) => f.id === action.payload.id);
      if (idx >= 0) state.currentForm.fields[idx] = action.payload;
    },
    removeField(state, action: PayloadAction<string>) {
      state.currentForm.fields = state.currentForm.fields.filter((f) => f.id !== action.payload);
    },
    reorderFields(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      const arr = state.currentForm.fields;
      if (from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
    },
    saveForm(state, action: PayloadAction<{ name: string }>) {
      const name = action.payload.name.trim() || 'Untitled Form';
      const toSave: FormSchema = {
        ...state.currentForm,
        name,
        createdAt: new Date().toISOString(),
        id: state.currentForm.id || uuidv4(),
      };
      state.savedForms.push(toSave);
      localStorage.setItem('upliance_forms_v1', JSON.stringify(state.savedForms));
    },
    loadSavedForms(state) {
      state.savedForms = JSON.parse(localStorage.getItem('upliance_forms_v1') || '[]');
    },
  },
});

export const {
  resetCurrentForm,
  setCurrentForm,
  addField,
  updateField,
  removeField,
  reorderFields,
  saveForm,
  loadSavedForms,
} = slice.actions;

export default slice.reducer;
