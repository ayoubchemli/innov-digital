import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { File, FileUp, Trash } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Form schema definition
export interface FormFieldDefinition {
  id: string;
  type: "text" | "textarea" | "email" | "number" | "select" | "checkbox" | "file";
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  maxFiles?: number;
  acceptedFileTypes?: string;
}

interface SecureFormProps {
  formId?: string;
  title: string;
  description?: string;
  fields: FormFieldDefinition[];
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const SecureForm = ({
  formId,
  title,
  description,
  fields,
  onSubmit,
  isLoading = false,
}: SecureFormProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  
  // Dynamically generate the schema based on fields
  const generateSchema = () => {
    const schemaObj: Record<string, any> = {};
    
    fields.forEach(field => {
      let validator;
      
      switch (field.type) {
        case "email":
          validator = z.string().email("Invalid email address");
          break;
        case "number":
          validator = z.number().or(z.string().regex(/^\d+$/).transform(Number));
          break;
        case "checkbox":
          validator = z.boolean();
          break;
        case "file":
          // File fields are handled separately
          validator = z.any();
          break;
        default:
          validator = z.string();
      }
      
      if (field.required && field.type !== "checkbox" && field.type !== "file") {
        validator = validator.min(1, { message: "This field is required" });
      }
      
      schemaObj[field.id] = validator;
    });
    
    return z.object(schemaObj);
  };
  
  const formSchema = generateSchema();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    // Combine form data with uploaded files
    const formData = {
      ...data,
      files: uploadedFiles,
      submittedAt: new Date(),
      formId,
    };
    
    try {
      await onSubmit(formData);
      toast.success("Form submitted successfully");
      form.reset();
      setUploadedFiles({});
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    }
  };
  
  // File handling
  const handleFileChange = (fieldId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const fieldDef = fields.find(f => f.id === fieldId);
    const maxFiles = fieldDef?.maxFiles || 5;
    
    // Convert FileList to Array
    const filesArray = Array.from(files);
    
    // Check if max files exceeded
    if (filesArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    // Update state with new files
    setUploadedFiles(prev => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), ...filesArray]
    }));
    
    // Reset input
    event.target.value = "";
  };
  
  // Remove file
  const removeFile = (fieldId: string, index: number) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fieldId]: prev[fieldId].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">{title}</h3>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {fields.map((field) => {
            if (field.type === "checkbox") {
              return (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={field.id}
                  render={({ field: formField }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={formField.value}
                          onCheckedChange={formField.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{field.label}</FormLabel>
                        {field.description && (
                          <FormDescription>{field.description}</FormDescription>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              );
            }
            
            if (field.type === "select") {
              return (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={field.id}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <Select
                        onValueChange={formField.onChange}
                        defaultValue={formField.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || "Select an option"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {field.options?.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.description && (
                        <FormDescription>{field.description}</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            }
            
            if (field.type === "file") {
              const fieldFiles = uploadedFiles[field.id] || [];
              const maxFiles = field.maxFiles || 5;
              
              return (
                <FormItem key={field.id} className="space-y-3">
                  <FormLabel>{field.label}</FormLabel>
                  <div className="grid gap-2">
                    <div className="flex flex-col gap-4">
                      {fieldFiles.length > 0 && (
                        <div className="grid gap-2">
                          {fieldFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-md border p-2"
                            >
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4" />
                                <span className="text-sm">
                                  {file.name} ({(file.size / 1024).toFixed(1)}KB)
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(field.id, index)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {fieldFiles.length < maxFiles && (
                        <div className="grid w-full items-center gap-1.5">
                          <Label
                            htmlFor={field.id}
                            className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-sm"
                          >
                            <FileUp className="mb-2 h-6 w-6 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Click to upload
                              {field.acceptedFileTypes && (
                                <span> {field.acceptedFileTypes}</span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                              {fieldFiles.length}/{maxFiles} files
                            </span>
                          </Label>
                          <Input
                            id={field.id}
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(field.id, e)}
                            accept={field.acceptedFileTypes}
                            multiple={maxFiles > 1}
                          />
                        </div>
                      )}
                    </div>
                    {field.description && (
                      <FormDescription>{field.description}</FormDescription>
                    )}
                  </div>
                </FormItem>
              );
            }
            
            if (field.type === "textarea") {
              return (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={field.id}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={field.placeholder}
                          {...formField}
                        />
                      </FormControl>
                      {field.description && (
                        <FormDescription>{field.description}</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            }
            
            // Default: text, email, number fields
            return (
              <FormField
                key={field.id}
                control={form.control}
                name={field.id}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={field.placeholder}
                        type={field.type}
                        {...formField}
                      />
                    </FormControl>
                    {field.description && (
                      <FormDescription>{field.description}</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SecureForm;
