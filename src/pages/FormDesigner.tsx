
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FormFieldDefinition } from "@/components/SecureForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  File,
  FileText,
  Grip,
  Plus,
  SaveAll,
  Trash,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const FormDesigner = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "New Form",
    description: "Form description",
    securityLevel: "normal",
    requiresIdVerification: false,
  });
  
  const [fields, setFields] = useState<FormFieldDefinition[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
  const [currentEditingField, setCurrentEditingField] = useState<FormFieldDefinition | null>(null);
  
  // Field template for new fields
  const getFieldTemplate = (type: FormFieldDefinition['type']): FormFieldDefinition => {
    const id = `field_${Date.now()}`;
    
    switch (type) {
      case "text":
        return {
          id,
          type,
          label: "Text Field",
          placeholder: "Enter text",
          required: false,
        };
      case "textarea":
        return {
          id,
          type,
          label: "Text Area",
          placeholder: "Enter longer text",
          required: false,
        };
      case "email":
        return {
          id,
          type,
          label: "Email Address",
          placeholder: "your@email.com",
          required: true,
        };
      case "number":
        return {
          id,
          type,
          label: "Number",
          placeholder: "Enter a number",
          required: false,
        };
      case "select":
        return {
          id,
          type,
          label: "Select Option",
          placeholder: "Select an option",
          required: false,
          options: [
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
            { value: "option3", label: "Option 3" },
          ],
        };
      case "checkbox":
        return {
          id,
          type,
          label: "Checkbox Field",
          description: "Check this box if you agree",
          required: false,
        };
      case "file":
        return {
          id,
          type,
          label: "File Upload",
          description: "Upload relevant files",
          required: false,
          maxFiles: 3,
          acceptedFileTypes: "PDF, DOCX, JPG, PNG",
        };
      default:
        return {
          id,
          type: "text",
          label: "New Field",
          placeholder: "Enter text",
          required: false,
        };
    }
  };
  
  // Handle adding a new field
  const handleAddField = (type: FormFieldDefinition['type']) => {
    const newField = getFieldTemplate(type);
    setFields([...fields, newField]);
    setShowAddFieldDialog(false);
    toast.success("Field added");
  };
  
  // Handle field editing
  const handleEditField = (field: FormFieldDefinition) => {
    setCurrentEditingField(field);
  };
  
  // Save field changes
  const saveFieldChanges = () => {
    if (!currentEditingField) return;
    
    setFields(fields.map(field => 
      field.id === currentEditingField.id ? currentEditingField : field
    ));
    
    setCurrentEditingField(null);
    toast.success("Field updated");
  };
  
  // Delete a field
  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    
    if (currentEditingField?.id === fieldId) {
      setCurrentEditingField(null);
    }
    
    toast.success("Field deleted");
  };
  
  // Move field up or down
  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;
    
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };
  
  // Handle drag end for reordering fields
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setFields(items);
  };
  
  // Duplicate field
  const duplicateField = (field: FormFieldDefinition) => {
    const duplicatedField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `Copy of ${field.label}`,
    };
    
    setFields([...fields, duplicatedField]);
    toast.success("Field duplicated");
  };
  
  // Save the form
  const saveForm = () => {
    // In a real app, this would save to a database
    toast.success("Form saved successfully");
    
    // Navigate back to forms list
    setTimeout(() => {
      navigate("/forms");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form Designer</h1>
          <p className="text-muted-foreground">
            Create and customize your secure form
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            {isPreviewMode ? "Edit Form" : "Preview"}
          </Button>
          <Button onClick={saveForm}>
            <SaveAll className="h-4 w-4 mr-2" />
            Save Form
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Form Builder Panel */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Form Details</CardTitle>
                  <CardDescription>
                    Basic information about the form
                  </CardDescription>
                </div>
                <Badge variant={formData.securityLevel === "restricted" ? "destructive" : "outline"}>
                  {formData.securityLevel.charAt(0).toUpperCase() + formData.securityLevel.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter form title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter form description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="securityLevel">Security Level</Label>
                  <Select
                    value={formData.securityLevel}
                    onValueChange={(value) => setFormData({...formData, securityLevel: value})}
                  >
                    <SelectTrigger id="securityLevel">
                      <SelectValue placeholder="Select security level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="requires-verification"
                    checked={formData.requiresIdVerification}
                    onCheckedChange={(checked) => setFormData({...formData, requiresIdVerification: checked})}
                  />
                  <Label htmlFor="requires-verification">Require ID Verification</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Form Fields</CardTitle>
                  <CardDescription>
                    Add and arrange form fields
                  </CardDescription>
                </div>
                <Dialog open={showAddFieldDialog} onOpenChange={setShowAddFieldDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Field</DialogTitle>
                      <DialogDescription>
                        Choose a field type to add to your form
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <Button
                        variant="outline"
                        className="h-auto flex-col py-6"
                        onClick={() => handleAddField("text")}
                      >
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Text Field</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-auto flex-col py-6"
                        onClick={() => handleAddField("textarea")}
                      >
                        <File className="h-8 w-8 mb-2" />
                        <span>Text Area</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-auto flex-col py-6"
                        onClick={() => handleAddField("email")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-8 w-8 mb-2"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span>Email</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-auto flex-col py-6"
                        onClick={() => handleAddField("number")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-8 w-8 mb-2"
                        >
                          <path d="M8 4v16" />
                          <path d="M16 4v16" />
                          <path d="M4 8h16" />
                          <path d="M4 16h16" />
                        </svg>
                        <span>Number</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-auto flex-col py-6"
                        onClick={() => handleAddField("select")}
                      >
                        <ChevronDown className="h-8 w-8 mb-2" />
                        <span>Select</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-auto flex-col py-6"
                        onClick={() => handleAddField("checkbox")}
                      >
                        <Check className="h-8 w-8 mb-2" />
                        <span>Checkbox</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-auto flex-col py-6"
                        onClick={() => handleAddField("file")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-8 w-8 mb-2"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>File Upload</span>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {fields.length > 0 ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="form-fields">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border rounded-md p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div {...provided.dragHandleProps}>
                                      <Grip className="h-5 w-5 text-muted-foreground cursor-move" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{field.label}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                                        {field.required && " (Required)"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => moveField(index, 'up')}
                                      disabled={index === 0}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => moveField(index, 'down')}
                                      disabled={index === fields.length - 1}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => duplicateField(field)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditField(field)}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                      >
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                      </svg>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteField(field.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No fields added yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Your form needs at least one field. Click "Add Field" to get started.
                  </p>
                  <Button onClick={() => setShowAddFieldDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Field
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Properties Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Properties</CardTitle>
              <CardDescription>
                Configure the selected field
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentEditingField ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="field-label">Field Label</Label>
                    <Input
                      id="field-label"
                      value={currentEditingField.label}
                      onChange={(e) => setCurrentEditingField({
                        ...currentEditingField,
                        label: e.target.value
                      })}
                    />
                  </div>
                  
                  {(currentEditingField.type === "text" || 
                    currentEditingField.type === "email" || 
                    currentEditingField.type === "number" ||
                    currentEditingField.type === "textarea" ||
                    currentEditingField.type === "select") && (
                    <div className="space-y-2">
                      <Label htmlFor="field-placeholder">Placeholder</Label>
                      <Input
                        id="field-placeholder"
                        value={currentEditingField.placeholder || ""}
                        onChange={(e) => setCurrentEditingField({
                          ...currentEditingField,
                          placeholder: e.target.value
                        })}
                      />
                    </div>
                  )}
                  
                  {(currentEditingField.type === "checkbox" ||
                    currentEditingField.type === "file") && (
                    <div className="space-y-2">
                      <Label htmlFor="field-description">Description</Label>
                      <Textarea
                        id="field-description"
                        value={currentEditingField.description || ""}
                        onChange={(e) => setCurrentEditingField({
                          ...currentEditingField,
                          description: e.target.value
                        })}
                      />
                    </div>
                  )}
                  
                  {currentEditingField.type === "select" && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {currentEditingField.options?.map((option, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <Input
                              value={option.label}
                              onChange={(e) => {
                                const newOptions = [...(currentEditingField.options || [])];
                                newOptions[index] = {
                                  ...newOptions[index],
                                  label: e.target.value,
                                  value: e.target.value.toLowerCase().replace(/\s+/g, '-')
                                };
                                setCurrentEditingField({
                                  ...currentEditingField,
                                  options: newOptions
                                });
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newOptions = [...(currentEditingField.options || [])];
                                newOptions.splice(index, 1);
                                setCurrentEditingField({
                                  ...currentEditingField,
                                  options: newOptions
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newOptions = [...(currentEditingField.options || [])];
                            newOptions.push({ value: `option${newOptions.length + 1}`, label: `Option ${newOptions.length + 1}` });
                            setCurrentEditingField({
                              ...currentEditingField,
                              options: newOptions
                            });
                          }}
                        >
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {currentEditingField.type === "file" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="max-files">Maximum Files</Label>
                        <Input
                          id="max-files"
                          type="number"
                          min="1"
                          max="10"
                          value={currentEditingField.maxFiles || 1}
                          onChange={(e) => setCurrentEditingField({
                            ...currentEditingField,
                            maxFiles: parseInt(e.target.value)
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="accepted-types">Accepted File Types</Label>
                        <Input
                          id="accepted-types"
                          value={currentEditingField.acceptedFileTypes || ""}
                          onChange={(e) => setCurrentEditingField({
                            ...currentEditingField,
                            acceptedFileTypes: e.target.value
                          })}
                          placeholder="PDF, DOCX, JPG, PNG"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="required-field"
                      checked={currentEditingField.required || false}
                      onCheckedChange={(checked) => setCurrentEditingField({
                        ...currentEditingField,
                        required: checked
                      })}
                    />
                    <Label htmlFor="required-field">Required Field</Label>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentEditingField(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveFieldChanges}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Field Selected</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select a field from your form to edit its properties.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Form Actions</CardTitle>
              <CardDescription>
                Options for your form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2"
                    >
                      <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    Export Form Template
                  </div>
                </Button>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-destructive" asChild>
                  <div>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Form
                  </div>
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                All changes are automatically saved as draft
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormDesigner;
