"use client";

import { useCallback, useState } from "react";
import { CloudArrowUpIcon, DocumentTextIcon, XMarkIcon } from "./icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface UploadBoxProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function UploadBox({ onFileSelect, selectedFile }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useLanguage();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && isValidFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (file && isValidFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileSelect(null);
    },
    [onFileSelect]
  );

  const isValidFile = (file: File): boolean => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    return allowed.includes(file.type) || file.name.endsWith(".pdf") || file.name.endsWith(".docx");
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <div className="relative flex items-center gap-4 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/30 p-5 animate-fade-in">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white shadow-md">
          <DocumentTextIcon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900 dark:text-white">
            {selectedFile.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatBytes(selectedFile.size)}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          aria-label={t.removeFile}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
        isDragging
          ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 scale-[1.01]"
          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/20"
      }`}
    >
      <input
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-colors duration-200 ${
          isDragging ? "bg-brand-500" : "bg-brand-100 dark:bg-brand-900"
        }`}
      >
        <CloudArrowUpIcon
          className={`h-8 w-8 transition-colors ${
            isDragging ? "text-white" : "text-brand-500 dark:text-brand-400"
          }`}
        />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
          {isDragging ? t.dropHere : t.dragDrop}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t.or}{" "}
          <span className="font-medium text-brand-600 dark:text-brand-400">
            {t.clickBrowse}
          </span>
        </p>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {t.supportsFormats}
        </p>
      </div>
    </label>
  );
}
