# FormeoEditor.clear() Method

## Overview

The `clear()` method has been added to the FormeoEditor class to provide a clean way to reset the editor to its initial state, as if no form data was ever provided.

## Method Signature

```typescript
editor.clear(): void
```

## Description

The `clear()` method:
- Resets the internal `userFormData` to the default form structure using `DEFAULT_FORMDATA()`
- Maintains the proper form structure with at least one empty stage
- Reloads the Components with the default form data
- Re-renders the editor to show the clean, initial state
- Effectively returns the editor to its initial state while preserving the required stage structure

## Usage Examples

### Basic Usage
```javascript
import { FormeoEditor } from 'formeo';

const editor = new FormeoEditor({
  editorContainer: '#my-editor'
});

// ... user builds a form ...

// Clear the form back to empty state
editor.clear();
```

### React Hook Example
```javascript
const clearForm = useCallback(() => {
  if (editorRef.current) {
    editorRef.current.clear();
    setFormData(null);
  }
}, []);
```

### Angular Component Example
```typescript
clearForm() {
  if (this.editor) {
    this.editor.clear();
  }
  if (this.renderer && this.renderContainer) {
    this.renderContainer.nativeElement.innerHTML = '';
  }
}
```

## When to Use

Use the `clear()` method when you need to:
- Reset the form builder to a blank state
- Start over with a new form
- Clear all form stages and fields
- Return to the initial editor state

## Comparison with formData Setter

| Method | Purpose | Result |
|--------|---------|---------|
| `editor.clear()` | Reset to initial state with proper structure | Clean editor with one empty stage |
| `editor.formData = {}` | Set specific form data | May break editor structure |

The `clear()` method is more reliable as it uses the proper default form structure and maintains at least one stage.

## Integration with Framework Demos

Both React and Angular demos now use the `clear()` method:
- **Interactive Demo**: Clear button uses `editor.clear()`
- **Code Examples**: All framework patterns updated to use the new method
- **Error-Free**: No more "clear is not a function" errors

## Benefits

1. **Official API**: Now part of the FormeoEditor public API
2. **Consistent**: Same behavior across all framework integrations
3. **Complete Reset**: Thoroughly clears all editor state
4. **Future-Proof**: Will work with future Formeo updates
