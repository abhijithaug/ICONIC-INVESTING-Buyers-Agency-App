import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCheck,
  Eye,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Building2,
  UserCheck
} from 'lucide-react';
import {
  listClientDocumentsFromSupabase,
  deleteClientDocumentFromSupabase,
  SupabaseStoredFile,
  SUPABASE_STORAGE_BUCKET,
  SUPABASE_DOCUMENT_CATEGORIES
} from '../../services/supabaseStorage';

interface SupabaseClientFilesSectionProps {
  clientFullName: string;
  refreshTrigger?: number | string;
  onFileDeleted?: (deletedFilePath: string) => void;
  className?: string;
  title?: string;
}

export const SupabaseClientFilesSection: React.FC<SupabaseClientFilesSectionProps> = ({
  clientFullName,
  refreshTrigger,
  onFileDeleted,
  className = '',
  title = 'Supabase Storage Files'
}) => {
  const [files, setFiles] = useState<SupabaseStoredFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [confirmDeletePath, setConfirmDeletePath] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const loadFiles = useCallback(async () => {
    if (!clientFullName || !clientFullName.trim()) {
      setFiles([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await listClientDocumentsFromSupabase(clientFullName);
      if (result.error) {
        setError(result.error);
      } else {
        setFiles(result.files);
      }
    } catch (err: any) {
      console.error('[SupabaseClientFilesSection] Error loading files:', err);
      setError(err?.message || 'Failed to fetch files from Supabase Storage');
    } finally {
      setIsLoading(false);
    }
  }, [clientFullName]);

  // Fetch files automatically on mount and whenever clientFullName or refreshTrigger updates
  useEffect(() => {
    loadFiles();
  }, [loadFiles, refreshTrigger]);

  const handleDelete = async (file: SupabaseStoredFile) => {
    setDeletingPath(file.fullPath);
    setConfirmDeletePath(null);

    try {
      const result = await deleteClientDocumentFromSupabase(file.fullPath);
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Deleted "${file.name}" from Supabase Storage.`
        });
        if (onFileDeleted) {
          onFileDeleted(file.fullPath);
        }
        // Refresh the file list automatically after delete
        await loadFiles();
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || `Failed to delete "${file.name}"`
        });
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error deleting file from Supabase Storage'
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setDeletingPath(null);
    }
  };

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const formatUploadDate = (isoOrStr?: string): string => {
    if (!isoOrStr) return 'Recently';
    try {
      const d = new Date(isoOrStr);
      if (isNaN(d.getTime())) return isoOrStr.split('T')[0] || isoOrStr;
      return d.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoOrStr.split('T')[0] || isoOrStr;
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return <FileText className="w-4 h-4 text-rose-600 shrink-0" />;
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) return <FileImage className="w-4 h-4 text-purple-600 shrink-0" />;
    return <FileCheck className="w-4 h-4 text-slate-600 shrink-0" />;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Contracts':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Building & Pest Reports':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'Payment Receipts':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'Finance Documents':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'ID Verification':
        return <UserCheck className="w-4 h-4 text-cyan-600" />;
      default:
        return <FolderOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'Contracts':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Building & Pest Reports':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Payment Receipts':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Finance Documents':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ID Verification':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Group files by category subfolder
  const groupedFiles: Record<string, SupabaseStoredFile[]> = {};

  // Guarantee standard categories are ordered first
  for (const cat of SUPABASE_DOCUMENT_CATEGORIES) {
    groupedFiles[cat] = [];
  }

  // Populate files
  files.forEach(f => {
    const cat = f.category || 'Other';
    if (!groupedFiles[cat]) {
      groupedFiles[cat] = [];
    }
    groupedFiles[cat].push(f);
  });

  // Filter down to categories that actually have files, plus keep standard ones if needed
  const categoriesWithFiles = Object.keys(groupedFiles).filter(
    cat => groupedFiles[cat].length > 0
  );

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold shadow-xs">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 font-serif-heading">
                {title}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1A3A5C] text-white">
                {files.length} {files.length === 1 ? 'file' : 'files'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Bucket: <span className="font-semibold text-slate-700">{SUPABASE_STORAGE_BUCKET}</span> • Path: <span className="font-semibold text-slate-700">{clientFullName}/[category]/</span>
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadFiles}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh file list from Supabase Storage"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#B8960C] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Fetching...' : 'Refresh Files'}</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Notification */}
      {statusMessage && (
        <div
          className={`mx-4 mt-3 p-3 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in duration-150 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="m-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="font-bold">Storage List Notice</div>
            <div className="text-[11px] text-amber-800">{error}</div>
          </div>
          <button
            type="button"
            onClick={loadFiles}
            className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg text-[11px] font-bold text-amber-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {isLoading && files.length === 0 && (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <Loader2 className="w-7 h-7 text-[#B8960C] animate-spin mx-auto" />
          <div className="text-xs font-semibold text-slate-700">
            Querying Supabase Storage for <span className="font-mono text-[#1A3A5C]">{clientFullName}/</span>...
          </div>
          <div className="text-[11px] text-slate-400">
            Scanning category subfolders (list method)
          </div>
        </div>
      )}

      {/* Empty files state */}
      {!isLoading && files.length === 0 && !error && (
        <div className="py-10 px-4 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="text-xs font-bold text-slate-700">
            No files uploaded yet for {clientFullName}
          </div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Uploaded contracts, inspection reports, finance slips, and receipts will appear here grouped by category.
          </p>
        </div>
      )}

      {/* Grouped Files List by Category Subfolder */}
      {categoriesWithFiles.length > 0 && (
        <div className="divide-y divide-slate-100">
          {categoriesWithFiles.map(category => {
            const catFiles = groupedFiles[category] || [];
            const isCollapsed = !!collapsedCategories[category];

            return (
              <div key={category} className="transition-colors">
                {/* Category Subfolder Header */}
                <div
                  onClick={() => toggleCategoryCollapse(category)}
                  className="px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer select-none transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-white border border-slate-200/80 shadow-2xs">
                      {getCategoryIcon(category)}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      ({clientFullName}/{category}/)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      {catFiles.length} {catFiles.length === 1 ? 'file' : 'files'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {isCollapsed ? '+' : '−'}
                    </span>
                  </div>
                </div>

                {/* Subfolder Files Table / List */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-white text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          <th className="py-2.5 px-4 font-bold">File Name</th>
                          <th className="py-2.5 px-4 font-bold">Category</th>
                          <th className="py-2.5 px-4 font-bold">Upload Date</th>
                          <th className="py-2.5 px-4 font-bold">Size</th>
                          <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {catFiles.map(file => {
                          const isCurrentlyDeleting = deletingPath === file.fullPath;
                          const isConfirming = confirmDeletePath === file.fullPath;

                          return (
                            <tr
                              key={file.fullPath}
                              className="hover:bg-slate-50/60 transition group"
                            >
                              {/* 1. Name */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5 min-w-[180px]">
                                  {getFileIcon(file.name)}
                                  <div className="min-w-0 flex-1">
                                    <div
                                      className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md group-hover:text-[#1A3A5C]"
                                      title={file.name}
                                    >
                                      {file.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                                      {file.fullPath}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Category */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(
                                    file.category
                                  )}`}
                                >
                                  {file.category}
                                </span>
                              </td>

                              {/* 3. Upload Date */}
                              <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                                <div className="flex items-center gap-1.5 text-[11px]">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{formatUploadDate(file.createdAt)}</span>
                                </div>
                              </td>

                              {/* 4. File Size */}
                              <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                                {file.sizeFormatted || '—'}
                              </td>

                              {/* 5. Actions: View button (Public URL) & Delete button */}
                              <td className="py-3 px-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* View Button */}
                                  <a
                                    href={file.publicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-[#1A3A5C] hover:text-white text-[#1A3A5C] border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                                    title={`View ${file.name} (Public URL)`}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View</span>
                                  </a>

                                  {/* Delete Button / Inline Confirmation */}
                                  {isConfirming ? (
                                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg animate-in fade-in duration-150">
                                      <span className="text-[10px] text-rose-700 font-bold px-1">
                                        Delete?
                                      </span>
                                      <button
                                        type="button"
                                        disabled={isCurrentlyDeleting}
                                        onClick={() => handleDelete(file)}
                                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                      >
                                        {isCurrentlyDeleting ? (
                                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                        ) : null}
                                        <span>Yes</span>
                                      </button>
                                      <button
                                        type="button"
                                        disabled={isCurrentlyDeleting}
                                        onClick={() => setConfirmDeletePath(null)}
                                        className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 text-[10px] cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={isCurrentlyDeleting}
                                      onClick={() => setConfirmDeletePath(file.fullPath)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                      title="Delete file from Supabase Storage"
                                    >
                                      {isCurrentlyDeleting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                                      ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
