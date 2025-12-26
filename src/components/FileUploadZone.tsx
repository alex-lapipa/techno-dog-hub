import { useState, useCallback } from "react";
import { Upload, X, FileText, Image, Music, File, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface FileUploadZoneProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const FileUploadZone = ({ 
  onFilesChange, 
  maxFiles = 10,
  maxSizeMB = 20 
}: FileUploadZoneProps) => {
  const { language } = useLanguage();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const acceptedTypes = {
    image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/x-m4a"],
    document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
  };

  const allAcceptedTypes = [...acceptedTypes.image, ...acceptedTypes.audio, ...acceptedTypes.document];

  const getFileIcon = (type: string) => {
    if (acceptedTypes.image.includes(type)) return Image;
    if (acceptedTypes.audio.includes(type)) return Music;
    if (acceptedTypes.document.includes(type)) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `submissions/${fileName}`;

    const { data, error } = await supabase.storage
      .from('community-uploads')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('community-uploads')
      .getPublicUrl(filePath);

    return {
      name: file.name,
      url: urlData.publicUrl,
      type: file.type,
      size: file.size
    };
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxFiles - uploadedFiles.length;
    if (remainingSlots <= 0) return;

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    const validFiles = filesToUpload.filter(file => {
      const isValidType = allAcceptedTypes.includes(file.type);
      const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      setUploadProgress(`${i + 1}/${validFiles.length}`);
      const result = await uploadFile(validFiles[i]);
      if (result) {
        newFiles.push(result);
      }
    }

    const allFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(allFiles);
    onFilesChange(allFiles);
    setIsUploading(false);
    setUploadProgress("");
  }, [uploadedFiles, maxFiles, maxSizeMB, onFilesChange, allAcceptedTypes]);

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const content = {
    en: {
      dropzone: "Drop files here or click to upload",
      types: "Photos, documents, audio files",
      limit: `Max ${maxFiles} files, ${maxSizeMB}MB each`,
      uploading: "Uploading",
      browse: "Browse files"
    },
    es: {
      dropzone: "Arrastra archivos aquí o haz clic para subir",
      types: "Fotos, documentos, archivos de audio",
      limit: `Máx ${maxFiles} archivos, ${maxSizeMB}MB cada uno`,
      uploading: "Subiendo",
      browse: "Explorar archivos"
    }
  };

  const t = content[language];

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-sm p-8 text-center transition-all duration-200 cursor-pointer",
          isDragging 
            ? "border-logo-green bg-logo-green/10" 
            : "border-border hover:border-logo-green/50 hover:bg-card",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          type="file"
          multiple
          accept={allAcceptedTypes.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading || uploadedFiles.length >= maxFiles}
        />
        
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 text-logo-green animate-spin" />
              <p className="font-mono text-sm text-logo-green">
                {t.uploading} {uploadProgress}...
              </p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground" />
              <div>
                <p className="font-mono text-sm text-foreground mb-1">
                  {t.dropzone}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {t.types}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
                  {t.limit}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => {
            const IconComponent = getFileIcon(file.type);
            return (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-sm group"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-sm">
                  <IconComponent className="w-4 h-4 text-logo-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;